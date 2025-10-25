# Persona-Aware Customer Service CLI

## Overview
A CLI chatbot that simulates Clay Pit's customer service agent speaking with Aniket Sharma, using his detailed persona profile to provide personalized, context-aware responses.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create or update `.env` file in the project root:

```bash
# Add to .env
OPENAI_API_KEY=your-openai-api-key-here
```

You can get an OpenAI API key from: https://platform.openai.com/api-keys

### 3. Run the CLI
```bash
# Default (auto-detect time of day)
npm run persona

# Override time context for testing
npm run persona -- --time=monday_morning
npm run persona -- --time=midday
npm run persona -- --time=late_afternoon
npm run persona -- --time=evening
```

## How It Works

### Persona Profile
The agent loads Aniket Sharma's detailed profile from `src/data/aniket_profile.json`, including:
- Communication style and preferences
- Favorite menu items
- Budget ranges
- Dietary requirements for his team
- Time-based behavioral patterns
- Personal touches (NVIDIA milestones, sustainability values)

### Time-Aware Behavior
The agent adapts its communication style based on time of day:

| Time Context | Behavior |
|--------------|----------|
| **Monday Morning** (Mon-Tue 8-10am) | Structured, checklist-oriented, short status checks |
| **Midday** (11am-1pm) | Efficient, quick options, expects agent to lead |
| **Late Afternoon** (4-6pm) | Conversational, open to brainstorming, storytelling |
| **Evening** (after 8pm) | High urgency, empathetic, rapid-fire solutions |

### Features
- ✅ **Persona-aware responses** - Knows Aniket's preferences and team needs
- ✅ **Time-context adaptation** - Adjusts tone and pacing based on time of day
- ✅ **Dietary intelligence** - Always includes vegetarian/mild-spice options
- ✅ **Budget awareness** - Suggests options within $700-$2000 range
- ✅ **Tech analogies** - Mirrors Aniket's communication style
- ✅ **Bullet summaries** - Provides Slack-ready recaps
- ✅ **Chef notes** - Includes dish stories Aniket can share

## Example Conversations

### Morning Mode (Structured)
```
You: Hey, need lunch for 20 people next Wednesday

Agent: Morning, Aniket! Got it—lunch for 20 next Wednesday. Let me get you set up efficiently:

Quick questions:
□ What time do you need delivery?
□ Same NVIDIA campus building as usual?
□ Budget range this time?

I can suggest our "Dev Team Bundle" (Butter Chicken + Goat Biryani + veggie options) with bulk discount.
```

### Evening Mode (Urgent)
```
You: Last minute dinner for 10 execs tomorrow at noon

Agent: Got it, high stakes. Let me get you sorted fast:

✓ I can do premium setup for 10 execs, noon tomorrow
✓ Budget ~$800-900 for this tier
✓ Hero picks: Kothmir Salmon + Butter Chicken + veggie centerpiece

Fastest path: I pre-build the menu, send you for approval in 5 mins?
```

### Late Afternoon Mode (Collaborative)
```
You: Thinking about adding something new for our GTC afterparty

Agent: Oh nice! GTC is coming up—that's a big one for your team. What kind of vibe are you going for? Fancy appetizers, comfort food, or something experimental?
```

## File Structure
```
src/
  data/
    aniket_profile.json          # Detailed persona definition
  persona-agent.ts               # Agent creation & system prompt builder
  persona-chat-cli.ts            # Main CLI interface
  README.md                      # This file
```

## Customization

### Adding More Personas
1. Create new profile JSON in `src/data/`
2. Update `loadAniketProfile()` to accept a profile name parameter
3. Pass profile name via CLI flag: `npm run persona -- --profile=john`

### Adjusting Agent Behavior
Edit `src/persona-agent.ts`:
- `buildSystemPrompt()` - Modify the system prompt template
- `getTimeBasedInstructions()` - Adjust time-based behaviors
- `getCurrentTimeContext()` - Change time detection logic

### Changing LLM Model
Edit `src/persona-agent.ts`, function `createPersonaAgent()`:
```typescript
model: "gpt-4.1",  // Change to gpt-4.1-mini or gpt-5-mini
```

## Tips
- Type `exit` to end the conversation
- The agent maintains conversation history throughout the session
- Use `--time=<context>` to test different time-based behaviors
- Check `src/data/aniket_profile.json` to see all persona details

## Troubleshooting

### Missing OpenAI API Key
```
Error: Missing credentials. Please pass an `apiKey`...
```
**Solution:** Add `OPENAI_API_KEY` to your `.env` file

### Profile Not Loading
```
Error: ENOENT: no such file or directory
```
**Solution:** Make sure `src/data/aniket_profile.json` exists

### Time Context Not Working
Use explicit override:
```bash
npm run persona -- --time=evening
```

## Next Steps
- [ ] Add conversation logging to track interactions
- [ ] Integrate with actual menu database
- [ ] Add order placement functionality
- [ ] Connect to Supabase for real customer data
- [ ] Add voice interface (Whisper STT + OpenAI TTS)
