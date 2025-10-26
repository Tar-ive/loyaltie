# ✅ Stripe Integration - Complete Setup Guide

---

## **STEP 1: Get Your Stripe Test Key** ✅

### A. Create Stripe Account

1. Go to: **https://dashboard.stripe.com/register**
2. Sign up with your email
3. Create a password
4. Skip business details (for now)

### B. Get Your API Key

1. After login, click **"Developers"** in left sidebar
2. Click **"API keys"**
3. Find **"Secret key"** (starts with `sk_test_...`)
4. Click **"Reveal test key"**
5. Click **"Copy"** button

### C. Add to `.env` File

Open: `C:\Users\Sharan Murli\OneDrive\Desktop\aitx_hackathon\.env`

Replace this line:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
```

With your actual key:
```env
STRIPE_SECRET_KEY=sk_test_51AbCdEf123456789...
```

**✅ Done!** Now restart your server.

---

## **STEP 2: Test with Stripe Test Cards** ✅

### A. Restart Server

```bash
# Stop current server (Ctrl+C)
npm run server
```

Look for: `✅ Stripe configured successfully`

### B. Test Complete Flow

1. **Open app:** http://localhost:3000
2. **New conversation:** Click "New Conversation"
3. **Place order:**
   ```
   You: I want to order 2 pizzas and fries
   AI: [Proposes order with price]
   You: yes
   AI: [Sends checkout link]
   ```
4. **Click the checkout link**
5. **Use test card:**
   ```
   Card:   4242 4242 4242 4242
   Expiry: 12/34
   CVC:    123
   ZIP:    12345
   ```
6. **Click "Pay"**
7. **Redirected to success page!** ✅

### Stripe Test Cards Reference

| Card Number | Result | Use Case |
|-------------|--------|----------|
| `4242 4242 4242 4242` | ✅ Success | Normal purchase |
| `4000 0000 0000 0002` | ❌ Declined | Test error handling |
| `4000 0000 0000 9995` | ❌ Insufficient funds | Test insufficient funds |
| `5555 5555 5555 4444` | ✅ Success | Mastercard |
| `3782 822463 10005` | ✅ Success | American Express |

More cards: https://docs.stripe.com/testing#cards

---

## **STEP 3: Success & Cancel Pages** ✅

**Already created for you!**

### Success Page
- **URL:** http://localhost:3000/success
- **Shows:** Order confirmation, order ID, next steps
- **Actions:** Return to chat, print receipt

### Cancel Page
- **URL:** http://localhost:3000/cancel
- **Shows:** Payment canceled message
- **Actions:** Return to chat, try again

**Try them:**
1. Complete a test payment → See success page
2. Cancel during payment → See cancel page

---

## **STEP 4: Production Deployment**

### When You're Ready for REAL Payments

### A. Switch to Live Mode in Stripe

1. Go to: **https://dashboard.stripe.com**
2. Toggle switch from **"Test mode"** to **"Live mode"** (top right)
3. Go to **Developers → API keys**
4. Copy your **live Secret key** (starts with `sk_live_...`)

### B. Update Environment Variables

**For Production Server:**

```env
# Replace test key with live key
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE

