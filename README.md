# Loyaltie CLI Documentation

This repository contains three AI-powered CLI tools for restaurant ordering and customer service, built with OpenAI Agents.

## Overview

- **Chat Ordering CLI** - Interactive ordering system with bulk/single order flows
- **Workflow Engine** - Standalone workflow for programmatic order processing
- **Persona Chat CLI** - Customer-aware service agent that adapts to time and preferences

## Quick Start

```bash
# Install dependencies
npm install

# Run the interactive ordering CLI # not working currently but functionality exists. 
npm run chat

# Run the workflow engine (command-line) # not working currently but functionality exists. 
npm run workflow

# Run the persona-aware chat agent - working 
npm run persona
```

## CLI Tools

### 1. Chat Ordering CLI

**Command:** `npm run chat`

**File:** `chat-ordering-cli.ts`

An interactive command-line interface for placing food orders with AI-powered assistance.

#### Features

- **Customer Recognition** - Asks for customer name and loads order history
- **Dual Order Flows** - Handles both bulk (catering/events) and single (individual) orders
- **Smart Classification** - Automatically categorizes orders based on quantity and context
- **Order History** - Retrieves and displays past bulk orders from CSV files
- **Intelligent Upselling** - Suggests relevant add-ons based on order type
- **Multi-Agent System** - Uses greeting, ordering, and finalizer agents
- **Receipt Generation** - Creates human-readable order confirmations

#### How It Works

1. **Greeting Phase**
   - Collects customer name
   - Asks what they'd like to order
   - Greeting agent acknowledges request

2. **Classification**
   - User specifies bulk or individual order
   - System loads relevant context (history for bulk orders)

3. **Order Building**
   - Ordering agent extracts items and quantities
   - Captures metadata (delivery time, address, contact)
   - Validates order details with customer

4. **Upselling**
   - Bulk orders: Offers masala chai growler (serves 12)
   - Single orders: Suggests mango lassi

5. **Finalization**
   - Customer confirms order
   - Finalizer agent generates receipt with order ID
   - Displays confirmation message

#### Data Sources

- `orders.csv` - Historical order records
- `order_details.csv` - Detailed order breakdowns

#### Example Session

```
Welcome to the Loyaltie ordering CLI.

First, what's your name? John
What would you like to order today? 12 breakfast burritos for the office tomorrow

[Greeting agent]
Got it! 12 breakfast burritos for your office tomorrow.

Is this a bulk or individual order? bulk

[Routing] → Bulk order flow

[Bulk order records]
#1234 · 2024-10-15
Total: $145.00
Notes: Office breakfast spread

[Validate / create docs]
Items captured:
12× Breakfast burritos

When do you need the order? Tomorrow by 8am
Delivery address: 123 Main St

[Upsell]
Suggestion: Add 2× Masala chai growler (serves 12).
Add the suggested catering beverage? [y/N] y

[Confirm]
Ready to confirm this bulk order? [Y/n] y

[Process checkout]
Order ID: ORD-XYZ789
Classification: Bulk
Items:
- 12× Breakfast burritos
- 2× Masala chai growler (serves 12)
Needed by: Tomorrow by 8am
Delivery: 123 Main St
You'll receive an email shortly.

Order confirmed. You'll receive follow-up details shortly.
```

---

### 2. Chat Ordering Workflow

**Command:** `npm run workflow`

**File:** `chat-ordering-workflow.ts`

A standalone workflow engine that can process orders programmatically without interactive input.

#### Features

- **Three-Agent Pipeline** - Greeting → Ordering → Finalizer
- **JSON Output** - Structured order data for integration
- **Automatic Classification** - Detects bulk vs single orders
- **Approval Detection** - Recognizes confirmation phrases
- **Command-Line Interface** - Can be called with order text as argument

#### Agents

**Greeting Agent**
- Acknowledges customer request
- Asks for missing key details
- Keeps responses concise (1 sentence)
- Model: GPT-5 with low reasoning effort

