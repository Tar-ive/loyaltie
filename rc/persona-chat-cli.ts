import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Runner, AgentInputItem } from "@openai/agents";
import {
  loadAniketProfile,
  getCurrentTimeContext,
  createPersonaAgent,
  TimeContext,
} from "./persona-agent";
import { SessionManager, Session, OrderState } from "./session/session-manager";
import { SystemLogger, LogCategory } from "./logging/system-logger";
import { loadOrderHistory } from "./utils/data-loader";
import {
  detectOrderIntent,
  detectConfirmationIntent,
  extractOrderDraft,
  formatOrderDraft,
} from "./utils/order-state";
import {
  createCheckoutSession,
  displayCheckout,
  displayPaymentConfirmation,
} from "./utils/stripe-checkout";
import { ProfileUpdater } from "./learning/profile-updater";

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

function extractText(item: AgentInputItem): string {
  if ("content" in item && Array.isArray(item.content)) {
    return item.content
      .map((c: any) => {
        if (c.type === "input_text" || c.type === "output_text") {
          return c.text;
        }
        return "";
      })
      .join(" ")
      .trim();
  }
  return "";
}

async function askYesNo(
  rl: ReturnType<typeof createInterface>,
  question: string,
  defaultYes: boolean = false
): Promise<boolean> {
  const suffix = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = await rl.question(
    colorize(`${question} ${suffix} `, "yellow")
  );
  const trimmed = answer.toLowerCase().trim();

  if (!trimmed) return defaultYes;
  if (["y", "yes"].includes(trimmed)) return true;
  if (["n", "no"].includes(trimmed)) return false;

  // Invalid input, ask again
  console.log(colorize("Please answer 'y' or 'n'", "gray"));
  return askYesNo(rl, question, defaultYes);
}

