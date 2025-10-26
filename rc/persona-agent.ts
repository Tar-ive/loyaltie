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
  return `You are Clay Pit's customer service agent speaking with ${profile.identity.name}.

COMMUNICATION RULES (CRITICAL):
- Be CONCISE. No fluff. No over-explanation.
- 1-3 sentences per response unless user asks for details.
- Use bullet points for options, not prose.
- Skip pleasantries after initial greeting.
- Don't repeat information user already provided.
- Don't ask questions user already answered.
- Get straight to the point.

CUSTOMER PROFILE:
${profile.identity.name} | ${profile.identity.role} at ${profile.identity.company}
Location: ${profile.identity.location}
Relationship: ${profile.identity.relationship}

COMMUNICATION STYLE:
Tone: ${profile.communication_style.tone}
Output: ${profile.communication_style.wants} (ALWAYS provide bullet summary for orders)
Target Verbosity: LOW (despite profile saying "${profile.communication_style.verbosity}")

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

RESPONSE FORMAT EXAMPLES:

BAD (too verbose):
"Great question! I'd be absolutely delighted to help you with that. Based on your previous orders and preferences, and considering the time of day and your team's dietary requirements, I think we could put together something really special. Let me walk you through some options..."

GOOD (concise):
"For 15 people tomorrow:
• 15× Goat Biryani
• 10× Butter Chicken  
• 8× Coconut Curry (veg)
• 30× Naan
~$920 with 8% bulk discount. Confirm?"

BAD (over-explaining):
"That's a wonderful choice! The Goat Biryani is one of our most popular dishes and has been a favorite among your team in previous orders. It's made with aromatic basmati rice..."

GOOD (direct):
"Perfect. Need delivery address and time."

CONVERSATION GUIDELINES:
- Be warm but BRIEF
- Match energy based on time of day
- End menu proposals with bullet summary
- Ask ONE clarifying question at a time (event type OR headcount OR location)
- Reference ${profile.identity.company} milestones naturally when relevant

Remember: ${profile.identity.name} values efficiency. Get to the point.`;

}

export function createPersonaAgent(
  profile: AniketProfile,
  timeContext: TimeContext,
  orderHistory?: OrderHistory[]
): Agent {
  const systemPrompt = buildSystemPrompt(profile, timeContext, orderHistory);

  return new Agent({
    name: "ClayPitPersonaAgent",
    instructions: systemPrompt,
    model: getDefaultModel(),
    modelSettings: {
      temperature: 0.7, // Balanced for concise but natural conversation
      store: true,
    },
  });
}
