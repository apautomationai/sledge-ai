import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { eq, or } from 'drizzle-orm';

import db from './db';
import { usersModel } from '@/models/users.model';
import { verifyPassword, hashPassword } from './utils/hash';
import { RegistrationService } from '@/services/registration.service';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET not set');

// Local strategy for login (email + password)
passport.use(
  'local',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(usersModel)
          .where(eq(usersModel.email, email))
          .limit(1)

        if (!user) {
          return done(null, false, { message: 'Incorrect email or password' });
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return done(null, false, { message: 'Incorrect email or password' });
        }

        // Check if email is verified (only for credential-based users)
        if (user.provider === 'credentials' && !user.isVerified) {
          return done(null, false, { message: 'Please verify your email address before logging in. Check your inbox for the verification link.' });
        }

        // return safe user object (omit passwordHash)
        return done(null, { id: user.id, email: user.email });
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// JWT strategy for protecting endpoints
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      passReqToCallback: false,
    },
    async (payload: any, done: any) => {
      try {
        const userId = (payload as any).sub;
        if (!userId) return done(null, false);

        const user = await db
          .select()
          .from(usersModel)
          .where(eq(usersModel.id, Number(userId)))
          .limit(1)
          .then((r) => r[0]);

        if (!user) return done(null, false);

        return done(null, { id: user.id, email: user.email, isVerified: user.isVerified });
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Google OAuth strategy for authentication
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const GOOGLE_AUTH_REDIRECT_URI = process.env.GOOGLE_AUTH_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI as string;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_AUTH_REDIRECT_URI) {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_AUTH_REDIRECT_URI,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          const avatar = profile.photos?.[0]?.value || null;

          if (!email || !googleId) {
            return done(new Error('Missing email or Google ID'), null);
          }

          // Check if user exists by providerId or email
          const [existingUser] = await db
            .select()
            .from(usersModel)
            .where(
              or(
                eq(usersModel.providerId, googleId),
                eq(usersModel.email, email)
              )
            )
            .limit(1);

          if (existingUser) {
            // User exists, return it
            return done(null, { id: existingUser.id, email: existingUser.email });
          }

          // Create new user
          // For OAuth users, we'll use a placeholder passwordHash since they don't have passwords
          // You might want to generate a random secure string here
          const placeholderPassword = 'oauth_user_no_password';
          const passwordHash = await hashPassword(placeholderPassword);

          const [newUser] = await db
            .insert(usersModel)
            .values({
              email,
              firstName,
              lastName,
              avatar,
              provider: 'google',
              providerId: googleId,
              passwordHash,
              isActive: true,
              isBanned: false,
              isVerified: true,
            })
            .returning();

          // Assign subscription to user (with error handling to not break registration)
          try {
            await RegistrationService.assignSubscriptionToUser(newUser.id);
          } catch (subscriptionError: any) {
            console.error('❌ Failed to assign subscription to user:', {
              userId: newUser.id,
              email: newUser.email,
              error: subscriptionError.message,
              stack: subscriptionError.stack
            });
            // Don't break authentication, but log the error for investigation
            // Note: In production, you might want to add this to a retry queue
          }

          return done(null, { id: newUser.id, email: newUser.email });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

// Microsoft OAuth strategy for authentication
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID as string;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET as string;
const MICROSOFT_AUTH_REDIRECT_URI = process.env.MICROSOFT_AUTH_REDIRECT_URI || process.env.MICROSOFT_REDIRECT_URI as string;

if (MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && MICROSOFT_AUTH_REDIRECT_URI) {
  passport.use(
    "microsoft",
    new MicrosoftStrategy(
      {
        clientID: MICROSOFT_CLIENT_ID,
        clientSecret: MICROSOFT_CLIENT_SECRET,
        callbackURL: MICROSOFT_AUTH_REDIRECT_URI,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email =
            profile.emails?.[0]?.value ||          // Personal Microsoft accounts
            profile._json?.mail ||                 // Azure AD accounts
            profile._json?.userPrincipalName ||    // ALWAYS present for AAD
            null;
          const microsoftId = profile.id;
          const firstName =
            profile.name?.givenName ||
            profile._json?.givenName ||
            (profile.displayName?.split(" ")[0] || "");
          const lastName =
            profile.name?.familyName ||
            profile._json?.surname ||
            (profile.displayName?.split(" ")[1] || "");
          const avatar =
            profile.photos?.[0]?.value ||
            profile._json?.photo ||
            null;

          if (!email || !microsoftId) {
            return done(new Error('Missing email or Microsoft ID'), null);
          }

          // Check if user exists by providerId or email
          const [existingUser] = await db
            .select()
            .from(usersModel)
            .where(
              or(
                eq(usersModel.providerId, microsoftId),
                eq(usersModel.email, email)
              )
            )
            .limit(1);

          if (existingUser) {
            // User exists, return it
            return done(null, { id: existingUser.id, email: existingUser.email });
          }

          // Create new user          
          const placeholderPassword = 'oauth_user_no_password';
          const passwordHash = await hashPassword(placeholderPassword);

          const [newUser] = await db
            .insert(usersModel)
            .values({
              email,
              firstName,
              lastName,
              avatar,
              provider: 'microsoft',
              providerId: microsoftId,
              passwordHash,
              isActive: true,
              isBanned: false,
              isVerified: true,
            })
            .returning();

          // Assign subscription to user (with error handling to not break registration)
          try {
            await RegistrationService.assignSubscriptionToUser(newUser.id);
          } catch (subscriptionError: any) {
            console.error('Failed to assign subscription to user:', {
              userId: newUser.id,
              email: newUser.email,
              error: subscriptionError.message,
              stack: subscriptionError.stack
            });
          }

          return done(null, { id: newUser.id, email: newUser.email });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

export default passport;
