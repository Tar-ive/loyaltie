#!/usr/bin/env node

import "dotenv/config";
import path from "node:path";
import { SessionManager } from "../session/session-manager";

// Parse command line arguments
const args = process.argv.slice(2);
let customerId = "";
let customerName = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--customer-id" && args[i + 1]) {
    customerId = args[i + 1];
    i++;
  } else if (args[i] === "--customer-name" && args[i + 1]) {
    customerName = args[i + 1];
    i++;
  }
}

if (!customerId || !customerName) {
  console.error("Usage: tsx create-session.ts --customer-id <id> --customer-name <name>");
  process.exit(1);
}

async function main() {
  try {
    const sessionManager = new SessionManager();
    const session = await sessionManager.createSession(customerId, customerName);
    
    // Output JSON for API consumption
    console.log(JSON.stringify(session));
  } catch (error) {
    console.error(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    process.exit(1);
  }
}

main();
