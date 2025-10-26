# OpenRouter + NVIDIA Nemotron Integration

## Overview
This integration enables the Clay Pit AI system to use NVIDIA Nemotron models via OpenRouter while preserving all existing agent orchestration, tool calling, and function use capabilities. It includes comprehensive performance tracking to compare speed and quality between OpenAI and Nemotron models.

## Implementation Summary

### Files Modified
1. **`rc/config/model-config.ts`** (NEW) - Model configuration and provider selection
2. **`rc/utils/performance-tracker.ts`** (NEW) - Performance tracking and speed benchmarking
3. **`rc/services/message-service.ts`** - Added performance tracking to message processing
4. **`rc/persona-agent.ts`** - Updated to use configurable model
5. **`rc/orders/chat-ordering-workflow.ts`** - Updated 3 agents to use configurable model
6. **`rc/learning/profile-updater.ts`** - Updated to use configurable model
7. **`server/index.ts`** - Added performance API endpoints
8. **`.env`** - Added OpenRouter configuration
9. **`package.json`** - Added dependencies: `@openai/agents-extensions`, `@ai-sdk/openai`

### Key Features
- ✅ Easy toggle between OpenAI and Nemotron via environment variable
- ✅ Automatic performance tracking (response time, tokens/second)
- ✅ Performance comparison API endpoints
- ✅ No breaking changes to existing functionality
- ✅ Works with existing frontend and backend

---

## Setup Instructions

### Step 1: Get OpenRouter API Key
1. Go to https://openrouter.ai/
2. Sign up or log in
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-...`)

### Step 2: Configure Environment Variables

Edit `.env` file:

```bash
# Add your OpenRouter API key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Start with OpenAI (USE_NEMOTRON=false) to establish baseline
USE_NEMOTRON=false
```

### Step 3: Start the Backend

```bash
npm run server
```

You should see:
```
🤖 Using OpenAI GPT-4.1
🚀 Server running on http://localhost:8000
```

---

## Testing Strategy

### Test 1: OpenAI Baseline (Establish Performance Baseline)

**Configuration:**
```bash
USE_NEMOTRON=false
```

**Steps:**
1. Start backend: `npm run server`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: http://localhost:3000
4. Create a new session with customer ID: `test_openai_001`
5. Send these test messages:

```
1. "Hi, what's your most popular dish?"
2. "I need catering for 20 people tomorrow"
3. "What vegetarian options do you have?"
4. "Can you suggest a menu for a corporate lunch?"
5. "What's the price for 20 meals?"
6. "Do you offer delivery?"
7. "What are your hours?"
8. "Can I add desserts to the order?"
9. "What's your spiciest dish?"
10. "Confirm the order for tomorrow at 2pm"
```

**Check Backend Console:**
```
⏱️  [req_xxx] Request started - Model: gpt-4.1 via openai
✅ [req_xxx] Completed in 3245ms
   📊 87 tokens @ 26.8 tok/s
