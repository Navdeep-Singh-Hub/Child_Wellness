import { Buffer } from 'buffer';
import crypto from 'crypto';
import express from 'express';
import Razorpay from 'razorpay';
import { Payment } from '../models/Payment.js';
import { Subscription } from '../models/Subscription.js';

const router = express.Router();

// Initialize Razorpay for webhook verification
// Keys should be in environment variables: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
// If keys are not set, create a dummy instance for localhost development
let razorpay;
const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

if (hasRazorpayKeys) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('[RAZORPAY WEBHOOK] Razorpay initialized');
  } catch (error) {
    console.error('[RAZORPAY WEBHOOK] Failed to initialize Razorpay:', error);
    // Create a dummy instance to prevent module load failure
    razorpay = { plans: {}, customers: {}, subscriptions: {}, payments: {} };
  }
} else {
  console.log('[RAZORPAY WEBHOOK] Razorpay keys not configured - using dummy instance for localhost development');
  // Create a dummy instance to prevent module load failure
  razorpay = { plans: {}, customers: {}, subscriptions: {}, payments: {} };
}

/**
 * Middleware: Verify Razorpay webhook signature
 */
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    console.warn('Webhook signature or secret missing');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get raw body (should be Buffer if raw parser is used, otherwise stringify parsed body)
  const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
  
  // Verify signature using raw body
  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  
  if (generatedSignature !== signature) {
    console.warn('Invalid webhook signature');
    console.warn('Expected:', signature);
    console.warn('Generated:', generatedSignature);
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Parse body if it's still a string
  if (typeof req.body === 'string' || req.body instanceof Buffer) {
    try {
      req.body = JSON.parse(rawBody);
    } catch (error) {
      console.error('Error parsing webhook body:', error);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  
  next();
}

router.post('/razorpay', verifyWebhookSignature, async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;
    
    console.log(`Received Razorpay webhook: ${event}`);
    
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
        
      case 'subscription.activated':
        await handleSubscriptionActivated(payload.subscription.entity);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;
        
      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity);
        break;
        
      case 'subscription.paused':
        await handleSubscriptionPaused(payload.subscription.entity);
        break;
        
      case 'subscription.resumed':
        await handleSubscriptionResumed(payload.subscription.entity);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }
    
    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Razorpay from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(paymentEntity) {
  try {
    const paymentId = paymentEntity.id;
    const subscriptionId = paymentEntity.subscription_id;
    
    // Find or create payment record
    let payment = await Payment.findOne({ razorpayPaymentId: paymentId });
    
    if (!payment) {
      // Find subscription to get user info
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId,
      });
      
      if (subscription) {
        payment = await Payment.create({
          userId: subscription.userId,
          auth0Id: subscription.auth0Id,
          subscriptionId: subscription._id,
          razorpayPaymentId: paymentId,
          razorpayOrderId: paymentEntity.order_id,
          razorpaySubscriptionId: subscriptionId,
          amount: paymentEntity.amount,
          amountInRupees: paymentEntity.amount / 100,
          currency: paymentEntity.currency,
          status: 'captured',
          method: paymentEntity.method,
          paidAt: new Date(paymentEntity.captured_at * 1000),
          webhookReceived: true,
          webhookProcessedAt: new Date(),
        });
      }
    } else {
      // Update existing payment
      payment.status = 'captured';
      payment.paidAt = new Date(paymentEntity.captured_at * 1000);
      payment.webhookReceived = true;
      payment.webhookProcessedAt = new Date();
      await payment.save();
    }
    
    // Update subscription status
    if (subscriptionId) {
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId,
      });
      
      if (subscription) {
        subscription.status = 'active';
        subscription.subscriptionStartDate = new Date(paymentEntity.created_at * 1000);
        
        // Calculate next billing date (1 month from payment)
        const nextBilling = new Date(paymentEntity.captured_at * 1000);
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        subscription.nextBillingDate = nextBilling;
        subscription.subscriptionEndDate = nextBilling;
        
        await subscription.save();
        console.log(`Payment captured: ${paymentId}, Subscription activated: ${subscriptionId}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment.captured:', error);
    throw error;
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(paymentEntity) {
  try {
    const paymentId = paymentEntity.id;
    const subscriptionId = paymentEntity.subscription_id;
    
    // Record failed payment
    let payment = await Payment.findOne({ razorpayPaymentId: paymentId });
    
    if (!payment && subscriptionId) {
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId,
      });
      
      if (subscription) {
        payment = await Payment.create({
          userId: subscription.userId,
          auth0Id: subscription.auth0Id,
          subscriptionId: subscription._id,
          razorpayPaymentId: paymentId,
          razorpaySubscriptionId: subscriptionId,
          amount: paymentEntity.amount,
          amountInRupees: paymentEntity.amount / 100,
          currency: paymentEntity.currency,
          status: 'failed',
          method: paymentEntity.method,
          failureReason: paymentEntity.error?.description || 'Payment failed',
          failureCode: paymentEntity.error?.code,
          webhookReceived: true,
          webhookProcessedAt: new Date(),
        });
      }
    } else if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentEntity.error?.description || 'Payment failed';
      payment.failureCode = paymentEntity.error?.code;
      payment.webhookReceived = true;
      payment.webhookProcessedAt = new Date();
      await payment.save();
    }
    
    // Update subscription status to past_due or expired
    if (subscriptionId) {
      const subscription = await Subscription.findOne({
        razorpaySubscriptionId: subscriptionId,
      });
      
      if (subscription) {
        subscription.status = 'past_due';
        await subscription.save();
        console.log(`Payment failed: ${paymentId}, Subscription marked as past_due: ${subscriptionId}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment.failed:', error);
    throw error;
  }
}

