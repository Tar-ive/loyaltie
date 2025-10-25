# Agentic Chatbot Architecture
## Voice-First Customer Engagement System with Langflow

**Version:** 1.0
**Date:** 2025-10-25
**Purpose:** Restaurant customer engagement with audio capabilities and database-backed personalization

---

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  (Web App / Mobile App / Phone System / WhatsApp)               │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ Audio/Text Input
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Audio Processing Layer                        │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Whisper    │         │   ElevenLabs  │                     │
│  │  (STT API)   │         │   (TTS API)   │                     │
│  └──────────────┘         └──────────────┘                     │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ Text Input/Output
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Langflow Engine                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Agentic Chatbot Flow                        │  │
│  │                                                            │  │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐            │  │
│  │  │ Context  │   │   LLM    │   │ Memory   │            │  │
│  │  │Retrieval │──▶│ Agent    │◀──│ Store    │            │  │
│  │  └──────────┘   └──────────┘   └──────────┘            │  │
│  │       ▲              │                                    │  │
│  │       │              ▼                                    │  │
│  │  ┌──────────┐   ┌──────────┐                            │  │
│  │  │Database  │   │ Response │                            │  │
│  │  │Query     │   │Generation│                            │  │
│  │  └──────────┘   └──────────┘                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ Database Queries
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Customers  │  │Agent Personas│  │ Interactions │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Transcripts  │  │    Orders    │  │Menu Items    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Audio Processing Layer

**Input: Speech-to-Text (STT)**
- **Technology:** OpenAI Whisper API
- **Input:** Audio files (.mp3, .wav, .m4a, .ogg, .flac)
- **Output:** Transcribed text + confidence score
- **Processing:**
  - Audio validation (format, size < 25MB)
  - Language detection (default: en-US)
  - Confidence scoring (0-1 scale)

**Output: Text-to-Speech (TTS)**
- **Technology:** OpenAI TTS API / ElevenLabs
- **Input:** Response text from LLM
- **Output:** Audio file (.mp3)
- **Voice Options:** nova, alloy, echo, fable, onyx, shimmer
- **Features:**
  - Persona-specific voice selection
  - Emotion/tone adjustment
  - Real-time streaming support

### 2.2 Langflow Engine

**Core Components:**

```
Langflow Flow Structure:
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Input Node (Text/Audio)                                    │
│         │                                                    │
│         ▼                                                    │
│  Context Retrieval Node                                     │
│  ├─ Get Customer Profile                                    │
│  ├─ Get Order History                                       │
│  ├─ Get Preferences                                         │
│  └─ Get Recent Interactions                                 │
│         │                                                    │
│         ▼                                                    │
│  Agent Persona Node                                         │
│  └─ Load Agent Guidelines from DB                           │
│         │                                                    │
│         ▼                                                    │
│  Memory Node (Conversation History)                         │
│  └─ Store/Retrieve Last N Messages                          │
│         │                                                    │
│         ▼                                                    │
│  LLM Node (Claude 3.5 Sonnet)                              │
│  └─ Generate Response with Full Context                     │
│         │                                                    │
│         ▼                                                    │
│  Database Writer Node                                       │
│  ├─ Save Interaction                                        │
│  ├─ Save Transcript Turn                                    │
│  └─ Update Sentiment                                        │
│         │                                                    │
│         ▼                                                    │
│  Output Node (Text Response)                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Database Layer (Supabase)

**Tables Used:**

1. **agent_personas** - Agent personality and tone
2. **customers** - Customer master data
3. **customer_profiles** - Preferences and dietary info
4. **customer_order_metrics** - Aggregated metrics (materialized view)
5. **agent_interactions** - Conversation sessions
6. **interaction_transcripts** - Turn-by-turn dialogue
7. **transcript_media** - Audio file references
8. **orders** - Order history
9. **menu_items** - Menu data for recommendations

---

## 3. Data Flow

### 3.1 Incoming Voice Call Flow

```
1. User calls restaurant
   ↓
2. Audio captured and sent to Whisper API
   ↓
3. Speech → Text transcription
   ↓
4. Langflow receives text input
   ↓
5. Context Retrieval:
   - Phone number lookup → Customer ID
   - Fetch customer profile
   - Fetch order history & metrics
   - Fetch preferences (dietary, spice level, allergies)
   - Load agent persona (default: Asha)
   ↓
6. Build conversation context:
   - Customer name & VIP status
   - Last order details
   - Favorite items
   - Recent sentiment
   ↓
7. LLM Agent (Claude) generates response
   - Uses persona tone guidelines
   - Considers customer preferences
   - Personalizes recommendations
   ↓
