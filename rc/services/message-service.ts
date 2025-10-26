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

    // Get conversation history from session and ensure proper format
    let conversationHistory: AgentInputItem[] = session.state.conversationHistory || [];
    
    // Ensure conversation history is properly formatted
    conversationHistory = conversationHistory.map(item => {
      // If item is already properly formatted, return as is
      if (item.role && item.content && Array.isArray(item.content)) {
        return item;
      }
      
      // If item has a simple text content, convert to proper format
      if (typeof item === 'object' && 'role' in item && 'content' in item) {
        const content = (item as any).content;
        if (typeof content === 'string') {
          return {
            role: item.role,
            content: [{ type: "input_text", text: content }]
          };
        }
      }
      
      // Return item as is if it's already in the right format
      return item;
    });

    // Add user message
    conversationHistory.push({
      role: "user",
      content: [{ type: "input_text", text: message }],
    });

    // Get agent response
    let response;
    try {
      response = await runner.run(agent, [...conversationHistory]);
    } catch (error: any) {
      console.error("❌ Agent runner error:", error);
      
      // If it's a validation error, try with a simplified conversation
      if (error.message && error.message.includes("Invalid input")) {
        console.log("🔄 Retrying with simplified conversation format...");
        
        // Create a simplified conversation with just the current message
        const simplifiedHistory: AgentInputItem[] = [{
          role: "user",
          content: [{ type: "input_text", text: message }],
        }];
        
        try {
          response = await runner.run(agent, simplifiedHistory);
        } catch (retryError) {
          console.error("❌ Retry also failed:", retryError);
          throw new Error("Agent validation failed. Please try a simpler message.");
        }
      } else {
        throw error;
      }
    }

    if (!response.finalOutput) {
      throw new Error("Agent did not produce a response");
    }

    // Clean up response - remove meta-commentary
    let responseContent = response.finalOutput.trim();

    // Remove meta-commentary patterns like **warm, friendly tone** or *thinking about...*
    responseContent = responseContent.replace(/^\*\*[^*]+\*\*\s*/g, '');
    responseContent = responseContent.replace(/^\*[^*]+\*\s*/g, '');

    // Remove lines that are just meta-commentary about tone/style
    const metaCommentaryPatterns = [
      /^.*\(.*tone.*\).*$/gim,
      /^.*matching.*efficiency.*$/gim,
    ];
    metaCommentaryPatterns.forEach(pattern => {
      responseContent = responseContent.replace(pattern, '');
    });

    responseContent = responseContent.trim();

    // Add agent response to history (with error handling)
    try {
      conversationHistory.push(...response.newItems.map((item) => item.rawItem));
    } catch (error) {
      console.error("❌ Error adding response to history:", error);
      // If adding to history fails, just continue without updating history
      console.log("⚠️ Continuing without updating conversation history");
    }

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
    console.log(`💾 Saving conversation history for ${sessionId}:`, JSON.stringify(conversationHistory, null, 2));
    try {
      await sessionManager.updateSession(sessionId, {
        conversationHistory,
        orderState,
      });
      console.log(`✅ Successfully saved conversation history for ${sessionId}`);
    } catch (error) {
      console.error("❌ Error updating session:", error);
      // If updating fails, try with a minimal conversation history
      try {
        const minimalHistory: AgentInputItem[] = [{
          role: "user",
          content: [{ type: "input_text", text: message }],
        }, {
          role: "assistant", 
          content: [{ type: "input_text", text: responseContent }],
        }];
        
        await sessionManager.updateSession(sessionId, {
          conversationHistory: minimalHistory,
          orderState,
        });
        console.log("✅ Updated session with minimal conversation history");
      } catch (minimalError) {
        console.error("❌ Even minimal update failed:", minimalError);
        // Continue without updating session
      }
    }

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

    // Convert conversation history to frontend format
    const conversationHistory = session.state.conversationHistory || [];
    console.log(`📝 Raw conversation history for ${sessionId}:`, JSON.stringify(conversationHistory, null, 2));
    
    const formattedConversation = conversationHistory.map((item: any, index: number) => {
      console.log(`📝 Processing item ${index}:`, JSON.stringify(item, null, 2));
      
      // Extract text content from the content array
      let content = '';
      if (Array.isArray(item.content)) {
        const textContent = item.content.find((c: any) => c.type === 'input_text' || c.type === 'text');
        content = textContent ? textContent.text : '';
        console.log(`📝 Extracted content from array:`, content);
      } else if (typeof item.content === 'string') {
        content = item.content;
        console.log(`📝 Direct string content:`, content);
      } else {
        console.log(`📝 Unknown content format:`, typeof item.content, item.content);
      }
      
      const formatted = {
        role: item.role,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      console.log(`📝 Formatted item:`, formatted);
      return formatted;
    });
    
    console.log(`📝 Final formatted conversation:`, JSON.stringify(formattedConversation, null, 2));

    // If no conversation history, create a basic one with current message
    let finalConversation = formattedConversation;
    if (finalConversation.length === 0) {
      console.log(`⚠️ No conversation history found for ${sessionId}, creating basic conversation`);
      finalConversation = [
        {
          role: "user",
          content: "Hello, I'd like to start a conversation",
          timestamp: new Date().toISOString()
        },
        {
          role: "assistant", 
          content: "Hello! I'm here to help you with your order. How can I assist you today?",
          timestamp: new Date().toISOString()
        }
      ];
    }

    return {
      session_id: sessionId,
      conversation: finalConversation,
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
