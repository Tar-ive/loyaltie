# 🛒 Stripe Checkout Integration Guide

## Overview

EchoEats now supports **automated Stripe Checkout** for order payments. When a customer confirms their order, the system automatically generates a Stripe checkout link that they can click to complete payment.

---

## 📋 How It Works

### 1. **Order Flow**

```
User: "I want to order 2 pizzas"
  ↓
Agent: Proposes order with items and price
  ↓
System: Detects order intent, transitions to "confirming" phase
  ↓
User: "yes" or "confirm"
  ↓
System: Creates Stripe Checkout Session
  ↓
Agent: Sends checkout URL link to user
  ↓
User: Clicks link → Redirected to Stripe payment page
  ↓
Payment completed → Order fulfilled
```

### 2. **Key Components**

| Component | Location | Purpose |
|-----------|----------|---------|
| **Order Detection** | `rc/utils/order-state.ts` | Detects when user wants to order |
| **Stripe Checkout** | `rc/utils/stripe-checkout.ts` | Creates Stripe checkout sessions |
| **Message Service** | `rc/services/message-service.ts` | Orchestrates order flow & checkout |
| **Frontend Handler** | `frontend/src/components/chat/ChatInterface.tsx` | Displays checkout links |

---

## 🔧 Setup Instructions

### Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Sign up or log in to your Stripe account
3. Navigate to **Developers** → **API keys**
4. Copy your **Secret key** (starts with `sk_test_...`)

### Step 2: Configure Environment Variables

Update your `.env` file in the project root:

```env
# Required: Stripe Secret Key (Test mode)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE

# Required: Frontend URL for success/cancel redirects
FRONTEND_URL=http://localhost:3000
```

**Important:**
- Use **test keys** (sk_test_...) for development
- Use **live keys** (sk_live_...) only for production
- Never commit your `.env` file to version control

### Step 3: Install Dependencies

```bash
npm install stripe
```

### Step 4: Restart the Server

```bash
npm run server
```

---

## 💻 Testing the Integration

### Test Flow:

1. **Start the application:**
   ```bash
   # Terminal 1: Start backend
   npm run server

   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

2. **Open the frontend:** http://localhost:3000

3. **Create a new conversation** and chat with EchoEats

4. **Place an order:**
   ```
   User: I want to order 3 burgers and 2 fries
   Agent: [Proposes order with price]
   User: yes
   ```

5. **Get checkout link:**
   - Agent will provide a Stripe checkout URL
   - Click the link to be redirected to Stripe's payment page

6. **Test payment with Stripe test cards:**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

More test cards: https://docs.stripe.com/testing

---

## 📝 Code Walkthrough

### Order Detection Logic

**File:** `rc/services/message-service.ts:88-104`

```typescript
// DETECT ORDER INTENT
if (detectOrderIntent(message) || responseContent.toLowerCase().includes("confirm")) {
  const draft = extractOrderDraft(responseContent);

  if (draft && draft.items.length > 0) {
    orderState = {
      phase: "confirming",
      draft,
    };
  }
}
```

### Checkout Creation Logic

**File:** `rc/services/message-service.ts:107-137`

```typescript
// HANDLE ORDER CONFIRMATION
if (orderState.phase === "confirming" && detectConfirmationIntent(message)) {
  // Create Stripe checkout session
  const checkoutSession = await createCheckoutSession(
    orderState.draft!,
    profile.identity.name
  );

  checkoutUrl = checkoutSession.checkoutUrl; // Sent to frontend
  orderId = checkoutSession.orderId;
}
```

### Stripe API Integration

**File:** `rc/utils/stripe-checkout.ts:26-107`

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(
  draft: OrderDraft,
  customerEmail?: string
): Promise<CheckoutSession> {
  // Create line items from order
  const lineItems = draft.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        description: item.notes || "EchoEats food order",
      },
      unit_amount: pricePerItem,
    },
    quantity: item.quantity,
  }));

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/success?order_id=${orderId}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      orderId,
      deliveryDate: draft.deliveryDate,
      items: JSON.stringify(draft.items),
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url!, // This is the clickable link
    amount: draft.estimatedTotal,
    orderId,
  };
}
```

### Frontend Display

**File:** `frontend/src/components/chat/ChatInterface.tsx:75-93`

```typescript
// Handle checkout URL if order was confirmed
if (response.checkout_url && response.order_id) {
  // Add checkout link message
  const checkoutMessage = {
    role: 'assistant',
    content: `🎉 Order confirmed!\n\n💳 Click here to pay:\n${response.checkout_url}\n\nOrder ID: ${response.order_id}`,
  };
  setMessages(prev => [...prev, checkoutMessage]);
}
```

The checkout URL is automatically made clickable by the `MessageBubble` component.

---

## 🔐 Security Best Practices

1. **Never expose your secret key:**
   - Keep it in `.env` file only
   - Never commit `.env` to Git
   - Never send it to the frontend

2. **Use test mode for development:**
   - Test keys start with `sk_test_`
   - Live keys start with `sk_live_`

3. **Validate webhooks in production:**
   - Verify Stripe webhook signatures
   - Handle payment confirmations server-side

4. **Use environment-specific URLs:**
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

---

## 🎨 Customization

### Change Success/Cancel URLs

Edit in `rc/utils/stripe-checkout.ts:84-85`:

```typescript
success_url: `${process.env.FRONTEND_URL}/order-success?order_id=${orderId}`,
cancel_url: `${process.env.FRONTEND_URL}/order-canceled`,
```

### Change Currency

Edit in `rc/utils/stripe-checkout.ts:67`:

```typescript
currency: "eur", // Change from "usd" to your currency
```

### Add Customer Information

Edit in `rc/utils/stripe-checkout.ts:86-87`:

```typescript
customer_email: customerEmail,
phone_number_collection: {
  enabled: true,
},
```

---

## 🐛 Troubleshooting

### "Stripe not configured - using mock checkout"

**Problem:** Stripe secret key is missing or invalid

**Solution:**
1. Check `.env` file has `STRIPE_SECRET_KEY=sk_test_...`
2. Restart the server after adding the key
3. Verify the key is valid in Stripe Dashboard

### "Failed to create checkout session"

**Problem:** Stripe API error

**Solution:**
1. Check server console for detailed error
2. Verify API key is correct
3. Ensure Stripe account is active
4. Check network connection

### Checkout link doesn't work

**Problem:** Invalid redirect URLs

**Solution:**
1. Verify `FRONTEND_URL` is set correctly in `.env`
2. Make sure frontend is running on that URL
3. Check Stripe Dashboard → Settings → Redirect URLs

---

## 📚 Additional Resources

- [Stripe Checkout Docs](https://docs.stripe.com/payments/checkout)
- [Stripe Testing Guide](https://docs.stripe.com/testing)
- [Stripe API Reference](https://docs.stripe.com/api)
- [Stripe Node.js SDK](https://github.com/stripe/stripe-node)

---

## 🎉 Success!

Your EchoEats app now has fully integrated Stripe payments! Users can order food through chat and complete payment seamlessly via Stripe Checkout.

**Next Steps:**
- Test with various orders
- Customize success/cancel pages
- Add webhook handling for payment confirmations
- Deploy to production with live Stripe keys
