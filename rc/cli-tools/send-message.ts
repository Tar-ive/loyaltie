#!/usr/bin/env node

import "dotenv/config";
import path from "node:path";
import { SessionManager } from "../session/session-manager";
import { Runner, AgentInputItem } from "@openai/agents";
import { loadAniketProfile, getCurrentTimeContext, createPersonaAgent, TimeContext } from "../persona-agent";
import { SystemLogger, LogCategory } from "../logging/system-logger";
import { loadOrderHistory } from "../utils/data-loader";

// Parse command line arguments
const args = process.argv.slice(2);
let sessionId = "";
let message = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--session-id" && args[i + 1]) {
    sessionId = args[i + 1];
    i++;
  } else if (args[i] === "--message" && args[i + 1]) {
    message = args[i + 1];
    i++;
  }
}

if (!sessionId || !message) {
  console.error("Usage: tsx send-message.ts --session-id <id> --message <message>");
  process.exit(1);
}

async function main() {
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
        __trace_source__: "cli-tool-send-message",
        sessionId: sessionId,
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
    
    // Add agent response to history
    conversationHistory.push(...response.newItems.map((item) => item.rawItem));
    
    // Update session with new conversation history
    await sessionManager.updateSession(sessionId, {
      conversationHistory,
      orderState: session.state.orderState || {},
    });
    
    // Output JSON for API consumption
    console.log(JSON.stringify({
      session_id: sessionId,
      response: response.finalOutput.trim(),
      order_state: session.state.orderState || {},
    }));
  } catch (error) {
    console.error(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    process.exit(1);
  }
}

main();