# Update frontend URL to your domain
FRONTEND_URL=https://yourdomain.com
```

### C. Important: Complete Stripe Account Setup

Before going live, Stripe requires:

1. **Business Information:**
   - Business name
   - Business address
   - Tax information

2. **Bank Account:**
   - Add your bank account for payouts
   - Verify bank account (microdeposits)

3. **Identity Verification:**
   - Upload ID documents
   - Business documentation (if applicable)

**Complete setup:** https://dashboard.stripe.com/account/onboarding

### D. Security Checklist

✅ **Before Production:**

- [ ] Never commit `.env` file to Git
- [ ] Use live keys ONLY on production server
- [ ] Enable 2FA on Stripe account
- [ ] Set up webhook endpoints (optional but recommended)
- [ ] Test with small real payments first
- [ ] Review Stripe Dashboard regularly
- [ ] Set up email notifications in Stripe

---

## **📊 Testing Checklist**

### ✅ Complete Test Flow

- [ ] **Setup:**
  - [ ] Added Stripe test key to `.env`
  - [ ] Restarted backend server
  - [ ] Saw "Stripe configured" message

- [ ] **Order Flow:**
  - [ ] Opened frontend (localhost:3000)
  - [ ] Created new conversation
  - [ ] Placed an order via chat
  - [ ] AI proposed order with price
  - [ ] Confirmed with "yes"
  - [ ] Received checkout link

- [ ] **Payment:**
  - [ ] Clicked checkout link
  - [ ] Opened Stripe payment page
  - [ ] Entered test card: 4242 4242 4242 4242
  - [ ] Clicked "Pay"
  - [ ] Redirected to success page
  - [ ] Saw order ID

- [ ] **Pages:**
  - [ ] Success page displays correctly
  - [ ] Can return to chat from success page
  - [ ] Cancel page works if payment canceled

### ✅ Error Testing

- [ ] **Declined Card:**
  - [ ] Used card: 4000 0000 0000 0002
  - [ ] Payment declined
  - [ ] Error message shown

- [ ] **Network Issues:**
  - [ ] Server restart doesn't break ongoing orders
  - [ ] Frontend handles API errors gracefully

---

## **🎯 Quick Reference**

### Test Card (Always Works)
```
Card:   4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC:    123 (any 3 digits)
ZIP:    12345 (any 5 digits)
```

### URLs
- **Dashboard:** https://dashboard.stripe.com
- **API Keys:** https://dashboard.stripe.com/test/apikeys
- **Payments:** https://dashboard.stripe.com/test/payments
- **Docs:** https://docs.stripe.com/testing

### File Locations
- **Stripe Checkout Logic:** `rc/utils/stripe-checkout.ts`
- **Order Detection:** `rc/services/message-service.ts`
- **Success Page:** `frontend/src/app/success/page.tsx`
- **Cancel Page:** `frontend/src/app/cancel/page.tsx`
- **Environment Config:** `.env`

---

## **🐛 Troubleshooting**

### "Stripe not configured"

**Problem:** Server shows warning about Stripe

**Solution:**
1. Check `.env` has `STRIPE_SECRET_KEY=sk_test_...`
2. Restart server: `npm run server`
3. Verify key is correct in Stripe Dashboard

### "Invalid API key"

**Problem:** Stripe API returns error

**Solution:**
1. Make sure you copied the **Secret key** (not Publishable key)
2. Key should start with `sk_test_` for testing
3. Reveal and copy key again from Stripe

### Checkout link doesn't work

**Problem:** Link shows error when clicked

**Solution:**
1. Check `FRONTEND_URL=http://localhost:3000` in `.env`
2. Make sure frontend is running
3. Verify Stripe account is active

### Payment succeeds but no redirect

**Problem:** After payment, stays on Stripe page

**Solution:**
1. Check success URL is correct in `.env`
2. Make sure `success` page exists in frontend
3. Clear browser cache and try again

---

## **📚 Next Steps**

### For Development
1. ✅ Test with various orders
2. ✅ Try different test cards
3. ✅ Test error scenarios
4. ⬜ Add webhook handling (advanced)
5. ⬜ Store orders in database (advanced)

### For Production
1. ⬜ Complete Stripe account verification
2. ⬜ Switch to live API keys
3. ⬜ Update FRONTEND_URL to your domain
4. ⬜ Test with small real payments
5. ⬜ Set up monitoring and alerts

---

## **🎊 You're All Set!**

Your Stripe integration is **fully functional** and ready to test!

### What You Can Do Now:
✅ Accept test payments
✅ Generate checkout links
✅ Handle successful payments
✅ Handle canceled payments
✅ Track orders with IDs

### When Ready for Real Money:
- Complete Stripe verification
- Switch to live keys
- Deploy to production
- Start accepting real payments!

---

## **💬 Need Help?**

- **Stripe Docs:** https://docs.stripe.com
- **Test Cards:** https://docs.stripe.com/testing
- **Support:** https://support.stripe.com

**Happy Testing!** 🚀
