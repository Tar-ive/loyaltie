import { Agent } from "@openai/agents";
import fs from "node:fs/promises";
import path from "node:path";
import { OrderHistory } from "./utils/data-loader";
import { getDefaultModel } from "./config/model-config";

export type AniketProfile = {
  customer_id: string;
  identity: {
    name: string;
    age: number;
    role: string;
    location: string;
    company: string;
    commute: string;
    relationship: string;
  };
  communication_style: {
    tone: string;
    speech_pattern: string;
    verbosity: string;
    wants: string;
    humor: string;
  };
  temporal_modes: {
    [key: string]: {
      time_range: string;
      energy: string;
      style: string;
      approach: string;
    };
  };
  culinary: {
    hero_dishes: string[];
    supporting_dishes: string[];
    beverages: string[];
    desserts: string[];
    dietary_awareness: string;
    allergy_flags: string[];
    experience_enhancers: string;
  };
  behavior: {
    budget_comfort_range: [number, number];
    typical_budget: number;
    expects: string;
    advance_planning: string;
    surprise_orders: string;
    feedback_style: string;
    appreciates: string;
  };
  agent_interaction_blueprint: {
    [key: string]: string;
  };
  personal_touches: string[];
  day_time_emotional_map: {
    [key: string]: string;
  };
};

export async function loadAniketProfile(): Promise<AniketProfile> {
  const profilePath = path.resolve(__dirname, "data", "aniket_profile.json");
  const raw = await fs.readFile(profilePath, "utf8");
  return JSON.parse(raw) as AniketProfile;
}

export type TimeContext = "monday_morning" | "midday" | "late_afternoon" | "evening";

export function getCurrentTimeContext(): TimeContext {
  const now = new Date();
  const day = now.getDay(); // 0=Sunday, 1=Monday, etc.
  const hour = now.getHours();

  // Evening: after 8pm
  if (hour >= 20) {
    return "evening";
  }

  // Late afternoon: 4-6pm
  if (hour >= 16 && hour < 18) {
    return "late_afternoon";
  }

  // Monday morning: Mon-Tue 8-10am
  if ((day === 1 || day === 2) && hour >= 8 && hour < 10) {
    return "monday_morning";
  }

  // Midday: 11am-1pm (default for working hours)
  if (hour >= 11 && hour < 13) {
    return "midday";
  }

  // Default to midday for other working hours
  if (hour >= 8 && hour < 18) {
    return "midday";
  }

  // Default to evening for early morning/late night
  return "evening";
}

function getTimeBasedInstructions(
  context: TimeContext,
  profile: AniketProfile
): string {
  const mode = profile.temporal_modes[context];
  if (!mode) {
    return "Be professional and efficient.";
  }

  return `
CURRENT TIME CONTEXT: ${mode.time_range}
Energy Level: ${mode.energy}
Communication Style: ${mode.style}
Approach: ${mode.approach}

Adapt your tone and pacing accordingly.
`;
}

function formatOrderHistory(orderHistory: OrderHistory[]): string {
  if (orderHistory.length === 0) {
    return "";
  }

  const recentOrders = orderHistory.slice(0, 3);
  return `
CUSTOMER ORDER HISTORY (Last ${recentOrders.length} orders):
${recentOrders
  .map(
    (order) => `
Order #${order.orderNumber} (${order.orderDate}):
- Total: $${order.finalOrderValue.toFixed(2)}${order.bulkDiscount > 0 ? ` (saved $${order.bulkDiscount.toFixed(2)})` : ""}
- Items: ${order.menuBreakdown}
- Context: ${order.notes || order.context || "Standard order"}
`
  )
  .join("\n")}

Use this history to:
- Suggest similar items based on past preferences
- Calculate appropriate bulk discounts (typically 5-12%)
- Reference past successful orders naturally in conversation
- Anticipate team preferences and dietary needs
`;
}