async function main() {
  console.log(colorize("\n=== EchoEats Customer Service Agent ===\n", "cyan"));

  // Load Aniket's profile
  console.log(colorize("Loading customer profile...", "gray"));
  const profile = await loadAniketProfile();

  // Initialize session manager
  const sessionManager = new SessionManager();
  const activeSessions = await sessionManager.listActiveSessions(
    profile.customer_id
  );

  let session: Session;

  if (activeSessions.length > 0) {
    console.log(
      colorize(`\nFound ${activeSessions.length} active session(s):`, "cyan")
    );
    activeSessions.slice(0, 3).forEach((s, i) => {
      const lastAccessed = new Date(s.lastAccessedAt).toLocaleString();
      console.log(
        colorize(
          `  ${i + 1}. ${s.sessionId} (${s.conversationTurns} turns, last: ${lastAccessed})`,
          "gray"
        )
      );
    });

    const rl = createInterface({ input, output });
    const resume = await askYesNo(rl, "\nResume last session?", true);

    if (resume) {
      session = await sessionManager.resumeSession(activeSessions[0].sessionId);
      console.log(colorize("✓ Session resumed\n", "green"));
    } else {
      session = await sessionManager.createSession(
        profile.customer_id,
        profile.identity.name
      );
      console.log(colorize("✓ New session created\n", "green"));
    }
    rl.close();
  } else {
    session = await sessionManager.createSession(
      profile.customer_id,
      profile.identity.name
    );
    console.log(colorize("✓ New session created\n", "green"));
  }

  // Initialize logger
  const logger = new SystemLogger(session.metadata.sessionId);
  logger.info(LogCategory.SESSION_START, "Session started", {
    customerId: profile.customer_id,
    customerName: profile.identity.name,
    sessionId: session.metadata.sessionId,
  });

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
      logger.info(
        LogCategory.SYSTEM_INFO,
        `Time context overridden: ${timeContext}`
      );
      console.log(
        colorize(
          `Time context overridden: ${getTimeContextLabel(timeContext)}`,
          "yellow"
        )
      );
    } else {
      logger.warn(
        LogCategory.SYSTEM_INFO,
        `Invalid time context: ${requested}`
      );
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
    logger.info(LogCategory.SYSTEM_INFO, `Time context: ${timeContext}`);
    console.log(
      colorize(
        `Detected time context: ${getTimeContextLabel(timeContext)}`,
        "gray"
      )
    );
  }

  // Load order history
  const orderHistory = await logger.trackOperation(
    LogCategory.DATA_LOAD,
    "Load order history",
    () => loadOrderHistory(profile.identity.name)
  );
  console.log(
    colorize(`✓ Loaded ${orderHistory.length} historical orders\n`, "gray")
  );

  // Create the persona-aware agent with order history
  const agent = createPersonaAgent(profile, timeContext, orderHistory);
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "persona-chat-cli",
      sessionId: session.metadata.sessionId,
    },
  });

  // Initialize conversation
  const rl = createInterface({ input, output });
  let conversationHistory: AgentInputItem[] =
    session.state.conversationHistory;
  let orderState: OrderState = session.state.orderState;

  console.log(
    colorize(
      `Customer: ${profile.identity.name} (${profile.identity.role})\n`,
      "cyan"
    )
  );

  // Show conversation history if resuming
  if (conversationHistory.length > 0) {
    console.log(colorize("[Conversation history restored]", "gray"));
    const recentHistory = conversationHistory.slice(-6);
    for (const item of recentHistory) {
      if ("role" in item && item.role === "user") {
        const text = extractText(item);
        if (text) {
          console.log(colorize("You: ", "cyan") + text);
        }
      } else {
        const text = extractText(item);
        if (text) {
          console.log(colorize("Agent: ", "green") + text);
        }
      }
    }
    console.log();
  } else {
    console.log(
      colorize(
        "Agent: Hi! What can I help you order today? Type 'exit' to end.\n",
        "green"
      )
    );
  }

  // Main conversation loop
  while (true) {
    const userInput = await rl.question(colorize("You: ", "cyan"));

    if (userInput.trim().toLowerCase() === "exit") {
      logger.info(LogCategory.SESSION_END, "User exited session");

      // Extract learnings
      console.log(colorize("\n🧠 Analyzing conversation for learnings...", "cyan"));
      const profileUpdater = new ProfileUpdater(logger);
      const learnings = await profileUpdater.extractLearnings(
        conversationHistory,
        session.metadata.sessionId
      );

      if (learnings.length > 0) {
        console.log(
          colorize(
            `\n✓ Learned ${learnings.length} new thing(s) about you:`,
            "cyan"
          )
        );
        learnings.forEach((l) => {
          console.log(
            colorize(`  • ${l.field}: ${JSON.stringify(l.newValue)}`, "gray")
          );
        });

        const applyUpdates = await askYesNo(
          rl,
          "\nUpdate your profile with this info?",
          true
        );
        if (applyUpdates) {
          await profileUpdater.applyUpdates(learnings);
          logger.info(LogCategory.PROFILE_UPDATE, "Profile updated with learnings");
        }
      }

      await sessionManager.closeSession("completed");
      await logger.close();

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

    logger.info(LogCategory.USER_INPUT, userInput);

    // Handle order confirmation state
    if (orderState.phase === "confirming") {
      if (detectConfirmationIntent(userInput)) {
        logger.info(LogCategory.ORDER_CONFIRMED, "User confirmed order", {
          draft: orderState.draft,
        });

        orderState = { phase: "processing", draft: orderState.draft };
        sessionManager.updateOrderState(orderState);

        console.log(colorize("\n🔄 Processing order...\n", "yellow"));

        // Simulate processing steps with logging
        await logger.trackOperation(
          LogCategory.PERFORMANCE,
          "Calculate pricing",
          () => new Promise((r) => setTimeout(r, 800))
        );

        await logger.trackOperation(
          LogCategory.PERFORMANCE,
          "Apply bulk discount",
          () => new Promise((r) => setTimeout(r, 600))
        );

        // Create checkout session
        logger.info(LogCategory.CHECKOUT_INITIATED, "Starting checkout process");
        const checkoutSession = await logger.trackOperation(
          LogCategory.CHECKOUT_INITIATED,
          "Create checkout session",
          () => createCheckoutSession(orderState.draft!)
        );

        logger.info(LogCategory.CHECKOUT_COMPLETED, "Checkout session created", {
          sessionId: checkoutSession.sessionId,
          orderId: checkoutSession.orderId,
          amount: checkoutSession.amount,
        });

        displayCheckout(checkoutSession);
        displayPaymentConfirmation(checkoutSession);

        orderState = {
          phase: "completed",
          orderId: checkoutSession.orderId,
        };
        sessionManager.updateOrderState(orderState);
        await sessionManager.saveSession(session);

        // Feed confirmation back to agent for receipt generation
        conversationHistory.push({
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Order confirmed. Order ID: ${checkoutSession.orderId}`,
            },
          ],
        });

        const receiptResponse = await runner.run(agent, [
          ...conversationHistory,
        ]);
        if (receiptResponse.finalOutput) {
          console.log(
            colorize("Agent: ", "green") +
              receiptResponse.finalOutput.trim() +
              "\n"
          );
          conversationHistory.push(
            ...receiptResponse.newItems.map((item) => item.rawItem)
          );
        }

        orderState = { phase: "chatting" };
        sessionManager.updateOrderState(orderState);
        sessionManager.updateConversationHistory(conversationHistory);
        await sessionManager.saveSession(session);

        continue;
      } else {
        logger.info(LogCategory.ORDER_CANCELLED, "User declined order");
        console.log(
          colorize(
            "No problem! Let me know if you'd like to adjust anything.\n",
            "green"
          )
        );
        orderState = { phase: "chatting" };
        sessionManager.updateOrderState(orderState);
        continue;
      }
    }

    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: userInput }],
    });

    // Show typing indicator
    process.stdout.write(colorize("Agent: ", "green"));

    try {
      const startTime = Date.now();
      logger.debug(LogCategory.AGENT_CALL, "Calling agent");

      // Run agent with conversation history
      const response = await runner.run(agent, [...conversationHistory]);

      const duration = Date.now() - startTime;
      logger.log(
        "info" as any,
        LogCategory.AGENT_RESPONSE,
        "Agent responded",
        undefined,
        duration
      );

      if (!response.finalOutput) {
        logger.error(LogCategory.AGENT_ERROR, "No response from agent");
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

      // Save conversation state
      sessionManager.updateConversationHistory(conversationHistory);
      await sessionManager.saveSession(session);

      // Detect order intent
      if (
        detectOrderIntent(userInput) ||
        response.finalOutput.toLowerCase().includes("confirm")
      ) {
        const draft = extractOrderDraft(response.finalOutput);
        if (draft && draft.items.length > 0) {
          logger.info(LogCategory.ORDER_INTENT_DETECTED, "Order intent detected", {
            itemCount: draft.items.length,
          });
          logger.info(LogCategory.ORDER_DRAFT_CREATED, "Order draft created", {
            draft,
          });

          // Show summary and transition to confirming state
          console.log(colorize("\n📋 Order Summary:", "cyan"));
          console.log(colorize(formatOrderDraft(draft), "gray"));
          console.log();

          orderState = { phase: "confirming", draft };
          sessionManager.updateOrderState(orderState);
          await sessionManager.saveSession(session);

          console.log(
            colorize("Type 'yes' to confirm or 'no' to adjust: ", "yellow")
          );
        }
      }
    } catch (error) {
      logger.error(LogCategory.AGENT_ERROR, "Agent call failed", error as Error);
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