8. Response text → TTS (OpenAI/ElevenLabs)
   ↓
9. Audio played to customer
   ↓
10. Store interaction in database:
    - agent_interactions (session metadata)
    - interaction_transcripts (customer turn)
    - interaction_transcripts (agent turn)
    - transcript_media (audio file reference)
```

### 3.2 Text Chat Flow

```
1. User sends text message (web/app/SMS)
   ↓
2. Langflow receives text input directly
   ↓
3. Context Retrieval (same as voice)
   ↓
4. LLM generates response
   ↓
5. Text response sent back
   ↓
6. Store interaction (skip audio processing)
```

---

## 4. Langflow Node Configuration

### 4.1 Custom Nodes Required

**1. Supabase Query Node**
```json
{
  "name": "SupabaseQuery",
  "type": "CustomComponent",
  "inputs": [
    "connection_url",
    "table_name",
    "query_type",
    "filters"
  ],
  "outputs": ["result_data"],
  "code": "supabase_connector.py"
}
```

**2. Customer Context Builder**
```json
{
  "name": "CustomerContextBuilder",
  "type": "CustomComponent",
  "inputs": [
    "customer_id",
    "include_orders",
    "include_preferences",
    "include_history"
  ],
  "outputs": ["context_object"],
  "code": "context_builder.py"
}
```

**3. Agent Persona Loader**
```json
{
  "name": "AgentPersonaLoader",
  "type": "CustomComponent",
  "inputs": [
    "persona_name",
    "customer_overrides"
  ],
  "outputs": ["persona_config"],
  "code": "persona_loader.py"
}
```

**4. Interaction Saver**
```json
{
  "name": "InteractionSaver",
  "type": "CustomComponent",
  "inputs": [
    "interaction_id",
    "turn_index",
    "speaker",
    "content",
    "sentiment"
  ],
  "outputs": ["success"],
  "code": "interaction_saver.py"
}
```

### 4.2 Standard Langflow Nodes Used

- **ChatInput** - Entry point for text/transcribed audio
- **ChatOutput** - Exit point for responses
- **Prompt** - System prompt with context injection
- **OpenAI** - LLM for response generation (or Anthropic)
- **Memory** - Conversation history buffer
- **ConditionalRouter** - Route based on intent/sentiment

---

## 5. Agent Personas

### 5.1 Persona System

Each agent persona stored in `agent_personas` table:

```json
{
  "name": "Asha",
  "description": "Warm, knowledgeable, personal concierge",
  "tone_guidelines": {
    "warmth": "high",
    "formality": "medium",
    "pace": "measured",
    "enthusiasm": "genuine",
    "proactivity": "anticipates needs"
  },
  "suggestion_rules": {
    "dietary_aware": true,
    "upsell_threshold": 50,
    "personalization_level": "high"
  },
  "default_channel": "voice"
}
```

### 5.2 Available Personas

1. **Asha** - Premium concierge (VIP customers)
2. **Dev** - Efficient order-taker (lunch rush)
3. **Priya** - Dietary specialist (allergies/restrictions)
4. **Amit** - Catering coordinator (large orders)
5. **Leela** - Complaint resolver (escalations)
6. **Maya** - New customer onboarding

### 5.3 Dynamic Persona Selection

```python
def select_persona(customer_id, context):
    # Check for customer-specific override
    override = get_customer_persona_override(customer_id)
    if override:
        return override

    # VIP customers → Asha
    if is_premium_customer(customer_id):
        return "Asha"

    # Order intent + dietary restrictions → Priya
    if context.intent == "order" and has_dietary_restrictions(customer_id):
        return "Priya"

    # Complaint/negative sentiment → Leela
    if context.sentiment < -0.3:
        return "Leela"

    # Default
    return "Dev"
```

---

## 6. Database Schema Usage

### 6.1 Key Queries for Context Retrieval

**Get Customer Profile:**
```sql
SELECT c.*, cp.*, cm.*
FROM customers c
LEFT JOIN customer_profiles cp ON cp.customer_id = c.customer_id
LEFT JOIN customer_order_metrics cm ON cm.customer_id = c.customer_id
WHERE c.phone = $1;
```

**Get Recent Interactions:**
```sql
SELECT ai.*,
       array_agg(it.content ORDER BY it.turn_index) as conversation
