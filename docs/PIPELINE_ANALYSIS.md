# Pipeline Analysis - Complete Breakdown

## Architecture Overview

```
┌─────────────────────────┐
│   Frontend (Browser)    │
└───────────┬─────────────┘
            │ HTTP REST API
            ▼
┌─────────────────────────────────────────┐
│   FastAPI Backend (Python)              │
│   - Port 8000                           │
│   - Endpoints: /api/v1/sessions         │
│   - Endpoints: /api/v1/messages         │
└───────────┬─────────────────────────────┘
            │ subprocess.run()
            ▼
┌─────────────────────────────────────────┐
│   TypeScript CLI Tools                  │
│   - rc/cli-tools/create-session.ts      │
│   - rc/cli-tools/send-message.ts        │
│   - rc/cli-tools/list-sessions.ts       │
└───────────┬─────────────────────────────┘
            │ import modules
            ▼
┌─────────────────────────────────────────┐
│   Core TypeScript Logic                 │
│   - persona-agent.ts (agent builder)    │
│   - persona-chat-cli.ts (CLI interface) │
│   - session-manager.ts (state mgmt)     │
│   - logging/system-logger.ts            │
└───────────┬─────────────────────────────┘
            │ file I/O
            ▼
┌─────────────────────────────────────────┐
│   Data Storage                          │
│   - sessions/{id}/session.json          │
│   - sessions/{id}/logs.jsonl            │
│   - rc/data/aniket_profile.json         │
│   - orders.csv                          │
│   - order_details.csv                   │
└─────────────────────────────────────────┘
```

## Step-by-Step Data Flow

### 1. **Frontend Makes Request**
```javascript
// User clicks "Send Message"
const result = await fetch('http://localhost:8000/api/v1/messages/session/abc123', {
  method: 'POST',
  body: JSON.stringify({ message: "I need lunch for 8 people" })
});
```

### 2. **FastAPI Receives Request**
```python
# backend/routers/messages.py
@router.post("/session/{session_id}")
async def send_message(session_id: str, data: MessageRequest):
    result = cli.send_message(session_id, data.message)  # ← Calls CLI tool
    return result
```

### 3. **CLI Service Calls TypeScript**
```python
# backend/services/cli_service.py
def send_message(self, session_id: str, message: str) -> Dict[str, Any]:
    output = self.run_cli_command(
        "rc/cli-tools/send-message.ts",  # ← Path to TypeScript script
        "--session-id", sessionId,
        "--message", message
    )
    return json.loads(output)
```

### 4. **TypeScript Script Executes**
```typescript
// rc/cli-tools/send-message.ts
const profile = await loadAniketProfile();  // ← Loads aniket_profile.json
const agent = createPersonaAgent(profile, timeContext, orderHistory);
const response = await runner.run(agent, conversationHistory);
console.log(JSON.stringify({ response: response.finalOutput }));
```

### 5. **Agent Processes Message**
```typescript
// rc/persona-agent.ts
// Builds system prompt from:
// - Profile data (aniket_profile.json)
// - Time context (auto-detected or CLI param)
// - Order history (from CSV files)
// Sends to OpenAI API with conversation history
```

### 6. **Response Returns to Frontend**
```json
{
  "session_id": "sess_123",
  "response": "Perfect! I can help with that...",
  "order_state": { "phase": "chatting" }
}
```

## Hardcoded Values Analysis

### ❌ HARDCODED (Outside of JSON)

#### 1. **Profile Loading**
**Location:** `rc/persona-agent.ts:60`
```typescript
export async function loadAniketProfile(): Promise<AniketProfile> {
  const profilePath = path.resolve(__dirname, "data", "aniket_profile.json");
  //                                                      ^^^^^^^^^^^^^^^^^^^
  //                                                      HARDCODED: Always loads Aniket
  const raw = await fs.readFile(profilePath, "utf8");
  return JSON.parse(raw) as AniketProfile;
}
```
**Impact:** Only works for Aniket Sharma. Cannot switch customers without code change.

#### 2. **Profile Type Name**
**Location:** `rc/persona-agent.ts:6`
```typescript
export type AniketProfile = {  // ← HARDCODED: Type is named "Aniket"
  customer_id: string;
  identity: { ... }
  // ...
}
```
**Impact:** Type name locked to "Aniket" even though it's a generic customer profile.