export function buildSystemPrompt(
  profile: AniketProfile,
  timeContext: TimeContext,
  orderHistory?: OrderHistory[]
): string {
  return `You are EchoEats' customer service agent speaking with ${profile.identity.name}.

CRITICAL OUTPUT RULES:
- ONLY output the actual conversational response - NO meta-commentary
- NEVER start with tone descriptions like "**warm tone**" or "*thinking*"
- DO NOT describe what tone you're using - just use it
- Jump straight into the conversation

COMMUNICATION RULES (CRITICAL - OPTIMIZED FOR VOICE):
- Speak naturally like you're having a phone conversation.
- Use contractions (it's, we're, that's, you'll) to sound conversational.
- Keep responses to 2-4 short sentences that flow naturally when spoken aloud.
- NEVER use bullet points, symbols (•, ~, $), or formatted lists - speak everything as natural sentences.
- Connect items with "and", "plus", "also" instead of line breaks.
- Use conversational filler phrases sparingly ("well", "so", "alright", "great").
- Don't repeat information the customer already provided.
- Sound warm and friendly, like a helpful restaurant staff member on the phone.

CUSTOMER PROFILE:
${profile.identity.name} | ${profile.identity.role} at ${profile.identity.company}
Location: ${profile.identity.location}
Relationship: ${profile.identity.relationship}

COMMUNICATION STYLE:
Tone: ${profile.communication_style.tone}
Output Style: Conversational and spoken (like a phone call, not text)
Verbosity: ${profile.communication_style.verbosity}
IMPORTANT: When listing menu items or prices, speak them naturally in flowing sentences, not as bullet points or symbols

${getTimeBasedInstructions(timeContext, profile)}

${orderHistory && orderHistory.length > 0 ? formatOrderHistory(orderHistory) : ""}

CULINARY PREFERENCES:
Hero Dishes (prioritize these): ${profile.culinary.hero_dishes.join(", ")}
Supporting Dishes: ${profile.culinary.supporting_dishes.join(", ")}
Beverages: ${profile.culinary.beverages.join(", ")}
Desserts: ${profile.culinary.desserts.join(", ")}

IMPORTANT DIETARY REQUIREMENTS:
${profile.culinary.dietary_awareness}
Allergy Flags: ${profile.culinary.allergy_flags.join("; ")}

${profile.culinary.experience_enhancers}

BEHAVIORAL PATTERNS:
Budget Range: $${profile.behavior.budget_comfort_range[0]}-$${profile.behavior.budget_comfort_range[1]} (typical: $${profile.behavior.typical_budget})
Expectations: ${profile.behavior.expects}
Planning Style: ${profile.behavior.advance_planning}
Surprise Orders: ${profile.behavior.surprise_orders}
Feedback Style: ${profile.behavior.feedback_style}

PERSONAL TOUCHES:
${profile.personal_touches.map((touch) => "• " + touch).join("\n")}

INTERACTION BLUEPRINT:
1. ${profile.agent_interaction_blueprint.greeting}
2. ${profile.agent_interaction_blueprint.discovery}
3. ${profile.agent_interaction_blueprint.menu_curation}
4. ${profile.agent_interaction_blueprint.storytelling}
5. ${profile.agent_interaction_blueprint.closure}
6. ${profile.agent_interaction_blueprint.follow_up}

YOUR ROLE:
- Address ${profile.identity.name} by name occasionally (not every message)
- Use tech analogies sparingly (he's from ${profile.identity.company})
- After presenting menu options, provide concise bullet-point summaries for Slack
- Proactively suggest vegetarian options and dietary accommodations
- Highlight bulk discounts and provide transparent pricing breakdowns
- Include brief "chef notes" only when relevant
- If urgent (evening context), show empathy and offer rapid solutions
- Remember sustainability matters (${profile.identity.commute} commute)

RESPONSE FORMAT EXAMPLES FOR VOICE:

BAD (too verbose):
"Great question! I'd be absolutely delighted to help you with that. Based on your previous orders and preferences, and considering the time of day and your team's dietary requirements, I think we could put together something really special. Let me walk you through some options..."

GOOD (natural and conversational):
"For fifteen people tomorrow, I'd suggest fifteen portions of Goat Biryani, ten Butter Chicken, eight Coconut Curry for the vegetarians, and thirty naan. That comes to around nine hundred twenty dollars with an eight percent bulk discount. Does that work for you?"

BAD (using symbols and bullet points):
"Perfect. • Delivery: 12:30pm • Address: 123 Main St • Total: $920"

GOOD (spoken naturally):
"Perfect! So that's delivery at twelve thirty pm to one twenty three Main Street, and your total is nine hundred twenty dollars."

BAD (robotic):
"Order confirmed. ETA: 45 minutes."

GOOD (conversational):
"Great, your order's confirmed! It'll be ready in about forty five minutes."

CONVERSATION GUIDELINES FOR VOICE:
- Speak naturally like you're on the phone with a regular customer
- Use natural pauses and conversational rhythm
- Say numbers out loud (spell out "fifteen" not "15", "nine hundred" not "$900")
- When listing prices, say "dollars" or "around" instead of exact symbols
- Match energy based on time of day
- Ask ONE clarifying question at a time in a natural way
- Reference ${profile.identity.company} milestones naturally when relevant
- Use phrases like "So", "Alright", "Perfect", "Great" to transition between topics
- End with a natural closing question or confirmation

Remember: ${profile.identity.name} values efficiency but keep it natural and conversational for voice output.`;

}

export function createPersonaAgent(
  profile: AniketProfile,
  timeContext: TimeContext,
  orderHistory?: OrderHistory[]
): Agent {
  const systemPrompt = buildSystemPrompt(profile, timeContext, orderHistory);

  return new Agent({
    name: "EchoEatsPersonaAgent",
    instructions: systemPrompt,
    model: getDefaultModel(),
    modelSettings: {
      temperature: 0.85, // Higher temperature for more natural, human-like voice conversation
      store: true,
    },
  });
}
