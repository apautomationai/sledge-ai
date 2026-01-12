import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/invoice-review",
  "/integrations",
  "/profile",
  "/jobs",
  "/report"
];

// Decode JWT without verification (just to read the payload)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If it's a protected route and there's no token, redirect to sign-in
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/sign-in', request.url);
    // Add the original URL as a query parameter so we can redirect back after login
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user has token, check if email is verified
  if (isProtectedRoute && token) {
    const decoded = decodeJWT(token);

    // Check if email is verified
    if (decoded && decoded.is_verified === false) {
      // Get user email from token
      const email = decoded.email || '';
      // Redirect to verify-email page
      return NextResponse.redirect(new URL(`/verify-email?email=${encodeURIComponent(email)}`, request.url));
    }
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  // The subscription provider will handle payment redirect if needed
  const isAuthPage = ['/sign-in', '/sign-up', '/forgot-password'].some(route =>
    pathname.startsWith(route)
  );

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};