# Langflow Setup Guide
## Building the Agentic Chatbot with Audio & Database Retrieval

**Purpose:** Step-by-step instructions to build the chatbot in Langflow

---

## Prerequisites

1. **Langflow Installation:**
   ```bash
   pip install langflow
   langflow run
   ```
   Access at: http://localhost:7860

2. **Environment Variables:**
   ```bash
   export SUPABASE_CONNECTION_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres"
   export OPENAI_API_KEY="sk-***"
   export ANTHROPIC_API_KEY="sk-ant-***"
   ```

---

## Langflow Flow Structure

### Overview

```
Input → Context Retrieval → Persona Loader → Memory → LLM → Output → Save
  ↓           ↓                  ↓             ↓       ↓      ↓      ↓
Phone#    Customer Data     Agent Config   History Response Text  Database
```

---

## Step-by-Step Build

### 1. Create New Flow

1. Open Langflow UI
2. Click **"New Flow"**
3. Name: `Clay Pit Agentic Chatbot`
4. Description: `Voice-first customer engagement with database retrieval`

### 2. Add Input Node

**Node: ChatInput**
- **Name:** `User Input`
- **Configuration:**
  - Input Type: `Text`
  - Sender: `User`
  - Sender Name: `Customer`

### 3. Add Custom Supabase Connector Node

**Node: CustomComponent**
- **Name:** `Customer Context Retriever`
- **Code:**

```python
from langflow import CustomComponent
from typing import Optional
import os
from supabase import create_client, Client

class CustomerContextRetriever(CustomComponent):
    display_name = "Customer Context Retriever"
    description = "Retrieves customer data from Supabase"

    def build_config(self):
        return {
            "phone_number": {
                "display_name": "Phone Number",
                "info": "Customer phone number for lookup"
            },
            "connection_url": {
                "display_name": "Supabase Connection URL",
                "info": "PostgreSQL connection string",
                "password": True
            }
        }

    def build(
        self,
        phone_number: str,
        connection_url: str = os.getenv("SUPABASE_CONNECTION_URL")
    ) -> dict:
        # Parse connection URL
        import re
        match = re.match(
            r"postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)",
            connection_url
        )

        if not match:
            return {"error": "Invalid connection URL"}

        user, password, host, port, database = match.groups()

        # Connect to Supabase
        supabase_url = f"https://{os.getenv('SUPABSE_REF')}.supabase.co"
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")

        supabase: Client = create_client(supabase_url, supabase_key)

        # Get customer data
        customer_response = supabase.table("customers") \
            .select("*, customer_profiles(*), customer_order_metrics(*)") \
            .eq("phone", phone_number) \
            .single() \
            .execute()

        if not customer_response.data:
            return {
                "found": False,
                "message": "Customer not found"
            }

        customer = customer_response.data

        # Get recent interactions
        interactions_response = supabase.table("agent_interactions") \
            .select("*") \
            .eq("customer_id", customer["customer_id"]) \
            .order("started_at", desc=True) \
            .limit(3) \
            .execute()

        return {
            "found": True,
            "customer_id": customer["customer_id"],
            "customer_name": customer["full_name"],
            "customer_email": customer.get("email"),
            "preferences": customer.get("customer_profiles"),
            "order_metrics": customer.get("customer_order_metrics"),
            "recent_interactions": interactions_response.data,
            "is_premium": bool(
                supabase.table("premium_customers")
                .select("customer_id")
                .eq("customer_id", customer["customer_id"])
                .single()
                .execute()
                .data
            )
        }
```

**Connections:**
- Input: `User Input.message` (to extract phone number)
- Output: `context_data` → Connect to Prompt node

### 4. Add Agent Persona Loader

**Node: CustomComponent**
- **Name:** `Agent Persona Loader`
- **Code:**

