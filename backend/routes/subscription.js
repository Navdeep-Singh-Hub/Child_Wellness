import crypto from 'crypto';
import express from 'express';
import Razorpay from 'razorpay';
import { Payment } from '../models/Payment.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';

const router = express.Router();

// Log that router is being loaded
console.log('[SUBSCRIPTION ROUTER] Router module loaded');

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('[SUBSCRIPTION ROUTER] Test route hit');
  res.json({ ok: true, message: 'Subscription router is working' });
});

// Initialize Razorpay instance
// Keys should be in environment variables: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
// If keys are not set, Razorpay will still initialize but API calls will fail
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });
  console.log('[SUBSCRIPTION ROUTER] Razorpay initialized (keys may be empty for localhost)');
} catch (error) {
  console.error('[SUBSCRIPTION ROUTER] Failed to initialize Razorpay:', error);
  // Create a dummy instance to prevent module load failure
  razorpay = { plans: {}, customers: {}, subscriptions: {}, payments: {} };
}

// Monthly subscription plan configuration
const MONTHLY_PLAN_AMOUNT = 29900; // ₹299.00 in paise
const MONTHLY_PLAN_INTERVAL = 1; // 1 month
const TRIAL_DAYS = 7;

// TEMPORARY: Set to true to test Paywall (disable free access for testing)
// TODO: Remove this and use DISABLE_FREE_ACCESS_FOR_TESTING env variable instead
// Set to false in production to enable free access for employees/boss
const FORCE_DISABLE_FREE_ACCESS = process.env.DISABLE_FREE_ACCESS_FOR_TESTING === 'true';

// Whitelist: IDs that should always have free access (employees, boss, etc.)
// Add Auth0 IDs here or via FREE_ACCESS_IDS env variable (comma-separated)
// 
// HOW TO FIND AUTH0 ID:
// 1. Check browser console when user logs in
// 2. Check Auth0 dashboard → Users → Select user → Copy "User ID"
// 3. Format: Usually starts with "auth0|" followed by alphanumeric string
//
// EXAMPLES:
// - Boss: 'auth0|60f7b3c4d5e6f7a8b9c0d1e2'
// - Employee 1: 'auth0|70f8c4d5e6f7a8b9c0d1e2f3'
// - Employee 2: 'auth0|80f9d5e6f7a8b9c0d1e2f3a4'
//
// OR set in backend .env file:
// FREE_ACCESS_IDS=auth0|boss_id,auth0|employee1_id,auth0|employee2_id
const FREE_ACCESS_IDS = [
  'auth0_test_user', // Default test user from server.js
  'dev_local_tester', // Fallback from utils/api.ts for localhost
  // Add employee/boss Auth0 IDs here:
  // 'auth0|your_boss_id_here',
  // 'auth0|employee1_id_here',
  // 'auth0|employee2_id_here',
  ...(process.env.FREE_ACCESS_IDS ? process.env.FREE_ACCESS_IDS.split(',').map(id => id.trim()).filter(Boolean) : []),
].filter(Boolean); // Remove null/undefined/empty

/**
 * Helper: Get or create subscription for user
 * Automatically starts 7-day free trial for new users
 * Skips for whitelisted users
 */
async function getOrCreateSubscription(auth0Id, userId) {
  // Skip subscription creation for whitelisted users
  if (hasFreeAccess(auth0Id)) {
    console.log(`User ${auth0Id} has free access - skipping subscription creation`);
    return null;
  }
  
  let subscription = await Subscription.findOne({ auth0Id });
  
  if (!subscription) {
    // New user - start free trial
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);
    
    subscription = await Subscription.create({
      userId,
      auth0Id,
      trialStartDate: now,
      trialEndDate,
      trialUsed: true,
      status: 'trial',
    });
    
    console.log(`Started 7-day free trial for user ${auth0Id}`);
  }
  
  return subscription;
}

/**
 * Helper: Check if user has free access (whitelisted)
 * Also checks for localhost/development environment
 * 
 * IMPORTANT: If Razorpay keys are not configured, ALL users get free access (for localhost development)
 */