#### 3. **Restaurant Name**
**Location:** `rc/persona-agent.ts:152`
```typescript
return `You are Clay Pit's customer service agent speaking with ${profile.identity.name}.
//               ^^^^^^^^^ Hardcoded restaurant name
```
**Impact:** Script is specific to "Clay Pit". Cannot use for other restaurants.

#### 4. **File Paths**
**Location:** Multiple files
```typescript
// rc/persona-agent.ts:60
const profilePath = path.resolve(__dirname, "data", "aniket_profile.json");
//                                                     ^^^^^^^^^^^^^^^^^^^

// rc/learning/profile-updater.ts:24
"../data/aniket_profile.json"
//     ^^^^^^^^^

// backend/services/cli_service.py:11
self.tsx_bin = self.root_dir / "node_modules" / ".bin" / "tsx"
#                                                  ^^^^

// backend/services/cli_service.py:12
self.sessions_dir = self.root_dir / "sessions"
#                              ^^^^^^^^^

// backend/services/cli_service.py:72
const session_file = self.sessions_dir / session_id / "session.json"
#                                                       ^^^^^^^^^^^^
```
**Impact:** File paths are hardcoded. Moving files requires code changes.

#### 5. **API Port**
**Location:** `backend/main.py:68`
```python
uvicorn.run(app, host="0.0.0.0", port=8000)
#                                   ^^^^ Hardcoded port
```
**Impact:** Port 8000 is hardcoded. Cannot run on different port without code change.

#### 6. **OpenAI Model**
**Location:** `rc/persona-agent.ts:257`
```typescript
return new Agent({
  name: "ClayPitPersonaAgent",
  instructions: systemPrompt,
  model: "gpt-4.1",  // ← Hardcoded model
  modelSettings: { ... }
});
```
**Impact:** Model is hardcoded. Cannot switch to GPT-3.5 or other models without code change.

#### 7. **CSV File Names**
**Location:** `rc/utils/data-loader.ts` (implied)
```typescript
// Code loads:
orders.csv        // ← Hardcoded filename
order_details.csv // ← Hardcoded filename
```
**Impact:** Cannot use different CSV files without code change.

#### 8. **Time Context Thresholds**
**Location:** `rc/persona-agent.ts:73-100`
```typescript
if (hour >= 20) {           // ← Hardcoded: 8pm
  return "evening";
}

if (hour >= 16 && hour < 18) {  // ← Hardcoded: 4-6pm
  return "late_afternoon";
}

if ((day === 1 || day === 2) && hour >= 8 && hour < 10) {  // ← Hardcoded: Mon-Tue 8-10am
  return "monday_morning";
}
```
**Impact:** Time context rules are hardcoded. Cannot adjust thresholds without code change.

#### 9. **CLI Tool Scripts**
**Location:** `backend/services/cli_service.py`
```python
script = "rc/cli-tools/create-session.ts"   # ← Hardcoded path
script = "rc/cli-tools/send-message.ts"     # ← Hardcoded path
script = "rc/cli-tools/list-sessions.ts"    # ← Hardcoded path
```
**Impact:** Script paths are hardcoded. Moving files requires code changes.

#### 10. **System Prompt Structure**
**Location:** `rc/persona-agent.ts:147-245`
```typescript
return `You are Clay Pit's customer service agent speaking with ${profile.identity.name}.
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//      This entire prompt structure is hardcoded
//
//      Every line of the prompt is hardcoded in the code
COMMUNICATION RULES (CRITICAL):
- Be CONCISE. No fluff...
//     ^^^^^^^^^^^^^^^^ Hardcoded instructions
```
**Impact:** Cannot change prompt structure without code modification.

---

## ✅ NOT HARDCODED (Dynamic/Configurable)

### 1. **Customer Data** - Stored in JSON
```json
{
  "customer_id": "aniket-sharma-nvidia",
  "identity": { "name": "Aniket Sharma", ... },
  "culinary": { ... },
  "behavior": { ... }
}
```
**Benefit:** Easy to modify without code changes.