**Ordering Agent**
- Classifies order as bulk (≥10 items or multi-person) or single
- Extracts items with quantities (defaults to 1 if missing)
- Captures metadata (needed_by, address, contact)
- Detects approval status from user language
- Returns pure JSON with order draft

**Finalizer Agent**
- Generates customer-facing receipt
- Creates friendly order ID (e.g., ORD-XYZ123)
- Summarizes line items and metadata
- Provides next steps (5-7 lines max)
- Model: GPT-5 with low reasoning effort

#### Order Draft Structure

```typescript
{
  "classification": "bulk" | "single",
  "items": [
    {
      "name": "Breakfast burrito",
      "quantity": 12,
      "notes": "Extra salsa on the side"
    }
  ],
  "meta": {
    "needed_by": "Tomorrow by 8am",
    "address": "123 Main St",
    "contact": "John Smith"
  },
  "status": "needs_approval" | "approved",
  "confirmation_prompt": "Please confirm your order"
}
```

#### Return Values

**Awaiting Approval**
```json
{
  "status": "awaiting_approval",
  "classification": "bulk",
  "items": [...],
  "meta": {...},
  "confirmation_prompt": "Please confirm your order (reply 'confirm' to place it)."
}
```

**Success**
```json
{
  "status": "success",
  "classification": "bulk",
  "order": {...},
  "receipt_text": "Order ID: ORD-XYZ123\n..."
}
```

**Needs Clarification**
```json
{
  "status": "needs_clarification",
  "message": "I couldn't parse the order details. Could you rephrase..."
}
```

#### Command-Line Usage

```bash
# Default example
npm run workflow

# Custom order
npm run workflow "3 medium pizzas and 1 salad for Friday delivery to 456 Oak Ave"

# Direct execution
npx tsx chat-ordering-workflow.ts "order details here"
```

#### Approval Keywords

The workflow automatically detects approval from phrases like:
- confirm / confirmed
- approve / approved
- place it / place the order
- go ahead
- sounds good
- yes / yep / do it

---

### 3. Persona Chat CLI

**Command:** `npm run persona`

**File:** `rc/persona-chat-cli.ts`

An AI customer service agent that adapts its behavior based on customer profiles and time of day.

#### Features

- **Profile-Driven Conversations** - Loads customer preferences from JSON
- **Time-Aware Responses** - Adapts tone and pacing based on time of day
- **Context Modes** - Four distinct interaction modes
- **Colored Terminal Output** - Enhanced UX with ANSI colors
- **Persistent Conversation** - Maintains context across messages
- **Dietary Awareness** - Respects allergies and preferences

#### Time Contexts

**Monday Morning (Mon-Tue 8-10am)**
- Structured, efficient communication
- Quick decision-making
- Minimal small talk

**Midday (11am-1pm, default working hours)**
- Balanced efficiency
- Standard professional tone
- Clear, concise responses

**Late Afternoon (4-6pm)**
- Collaborative mode
- More detailed explanations
- Team-oriented suggestions

**Evening (8pm+)**
- High urgency mode
- Empathetic and rapid
- Streamlined solutions

#### Command-Line Options

```bash
# Auto-detect time context
npm run persona

# Override time context
npm run persona -- --time=monday_morning
npm run persona -- --time=midday
npm run persona -- --time=late_afternoon
npm run persona -- --time=evening
```

#### Customer Profile Structure

Located in `rc/data/aniket_profile.json`:

```json
{
  "customer_id": "aniket_001",
  "identity": {
    "name": "Aniket",
    "age": 32,
    "role": "Engineering Manager",
    "location": "Austin, TX",
    "company": "Tech Corp",
    "commute": "bike",
    "relationship": "VIP customer"
  },
  "communication_style": {
    "tone": "friendly but professional",
    "speech_pattern": "clear and direct",
    "verbosity": "concise",
    "wants": "bullet points for team sharing",
    "humor": "tech analogies welcome"
  },
  "temporal_modes": {
    "monday_morning": {
      "time_range": "Mon-Tue 8-10am",
      "energy": "focused",
      "style": "efficient and structured",
      "approach": "quick decisions"
    },
    ...
  },
  "culinary": {
    "hero_dishes": ["Palak Paneer", "Chicken Tikka Masala"],
    "supporting_dishes": ["Garlic Naan", "Biryani"],
    "beverages": ["Mango Lassi", "Masala Chai"],
    "desserts": ["Gulab Jamun", "Kheer"],
    "dietary_awareness": "Vegetarian-friendly prioritization",
    "allergy_flags": ["None known"],
    "experience_enhancers": "Include chef notes and dish stories"
  },
  "behavior": {
    "budget_comfort_range": [40, 150],
    "typical_budget": 75,
    "expects": "transparent pricing",
    "advance_planning": "prefers 1-day notice",
    "surprise_orders": "occasional spontaneous lunch",
    "feedback_style": "direct and constructive",
    "appreciates": "bulk discounts and sustainability"
  },
  "agent_interaction_blueprint": {
    "greeting": "Use name, acknowledge context",
    "discovery": "Quick questions about event type and headcount",
    "menu_curation": "Lead with hero dishes, explain pairings",
    "storytelling": "Brief chef notes when relevant",
    "closure": "Bullet summary for team sharing",
    "follow_up": "Confirm delivery details"
  },
  "personal_touches": [
    "Mention sustainability (he bikes to work)",
    "Use tech analogies when natural",
    "Provide Slack-friendly summaries",
    "Highlight team lunch options"
  ],
  "day_time_emotional_map": {
    "monday_morning": "Focused on efficiency",
    "midday": "Standard professional mode",
    "late_afternoon": "More collaborative",
    "evening": "Empathetic to urgency"
  }
}
```

#### Example Conversation

```
=== Clay Pit Customer Service Agent ===

Loading customer profile...
Detected time context: Monday Morning - Structured Mode

Customer: Aniket (Engineering Manager)

Agent: Hi! I'm here to help with your order. Type 'exit' to end the conversation.

You: Need lunch for 8 people tomorrow

Agent: Perfect, Aniket! Lunch for 8 tomorrow. To help me curate the right menu:
• What type of event? (team meeting, celebration, casual lunch)
• Any dietary preferences or restrictions?
• Preferred budget per person?

You: Team meeting, vegetarian friendly, around $15/person

Agent: Excellent choice for a team lunch! Here's what I recommend:

**Hero Dishes**
• Palak Paneer (8 servings) - creamy spinach and cottage cheese
• Vegetable Biryani (family size) - aromatic rice with seasonal vegetables

**Sides & Breads**
• Garlic Naan (16 pieces) - perfect for sharing
• Raita (1 quart) - cooling yogurt complement

**Beverages**
• Mango Lassi (8 cups) - sweet and refreshing

**Total**: ~$120 (team discount applied)

**Chef's Note**: The Palak Paneer uses locally-sourced spinach and our house-made paneer. Pairs beautifully with the naan!

**For Your Slack:**
• 8-person vegetarian spread
• Palak Paneer + Veg Biryani (mains)
• Garlic Naan + Raita (sides)
• Mango Lassi (drinks)
• $120 total, delivery tomorrow
• ♻️ Sustainable packaging

Shall I confirm this order?

You: exit

Agent: Thank you! Looking forward to serving you soon.

💡 Tip: Use --time=<context> to simulate different times of day
   Options: monday_morning, midday, late_afternoon, evening
```

#### Agent Behavior

The agent adapts based on:

1. **Customer Identity** - Uses name, role, company context
2. **Time of Day** - Adjusts verbosity and pacing
3. **Culinary Preferences** - Prioritizes hero dishes
4. **Dietary Requirements** - Respects allergies and preferences
5. **Budget Awareness** - Works within comfort range
6. **Communication Style** - Matches customer's preferred format
7. **Personal Touches** - Includes tech analogies, sustainability notes

---

## Architecture

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **AI Framework**: OpenAI Agents SDK (`@openai/agents`)
- **Models**: GPT-5 (ordering workflows), GPT-4.1 (persona chat)
- **Input/Output**: Node.js readline for CLI interaction
- **Data Storage**: CSV files for order history

### Agent Configuration