```

**Get Performance Metrics:**
```bash
curl http://localhost:8000/api/v1/performance/metrics
```

**Record Results:**
- Average response time: _____ ms
- Min response time: _____ ms
- Max response time: _____ ms
- Avg tokens/second: _____ tok/s
- Success rate: _____%

---

### Test 2: Switch to Nemotron (Compare Performance)

**Configuration:**
1. Stop the backend (Ctrl+C)
2. Edit `.env`:
```bash
USE_NEMOTRON=true
```
3. Restart backend: `npm run server`

You should see:
```
🚀 Using NVIDIA Nemotron via OpenRouter
🚀 Server running on http://localhost:8000
```

**Steps:**
1. In frontend, create new session: `test_nemotron_001`
2. Send the **SAME 10 messages** from Test 1
3. Watch backend console for timing logs

**Check Performance:**
```bash
curl http://localhost:8000/api/v1/performance/metrics
```

**Record Results:**
- Average response time: _____ ms
- Min response time: _____ ms
- Max response time: _____ ms
- Avg tokens/second: _____ tok/s
- Success rate: _____%

**Compare:**
| Metric | OpenAI | Nemotron | Difference |
|--------|--------|----------|------------|
| Avg Time | ___ ms | ___ ms | ___ ms |
| Tokens/s | ___ t/s | ___ t/s | ___ t/s |
| Success | ___% | ___% | ___% |

---

### Test 3: Quality Comparison

**Test Scenarios:**

#### Scenario 1: Complex Order
```
"I need food for 25 people tomorrow at noon. Half the team is vegetarian, 
one person has a nut allergy, and our budget is around $600. What do you suggest?"
```

**Compare:**
- OpenAI response quality: ___/10
- Nemotron response quality: ___/10
- Which handled dietary restrictions better? _______

#### Scenario 2: Ambiguous Request
```
"Something spicy for dinner tonight"
```

**Compare:**
- OpenAI clarifying questions: _______
- Nemotron clarifying questions: _______
- Which was more helpful? _______

#### Scenario 3: Context Retention (Multi-turn)
```
Turn 1: "I need lunch for 15 people"
Turn 2: "Make it vegetarian"
Turn 3: "Actually, change it to 20 people"
Turn 4: "Add some desserts"
Turn 5: "Confirm the order"
```

**Compare:**
- OpenAI maintained context: ✅/❌
- Nemotron maintained context: ✅/❌
- Which handled changes better? _______

---

### Test 4: Stress Testing

**Concurrent Sessions:**
1. Open 3 browser tabs
2. Create 3 sessions simultaneously
3. Send messages to all 3 at the same time

**Check:**
- Any errors? ___
- Response time degradation? ___
- Cross-session contamination? ___

**Long Conversation:**
1. Single session with 20+ messages
2. Check if context window breaks
3. Measure response time progression

**Results:**
- Messages 1-5 avg: ___ ms
- Messages 6-10 avg: ___ ms
- Messages 11-15 avg: ___ ms
- Messages 16-20 avg: ___ ms

---

## Performance API Endpoints

### GET /api/v1/performance/metrics
Returns summary statistics:
```json
{
  "totalRequests": 10,
  "successRate": 100,
  "avgDurationMs": 4235,
  "minDurationMs": 2890,
  "maxDurationMs": 6120,
  "avgTokensPerSecond": 28.5,
  "byProvider": {
    "openai": {
      "count": 5,
      "avgDurationMs": 3245,
      "avgTokensPerSecond": 31.2
    },
    "openrouter": {
      "count": 5,
      "avgDurationMs": 5225,
      "avgTokensPerSecond": 25.8
    }
  }
}
```

### GET /api/v1/performance/details
Returns detailed metrics for each request:
```json
{
  "metrics": [
    {
      "requestId": "req_1234_abc",
      "modelName": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      "provider": "openrouter",
      "startTime": 1698765432000,
      "endTime": 1698765436235,
      "durationMs": 4235,
      "promptTokens": 45,
      "completionTokens": 120,
      "totalTokens": 165,
      "tokensPerSecond": 28.3,
      "messageContent": "Hi, what's on the menu?",
      "responseContent": "...",
      "errorOccurred": false
    }
  ]
}
```

### POST /api/v1/performance/export
Exports metrics to JSON file in project root:
```json
{
  "status": "exported",
  "file": "performance-metrics.json",
  "message": "Metrics exported to project root"
}
```

---

## Interpreting Results

### Response Time
- **Faster is better**
- OpenAI GPT-4: Typically 2-5 seconds
- Nemotron Ultra: Typically 3-8 seconds (larger model, more compute)
- **Acceptable:** < 10 seconds
- **Good:** < 5 seconds
- **Excellent:** < 3 seconds

### Tokens per Second
- **Higher is better**
- Indicates generation speed
- **Acceptable:** > 15 tok/s
- **Good:** > 25 tok/s
- **Excellent:** > 40 tok/s

### Quality Factors
- **Context retention:** Does it remember previous turns?
- **Instruction following:** Does it follow persona guidelines?
- **Accuracy:** Correct menu items, pricing, logistics?
- **Helpfulness:** Does it ask clarifying questions when needed?

---

## Troubleshooting

### Error: "Cannot find module '@openai/agents-extensions'"
**Solution:**
```bash
npm install @openai/agents-extensions @ai-sdk/openai
```

### Error: "Invalid API key" (OpenRouter)
**Solution:**
1. Check `.env` has `OPENROUTER_API_KEY=sk-or-...`
2. Verify key is valid at https://openrouter.ai/
3. Restart backend after updating `.env`

### Error: Model not responding / timeout
**Solution:**
1. Check OpenRouter status: https://status.openrouter.ai/
2. Try switching back to OpenAI: `USE_NEMOTRON=false`
3. Check backend logs for specific error

### Performance metrics show 0 requests
**Solution:**
1. Send at least one message through the frontend
2. Performance tracking only works for messages sent via `/api/v1/messages/session/{id}` endpoint
3. Check backend console for tracking logs

### Frontend not connecting to backend
**Solution:**
1. Verify backend is running: `http://localhost:8000/health`
2. Check frontend .env.local: `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Clear browser cache and reload

---

## Production Considerations

### When to Use Nemotron
✅ **Use Nemotron if:**
- Response quality is significantly better
- Cost is lower (check OpenRouter pricing)
- Speed is acceptable (< 10s per response)
- Context handling is equivalent or better

❌ **Stick with OpenAI if:**
- Speed is critical (< 3s required)
- Nemotron quality is not noticeably better
- Budget allows for OpenAI pricing
- Stability/uptime is critical

### Cost Comparison
- **OpenAI GPT-4.1:** ~$0.03 per 1K tokens (input), ~$0.06 per 1K tokens (output)
- **Nemotron via OpenRouter:** ~$0.015 per 1K tokens (check current pricing)
- **Potential savings:** ~50% depending on usage patterns

### Deployment Options
1. **Pure OpenAI:** `USE_NEMOTRON=false`, no OpenRouter key needed
2. **Pure Nemotron:** `USE_NEMOTRON=true`, OpenRouter key required
3. **Hybrid:** Toggle based on use case (e.g., complex queries → Nemotron, simple → OpenAI)

---

## Rollback Plan

If you need to revert to OpenAI-only:

### Quick Rollback (30 seconds)
```bash
# In .env
USE_NEMOTRON=false