FROM agent_interactions ai
LEFT JOIN interaction_transcripts it ON it.interaction_id = ai.interaction_id
WHERE ai.customer_id = $1
ORDER BY ai.started_at DESC
LIMIT 3;
```

**Get Favorite Items:**
```sql
SELECT mi.name, mi.description, mi.base_price
FROM menu_items mi
WHERE mi.menu_item_id = ANY(
    SELECT unnest(favorite_items)
    FROM customer_order_metrics
    WHERE customer_id = $1
);
```

### 6.2 Interaction Storage

**Start Interaction:**
```sql
INSERT INTO agent_interactions (
    customer_id, agent_persona_id, channel,
    started_at, intent
)
VALUES ($1, $2, $3, NOW(), $4)
RETURNING interaction_id;
```

**Add Transcript Turn:**
```sql
INSERT INTO interaction_transcripts (
    interaction_id, turn_index, speaker,
    content, confidence
)
VALUES ($1, $2, $3, $4, $5);
```

**End Interaction:**
```sql
UPDATE agent_interactions
SET ended_at = NOW(),
    sentiment_score = $2,
    resolution_status = $3,
    summary = $4
WHERE interaction_id = $1;
```

---

## 7. Memory Management

### 7.1 Conversation Memory

**Langflow Memory Node Configuration:**
```json
{
  "type": "ConversationBufferMemory",
  "config": {
    "max_messages": 20,
    "return_messages": true,
    "memory_key": "chat_history",
    "input_key": "user_message",
    "output_key": "agent_response"
  }
}
```

### 7.2 Long-Term Memory

**Database-backed conversation history:**
- Retrieve last 5 interactions from `agent_interactions`
- Extract key points and sentiment trends
- Inject into system prompt as "Previous Conversations"

### 7.3 Retrieval-Augmented Generation (RAG)

**Future Enhancement:**
```
- Enable pgvector extension in Supabase
- Generate embeddings for interaction transcripts
- Semantic search for similar past conversations
- Use similar interactions as few-shot examples
```

---

## 8. Audio Processing Details

### 8.1 Whisper Integration

**API Call:**
```python
import openai

def transcribe_audio(audio_file_path):
    with open(audio_file_path, "rb") as audio:
        transcript = openai.Audio.transcribe(
            model="whisper-1",
            file=audio,
            language="en",
            response_format="verbose_json"
        )

    return {
        "text": transcript.text,
        "confidence": 0.95,  # Estimated
        "language": transcript.language
    }
```

### 8.2 TTS Integration

**API Call:**
```python
def generate_speech(text, voice="nova"):
    response = openai.Audio.create(
        model="tts-1",
        voice=voice,
        input=text
    )

    audio_path = f"temp/response_{timestamp}.mp3"
    response.stream_to_file(audio_path)

    return audio_path
```

### 8.3 Voice Selection by Persona

```python
PERSONA_VOICES = {
    "Asha": "nova",      # Warm, friendly
    "Dev": "onyx",       # Professional, efficient
    "Priya": "shimmer",  # Gentle, reassuring
    "Amit": "echo",      # Confident, clear
    "Leela": "fable",    # Empathetic, calming
    "Maya": "alloy"      # Neutral, welcoming
}
```

---

## 9. Deployment Architecture

### 9.1 Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │   Frontend   │        │   Langflow   │                  │
│  │  (Next.js)   │───────▶│   Server     │                  │
│  └──────────────┘        └──────────────┘                  │
│         │                        │                          │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │   Twilio     │        │   Supabase   │                  │
│  │  (Voice API) │        │  (Database)  │                  │
│  └──────────────┘        └──────────────┘                  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │   Whisper    │        │ ElevenLabs/  │                  │
│  │   (STT)      │        │ OpenAI (TTS) │                  │
│  └──────────────┘        └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 API Endpoints

**Langflow REST API:**
```
POST /api/v1/run/{flow_id}
Headers:
  - x-api-key: <langflow-api-key>
Body:
{
  "input_value": "user message",
  "customer_id": "uuid",
  "audio_url": "optional audio file"
}
```

---

## 10. Configuration & Environment

### 10.1 Environment Variables

```bash
# Supabase
SUPABASE_CONNECTION_URL=postgresql://postgres:***@db.xxx.supabase.co:5432/postgres
SUPABASE_SERVICE_KEY=your-service-key
SUPABSE_REF=your-ref

# OpenAI
OPENAI_API_KEY=sk-***

# Anthropic (for Claude)
ANTHROPIC_API_KEY=sk-ant-***

# ElevenLabs (optional, for better TTS)
ELEVENLABS_API_KEY=***

# Langflow
LANGFLOW_API_KEY=***
LANGFLOW_FLOW_ID=chatbot-v1

# Twilio (for phone calls)
TWILIO_ACCOUNT_SID=***
TWILIO_AUTH_TOKEN=***
TWILIO_PHONE_NUMBER=+1234567890
```

### 10.2 Langflow Configuration File

```yaml
# langflow_config.yaml
name: "Clay Pit Agentic Chatbot"
version: "1.0"
description: "Voice-first customer engagement with database retrieval"