All agents use:
- **Tracing**: Enabled for debugging and observability
- **Store**: Conversation history stored for context
- **Reasoning**: Low effort for fast responses
- **Temperature**: 0.8 for persona chat (natural conversation)

### File Structure

```
aitx_hackathon/
├── chat-ordering-cli.ts          # Main interactive ordering CLI
├── chat-ordering-workflow.ts     # Workflow engine & agent definitions
├── rc/
│   ├── persona-chat-cli.ts       # Persona-aware customer service CLI
│   ├── persona-agent.ts          # Persona logic & prompt building
│   └── data/
│       └── aniket_profile.json   # Customer profile example
├── orders.csv                    # Order history
├── order_details.csv             # Detailed order records
├── package.json                  # Dependencies & scripts
└── docs/                         # This documentation
```

### Data Flow

#### Chat Ordering CLI
```
User Input
  ↓
Greeting Agent → Extract name & initial request
  ↓
Classification (bulk/single)
  ↓
Load History (if bulk) + Ordering Agent → Extract items & metadata
  ↓
Upsell Logic
  ↓
User Confirmation
  ↓
Finalizer Agent → Generate receipt
  ↓
Output to user
```

#### Persona Chat CLI
```
Load Customer Profile
  ↓
Detect/Override Time Context
  ↓
Build Dynamic System Prompt
  ↓
Initialize Agent with Profile
  ↓
User Message
  ↓
Agent Response (context-aware)
  ↓
Update Conversation History
  ↓
Loop until exit
```

---

## Development

### Running in Development

```bash
# Install dependencies
npm install

# Run with TypeScript execution
npx tsx chat-ordering-cli.ts
npx tsx chat-ordering-workflow.ts "your order here"
npx tsx rc/persona-chat-cli.ts --time=evening
```

### Environment Variables

The tools use OpenAI's agent framework which requires:
- OpenAI API key (set via standard OpenAI environment variables)
- Agent tracing configured (optional, for debugging)

### Adding Customer Profiles

Create new JSON profiles in `rc/data/` following the structure of `aniket_profile.json`.

Update `persona-agent.ts` to load the appropriate profile:

```typescript
export async function loadCustomerProfile(customerId: string): Promise<AniketProfile> {
  const profilePath = path.resolve(__dirname, "data", `${customerId}_profile.json`);
  const raw = await fs.readFile(profilePath, "utf8");
  return JSON.parse(raw);
}
```

### Customizing Agents

Edit agent configurations in `chat-ordering-workflow.ts`:

```typescript
export const ordering = new Agent({
  name: "Ordering",
  instructions: "Your custom instructions here...",
  model: "gpt-5",
  modelSettings: {
    reasoning: { effort: "medium" },  // Adjust reasoning effort
    temperature: 0.7,                  // Adjust creativity
    store: true
  },
});
```

---

## Troubleshooting

### CLI Not Starting

**Issue**: `npm run chat` fails to start

**Solution**:
```bash
npm install
npx tsx chat-ordering-cli.ts
```

### Agent Response Errors

**Issue**: "Agent result is undefined"

**Cause**: API key not configured or model unavailable

**Solution**: Ensure OpenAI API key is set and model access is configured

### CSV Files Not Found

**Issue**: Order history not loading

**Solution**: Ensure `orders.csv` and `order_details.csv` are in the project root

### Profile Loading Fails

**Issue**: Persona chat can't load profile

**Solution**:
```bash
# Check profile exists
ls rc/data/aniket_profile.json

# Validate JSON syntax
npx tsx -e "console.log(require('./rc/data/aniket_profile.json'))"
```

---

## Future Enhancements

- [ ] Multi-customer profile support in persona CLI
- [ ] Database integration (replace CSV files)
- [ ] Web interface for CLIs
- [ ] Voice input/output support
- [ ] Order tracking and status updates
- [ ] Payment processing integration
- [ ] Analytics dashboard for order patterns
- [ ] Multi-language support
- [ ] Menu management system
- [ ] Inventory tracking

---

## License

ISC

## Repository

https://github.com/Tar-ive/aitx_hackathon