```python
from langflow import CustomComponent
from supabase import create_client, Client
import os

class AgentPersonaLoader(CustomComponent):
    display_name = "Agent Persona Loader"
    description = "Loads agent persona from database"

    def build_config(self):
        return {
            "persona_name": {
                "display_name": "Persona Name",
                "options": ["Asha", "Dev", "Priya", "Amit", "Leela", "Maya"],
                "value": "Asha"
            },
            "customer_context": {
                "display_name": "Customer Context",
                "info": "Customer data from previous node"
            }
        }

    def build(
        self,
        persona_name: str = "Asha",
        customer_context: dict = None
    ) -> dict:
        supabase_url = f"https://{os.getenv('SUPABSE_REF')}.supabase.co"
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        supabase: Client = create_client(supabase_url, supabase_key)

        # Override persona based on customer tier
        if customer_context and customer_context.get("is_premium"):
            persona_name = "Asha"

        # Get persona from database
        persona_response = supabase.table("agent_personas") \
            .select("*") \
            .eq("name", persona_name) \
            .single() \
            .execute()

        if not persona_response.data:
            return {
                "error": f"Persona '{persona_name}' not found",
                "fallback_persona": "Dev"
            }

        persona = persona_response.data

        return {
            "persona_id": persona["agent_persona_id"],
            "persona_name": persona["name"],
            "description": persona["description"],
            "tone_guidelines": persona["tone_guidelines"],
            "suggestion_rules": persona.get("suggestion_rules", {}),
            "default_channel": persona["default_channel"]
        }
```

**Connections:**
- Input: `Customer Context Retriever.context_data`
- Output: `persona_config` → Connect to Prompt node

### 5. Add Prompt Builder

**Node: Prompt**
- **Name:** `System Prompt`
- **Template:**

```jinja2
You are {{ persona_config.persona_name }}, an AI assistant for Clay Pit restaurant.

{{ persona_config.description }}

## Tone Guidelines
{% for key, value in persona_config.tone_guidelines.items() %}
- {{ key }}: {{ value }}
{% endfor %}

{% if customer_context.found %}
## Customer Information
- Name: {{ customer_context.customer_name }}
- VIP Status: {{ "Yes" if customer_context.is_premium else "No" }}

{% if customer_context.preferences %}
### Preferences
- Dietary Restrictions: {{ customer_context.preferences.dietary_restriction or "None" }}
- Spice Tolerance: {{ customer_context.preferences.spice_tolerance or "Medium" }}
- Allergies: {{ customer_context.preferences.allergies or "None" }}
{% endif %}

{% if customer_context.order_metrics %}
### Order History
- Total Orders: {{ customer_context.order_metrics.order_count }}
- Lifetime Value: ${{ customer_context.order_metrics.lifetime_value }}
- Average Order: ${{ customer_context.order_metrics.avg_order_value }}
- Last Sentiment: {{ customer_context.order_metrics.last_sentiment or "N/A" }}
{% endif %}
{% endif %}

## Instructions
- Be helpful, friendly, and professional
- Personalize recommendations based on customer preferences
- Use the tone guidelines above
- Keep responses concise and conversational

Now respond to the customer's message.
```

**Connections:**
- Input Variables:
  - `persona_config` ← Agent Persona Loader
  - `customer_context` ← Customer Context Retriever
- Output: `formatted_prompt` → LLM node

### 6. Add Memory Node

**Node: ConversationBufferMemory**
- **Name:** `Conversation Memory`
- **Configuration:**
  - Memory Key: `chat_history`
  - Return Messages: `True`
  - Max Token Limit: `2000`
  - Input Key: `user_message`
  - Output Key: `agent_response`

**Connections:**
- Connect to LLM node

### 7. Add LLM Node

**Node: ChatAnthropic (or ChatOpenAI)**
- **Name:** `Claude LLM`
- **Configuration:**
  - Model: `claude-3-5-sonnet-20241022`
  - Temperature: `0.7`
  - Max Tokens: `500`
  - API Key: `${ANTHROPIC_API_KEY}`

**Connections:**
- Input:
  - System Prompt ← `System Prompt.formatted_prompt`
  - User Message ← `User Input.message`
  - Memory ← `Conversation Memory`
- Output: `response` → Chat Output & Interaction Saver

### 8. Add Output Node

**Node: ChatOutput**
- **Name:** `Agent Response`
- **Configuration:**
  - Sender: `Agent`
  - Sender Name: `{{ persona_config.persona_name }}`

**Connections:**
- Input: `Claude LLM.response`

### 9. Add Interaction Saver Node

**Node: CustomComponent**
- **Name:** `Interaction Saver`
- **Code:**