function hasFreeAccess(auth0Id) {
  // Check if free access is disabled for testing (to test Paywall)
  // Check both environment variable and temporary hardcoded flag
  const disableFreeAccess = FORCE_DISABLE_FREE_ACCESS || process.env.DISABLE_FREE_ACCESS_FOR_TESTING === 'true';
  console.log(`[FREE ACCESS] FORCE_DISABLE_FREE_ACCESS: ${FORCE_DISABLE_FREE_ACCESS}, DISABLE_FREE_ACCESS_FOR_TESTING env: "${process.env.DISABLE_FREE_ACCESS_FOR_TESTING}", Final: ${disableFreeAccess}`);
  
  if (disableFreeAccess) {
    console.log(`[FREE ACCESS] Free access disabled for testing - NO free access (whitelist ignored)`);
    // When testing Paywall, ignore whitelist completely
    return false;
  }
  
  // If no auth0Id, allow access (development scenario)
  if (!auth0Id || auth0Id === 'undefined' || auth0Id === 'null' || auth0Id === '') {
    console.log(`[FREE ACCESS] No auth0Id provided - allowing free access for development`);
    return true;
  }
  
  // Check whitelist
  const isWhitelisted = FREE_ACCESS_IDS.includes(auth0Id);
  
  // Also allow if running on localhost (development)
  // If Razorpay keys are NOT configured, allow free access for everyone (localhost development)
  const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
  
  // If no Razorpay keys configured, it's definitely localhost - allow free access
  if (!hasRazorpayKeys) {
    console.log(`[FREE ACCESS] No Razorpay keys configured - allowing free access for localhost development`);
    return true;
  }
  
  // Check if we're in development mode (localhost)
  // Grant free access if:
  // 1. NODE_ENV is not 'production' (development mode)
  // 2. OR Razorpay keys are test keys
  const isTestKey = process.env.RAZORPAY_KEY_ID.includes('test') || 
                    process.env.RAZORPAY_KEY_ID.includes('rzp_test');
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isLocalhost = isTestKey || isDevelopment;
  
  // Log for debugging
  const hasAccess = isWhitelisted || isLocalhost;
  if (hasAccess) {
    console.log(`[FREE ACCESS] User ${auth0Id} has free access. Whitelisted: ${isWhitelisted}, Localhost: ${isLocalhost}, HasKeys: ${hasRazorpayKeys}, IsTestKey: ${isTestKey}`);
  } else {
    console.log(`[FREE ACCESS] User ${auth0Id} does NOT have free access. Whitelisted: ${isWhitelisted}, Localhost: ${isLocalhost}`);
  }
  
  return hasAccess;
}

/**
 * Helper: Check if subscription is active (trial or paid)
 */
async function checkSubscriptionStatus(auth0Id) {
  // Check if user has free access (whitelisted)
  if (hasFreeAccess(auth0Id)) {
    return {
      hasAccess: true,
      status: 'free',
      isTrial: false,
      isActive: true,
      trialEndDate: null,
      subscriptionEndDate: null,
      nextBillingDate: null,
      razorpaySubscriptionId: null,
      isFreeAccess: true, // Flag to indicate free access
    };
  }
  
  const subscription = await Subscription.findOne({ auth0Id });
  
  if (!subscription) {
    return {
      hasAccess: false,
      status: 'none',
      isTrial: false,
      isActive: false,
      trialEndDate: null,
      subscriptionEndDate: null,
    };
  }
  
  const now = new Date();
  const isTrialActive = subscription.isTrialActive();
  const isTrialExpired = subscription.isTrialExpired();
  const isPaidActive = subscription.status === 'active' && 
                       subscription.subscriptionEndDate && 
                       subscription.subscriptionEndDate > now;
  
  const hasAccess = isTrialActive || isPaidActive;
  
  return {
    hasAccess,
    status: subscription.status,
    isTrial: isTrialActive,
    isActive: hasAccess,
    trialEndDate: subscription.trialEndDate,
    subscriptionEndDate: subscription.subscriptionEndDate,
    nextBillingDate: subscription.nextBillingDate,
    razorpaySubscriptionId: subscription.razorpaySubscriptionId,
  };
}

/**
 * POST /api/subscription/create-subscription
 * Creates a Razorpay subscription for the user
 * Called when user wants to subscribe after trial ends
 */
