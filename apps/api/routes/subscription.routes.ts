import { Router } from 'express';
import express from 'express';
import { subscriptionController } from '@/controllers/subscription.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

// POST /api/v1/subscription/webhook - Handle Stripe webhook events (no auth required)
// Apply raw body parsing specifically for this route
router.post('/webhook',
    express.raw({ type: 'application/json' }),
    subscriptionController.handleStripeWebhook
);





// All other subscription routes require authentication
router.use(authenticate);

// GET /api/v1/subscription/status - Get current subscription status
router.get('/status', subscriptionController.getSubscriptionStatus);

// POST /api/v1/subscription/create-checkout - Create Stripe checkout session
router.post('/create-checkout', subscriptionController.createCheckoutSession);

// POST /api/v1/subscription/create-portal - Create Stripe customer portal session
router.post('/create-portal', subscriptionController.createCustomerPortal);



export default router;