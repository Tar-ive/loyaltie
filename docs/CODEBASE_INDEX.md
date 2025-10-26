# Codebase Index - ASCII AST

Complete file structure with 2-line descriptions for indexing and navigation.

```
aitx_hackathon/
│
├── 📄 package.json
│   └── Project dependencies and npm scripts for TypeScript execution.
│       Defines "persona", "chat", "workflow" commands for CLI tools.
│
├── 📄 tsconfig.json
│   └── TypeScript compiler configuration with CommonJS module system.
│       Targets ES2020 with strict type checking enabled.
│
├── 📄 major_decisions.json
│   └── Architectural decision log documenting all major design choices and rationales.
│       Includes rejected designs, accepted patterns, known limitations, and future plans.
│
├── 📄 orders.csv
│   └── Customer order history with customer_id, name, demographics, and order summaries.
│       Links to order_details.csv via order_number for complete order information.
│
├── 📄 order_details.csv
│   └── Detailed order breakdowns with menu items, quantities, prices, and discounts.
│       Joined with orders.csv to provide complete historical context to agent.
│
├── 📄 README.md
│   └── Project overview, setup instructions, and high-level architecture.
│       Entry point for understanding the persona-aware ordering system.
│
├── 📁 docs/
│   │   Comprehensive documentation for integration and codebase navigation.
│   │
│   ├── 📄 CODEBASE_INDEX.md (this file)
│   │   └── ASCII AST of entire codebase with 2-line descriptions per file.
│   │       Indexable structure for quick navigation and understanding.
│   │
│   └── 📄 FASTAPI_INTEGRATION.md
│       └── Guide for integrating existing TypeScript CLI with FastAPI via subprocess pattern.
│           Explains architecture, CLI service wrapper, required helper scripts, no-database approach.
│
├── 📁 rc/
│   │   Core persona-aware customer service system with session management.
│   │
│   ├── 📁 data/
│   │   │
│   │   └── 📄 aniket_profile.json
│   │       └── Comprehensive customer persona with communication style, culinary preferences, behavior patterns.
│   │           Includes temporal modes, dietary awareness, delivery addresses, and learned preferences.
│   │
│   ├── 📁 learning/
│   │   │
│   │   └── 📄 profile-updater.ts
│   │       └── GPT-4.1 powered learning extraction from conversation history with profile updates.
│   │           Identifies addresses, contacts, preferences; creates backups before applying updates.
│   │
│   ├── 📁 logging/
│   │   │
│   │   └── 📄 system-logger.ts
│   │       └── Comprehensive logging system with 18 categories (session, agent, data, order, payment).
│   │           Logs to JSON Lines format (logs.jsonl) for FastAPI integration, auto-flush, colored console.
│   │
│   ├── 📁 session/
│   │   │
│   │   └── 📄 session-manager.ts
│   │       └── Multi-session management with persistence (session.json per session directory).
│   │           Creates, resumes, lists sessions; tracks conversation history, order state, context variables.
│   │
│   ├── 📁 orders/
│   │   │   Order flow CLIs for bulk/single ordering workflows.
│   │   │
│   │   ├── 📄 chat-ordering-cli.ts
│   │   │   └── Interactive CLI for bulk/single order flows with CSV history integration.
│   │   │       Implements multi-turn conversations with confirmation workflow and upsells.
│   │   │
│   │   └── 📄 chat-ordering-workflow.ts
│   │       └── Agent workflow definitions for greeting, ordering, and finalizing orders.
│   │           Exports parseJSON helper and order classification logic (bulk vs single).
│   │
│   ├── 📄 persona-agent.ts
│   │   └── Creates persona-aware agent with dynamic system prompts based on profile and time.
│   │       Loads customer profile, formats order history, builds concise instruction prompts.
│   │
│   ├── 📄 persona-chat-cli.ts
│   │   └── Main CLI orchestrator integrating session management, logging, orders, and learning.
│   │       Handles session resume, order confirmation state machine, Stripe checkout, profile updates.
│   │
│   ├── 📄 README.md
│   │   └── Documentation for persona-chat CLI with time-aware behavior examples.
│   │       Explains time contexts, customer profiles, and usage instructions.
│   │
│   ├── 📁 session/
│   │   │
│   │   └── 📄 session-manager.ts
│   │       └── Multi-session management with persistence (session.json per session directory).
│   │           Creates, resumes, lists sessions; tracks conversation history, order state, context variables.
│   │
│   └── 📁 utils/
│       │
│       ├── 📄 data-loader.ts
│       │   └── CSV loader for order history from orders.csv + order_details.csv.
│       │       Joins on order_number, returns sorted OrderHistory[] for agent context.
│       │
│       ├── 📄 order-state.ts
│       │   └── Order state machine logic with intent/confirmation detection and draft extraction.
│       │       Detects ordering keywords, parses agent responses for items/quantities/totals.
│       │
│       └── 📄 stripe-checkout.ts
│           └── Stripe checkout placeholder with mock session creation and visual display.
│               Generates order IDs, displays ASCII QR code, simulates 1.5s processing delay.
│
└── 📁 sessions/
    │   Auto-generated session storage (created on first CLI run).
    │   Each session has unique directory with session.json and logs.jsonl.
    │
    └── 📁 sess_{timestamp}_{random}/
        │
        ├── 📄 logs.jsonl
        │   └── JSON Lines log file with timestamped entries for all operations.
        │       FastAPI can tail this for real-time monitoring and analytics.
        │
        └── 📄 session.json
            └── Session state: metadata (turns, orders placed), conversation history, order state.
                Persistent storage enabling session resume across CLI invocations.
```

