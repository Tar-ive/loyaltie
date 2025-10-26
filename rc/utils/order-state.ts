import { OrderDraft } from "../session/session-manager";

export function detectOrderIntent(message: string): boolean {
  const patterns = [
    /\b(need|want|like to order|ordering)\b/i,
    /\b(catering for|lunch for|dinner for|breakfast for)\b/i,
    /\b(\d+\s*(people|person|ppl|folks))\b/i,
    /\b(team|office|group|event)\b.*\b(order|meal|food|catering)\b/i,
  ];

  return patterns.some((pattern) => pattern.test(message));
}

export function detectConfirmationIntent(message: string): boolean {
  const affirmative = /\b(yes|yep|yeah|yup|sure|ok|okay|confirm|confirmed|approve|approved|place it|place the order|go ahead|sounds good|looks good|perfect|great)\b/i;
  const negative = /\b(no|nope|nah|cancel|don't|never mind|hold on|wait)\b/i;

  // Check if negative words are present - if so, not a confirmation
  if (negative.test(message)) {
    return false;
  }

  return affirmative.test(message);
}

export function extractOrderDraft(agentResponse: string): OrderDraft | null {
  const draft: OrderDraft = {
    items: [],
  };

  // Extract items with patterns like "15× Goat Biryani" or "15 Goat Biryani" or "15x Goat Biryani"
  const itemPatterns = [
    /(\d+)\s*[×x]\s*([A-Z][A-Za-z\s&]+?)(?=\s*(?:\(|$|•|,|\d+\s*[×x]))/gi,
    /(\d+)\s+([A-Z][A-Za-z\s&]+?)(?=\s*(?:\(|$|•|,|\d+\s+[A-Z]))/gi,
  ];

  for (const pattern of itemPatterns) {
    let match;
    while ((match = pattern.exec(agentResponse)) !== null) {
      const quantity = parseInt(match[1], 10);
      const name = match[2].trim();

      // Skip if it looks like it's part of a price or other number
      if (name && name.length > 3 && quantity > 0 && quantity < 1000) {
        // Check if we already have this item
        const existing = draft.items.find(
          (item) => item.name.toLowerCase() === name.toLowerCase()
        );
        if (!existing) {
          draft.items.push({ quantity, name });
        }
      }
    }
  }

  // Extract estimated total
  const totalPatterns = [
    /total[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /estimated[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:total|with)/i,
    /~\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/,
  ];

  for (const pattern of totalPatterns) {
    const match = agentResponse.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      if (amount > 0 && amount < 100000) {
        draft.estimatedTotal = amount;
        break;
      }
    }
  }

  // Extract delivery date/time
  const datePatterns = [
    /(?:needed by|delivery|for)\s+(?:tomorrow|tonight|today)/i,
    /(?:needed by|delivery|for)\s+(\w+\s+\d+(?:st|nd|rd|th)?)/i,
    /(?:needed by|delivery|for)\s+(\d+\/\d+)/i,
  ];

  for (const pattern of datePatterns) {
    const match = agentResponse.match(pattern);
    if (match) {
      draft.deliveryDate = match[0];
      break;
    }
  }

  // Only return draft if we found at least some items
  return draft.items.length > 0 ? draft : null;
}

export function formatOrderDraft(draft: OrderDraft): string {
  let output = "Order Summary:\n";

  if (draft.items.length > 0) {
    draft.items.forEach((item) => {
      output += `  • ${item.quantity}× ${item.name}`;
      if (item.notes) {
        output += ` (${item.notes})`;
      }
      output += "\n";
    });
  }

  if (draft.deliveryDate) {
    output += `\nDelivery: ${draft.deliveryDate}`;
  }

  if (draft.deliveryAddress) {
    output += `\nAddress: ${draft.deliveryAddress}`;
  }

  if (draft.estimatedTotal) {
    output += `\n\nEstimated Total: $${draft.estimatedTotal.toFixed(2)}`;
  }

  return output;
}
