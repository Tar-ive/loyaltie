import Stripe from "stripe";
import { OrderDraft } from "../session/session-manager";

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  amount: number;
  orderId: string;
  timestamp: Date;
}

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

export async function createCheckoutSession(
  draft: OrderDraft,
  customerEmail?: string
): Promise<CheckoutSession> {
  const orderId = `ORD-ECH-${new Date()
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "")}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

  // If Stripe is not configured, return mock checkout
  if (!stripe) {
    console.warn("⚠️  Stripe not configured - using mock checkout");
    const mockSessionId = `cs_test_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      sessionId: mockSessionId,
      checkoutUrl: `https://checkout.stripe.com/pay/${mockSessionId}`,
      amount: draft.estimatedTotal || 0,
      orderId,
      timestamp: new Date(),
    };
  }

  try {
    // Calculate total amount in cents
    const totalAmount = Math.round((draft.estimatedTotal || 0) * 100);

    // Create line items from order draft
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = draft.items.map((item) => {
      // Calculate price per item (distribute total evenly or use a default)
      const pricePerItem = draft.estimatedTotal
        ? Math.round((draft.estimatedTotal / draft.items.reduce((sum, i) => sum + i.quantity, 0)) * 100)
        : 1500; // Default $15 per item if no total

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.notes || "EchoEats food order",
          },
          unit_amount: pricePerItem,
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/cancel`,
      customer_email: customerEmail,
      metadata: {
        orderId,
        deliveryDate: draft.deliveryDate || "",
        deliveryAddress: draft.deliveryAddress || "",
        contact: draft.contact || "",
        items: JSON.stringify(draft.items),
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      amount: draft.estimatedTotal || 0,
      orderId,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);
    throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function displayCheckout(session: CheckoutSession): void {
  const border = "=".repeat(60);

  console.log("\n" + COLORS.cyan + border + COLORS.reset);
  console.log(
    COLORS.bold +
      COLORS.green +
      "💳 STRIPE CHECKOUT SESSION" +
      COLORS.reset
  );
  console.log(COLORS.cyan + border + COLORS.reset);

  console.log(
    COLORS.yellow + `\nOrder ID: ` + COLORS.reset + session.orderId
  );
  console.log(
    COLORS.yellow +
      `Amount: ` +
      COLORS.reset +
      `$${session.amount.toFixed(2)}`
  );
  console.log(
    COLORS.yellow +
      `Session: ` +
      COLORS.reset +
      session.sessionId
  );
  console.log(
    COLORS.yellow +
      `Created: ` +
      COLORS.reset +
      session.timestamp.toISOString()
  );

  console.log(
    COLORS.cyan +
      "\n📱 Checkout URL:" +
      COLORS.reset
  );
  console.log(COLORS.gray + session.checkoutUrl + COLORS.reset);

  // ASCII QR Code placeholder
  console.log(
    COLORS.gray +
      `
┌─────────────────────────┐
│ █▀▀▀▀▀█ ▀▀█▄ █▀▀▀▀▀█ │
│ █ ███ █ ██ █ █ ███ █ │
│ █ ▀▀▀ █ █▀█▄ █ ▀▀▀ █ │
│ ▀▀▀▀▀▀▀ ▀ █ ▀ ▀▀▀▀▀▀▀ │
│ ▀█▄▀█▀▀ ▄█▀█ ▀ ▀▀█▀▄ │
│ █▀ ▀▀▀▀▄  ▄█▀▀▄▀█▀ █ │
│ ▀▀  ▀▀▀█▀▀█ █▀▀▀▀██  │
│ █▀▀▀▀▀█  ▄▀█ █ ▀ █▀█ │
│ █ ███ █ █▀▄▀▀▀▄▀▄▄█▀ │
│ █ ▀▀▀ █ ▀█ ▀██ ▄█▀▀▄ │
│ ▀▀▀▀▀▀▀ ▀  ▀  ▀ ▀ ▀▀ │
└─────────────────────────┘
   [Scan to complete payment]
` +
      COLORS.reset
  );

  console.log(
    COLORS.gray +
      "\n💡 In production, this would redirect to Stripe's hosted checkout page." +
      COLORS.reset
  );
  console.log(COLORS.cyan + border + COLORS.reset + "\n");
}

export function displayPaymentConfirmation(session: CheckoutSession): void {
  console.log(
    COLORS.green +
      `\n✅ Payment Confirmed!` +
      COLORS.reset
  );
  console.log(
    COLORS.gray +
      `   Order ${session.orderId} has been placed successfully.` +
      COLORS.reset
  );
  console.log(
    COLORS.gray +
      `   You'll receive a confirmation email shortly.\n` +
      COLORS.reset
  );
}