router.post('/create-subscription', async (req, res) => {
  console.log('[SUBSCRIPTION ROUTER] POST /create-subscription route hit');
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    
    // Check if user has free access - don't create subscription
    if (hasFreeAccess(auth0Id)) {
      console.log(`[CREATE SUBSCRIPTION] User ${auth0Id} has free access - skipping subscription creation`);
      return res.json({
        ok: true,
        message: 'User has free access - subscription not needed',
        hasFreeAccess: true,
      });
    }
    
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    // Get or create subscription
    const subscription = await getOrCreateSubscription(auth0Id, user._id);
    
    // Check if already has active subscription
    if (subscription.status === 'active' && subscription.isActive()) {
      return res.json({
        ok: true,
        message: 'Subscription already active',
        subscriptionId: subscription.razorpaySubscriptionId,
      });
    }
    
    // Check if Razorpay keys are configured
    const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    
    if (!hasRazorpayKeys) {
      console.log('[CREATE SUBSCRIPTION] Razorpay keys not configured - returning mock response for localhost development');
      // For localhost development without Razorpay keys, return mock data
      return res.json({
        ok: true,
        subscriptionId: 'mock_subscription_' + Date.now(),
        planId: 'mock_plan_id',
        customerId: 'mock_customer_id',
        amount: MONTHLY_PLAN_AMOUNT / 100,
        currency: 'INR',
        mock: true, // Flag to indicate this is a mock response
      });
    }
    
    // Create Razorpay plan if it doesn't exist (idempotent)
    let planId = process.env.RAZORPAY_PLAN_ID;
    
    if (!planId) {
      // Create plan dynamically (only if not set in env)
      try {
        const plan = await razorpay.plans.create({
          period: 'monthly',
          interval: MONTHLY_PLAN_INTERVAL,
          item: {
            name: 'Monthly Therapy Access',
            description: 'Monthly subscription for Therapy Progress access',
            amount: MONTHLY_PLAN_AMOUNT,
            currency: 'INR',
          },
        });
        planId = plan.id;
        console.log('Created Razorpay plan:', planId);
      } catch (error) {
        console.error('Failed to create Razorpay plan:', error);
        // If plan already exists, try to find it
        // In production, you should set RAZORPAY_PLAN_ID in env vars
        return res.status(500).json({
          ok: false,
          error: 'Failed to create subscription plan. Please set RAZORPAY_PLAN_ID in environment variables.',
        });
      }
    }
    
    // Create Razorpay customer
    let customerId = subscription.razorpayCustomerId;
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name: user.name || user.email,
        email: user.email,
        contact: user.phoneNumber ? `${user.phoneCountryCode}${user.phoneNumber}` : undefined,
      });
      customerId = customer.id;
      subscription.razorpayCustomerId = customerId;
    }
    
    // Create Razorpay subscription
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months = 1 year (or set to null for indefinite)
      start_at: Math.floor(Date.now() / 1000) + 60, // Start 1 minute from now
      notes: {
        auth0Id,
        userId: user._id.toString(),
      },
    });
    
    // Update subscription in database
    subscription.razorpaySubscriptionId = razorpaySubscription.id;
    subscription.razorpayPlanId = planId;
    subscription.status = 'active';
    subscription.subscriptionStartDate = new Date(razorpaySubscription.created_at * 1000);
    
    // Calculate next billing date (1 month from start)
    const nextBilling = new Date(razorpaySubscription.created_at * 1000);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    subscription.nextBillingDate = nextBilling;
    
    // Set subscription end date (for access checking)
    subscription.subscriptionEndDate = nextBilling;
    
    await subscription.save();
    
    console.log(`Created Razorpay subscription ${razorpaySubscription.id} for user ${auth0Id}`);
    
    res.json({
      ok: true,
      subscriptionId: razorpaySubscription.id,
      planId,
      customerId,
      amount: MONTHLY_PLAN_AMOUNT / 100, // Convert paise to rupees
      currency: 'INR',
    });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to create subscription',
    });
  }
});

/**
 * POST /api/subscription/verify-payment
 * Verifies payment signature and updates subscription status
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    
    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({
        ok: false,
        error: 'Missing payment verification data',
      });
    }
    
    // Verify signature
    const text = `${razorpay_subscription_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid payment signature',
      });
    }
    
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    // Update subscription
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: razorpay_subscription_id,
    });
    
    if (subscription) {
      subscription.status = 'active';
      subscription.subscriptionStartDate = new Date(payment.created_at * 1000);
      
      // Calculate next billing date (1 month from payment)
      const nextBilling = new Date(payment.created_at * 1000);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      subscription.nextBillingDate = nextBilling;
      subscription.subscriptionEndDate = nextBilling;
      
      await subscription.save();
    }
    
    // Record payment
    await Payment.findOneAndUpdate(
      { razorpayPaymentId: razorpay_payment_id },
      {
        userId: subscription?.userId,
        auth0Id: subscription?.auth0Id || auth0Id,
        subscriptionId: subscription?._id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySubscriptionId: razorpay_subscription_id,
        amount: payment.amount,
        amountInRupees: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        paidAt: payment.captured_at ? new Date(payment.captured_at * 1000) : null,
        webhookReceived: false,
      },
      { upsert: true, new: true }
    );
    
    res.json({
      ok: true,
      message: 'Payment verified successfully',
      subscriptionStatus: subscription?.status,
    });
  } catch (error) {
    console.error('Failed to verify payment:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to verify payment',
    });
  }
});

/**
 * GET /api/subscription/status
 * Returns current subscription status for the user
 * Automatically creates trial for new users
 */