## Key Systems Map

### 🔐 Session Management
```
persona-chat-cli.ts (orchestrator)
  └── session/session-manager.ts (state)
      └── sessions/{id}/session.json (storage)
```

### 📝 Logging
```
persona-chat-cli.ts (generates logs)
  └── logging/system-logger.ts (logger)
      └── sessions/{id}/logs.jsonl (output)
```

### 🤖 Agent System
```
persona-chat-cli.ts (runner)
  └── persona-agent.ts (builder)
      ├── data/aniket_profile.json (persona)
      └── utils/data-loader.ts (history)
          └── orders.csv + order_details.csv (data)
```

### 🛒 Order Flow
```
persona-chat-cli.ts (state machine)
  └── utils/order-state.ts (detection)
      └── utils/stripe-checkout.ts (payment)
```

### 🧠 Learning System
```
persona-chat-cli.ts (triggers on exit)
  └── learning/profile-updater.ts (extraction)
      └── data/aniket_profile.json (updates)
          └── aniket_profile.backup_*.json (backups)
```

## File Statistics (Alphabetical)

| Directory | Files | Purpose |
|-----------|-------|---------|
| `/` (root) | 6 | Entry points, data, config |
| `docs/` | 2 | Documentation |
| `rc/` | 4 | Core CLI & agent |
| `rc/data/` | 1 | Customer profiles |
| `rc/learning/` | 1 | Profile learning |
| `rc/logging/` | 1 | System logger |
| `rc/orders/` | 2 | Order flow CLIs |
| `rc/session/` | 1 | Session manager |
| `rc/utils/` | 3 | Data, orders, checkout |
| `sessions/` | N | Auto-generated |

## Quick Navigation

**Want to understand...?**
- **How sessions work**: `rc/session/session-manager.ts` → `sessions/{id}/session.json`
- **How agents respond**: `rc/persona-agent.ts` → `rc/data/aniket_profile.json`
- **How orders flow**: `rc/utils/order-state.ts` → `persona-chat-cli.ts` lines 305-396
- **How logging works**: `rc/logging/system-logger.ts` → `sessions/{id}/logs.jsonl`
- **How learning happens**: `rc/learning/profile-updater.ts` → profile backups
- **How to integrate API**: `docs/FASTAPI_INTEGRATION.md`
- **Why decisions made**: `major_decisions.json`

## Search Index Keywords

**Session**: session-manager.ts, session.json, sess_{id}/
**Agent**: persona-agent.ts, persona-chat-cli.ts, aniket_profile.json
**Order**: order-state.ts, stripe-checkout.ts, orders.csv
**Logging**: system-logger.ts, logs.jsonl, LogCategory
**Learning**: profile-updater.ts, extractLearnings(), applyUpdates()
**CSV**: data-loader.ts, orders.csv, order_details.csv
**API**: FASTAPI_INTEGRATION.md, subprocess wrapper
**State**: OrderState, SessionState, conversationHistory
**Checkout**: stripe-checkout.ts, createCheckoutSession()
**Profile**: aniket_profile.json, temporal_modes, learned_preferences
