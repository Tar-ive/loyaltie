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

export async function createCheckoutSession(
  draft: OrderDraft
): Promise<CheckoutSession> {
  // Generate mock checkout session
  const sessionId = `cs_test_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const orderId = `ORD-CLY-${new Date()
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "")}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    sessionId,
    checkoutUrl: `https://checkout.stripe.com/pay/${sessionId}`,
    amount: draft.estimatedTotal || 0,
    orderId,
    timestamp: new Date(),
  };
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