### 2. **Session IDs** - Generated dynamically
```typescript
const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
```

### 3. **Conversation History** - Stored per session
```json
// Stored in: sessions/{id}/session.json
{
  "state": {
    "conversationHistory": [...]  // Grows dynamically
  }
}
```

### 4. **Order History** - Loaded from CSV
```typescript
const orderHistory = await loadOrderHistory(profile.identity.name);
```

### 5. **Time Context** - Auto-detected or CLI param
```typescript
// Auto-detects OR accepts --time=monday_morning
const timeContext = getCurrentTimeContext();
```

---

## Critical Hardcoding Issues

### 🔴 **MUST FIX FOR MULTI-CUSTOMER SUPPORT**

1. **Profile Loading** - Always loads `aniket_profile.json`
   - **Current:** Only works for Aniket
   - **Needed:** Accept customer_id parameter
   - **Solution:** `loadProfile(customerId: string)` instead of `loadAniketProfile()`

2. **Type Name** - Named "AniketProfile"
   - **Current:** Type name locked to "Aniket"
   - **Needed:** Generic "CustomerProfile" type
   - **Solution:** Rename `AniketProfile` to `CustomerProfile`

3. **Restaurant Name** - Hardcoded "Clay Pit"
   - **Current:** Cannot use for other restaurants
   - **Needed:** Configurable restaurant name
   - **Solution:** Store in environment variable or config file

### 🟡 **SHOULD FIX FOR FLEXIBILITY**

4. **Model Selection** - Hardcoded "gpt-4.1"
   - **Solution:** Add to environment variables or config

5. **Time Thresholds** - Hardcoded time ranges
   - **Solution:** Move to config file or database

6. **Port Number** - Hardcoded 8000
   - **Solution:** Use environment variable `PORT`

### 🟢 **ACCEPTABLE HARDCODING**

7. **File Paths** - Relative paths are standard
   - **Acceptable:** Standard practice in Node.js/Python

8. **System Prompt Structure** - Business logic
   - **Acceptable:** Prompt engineering is part of the system

---

## Recommendations

### Immediate Actions (Multi-Customer Support)

1. **Refactor Profile Loading**
   ```typescript
   // Before
   const profile = await loadAniketProfile();
   
   // After
   const profile = await loadProfile(customerId);
   ```

2. **Rename Type**
   ```typescript
   // Before
   export type AniketProfile = { ... }
   
   // After
   export type CustomerProfile = { ... }
   ```

3. **Make Restaurant Configurable**
   ```typescript
   // Add to config or env
   const RESTAURANT_NAME = process.env.RESTAURANT_NAME || "Clay Pit";
   ```

### Medium Priority

4. **Add Config File**
   ```json
   // config.json
   {
     "restaurant": "Clay Pit",
     "openai": {
       "model": "gpt-4.1",
       "temperature": 0.7
     },
     "timeContexts": {
       "evening": { "start": 20, "end": 24 },
       "late_afternoon": { "start": 16, "end": 18 }
     }
   }
   ```

5. **Use Environment Variables**
   ```bash
   # .env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4.1
   RESTAURANT_NAME=Clay Pit
   PORT=8000
   ```

---

## Summary

### Hardcoded Values (Outside JSON)

1. ✅ **Profile filename** - `aniket_profile.json` hardcoded
2. ✅ **Type name** - `AniketProfile` hardcoded
3. ✅ **Restaurant name** - "Clay Pit" hardcoded in prompt
4. ✅ **File paths** - Multiple hardcoded paths
5. ✅ **API port** - 8000 hardcoded
6. ✅ **OpenAI model** - "gpt-4.1" hardcoded
7. ✅ **CSV filenames** - Hardcoded
8. ✅ **Time thresholds** - Hardcoded ranges
9. ✅ **CLI script paths** - Hardcoded
10. ✅ **System prompt structure** - Entire prompt hardcoded

### What Can Be Changed Without Code

- ✅ Customer profile data (JSON)
- ✅ Session IDs (auto-generated)
- ✅ Conversation history (stored per session)
- ✅ Order history (CSV files)

**The system is currently SINGLE-CUSTOMER only. To support multiple customers, you need to refactor the profile loading logic.**