/**
 * Handle subscription.activated event
 */
async function handleSubscriptionActivated(subscriptionEntity) {
  try {
    const subscriptionId = subscriptionEntity.id;
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });
    
    if (subscription) {
      subscription.status = 'active';
      subscription.subscriptionStartDate = new Date(subscriptionEntity.created_at * 1000);
      
      // Calculate next billing date (1 month from start)
      const nextBilling = new Date(subscriptionEntity.current_start * 1000);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      subscription.nextBillingDate = nextBilling;
      subscription.subscriptionEndDate = nextBilling;
      
      await subscription.save();
      console.log(`Subscription activated: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling subscription.activated:', error);
    throw error;
  }
}

/**
 * Handle subscription.cancelled event
 */
async function handleSubscriptionCancelled(subscriptionEntity) {
  try {
    const subscriptionId = subscriptionEntity.id;
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });
    
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await subscription.save();
      console.log(`Subscription cancelled: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling subscription.cancelled:', error);
    throw error;
  }
}

/**
 * Handle subscription.charged event (recurring payment)
 */
async function handleSubscriptionCharged(subscriptionEntity) {
  try {
    const subscriptionId = subscriptionEntity.id;
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });
    
    if (subscription) {
      // Update subscription end date (extend by 1 month)
      const currentEnd = subscription.subscriptionEndDate || new Date();
      currentEnd.setMonth(currentEnd.getMonth() + 1);
      subscription.subscriptionEndDate = currentEnd;
      
      // Update next billing date (1 month from now)
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      subscription.nextBillingDate = nextBilling;
      
      subscription.status = 'active';
      await subscription.save();
      console.log(`Subscription charged (renewed): ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling subscription.charged:', error);
    throw error;
  }
}

/**
 * Handle subscription.paused event
 */
async function handleSubscriptionPaused(subscriptionEntity) {
  try {
    const subscriptionId = subscriptionEntity.id;
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });
    
    if (subscription) {
      subscription.status = 'cancelled'; // Treat paused as cancelled for access
      await subscription.save();
      console.log(`Subscription paused: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling subscription.paused:', error);
    throw error;
  }
}

/**
 * Handle subscription.resumed event
 */
async function handleSubscriptionResumed(subscriptionEntity) {
  try {
    const subscriptionId = subscriptionEntity.id;
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });
    
    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
      console.log(`Subscription resumed: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling subscription.resumed:', error);
    throw error;
  }
}

export default router;

