# 🚀 QUICK START - Test Stripe Now!

## Step 1: Get Stripe Key (2 minutes)

1. Go to: https://dashboard.stripe.com/register
2. Sign up (skip business details)
3. Click **Developers** → **API keys**
4. Copy your **Secret key** (sk_test_...)

## Step 2: Add to .env (30 seconds)

Open your `.env` file and update line 7:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

Paste your actual key:
```env
STRIPE_SECRET_KEY=sk_test_51AbCdEf...
```

## Step 3: Restart Server (10 seconds)

```bash
# Stop server (Ctrl+C)
npm run server
```

## Step 4: Test It! (1 minute)

1. Open: http://localhost:3000
2. Start a conversation
3. Say: **"I want to order 2 pizzas"**
4. Say: **"yes"** when asked to confirm
5. Click the payment link
6. Use card: **4242 4242 4242 4242**
7. Done! ✅

---

## Test Card (Copy-Paste)

```
Card Number: 4242 4242 4242 4242
Expiry:      12/34
CVC:         123
ZIP:         12345
```

---

## Files Created

✅ **Success Page:** `/frontend/src/app/success/page.tsx`
✅ **Cancel Page:** `/frontend/src/app/cancel/page.tsx`
✅ **Full Guide:** `STRIPE_SETUP_COMPLETE.md`

---

## That's It!

You now have:
- ✅ Working Stripe checkout
- ✅ Order detection in chat
- ✅ Clickable payment links
- ✅ Success/Cancel pages

**Ready to accept real payments?** See `STRIPE_SETUP_COMPLETE.md` Step 4.

---

**Questions?** Check `STRIPE_INTEGRATION.md` for detailed docs.
