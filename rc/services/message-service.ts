import { SessionManager, OrderState } from "../session/session-manager";
import { Runner, AgentInputItem } from "@openai/agents";
import { loadAniketProfile, getCurrentTimeContext, createPersonaAgent } from "../persona-agent";
import { SystemLogger } from "../logging/system-logger";
import { loadOrderHistory } from "../utils/data-loader";
import { performanceTracker } from "../utils/performance-tracker";
import { detectOrderIntent, detectConfirmationIntent, extractOrderDraft, formatOrderDraft } from "../utils/order-state";
import { createCheckoutSession } from "../utils/stripe-checkout";

export interface SendMessageResult {
  session_id: string;
  response: string;
  order_state: any;
  checkout_url?: string;
  order_id?: string;
  order_summary?: string;
}

export interface CreateSessionResult {
  metadata: any;
  state: any;
}

/**
 * Send a message to an existing session and get agent response
 */
export async function sendMessage(sessionId: string, message: string): Promise<SendMessageResult> {
  // Generate request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine provider and model
  const useNemotron = process.env.USE_NEMOTRON === 'true';
  const provider = useNemotron ? 'openrouter' : 'openai';
  const modelName = useNemotron ? 'nvidia/llama-3.1-nemotron-ultra-253b-v1' : 'gpt-4.1';
  
  // Start performance tracking
  const startTime = performanceTracker.startRequest(requestId, modelName, provider, message);
  
  try {
    // Load session
    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);

    // Initialize logger
    const logger = new SystemLogger(sessionId);

    // Load profile and create agent
    const profile = await loadAniketProfile();
    const timeContext = getCurrentTimeContext();
    const orderHistory = await loadOrderHistory(profile.identity.name);
    const agent = createPersonaAgent(profile, timeContext, orderHistory);

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "message-service",
        sessionId: sessionId,
        requestId: requestId,
      },
    });

    // Get conversation history from session
    const conversationHistory: AgentInputItem[] = session.state.conversationHistory || [];

    // Add user message
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: message }],
    });

    // Get agent response
    const response = await runner.run(agent, [...conversationHistory]);

    if (!response.finalOutput) {
      throw new Error("Agent did not produce a response");
    }

    const responseContent = response.finalOutput.trim();

    // Add agent response to history
    conversationHistory.push(...response.newItems.map((item) => item.rawItem));

    // Get current order state
    let orderState: OrderState = session.state.orderState || { phase: "chatting" };
    let checkoutUrl: string | undefined;
    let orderId: string | undefined;
    let orderSummary: string | undefined;

    // DETECT ORDER INTENT - Check if user is trying to place an order
    // First check if AI is mentioning a total price (order ready for confirmation)
    const hasPriceTotal = /\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?|total.*\$?\s*(\d+(?:,\d{3})*)/i.test(responseContent);
    const mentionsOrder = /order|confirm|delivery|checkout/i.test(responseContent);

    if ((detectOrderIntent(message) || responseContent.toLowerCase().includes("confirm")) && (hasPriceTotal || mentionsOrder)) {
      let draft = extractOrderDraft(responseContent);

      // If extraction failed but we have price info, create a simple draft
      if ((!draft || draft.items.length === 0) && hasPriceTotal) {
        // Extract price
        const priceMatch = responseContent.match(/(?:total.*?)?(?:\$|dollars?.*?)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
        const estimatedTotal = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;

        // Create simplified draft with price
        draft = {
          items: [{ name: "Order Items", quantity: 1, notes: "See conversation for details" }],
          estimatedTotal,
        };

        console.log(`📋 Order detected with price: $${estimatedTotal}`);
      } else if (draft && draft.items.length > 0) {
        console.log(`📋 Order detected with ${draft.items.length} items`);
      }

      if (draft && draft.estimatedTotal && draft.estimatedTotal > 0) {
        // Transition to "confirming" phase
        orderState = {
          phase: "confirming",
          draft,
        };

        orderSummary = formatOrderDraft(draft);
        console.log("Order summary:", orderSummary);
      }
    }

    // HANDLE ORDER CONFIRMATION - Check if user confirmed the order
    if (orderState.phase === "confirming" && detectConfirmationIntent(message)) {
      console.log("✅ User confirmed order, creating checkout...");

      try {
        // Move to processing phase
        orderState.phase = "processing";

        // Create Stripe checkout session
        const checkoutSession = await createCheckoutSession(
          orderState.draft!,
          profile.identity.name ? `${profile.identity.name.toLowerCase().replace(/\s/g, "")}@example.com` : undefined
        );

        console.log(`💳 Checkout created: ${checkoutSession.checkoutUrl}`);

        // Set checkout URL and order ID for response
        checkoutUrl = checkoutSession.checkoutUrl;
        orderId = checkoutSession.orderId;

        // Update order state to completed with order ID
        orderState = {
          phase: "completed",
          orderId: checkoutSession.orderId,
        };

      } catch (error) {
        console.error("❌ Checkout creation failed:", error);
        // Keep in confirming phase if checkout fails
        orderState.phase = "confirming";
      }
    }

    // Update session with new conversation history and order state
    await sessionManager.updateSession(sessionId, {
      conversationHistory,
      orderState,
    });

    // End performance tracking (estimate token usage)
    performanceTracker.endRequest(
      requestId,
      startTime,
      modelName,
      provider,
      message,
      responseContent,
      {
        prompt: Math.ceil(message.length / 4),
        completion: Math.ceil(responseContent.length / 4),
        total: Math.ceil((message.length + responseContent.length) / 4),
      }
    );

    return {
      session_id: sessionId,
      response: responseContent,
      order_state: orderState,
      checkout_url: checkoutUrl,
      order_id: orderId,
      order_summary: orderSummary,
    };
  } catch (error) {
    // Record error in performance tracker
    performanceTracker.recordError(
      requestId,
      modelName,
      provider,
      error instanceof Error ? error.message : String(error)
    );
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create a new session for a customer
 */
export async function createSession(customerId: string, customerName: string): Promise<CreateSessionResult> {
  try {
    const sessionManager = new SessionManager();
    const session = await sessionManager.createSession(customerId, customerName);
    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * List all sessions for a customer
 */
export async function listSessions(customerId: string): Promise<any[]> {
  try {
    const sessionManager = new SessionManager();
    const sessions = await sessionManager.listActiveSessions(customerId);
    return sessions;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get session details
 */
export async function getSession(sessionId: string): Promise<any> {
  try {
    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);
    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessionManager = new SessionManager();
    await sessionManager.closeSession("abandoned");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get conversation history for a session
 */
export async function getConversation(sessionId: string): Promise<any> {
  try {
    const sessionManager = new SessionManager();
    const session = await sessionManager.getSession(sessionId);

    return {
      session_id: sessionId,
      conversation: session.state.conversationHistory || [],
      order_state: session.state.orderState || {},
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get session logs
 */
export async function getSessionLogs(sessionId: string): Promise<any[]> {
  try {
    // For now, return empty array since SessionManager doesn't have getSessionLogs
    // TODO: Implement log reading from logs.jsonl file
    return [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