```python
from langflow import CustomComponent
from supabase import create_client, Client
import os
from datetime import datetime

class InteractionSaver(CustomComponent):
    display_name = "Interaction Saver"
    description = "Saves conversation to Supabase"

    def build_config(self):
        return {
            "customer_context": {
                "display_name": "Customer Context"
            },
            "persona_config": {
                "display_name": "Persona Config"
            },
            "user_message": {
                "display_name": "User Message"
            },
            "agent_response": {
                "display_name": "Agent Response"
            },
            "interaction_id": {
                "display_name": "Interaction ID",
                "info": "Reuse existing or create new"
            }
        }

    def build(
        self,
        customer_context: dict,
        persona_config: dict,
        user_message: str,
        agent_response: str,
        interaction_id: str = None
    ) -> dict:
        supabase_url = f"https://{os.getenv('SUPABSE_REF')}.supabase.co"
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "")
        supabase: Client = create_client(supabase_url, supabase_key)

        # Create or get interaction
        if not interaction_id and customer_context.get("customer_id"):
            interaction_response = supabase.table("agent_interactions").insert({
                "customer_id": customer_context["customer_id"],
                "agent_persona_id": persona_config["persona_id"],
                "channel": "chat",
                "started_at": datetime.utcnow().isoformat()
            }).execute()

            interaction_id = interaction_response.data[0]["interaction_id"]

        # Get current turn index
        transcript_count = supabase.table("interaction_transcripts") \
            .select("turn_index", count="exact") \
            .eq("interaction_id", interaction_id) \
            .execute()

        turn_index = len(transcript_count.data) if transcript_count.data else 0

        # Save customer turn
        supabase.table("interaction_transcripts").insert({
            "interaction_id": interaction_id,
            "turn_index": turn_index,
            "speaker": "customer",
            "content": user_message,
            "confidence": 1.0
        }).execute()

        # Save agent turn
        supabase.table("interaction_transcripts").insert({
            "interaction_id": interaction_id,
            "turn_index": turn_index + 1,
            "speaker": "agent",
            "content": agent_response,
            "confidence": 1.0
        }).execute()

        return {
            "success": True,
            "interaction_id": interaction_id,
            "turns_saved": 2
        }
```

**Connections:**
- Inputs:
  - `customer_context` ← Customer Context Retriever
  - `persona_config` ← Agent Persona Loader
  - `user_message` ← User Input
  - `agent_response` ← Claude LLM

### 10. Connect All Nodes

**Final Flow Diagram:**

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ├───────────────────────────┐
       │                           │
       ▼                           ▼
┌──────────────┐           ┌──────────────┐
│   Customer   │           │    Agent     │
│   Context    │──────────▶│   Persona    │
│  Retriever   │           │   Loader     │
└──────┬───────┘           └──────┬───────┘
       │                          │
       └──────────┬───────────────┘
                  ▼
           ┌──────────────┐
           │   System     │
           │   Prompt     │
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐      ┌──────────────┐
           │  Claude LLM  │◀─────│   Memory     │
           └──────┬───────┘      └──────────────┘
                  │
                  ├───────────────────┐
                  │                   │
                  ▼                   ▼
           ┌──────────────┐    ┌──────────────┐
           │    Agent     │    │ Interaction  │
           │   Response   │    │    Saver     │
           └──────────────┘    └──────────────┘
```

---

## Audio Integration

### Option 1: Pre-process Audio Outside Langflow

**Workflow:**
1. Receive audio from Twilio/phone system
2. Send to Whisper API → Get text
3. Send text to Langflow API
4. Receive text response from Langflow
5. Send to TTS API → Get audio
6. Play audio to customer

**API Call:**
```python
import requests
import openai

# Step 1: Transcribe
audio_file = open("customer_audio.mp3", "rb")
transcript = openai.Audio.transcribe("whisper-1", audio_file)

# Step 2: Send to Langflow
response = requests.post(
    "http://localhost:7860/api/v1/run/clay-pit-chatbot",
    headers={"x-api-key": "your-api-key"},
    json={
        "input_value": transcript.text,
        "phone_number": "+15125551234"
    }
)

agent_response = response.json()["outputs"][0]["text"]