components:
  - name: "customer_context"
    type: "custom"
    source: "nodes/customer_context.py"

  - name: "persona_loader"
    type: "custom"
    source: "nodes/persona_loader.py"

  - name: "interaction_saver"
    type: "custom"
    source: "nodes/interaction_saver.py"

flows:
  - id: "main_chatbot"
    nodes: [...] # Defined in Langflow UI

credentials:
  supabase_url: "${SUPABASE_CONNECTION_URL}"
  openai_key: "${OPENAI_API_KEY}"
  anthropic_key: "${ANTHROPIC_API_KEY}"
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

- Test database queries independently
- Test audio transcription with sample files
- Test TTS generation
- Test persona loading logic
- Test context builder

### 11.2 Integration Tests

- End-to-end conversation flow
- Database read/write operations
- Audio processing pipeline
- Error handling and fallbacks

### 11.3 Manual Testing Checklist

```
□ Voice call → STT → Response → TTS → Audio output
□ Customer recognition by phone number
□ Persona selection based on customer tier
□ Dietary preferences honored in recommendations
□ Conversation history retrieved correctly
□ Sentiment analysis working
□ Interaction saved to database
□ Audio files stored with correct references
□ Fallback to text-only mode if audio fails
```

---

## 12. Performance Considerations

### 12.1 Latency Targets

- **STT Processing:** < 3 seconds
- **Database Query:** < 500ms
- **LLM Response:** < 5 seconds
- **TTS Generation:** < 2 seconds
- **Total Turn Time:** < 10 seconds

### 12.2 Optimization Strategies

1. **Database:**
   - Use connection pooling
   - Cache customer profiles (5 min TTL)
   - Materialize order metrics view
   - Index all foreign keys

2. **Audio:**
   - Use Whisper small model for faster transcription
   - Stream TTS audio chunks (don't wait for full generation)
   - Compress audio files (24kbps MP3)

3. **LLM:**
   - Use Claude 3.5 Haiku for simple queries
   - Use Claude 3.5 Sonnet for complex conversations
   - Limit max tokens to 500 for faster responses
   - Cache system prompts

---

## 13. Security & Privacy

### 13.1 Data Protection

- **Audio Files:** Encrypted at rest in S3
- **Database:** Row-level security policies in Supabase
- **API Keys:** Stored in environment variables, never in code
- **PII:** Masked in logs and error messages

### 13.2 Compliance

- **GDPR:** Customer data deletion workflow
- **CCPA:** Data access/export functionality
- **PCI DSS:** No payment data stored (use external payment processor)

---

## 14. Future Enhancements

### Phase 2:
- [ ] Real-time audio streaming (WebSocket)
- [ ] Multi-language support (Spanish, Hindi)
- [ ] Voice biometrics for customer authentication
- [ ] Proactive outreach (order reminders, special offers)

### Phase 3:
- [ ] Emotion detection in voice
- [ ] Background noise cancellation
- [ ] Multi-turn complex dialogues (order modifications)
- [ ] Integration with delivery platforms

### Phase 4:
- [ ] Vector embeddings for semantic search (pgvector)
- [ ] Fine-tuned LLM on restaurant data
- [ ] Predictive analytics (churn risk, upsell opportunities)
- [ ] A/B testing framework for personas

---

## 15. Monitoring & Observability

### 15.1 Key Metrics

- **Conversation Metrics:**
  - Average turns per conversation
  - Resolution rate
  - Sentiment trend
  - Intent classification accuracy

- **System Metrics:**
  - API latency (STT, LLM, TTS)
  - Error rates
  - Uptime
  - Database query performance

- **Business Metrics:**
  - Orders placed via chatbot
  - Average order value (chatbot vs. other channels)
  - Customer satisfaction scores
  - Repeat usage rate

### 15.2 Logging

```python
# Structured logging format
{
  "timestamp": "2025-10-25T10:30:00Z",
  "interaction_id": "uuid",
  "customer_id": "uuid",
  "event": "llm_response_generated",
  "latency_ms": 3200,
  "tokens_used": 450,
  "persona": "Asha",
  "sentiment": 0.8
}
```

---

## Conclusion

This architecture provides a **scalable, maintainable, and extensible** foundation for a voice-first agentic chatbot system. By leveraging Langflow's visual flow editor, the system remains **accessible to non-developers** while maintaining **production-grade reliability** through proper database design, error handling, and monitoring.

**Key Strengths:**
✅ Database-backed personalization
✅ Multi-persona agent system
✅ Audio-first with text fallback
✅ Full conversation history
✅ Langflow visual editing
✅ Production-ready infrastructure
