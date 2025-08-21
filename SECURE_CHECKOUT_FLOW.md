# 🔒 Secure Checkout & Payment Flow (Stripe + Orders)

This document outlines the secure checkout and payment flow implemented with Stripe webhooks and proper server-side validation.

## 🏗️ Architecture Overview

### 1. Order Model Updates

- Added `paymentStatus` field: `'unpaid' | 'paid' | 'failed' | 'refunded'`
- Added `stripePaymentIntentId` field to link orders with Stripe payments
- Added `currency` field for multi-currency support
- Updated order status lifecycle: `pending → confirmed → preparing → out_for_delivery → delivered`

### 2. Security Features

- **Server-side validation**: All cart validation, stock checks, and price calculations happen on the server
- **Webhook signature verification**: Stripe webhook signatures are verified to prevent tampering
- **Payment intent linking**: Orders are linked to Stripe PaymentIntents via metadata
- **No frontend trust**: Frontend amounts are never trusted; server recalculates everything

## 🔄 Checkout Flow

### Step 1: User Checkout

1. User selects delivery address
2. User proceeds to payment page
3. Frontend calls `/api/orders/create` with address and currency

### Step 2: Secure Order Creation (`POST /api/orders/create`)

```typescript
// Request
{
  "deliveryAddress": "address_id",
  "currency": "usd"
}

// Response
{
  "success": true,
  "data": {
    "orderId": "ORD-123456789",
    "clientSecret": "pi_xxx_secret_xxx",
    "totalAmount": "99.99",
    "currency": "usd",
    "paymentIntentId": "pi_xxx"
  }
}
```

**Server-side validation:**

- ✅ Fetches user's cart from database
- ✅ Validates all food items exist and have sufficient stock
- ✅ Recalculates all prices server-side (never trust frontend)
- ✅ Creates order with `status: 'pending'` and `paymentStatus: 'unpaid'`
- ✅ Creates Stripe PaymentIntent with order metadata
- ✅ Links PaymentIntent ID to order

### Step 3: Frontend Payment Processing

1. Frontend receives `clientSecret` from order creation
2. Initializes Stripe PaymentSheet/PlatformPay with `clientSecret`
3. User completes payment through Stripe
4. Frontend handles payment result (success/failure)

### Step 4: Webhook Processing (`POST /api/webhooks/stripe`)

Stripe sends webhooks for payment events:

#### Payment Success (`payment_intent.succeeded`)

```typescript
// Updates order:
order.paymentStatus = 'paid'
order.status = 'confirmed'
```

#### Payment Failure (`payment_intent.payment_failed`)

```typescript
// Updates order:
order.paymentStatus = 'failed'
order.status = 'cancelled'
```

#### Payment Cancellation (`payment_intent.canceled`)

```typescript
// Updates order:
order.paymentStatus = 'failed'
order.status = 'cancelled'
```

#### Payment Refund (`charge.refunded`)

```typescript
// Updates order:
order.paymentStatus = 'refunded'
order.status = 'cancelled'
```

## 🛡️ Security Measures

### 1. Webhook Signature Verification

```typescript
// Verifies Stripe webhook signature
event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

### 2. Server-side Validation

- **Stock validation**: Checks if requested quantity is available
- **Price validation**: Recalculates all prices from database
- **Cart validation**: Ensures cart exists and belongs to user
- **Address validation**: Verifies delivery address exists

### 3. Payment Intent Linking

- Orders are linked to PaymentIntents via metadata
- Webhook handlers verify PaymentIntent ID matches order
- Prevents duplicate order processing

### 4. Error Handling

- Clear error messages for insufficient stock
- Proper error responses for validation failures
- Graceful handling of webhook failures

## 📊 Order Status Lifecycle

```
pending (created, waiting for payment)
    ↓
confirmed (payment successful, order being prepared)
    ↓
preparing (kitchen preparing food)
    ↓
out_for_delivery (delivery partner picked up)
    ↓
delivered (order completed)
```

**Failed states:**

- `cancelled` (payment failed or user cancelled)

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client-side (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🚀 Setup Instructions

### 1. Stripe Dashboard Setup

1. Create a Stripe account and get API keys
2. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Configure webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
4. Copy webhook signing secret

### 2. Database Migration

The Order model has been updated with new fields. Ensure your database is updated:

```typescript
// New fields added:
paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded'
stripePaymentIntentId: string
currency: 'usd' | 'inr'
```

### 3. API Endpoints

#### New Endpoints:

- `POST /api/orders/create` - Secure order creation
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `PUT /api/orders/[id]/status` - Admin order status update

#### Deprecated:

- `POST /api/checkout` - Now redirects to new flow

## 🧪 Testing

### Test Cards (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 🔍 Monitoring

### Key Metrics to Monitor:

- Order creation success rate
- Payment success/failure rates
- Webhook delivery success rate
- Order status transition times

### Logs to Watch:

- Order creation logs
- Webhook processing logs
- Payment intent creation logs
- Stock validation errors

## 🚨 Error Handling

### Frontend Errors:

- Show clear error messages for payment failures
- Allow retry with same order (don't duplicate)
- Handle network errors gracefully

### Backend Errors:

- Log all validation failures
- Return specific error messages for debugging
- Handle webhook signature verification failures

## 🔄 Retry Logic

### Payment Retry:

- Failed payments can be retried with the same order
- Order remains in `pending` status until payment succeeds
- Cart is only cleared after successful payment

### Webhook Retry:

- Stripe automatically retries failed webhooks
- Implement idempotency to handle duplicate webhooks
- Log webhook processing for debugging

This implementation ensures a secure, reliable checkout flow with proper validation, error handling, and monitoring.
