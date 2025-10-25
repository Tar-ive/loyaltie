# Agentic Chatbot with Audio & Database Retrieval

**Clay Pit Restaurant - Voice-First Customer Engagement System**

---

## 📚 Documentation

This directory contains the complete architecture and setup guide for building an agentic chatbot using Langflow with audio capabilities and Supabase database integration.

### Files

1. **[architecture.md](./architecture.md)** - Complete system architecture
   - System overview and component design
   - Data flow diagrams
   - Database schema usage
   - Audio processing pipeline
   - Deployment architecture
   - Security and performance considerations

2. **[langflow-setup-guide.md](./langflow-setup-guide.md)** - Step-by-step implementation
   - Langflow installation and configuration
   - Node-by-node setup instructions
   - Custom component code
   - Testing and deployment
   - Troubleshooting guide

---

## 🚀 Quick Start

### Prerequisites

```bash
# 1. Install Langflow
pip install langflow

# 2. Set environment variables
export SUPABASE_CONNECTION_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres"
export OPENAI_API_KEY="sk-***"
export ANTHROPIC_API_KEY="sk-ant-***"

# 3. Start Langflow
langflow run
```

Access Langflow at: http://localhost:7860

### Build the Flow

Follow the detailed instructions in [langflow-setup-guide.md](./langflow-setup-guide.md) to:

1. Create custom Supabase connector nodes
2. Add agent persona loader
3. Configure memory and LLM
4. Set up database interaction saver
5. Add audio processing (optional)

---

## 🎯 Key Features

### ✅ Implemented in Architecture

- **Multi-Persona Agent System** - 6 different agent personalities
- **Database-Backed Personalization** - Customer preferences, order history, VIP status
- **Conversation Memory** - Short-term (in-session) and long-term (database)
- **Audio Processing** - Whisper STT + OpenAI/ElevenLabs TTS
- **Real-Time Context Retrieval** - Customer data loaded on every interaction
- **Interaction Logging** - Full conversation history stored in Supabase

### 🔜 Future Enhancements

- Real-time audio streaming (WebSocket)
- Multi-language support
- Voice biometrics for authentication
- Emotion detection
- Predictive analytics (churn risk, upsell)
- Vector embeddings for semantic search

---

## 📊 System Components

### 1. Audio Layer
```
User Voice → Whisper API → Text
Text → OpenAI TTS → Audio → User
```

### 2. Langflow Engine
```
Input → Context Retrieval → Persona Loader → Memory → LLM → Output → Save
```

### 3. Database (Supabase)
```
- agent_personas (6 personas)
- customers (master data)
- customer_profiles (preferences)
- customer_order_metrics (aggregated)
- agent_interactions (sessions)
- interaction_transcripts (dialogue)
- transcript_media (audio files)
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│          (Phone / Web / Mobile / WhatsApp)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Audio/Text
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Audio Processing (Optional)                 │
│    Whisper STT ←→ Text ←→ OpenAI/ElevenLabs TTS        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Text
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Langflow Engine                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Context → Persona → Memory → LLM → Save         │  │
│  │    ↓         ↓                  ↓        ↓       │  │
│  │   DB        DB                 AI       DB       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Queries
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                         │
│  Customers | Personas | Interactions | Orders | Menu    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Flow Builder** | Langflow |
| **Database** | Supabase (PostgreSQL) |
| **LLM** | Anthropic Claude 3.5 Sonnet |
| **STT** | OpenAI Whisper |
| **TTS** | OpenAI TTS / ElevenLabs |
| **Voice** | Twilio (optional) |
| **Runtime** | Python 3.10+ |

---

## 📖 Usage Examples

### Text Chat

```python
import requests

response = requests.post(
    "http://localhost:7860/api/v1/run/chatbot",
    headers={"x-api-key": "your-key"},
    json={
        "input_value": "I'd like to order dinner",
        "phone_number": "+15125551234"
    }
)

print(response.json()["outputs"][0]["text"])
```

### Voice Call (with audio processing)

```python
import openai
import requests

# 1. Transcribe customer audio
audio = open("customer.mp3", "rb")
transcript = openai.Audio.transcribe("whisper-1", audio)

# 2. Send to chatbot
response = requests.post(
    "http://localhost:7860/api/v1/run/chatbot",
    json={
        "input_value": transcript.text,
        "phone_number": "+15125551234"
    }
)

agent_text = response.json()["outputs"][0]["text"]

# 3. Generate speech
speech = openai.Audio.create(
    model="tts-1",
    voice="nova",
    input=agent_text
)
speech.stream_to_file("agent_response.mp3")
```

---

## 🧪 Testing

### 1. Test in Langflow Playground

1. Open Langflow UI
2. Click "Playground"
3. Enter test message
4. Verify response and database logging

### 2. Test Database Queries

```sql
-- Check customer context retrieval
SELECT c.*, cp.*, cm.*
FROM customers c
LEFT JOIN customer_profiles cp ON cp.customer_id = c.customer_id
LEFT JOIN customer_order_metrics cm ON cm.customer_id = c.customer_id
WHERE c.phone = '+15125551234';

-- Check interactions saved
SELECT * FROM agent_interactions
ORDER BY started_at DESC LIMIT 5;

-- Check transcripts
SELECT * FROM interaction_transcripts
WHERE interaction_id = '<interaction_id>'
ORDER BY turn_index;
```

### 3. Test Audio Processing

```bash
# Test Whisper
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file=@test_audio.mp3 \
  -F model=whisper-1

# Test TTS
curl -X POST https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tts-1","voice":"nova","input":"Hello customer"}' \
  --output speech.mp3
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Set all environment variables
- [ ] Configure Supabase Row-Level Security
- [ ] Set up API key authentication for Langflow
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test failover scenarios
- [ ] Load test with concurrent users
- [ ] Set up automated backups

### Deployment Command

```bash
# Production deployment
langflow run \
  --host 0.0.0.0 \
  --port 7860 \
  --env-file .env.production \
  --backend-only
```

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| STT Processing | < 3 seconds |
| Database Query | < 500ms |
| LLM Response | < 5 seconds |
| TTS Generation | < 2 seconds |
| **Total Turn Time** | **< 10 seconds** |

---

## 🔐 Security

- **API Keys:** Stored in environment variables
- **Database:** Row-level security in Supabase
- **Audio Files:** Encrypted at rest in S3
- **PII:** Masked in logs
- **Authentication:** Langflow API keys

---

## 🐛 Troubleshooting

### Common Issues

1. **Customer not found**
   - Check phone number format: `+1XXXXXXXXXX`

2. **Persona not loading**
   - Verify `agent_personas` table has data

3. **Memory not working**
   - Check Langflow memory configuration

4. **Database connection failed**
   - Test: `psql "$SUPABASE_CONNECTION_URL" -c "SELECT 1;"`

See [langflow-setup-guide.md](./langflow-setup-guide.md#troubleshooting) for detailed solutions.

---

## 📞 Support

- **Architecture Questions:** See [architecture.md](./architecture.md)
- **Setup Issues:** See [langflow-setup-guide.md](./langflow-setup-guide.md)
- **Langflow Docs:** https://docs.langflow.org/
- **Supabase Docs:** https://supabase.com/docs

---

## 📝 License

Proprietary - Clay Pit Restaurant Internal Use Only

---

**Last Updated:** 2025-10-25
**Version:** 1.0
