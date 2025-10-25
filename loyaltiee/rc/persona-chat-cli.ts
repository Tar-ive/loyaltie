import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Runner, AgentInputItem } from "@openai/agents";
import {
  loadAniketProfile,
  getCurrentTimeContext,
  createPersonaAgent,
  TimeContext,
} from "./persona-agent";

// ANSI color codes for better UX
const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function getTimeContextLabel(context: TimeContext): string {
  const labels: Record<TimeContext, string> = {
    monday_morning: "Monday Morning - Structured Mode",
    midday: "Midday - Efficient Mode",
    late_afternoon: "Late Afternoon - Collaborative Mode",
    evening: "Evening - High Urgency Mode",
  };
  return labels[context];
}

async function main() {
  console.log(colorize("\n=== Clay Pit Customer Service Agent ===\n", "cyan"));

  // Load Aniket's profile
  console.log(colorize("Loading customer profile...", "gray"));
  const profile = await loadAniketProfile();

  // Detect or override time context
  const timeArg = process.argv.find((arg) => arg.startsWith("--time="));
  let timeContext: TimeContext;

  if (timeArg) {
    const requested = timeArg.split("=")[1] as TimeContext;
    if (
      ["monday_morning", "midday", "late_afternoon", "evening"].includes(
        requested
      )
    ) {
      timeContext = requested;
      console.log(
        colorize(`Time context overridden: ${getTimeContextLabel(timeContext)}`, "yellow")
      );
    } else {
      console.log(
        colorize(
          `Invalid time context: ${requested}. Using auto-detected time.`,
          "yellow"
        )
      );
      timeContext = getCurrentTimeContext();
    }
  } else {
    timeContext = getCurrentTimeContext();
    console.log(
      colorize(`Detected time context: ${getTimeContextLabel(timeContext)}`, "gray")
    );
  }

  // Create the persona-aware agent
  const agent = createPersonaAgent(profile, timeContext);
  const runner = new Runner({
    traceMetadata: { __trace_source__: "persona-chat-cli" },
  });

  // Initialize conversation
  const rl = createInterface({ input, output });
  const conversationHistory: AgentInputItem[] = [];

  console.log(
    colorize(
      `\nCustomer: ${profile.identity.name} (${profile.identity.role})\n`,
      "cyan"
    )
  );
  console.log(
    colorize(
      "Agent: Hi! I'm here to help with your order. Type 'exit' to end the conversation.\n",
      "green"
    )
  );

  // Main conversation loop
  while (true) {
    const userInput = await rl.question(colorize("You: ", "cyan"));

    if (userInput.trim().toLowerCase() === "exit") {
      console.log(
        colorize(
          "\nAgent: Thank you! Looking forward to serving you soon.\n",
          "green"
        )
      );
      break;
    }

    if (!userInput.trim()) {
      continue;
    }

    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: userInput }],
    });

    // Show typing indicator
    process.stdout.write(colorize("Agent: ", "green"));

    try {
      // Run agent with conversation history
      const response = await runner.run(agent, [...conversationHistory]);

      if (!response.finalOutput) {
        console.log(
          colorize(
            "I apologize, I couldn't generate a response. Please try again.",
            "yellow"
          )
        );
        continue;
      }

      // Display agent response
      console.log(response.finalOutput.trim() + "\n");

      // Add agent response to history
      conversationHistory.push(
        ...response.newItems.map((item) => item.rawItem)
      );
    } catch (error) {
      console.error(
        colorize(
          `\nError: ${error instanceof Error ? error.message : "Unknown error"}\n`,
          "yellow"
        )
      );
      console.log(colorize("Let's try that again.\n", "gray"));
    }
  }

  rl.close();
  console.log(
    colorize(
      "💡 Tip: Use --time=<context> to simulate different times of day",
      "gray"
    )
  );
  console.log(
    colorize(
      "   Options: monday_morning, midday, late_afternoon, evening\n",
      "gray"
    )
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      colorize(
        `Fatal error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "yellow"
      )
    );
    process.exitCode = 1;
  });
}
