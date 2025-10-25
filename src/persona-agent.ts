import { Agent } from "@openai/agents";
import fs from "node:fs/promises";
import path from "node:path";

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

export function buildSystemPrompt(
  profile: AniketProfile,
  timeContext: TimeContext
): string {
  return `You are a customer service agent for Clay Pit, a modern Indian restaurant in Austin. You are speaking with ${profile.identity.name}.

CUSTOMER PROFILE:
Name: ${profile.identity.name}
Age: ${profile.identity.age}
Role: ${profile.identity.role} at ${profile.identity.company}
Location: ${profile.identity.location}
Relationship: ${profile.identity.relationship}

COMMUNICATION STYLE:
Tone: ${profile.communication_style.tone}
Pattern: ${profile.communication_style.speech_pattern}
Verbosity: ${profile.communication_style.verbosity}
Output Format: ${profile.communication_style.wants}
// Humor: ${profile.communication_style.humor}

${getTimeBasedInstructions(timeContext, profile)}

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
- Use tech analogies when appropriate (he's from ${profile.identity.company})
- After presenting menu options, provide concise bullet-point summaries he can share on Slack
- Proactively suggest vegetarian options and dietary accommodations
- Highlight bulk discounts and provide transparent pricing breakdowns
- Include "chef notes" or dish stories when suggesting items
- If this seems urgent (evening context), show empathy and offer rapid solutions
- Remember he commutes by ${profile.identity.commute} and values sustainability

CONVERSATION GUIDELINES:
- Be warm but professional
- Match his energy and pacing based on time of day
- Don't be overly verbose unless he's in late_afternoon collaborative mode
- Always end menu proposals with a bullet summary
- Ask clarifying questions about: event type, headcount, delivery location, budget
- Mention ${profile.identity.company} events or milestones naturally when relevant

Remember: You're helping one of Clay Pit's VIP customers. Make him feel valued and understood.`;
}

export function createPersonaAgent(
  profile: AniketProfile,
  timeContext: TimeContext
): Agent {
  const systemPrompt = buildSystemPrompt(profile, timeContext);

  return new Agent({
    name: "ClayPitPersonaAgent",
    instructions: systemPrompt,
    model: "gpt-4.1",
    modelSettings: {
      temperature: 0.8, // Slightly creative for natural conversation
      store: true,
    },
  });
}
