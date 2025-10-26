import { SessionManager } from "../session/session-manager";
import { Runner, AgentInputItem } from "@openai/agents";
import { loadAniketProfile, getCurrentTimeContext, createPersonaAgent } from "../persona-agent";
import { SystemLogger } from "../logging/system-logger";
import { loadOrderHistory } from "../utils/data-loader";
import { performanceTracker } from "../utils/performance-tracker";

export interface SendMessageResult {
  session_id: string;
  response: string;
  order_state: any;
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

    // Update session with new conversation history
    await sessionManager.updateSession(sessionId, {
      conversationHistory,
      orderState: session.state.orderState || {},
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
      order_state: session.state.orderState || {},
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
