# Node.js Backend Migration

## What Changed

We migrated from Python (FastAPI) to Node.js (Express) backend to eliminate subprocess communication issues.

### Before (Python FastAPI)
- Backend spawned TypeScript CLI tools as subprocesses
- Timeout issues (60s) with agent responses
- Cross-language communication overhead
- Complex environment variable handling

### After (Node.js Express)
- Direct function calls to agent code
- Fast responses (~5-10 seconds)
- Native TypeScript integration
- Shared codebase between CLI and API

## Architecture

```
frontend (Next.js)
    ↓ HTTP
backend (Express + TypeScript)
    ↓ Direct function calls
services (message-service.ts)
    ↓
Agent code (OpenAI Agents SDK)
```

## Running the Backend

### Start the server:
```bash
npm run server
```

### Development mode (auto-reload):
```bash
npm run dev
```

The server will run on `http://localhost:8000`

## API Documentation

### Interactive Documentation (Swagger UI):
```
http://localhost:8000/api-docs
```

The API documentation is automatically generated from the OpenAPI 3.0 specification and provides:
- Interactive endpoint testing
- Request/response schemas
- Example payloads
- Authentication details (if applicable)

### OpenAPI Specification File:
- **Location**: `server/openapi.yaml`
- **Format**: OpenAPI 3.0.3 (YAML)
- Can be imported into tools like Postman, Insomnia, or used to generate client SDKs

## API Endpoints

All endpoints remain the same as the FastAPI version:

### Sessions
- `POST /api/v1/sessions/` - Create new session
- `GET /api/v1/sessions/customer/{customerId}` - List sessions
- `GET /api/v1/sessions/{sessionId}` - Get session details
- `DELETE /api/v1/sessions/{sessionId}` - Delete session

### Messages
- `POST /api/v1/messages/session/{sessionId}` - Send message
- `GET /api/v1/messages/session/{sessionId}/conversation` - Get conversation history
- `GET /api/v1/messages/session/{sessionId}/logs` - Get session logs

## Testing

### Option 1: Use the Interactive API Documentation
Visit `http://localhost:8000/api-docs` and use the "Try it out" feature to test endpoints directly from your browser.

### Option 2: Use cURL

**Create a session:**
```bash
curl -X POST http://localhost:8000/api/v1/sessions/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "test123", "customer_name": "Test User"}'
```

**Send a message:**
```bash
curl -X POST http://localhost:8000/api/v1/messages/session/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Get conversation history:**
```bash
curl http://localhost:8000/api/v1/messages/session/SESSION_ID/conversation
```

**List customer sessions:**
```bash
curl http://localhost:8000/api/v1/sessions/customer/CUSTOMER_ID
```

## Files Created

1. **`/server/index.ts`** - Express server with all API routes
2. **`/server/openapi.yaml`** - OpenAPI 3.0 specification
3. **`/rc/services/message-service.ts`** - Reusable service functions
4. Updated **`package.json`** with new scripts and Swagger dependencies

## Frontend Compatibility

The frontend requires **NO CHANGES** because all endpoints remain identical to the FastAPI version.

## Benefits

✅ **Fast**: Direct function calls, no subprocess overhead
✅ **Simple**: Same runtime for everything (Node.js)
✅ **Reliable**: No timeout issues
✅ **Type-safe**: End-to-end TypeScript
✅ **Maintainable**: Shared code between CLI and API

## Quick Start Guide

1. **Start the backend:**
   ```bash
   npm run server
   ```

2. **View API Documentation:**
   Open `http://localhost:8000/api-docs` in your browser

3. **Test endpoints:**
   Use the interactive Swagger UI or cURL commands

4. **Connect your frontend:**
   Point your frontend to `http://localhost:8000` - no changes needed!

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status and version |
| GET | `/health` | Health check |
| GET | `/api-docs` | Interactive API documentation |
| POST | `/api/v1/sessions/` | Create new session |
| GET | `/api/v1/sessions/customer/:id` | List customer sessions |
| GET | `/api/v1/sessions/:id` | Get session details |
| DELETE | `/api/v1/sessions/:id` | Delete session |
| POST | `/api/v1/messages/session/:id` | Send message |
| GET | `/api/v1/messages/session/:id/conversation` | Get conversation |
| GET | `/api/v1/messages/session/:id/logs` | Get session logs |