# Restart backend
npm run server
```

### Complete Rollback (remove integration)
```bash
# Revert code changes
git checkout rc/persona-agent.ts
git checkout rc/orders/chat-ordering-workflow.ts
git checkout rc/learning/profile-updater.ts
git checkout rc/services/message-service.ts
git checkout server/index.ts
git rm rc/config/model-config.ts
git rm rc/utils/performance-tracker.ts

# Uninstall packages
npm uninstall @openai/agents-extensions @ai-sdk/openai

# Restart
npm run server
```

---

## Next Steps

1. **Complete Testing:** Run all test scenarios documented above
2. **Analyze Results:** Create comparison table with your actual metrics
3. **Make Decision:** Based on speed, quality, and cost data
4. **Document Findings:** Update this file with your conclusions
5. **Deploy:** If satisfied, deploy with chosen configuration

---

## Support

For questions or issues:
1. Check backend logs: Look for `⏱️`, `✅`, or `❌` prefixed messages
2. Check performance metrics: `GET /api/v1/performance/metrics`
3. Export detailed data: `POST /api/v1/performance/export`
4. Review this documentation

---

## Summary

This integration successfully adds:
- ✅ OpenRouter support for NVIDIA Nemotron models
- ✅ Easy toggle between providers
- ✅ Comprehensive performance tracking
- ✅ No breaking changes to existing code
- ✅ Full E2E testing capability with frontend + backend

**Total implementation:** 9 files modified, ~250 lines of code added.
