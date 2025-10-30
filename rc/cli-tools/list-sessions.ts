#!/usr/bin/env node

import "dotenv/config";
import { SessionManager } from "../session/session-manager";

// Parse command line arguments
const args = process.argv.slice(2);
let customerId = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--customer-id" && args[i + 1]) {
    customerId = args[i + 1];
    i++;
  }
}

if (!customerId) {
  console.error("Usage: tsx list-sessions.ts --customer-id <id>");
  process.exit(1);
}

async function main() {
  try {
    const sessionManager = new SessionManager();
    const sessions = await sessionManager.listActiveSessions(customerId);
    
    // Output JSON for API consumption
    console.log(JSON.stringify(sessions));
  } catch (error) {
    console.error(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    process.exit(1);
  }
}

main();
