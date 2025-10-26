# Clay Pit AI - FastAPI Backend

This is the FastAPI backend for the Clay Pit AI customer service system. It provides HTTP API endpoints that interact with the TypeScript CLI tools to provide persona-aware customer service.

## Architecture

The backend uses a **subprocess wrapper** pattern - it calls TypeScript CLI tools via subprocess rather than rewriting the logic in Python. This keeps all business logic in one place (TypeScript) while providing HTTP API access.

```
FastAPI Backend (Python)
    ↓ subprocess calls
TypeScript CLI Tools
    ↓ read/write
Session Files (sessions/{id}/)
```

## Setup

### 1. Install Python Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the `.env` file from the root directory or create one:

```bash
# In backend/.env (or use root .env)
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Install Node.js Dependencies

Make sure the root project dependencies are installed:

```bash
# From project root
npm install
```

### 4. Run the Server

```bash
cd backend
source venv/bin/activate
python main.py
# OR
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Sessions

- `POST /api/v1/sessions/` - Create a new session
- `GET /api/v1/sessions/customer/{customer_id}` - List sessions for a customer
- `GET /api/v1/sessions/{session_id}` - Get session details
- `DELETE /api/v1/sessions/{session_id}` - Delete a session

### Messages

- `POST /api/v1/messages/session/{session_id}` - Send a message to the agent
- `GET /api/v1/messages/session/{session_id}/conversation` - Get full conversation
- `GET /api/v1/messages/session/{session_id}/logs` - Get session logs

## Example Usage

### Create a Session

```bash
curl -X POST http://localhost:8000/api/v1/sessions/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "aniket_001",
    "customer_name": "Aniket Sharma"
  }'
```

Response:
```json
{
  "metadata": {
    "sessionId": "sess_1234567890_abc123",
    "customerId": "aniket_001",
    "customerName": "Aniket Sharma",
    "createdAt": "2025-01-25T12:00:00.000Z",
    "status": "active"
  }
}
```

### Send a Message

```bash
curl -X POST http://localhost:8000/api/v1/messages/session/sess_1234567890_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need lunch for 8 people tomorrow"
  }'
```

Response:
```json
{
  "session_id": "sess_1234567890_abc123",
  "response": "Perfect! Let me help you with that...",
  "order_state": {
    "phase": "chatting"
  }
}
```

## Project Structure

```
backend/
├── main.py                    # FastAPI app entry point
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
├── routers/
│   ├── __init__.py
│   ├── sessions.py           # Session endpoints
│   └── messages.py           # Message endpoints
└── services/
    ├── __init__.py
    ├── cli_service.py        # Subprocess wrapper for CLI tools
    └── session_manager.py    # Python-side session utilities
```

## How It Works

1. **Request arrives** at FastAPI endpoint
2. **CLIService** calls TypeScript CLI tool via subprocess
3. **CLI tool** reads/writes session files in `sessions/` directory
4. **CLI tool** outputs JSON to stdout
5. **CLIService** parses JSON and returns to FastAPI
6. **FastAPI** sends JSON response to client

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation

Once the server is running, visit:
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Testing

```bash
# Health check
curl http://localhost:8000/health

# Root endpoint
curl http://localhost:8000/
```

## Troubleshooting

### "CLI command failed" error
- Make sure Node.js dependencies are installed: `npm install`
- Check that `tsx` is available: `npx tsx --version`
- Verify TypeScript CLI tools exist in `rc/cli-tools/`

### "Session not found" error
- Check that sessions directory exists: `ls sessions/`
- Verify session ID is correct

### "Missing credentials" error
- Ensure `.env` file has `OPENAI_API_KEY`
- Check that dotenv is loading the file

## Future Enhancements

- WebSocket support for streaming responses
- Authentication/authorization
- Rate limiting
- Caching
- Database integration (optional)
- Metrics and monitoring