# Step 3: Generate speech
speech = openai.Audio.create(
    model="tts-1",
    voice="nova",
    input=agent_response
)
speech.stream_to_file("agent_response.mp3")
```

### Option 2: Add Audio Nodes to Langflow

**Whisper STT Node:**
```python
from langflow import CustomComponent
import openai

class WhisperSTT(CustomComponent):
    display_name = "Whisper Speech-to-Text"

    def build(self, audio_file_path: str) -> str:
        with open(audio_file_path, "rb") as audio:
            transcript = openai.Audio.transcribe(
                model="whisper-1",
                file=audio
            )
        return transcript.text
```

**OpenAI TTS Node:**
```python
from langflow import CustomComponent
import openai

class OpenAITTS(CustomComponent):
    display_name = "OpenAI Text-to-Speech"

    def build(self, text: str, voice: str = "nova") -> str:
        response = openai.Audio.create(
            model="tts-1",
            voice=voice,
            input=text
        )

        output_path = f"/tmp/tts_{hash(text)}.mp3"
        response.stream_to_file(output_path)

        return output_path
```

---

## Testing the Flow

### 1. Test in Langflow Playground

1. Click **"Playground"** button
2. Enter test message:
   ```
   Phone: +15125551234
   Message: Hi, I'd like to order dinner
   ```
3. Verify:
   - ✓ Customer context retrieved
   - ✓ Persona loaded (should be Asha for VIP)
   - ✓ Response uses correct tone
   - ✓ Interaction saved to database

### 2. Test via API

```bash
curl -X POST http://localhost:7860/api/v1/run/clay-pit-chatbot \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-langflow-api-key" \
  -d '{
    "input_value": "I want to order lamb vindaloo",
    "phone_number": "+15125551234"
  }'
```

### 3. Verify Database

```sql
-- Check interaction was created
SELECT * FROM agent_interactions
ORDER BY started_at DESC LIMIT 1;

-- Check transcripts were saved
SELECT * FROM interaction_transcripts
WHERE interaction_id = '<interaction_id>'
ORDER BY turn_index;
```

---

## Deployment

### 1. Export Flow

1. Click **"Export"** in Langflow
2. Download JSON file
3. Save as: `langflow_chatbot_flow.json`

### 2. Deploy to Production

```bash
# Install Langflow in production
pip install langflow

# Set environment variables
export LANGFLOW_DATABASE_URL="postgresql://..."
export SUPABASE_CONNECTION_URL="postgresql://..."
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Run Langflow server
langflow run --host 0.0.0.0 --port 7860 --env-file .env

# Import flow
langflow load -f langflow_chatbot_flow.json
```

### 3. Secure with API Key

```bash
# Generate API key
langflow api-key create --name "production"

# Use in requests
curl -H "x-api-key: lf-..." http://your-server:7860/api/v1/run/chatbot
```

---

## Troubleshooting

### Issue: Customer Not Found

**Solution:** Check phone number format
- Ensure format: `+1XXXXXXXXXX` (with country code)
- Add phone number normalization in Context Retriever

### Issue: Persona Not Loading

**Solution:** Verify agent_personas table has data
```sql
SELECT * FROM agent_personas;
```

### Issue: Memory Not Working

**Solution:** Check Langflow memory configuration
- Ensure `return_messages: true`
- Check `memory_key` matches in all nodes

### Issue: Database Connection Failed

**Solution:** Verify credentials
```bash
psql "$SUPABASE_CONNECTION_URL" -c "SELECT 1;"
```

---

## Next Steps

1. **Add Voice Integration:**
   - Integrate Twilio for phone calls
   - Add Whisper and TTS nodes
   - Test end-to-end voice flow

2. **Enhance Context:**
   - Add menu item retrieval
   - Add order placement capability
   - Add reservation system

3. **Improve Persona Selection:**
   - Add sentiment-based routing
   - Add time-of-day routing
   - Add customer preference overrides

4. **Add Analytics:**
   - Track conversation metrics
   - Monitor LLM costs
   - Measure customer satisfaction

---

## Resources

- **Langflow Docs:** https://docs.langflow.org/
- **Supabase Docs:** https://supabase.com/docs
- **OpenAI Whisper:** https://platform.openai.com/docs/guides/speech-to-text
- **Anthropic Claude:** https://docs.anthropic.com/