router.get('/status', async (req, res) => {
  console.log('[SUBSCRIPTION ROUTER] GET /status route hit');
  try {
    const auth0Id = req.auth0Id || req.headers['x-auth0-id'];
    
    // Log for debugging
    console.log(`[SUBSCRIPTION STATUS] Checking status for auth0Id: ${auth0Id}`);
    console.log(`[SUBSCRIPTION STATUS] Request headers x-auth0-id: ${req.headers['x-auth0-id']}`);
    console.log(`[SUBSCRIPTION STATUS] FREE_ACCESS_IDS:`, FREE_ACCESS_IDS);
    console.log(`[SUBSCRIPTION STATUS] RAZORPAY_KEY_ID set:`, !!process.env.RAZORPAY_KEY_ID);
    console.log(`[SUBSCRIPTION STATUS] RAZORPAY_KEY_ID value:`, process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...');
    console.log(`[SUBSCRIPTION STATUS] NODE_ENV:`, process.env.NODE_ENV);
    
    if (!auth0Id) {
      // Check if free access is disabled for testing
      const disableFreeAccess = process.env.DISABLE_FREE_ACCESS_FOR_TESTING === 'true';
      if (disableFreeAccess) {
        console.log(`[SUBSCRIPTION STATUS] No auth0Id but free access disabled for testing - returning no access`);
        return res.json({
          ok: true,
          hasAccess: false,
          status: 'none',
          isTrial: false,
          isActive: false,
          trialEndDate: null,
          subscriptionEndDate: null,
          nextBillingDate: null,
          razorpaySubscriptionId: null,
        });
      }
      
      // Even if no auth0Id, allow access on localhost (only if free access is not disabled)
      const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
      const isTestKey = process.env.RAZORPAY_KEY_ID?.includes('test') || 
                        process.env.RAZORPAY_KEY_ID?.includes('rzp_test');
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isLocalhost = !hasRazorpayKeys || isTestKey || isDevelopment;
      
      console.log(`[SUBSCRIPTION STATUS] No auth0Id - HasKeys: ${hasRazorpayKeys}, IsTestKey: ${isTestKey}, IsDev: ${isDevelopment}, IsLocalhost: ${isLocalhost}`);
      
      if (isLocalhost) {
        console.log(`[SUBSCRIPTION STATUS] No auth0Id but localhost detected - allowing free access`);
        return res.json({
          ok: true,
          hasAccess: true,
          status: 'free',
          isTrial: false,
          isActive: true,
          trialEndDate: null,
          subscriptionEndDate: null,
          nextBillingDate: null,
          razorpaySubscriptionId: null,
          isFreeAccess: true,
        });
      }
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    
    // Check free access first (before any database operations)
    const freeAccessResult = hasFreeAccess(auth0Id);
    console.log(`[SUBSCRIPTION STATUS] DISABLE_FREE_ACCESS_FOR_TESTING: ${process.env.DISABLE_FREE_ACCESS_FOR_TESTING}`);
    console.log(`[SUBSCRIPTION STATUS] hasFreeAccess(${auth0Id}) = ${freeAccessResult}`);
    
    if (freeAccessResult) {
      console.log(`[SUBSCRIPTION STATUS] User ${auth0Id} has free access - skipping subscription check`);
      return res.json({
        ok: true,
        hasAccess: true,
        status: 'free',
        isTrial: false,
        isActive: true,
        trialEndDate: null,
        subscriptionEndDate: null,
        nextBillingDate: null,
        razorpaySubscriptionId: null,
        isFreeAccess: true,
      });
    }
    
    // Get user
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    // Only create trial if free access is NOT disabled (for testing Paywall)
    // When testing Paywall, we don't want to auto-create trials
    if (!FORCE_DISABLE_FREE_ACCESS && process.env.DISABLE_FREE_ACCESS_FOR_TESTING !== 'true') {
      // Ensure subscription exists (creates trial if new user)
      await getOrCreateSubscription(auth0Id, user._id);
    }
    
    // Get current status
    const status = await checkSubscriptionStatus(auth0Id);
    
    console.log(`[SUBSCRIPTION STATUS] Final status for ${auth0Id}:`, status);
    
    res.json({
      ok: true,
      ...status,
    });
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to get subscription status',
    });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancels the active subscription
 */
router.post('/cancel', async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    
    const subscription = await Subscription.findOne({ auth0Id });
    
    if (!subscription || !subscription.razorpaySubscriptionId) {
      return res.status(404).json({
        ok: false,
        error: 'No active subscription found',
      });
    }
    
    // Cancel subscription in Razorpay
    try {
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
    } catch (error) {
      // If already cancelled, continue
      if (error.statusCode !== 400) {
        throw error;
      }
    }
    
    // Update subscription status
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancelReason = req.body.reason || 'User requested cancellation';
    await subscription.save();
    
    res.json({
      ok: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to cancel subscription',
    });
  }
});

// Catch-all route for debugging (must be last)
router.use('*', (req, res) => {
  console.log(`[SUBSCRIPTION ROUTER] Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    ok: false, 
    error: 'Route not found in subscription router',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl
  });
});

export default router;

