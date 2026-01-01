# Razorpay Payment Integration Setup Guide

## Overview

This application integrates Razorpay payment gateway with a 7-day free trial and weekly auto-debit subscription for accessing the "Therapy Progress" section.

## Business Logic

1. **Free Trial**: New users automatically get a 7-day free trial upon signup
2. **Access Control**: Users can only access "Therapy Progress" if:
   - They are in the 7-day free trial period, OR
   - They have an active paid subscription, OR
   - They are in the FREE_ACCESS_IDS whitelist (for development)
3. **Auto-Debit**: After trial ends, subscription automatically charges monthly (₹299/month)
4. **Payment Failure**: If payment fails, access is blocked until payment is resolved
5. **Auto-Renewal**: Subscription auto-renews every month unless cancelled
6. **Free Access**: Users in FREE_ACCESS_IDS list always have free access (no subscription needed)

## Folder Structure

```
backend/
├── models/
│   ├── Subscription.js      # Subscription schema (trial, status, Razorpay IDs)
│   ├── Payment.js           # Payment history schema
│   └── User.js              # User schema (no changes needed)
├── routes/
│   ├── subscription.js      # Subscription APIs (create, verify, status, cancel)
│   └── razorpayWebhook.js   # Webhook handler for Razorpay events
└── server.js                # Main server (routes registered here)

frontend/
├── components/
│   └── Paywall.tsx          # Paywall UI component
├── app/(tabs)/
│   └── TherapyProgress.tsx  # Protected screen with access guard
└── utils/
    └── api.ts               # Subscription API functions
```

## Environment Variables

### Backend (.env)

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
RAZORPAY_PLAN_ID=plan_xxxxxxxxxxxxx  # Optional: Pre-created plan ID

# Free Access IDs (comma-separated) - These users won't need subscription
# Useful for localhost development/testing
FREE_ACCESS_IDS=auth0|your_user_id_here,another_id

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/child_wellness

# Server
PORT=4000
```

### Frontend (.env or app.json)

```env
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install razorpay

# Frontend (if using Razorpay React Native SDK for mobile)
npm install @razorpay/react-native
```

### 2. Razorpay Dashboard Setup

1. **Create Razorpay Account**: Sign up at https://razorpay.com
2. **Get API Keys**: 
   - Go to Settings → API Keys
   - Copy Key ID and Key Secret
   - Add to backend `.env`
3. **Create Subscription Plan**:
   - Go to Products → Plans
   - Create a weekly plan: ₹199, recurring weekly
   - Copy Plan ID to `RAZORPAY_PLAN_ID` (optional, code creates it automatically)
4. **Setup Webhook**:
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Select events:
     - `payment.captured`
     - `payment.failed`
     - `subscription.activated`
     - `subscription.cancelled`
     - `subscription.charged`
     - `subscription.paused`
     - `subscription.resumed`
   - Copy Webhook Secret to `RAZORPAY_WEBHOOK_SECRET`

### 3. Database Setup

MongoDB collections are automatically created when the app runs:
- `subscriptions` - User subscription data
- `payments` - Payment transaction history

### 4. API Endpoints

#### Backend APIs

**GET `/api/subscription/status`**
- Returns current subscription status
- Automatically creates trial for new users
- Response:
```json
{
  "ok": true,
  "hasAccess": true,
  "status": "trial",
  "isTrial": true,
  "isActive": true,
  "trialEndDate": "2024-01-15T00:00:00.000Z",
  "subscriptionEndDate": null,
  "nextBillingDate": null
}
```

**POST `/api/subscription/create-subscription`**
- Creates Razorpay subscription
- Returns subscription ID for checkout
- Response:
```json
{
  "ok": true,
  "subscriptionId": "sub_xxxxxxxxxxxxx",
  "planId": "plan_xxxxxxxxxxxxx",
  "customerId": "cust_xxxxxxxxxxxxx",
  "amount": 199,
  "currency": "INR"
}
```

**POST `/api/subscription/verify-payment`**
- Verifies payment after Razorpay checkout
- Body:
```json
{
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_subscription_id": "sub_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_here"
}
```

**POST `/api/subscription/cancel`**
- Cancels active subscription
- Body (optional):
```json
{
  "reason": "User requested cancellation"
}
```

**POST `/api/webhooks/razorpay`**
- Webhook endpoint (no auth, uses signature verification)
- Handles Razorpay events automatically

### 5. Frontend Integration

#### Paywall Component

The `Paywall` component shows:
- Trial status and days remaining
- Subscription plan details
- Subscribe button (opens Razorpay checkout)
- Active subscription info with cancel option

#### Access Guard

Therapy Progress screen automatically:
1. Checks subscription status on mount
2. Shows Paywall if no access
3. Allows access if trial active or subscription active

## Testing

### Test Cards (Razorpay Test Mode)

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Flow

1. **New User Signup**:
   - User signs up → Trial automatically created
   - Can access Therapy Progress immediately
   - Trial shows 7 days remaining

2. **Free Access (Development)**:
   - Users in FREE_ACCESS_IDS list always have access
   - No subscription required
   - Useful for localhost development/testing
   - Add your Auth0 ID to FREE_ACCESS_IDS in .env

3. **Trial Expired**:
   - After 7 days → Paywall shown
   - User clicks "Subscribe Now"
   - Razorpay checkout opens
   - After payment → Access restored

4. **Payment Failure**:
   - Webhook receives `payment.failed`
   - Subscription marked as `past_due`
   - Access blocked until payment resolved

5. **Auto-Renewal**:
   - Every month → Razorpay charges automatically
   - Webhook receives `subscription.charged`
   - Subscription extended by 1 month

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures** (implemented)
3. **Use HTTPS** in production
4. **Store sensitive data** in environment variables
5. **Validate payment signatures** before updating database

## Troubleshooting

### Common Issues

1. **"Failed to create subscription plan"**
   - Solution: Set `RAZORPAY_PLAN_ID` in env or ensure Razorpay API keys are correct

2. **"Webhook signature verification failed"**
   - Solution: Check `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard

3. **"Payment verification failed"**
   - Solution: Ensure signature is generated correctly on frontend

4. **Trial not starting automatically**
   - Solution: Check `/api/subscription/status` is called on user login/signup

## Production Checklist

- [ ] Switch to Razorpay Live Mode keys
- [ ] Update webhook URL to production domain
- [ ] Test payment flow end-to-end
- [ ] Set up monitoring for webhook events
- [ ] Configure email notifications for failed payments
- [ ] Add retry logic for failed webhook processing
- [ ] Set up database backups
- [ ] Configure rate limiting on webhook endpoint
- [ ] Add logging for all payment events
- [ ] Test subscription cancellation flow

## Support

For Razorpay-specific issues, refer to:
- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com

