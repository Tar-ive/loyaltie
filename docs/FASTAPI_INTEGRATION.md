# FastAPI Integration Guide

## Overview
This document explains how to integrate the existing TypeScript CLI functionality with a FastAPI backend **without rewriting everything in Python**.

## Strategy: Subprocess-Based Integration

Since all business logic is already working in TypeScript, the FastAPI backend should **call the CLI tools via subprocess** rather than porting everything to Python.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Web/Mobile)   │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────────────────────────┐
│        FastAPI Backend              │
│  - Authentication                   │
│  - Request validation               │
│  - Response formatting              │
│  - WebSocket management             │
└────────┬───────────────────────────┘
         │ subprocess.run()
         ▼
┌─────────────────────────────────────┐
│    TypeScript CLI Tools             │
│  - persona-chat-cli.ts (agents)     │
│  - session-manager.ts (state)       │
│  - profile-updater.ts (learning)    │
│  - Reads/writes sessions/ directory │
└─────────────────────────────────────┘
```

## Implementation: FastAPI Wrapper

### Minimal API Structure
```
api/
├── main.py              # FastAPI app
├── routers/
│   ├── sessions.py      # Session endpoints
│   └── messages.py      # Agent messaging
└── services/
    └── cli_service.py   # Subprocess wrapper
```

### Example: CLI Service (api/services/cli_service.py)
```python
import subprocess
import json
from pathlib import Path

class CLIService:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent.parent
        self.tsx_bin = self.root_dir / "node_modules" / ".bin" / "tsx"
    
    def run_cli_command(self, script: str, *args):
        """Execute TypeScript CLI command"""
        cmd = [str(self.tsx_bin), script, *args]
        result = subprocess.run(
            cmd, 
            cwd=str(self.root_dir),
            capture_output=True, 
            text=True
        )
        return result.stdout, result.stderr, result.returncode
    
    def create_session(self, customer_id: str, customer_name: str):
        """Programmatically create session"""
        # Call a new CLI script that creates session and returns JSON
        stdout, stderr, code = self.run_cli_command(
            "rc/cli-tools/create-session.ts",
            "--customer-id", customer_id,
            "--customer-name", customer_name
        )
        if code == 0:
            return json.loads(stdout)
        raise Exception(f"Session creation failed: {stderr}")
    
    def send_message(self, session_id: str, message: str):
        """Send message to agent"""
        stdout, stderr, code = self.run_cli_command(
            "rc/cli-tools/send-message.ts",
            "--session-id", session_id,
            "--message", message
        )
        if code == 0:
            return json.loads(stdout)
        raise Exception(f"Message failed: {stderr}")
    
    def get_session_logs(self, session_id: str):
        """Read logs.jsonl file"""
        log_file = self.root_dir / "sessions" / session_id / "logs.jsonl"
        if not log_file.exists():
            return []
        
        logs = []
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    logs.append(json.loads(line))
        return logs
```

### Example: Session Router (api/routers/sessions.py)
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.services.cli_service import CLIService

router = APIRouter()
cli = CLIService()

class SessionCreate(BaseModel):
    customer_id: str
    customer_name: str

class MessageRequest(BaseModel):
    message: str

@router.post("/sessions")
async def create_session(data: SessionCreate):
    """Create new conversation session"""
    try:
        session = cli.create_session(data.customer_id, data.customer_name)
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/messages")
async def send_message(session_id: str, data: MessageRequest):
    """Send message to agent"""
    try:
        response = cli.send_message(session_id, data.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/logs")
async def get_logs(session_id: str):
    """Get session logs"""
    return cli.get_session_logs(session_id)
```

## Required CLI Tools (New TypeScript Scripts)

Create these helper scripts in `rc/cli-tools/` to make the CLI API-friendly:

### 1. `rc/cli-tools/create-session.ts`
```typescript
// Creates session and outputs JSON
// Usage: tsx rc/cli-tools/create-session.ts --customer-id X --customer-name Y
// Output: {"sessionId": "...", "metadata": {...}}
```

### 2. `rc/cli-tools/send-message.ts`
```typescript
// Sends message to existing session, gets agent response
// Usage: tsx rc/cli-tools/send-message.ts --session-id X --message "..."
// Output: {"response": "...", "orderState": {...}}
```

### 3. `rc/cli-tools/list-sessions.ts`
```typescript
// Lists active sessions for customer
// Usage: tsx rc/cli-tools/list-sessions.ts --customer-id X
// Output: [{"sessionId": "...", "conversationTurns": 5, ...}]
```

### 4. `rc/cli-tools/extract-learnings.ts`
```typescript
// Extracts learnings from session
// Usage: tsx rc/cli-tools/extract-learnings.ts --session-id X
// Output: [{"field": "...", "newValue": "...", ...}]
```

## Why This Approach?

### ✅ Advantages
1. **No code duplication** - All logic stays in TypeScript
2. **Faster to market** - No porting/rewriting needed
3. **CLI still works** - Can use both API and CLI
4. **Proven logic** - Already tested and working
5. **Easy maintenance** - Single source of truth

### ⚠️ Considerations
1. **Subprocess overhead** - Small latency per request (~50-100ms)
2. **Error handling** - Need to parse stdout/stderr carefully
3. **Concurrency** - Multiple sessions = multiple processes (fine for MVP)
4. **Scaling** - For high load, consider porting hot paths to Python later

## File-Based Session Storage (Keep It Simple)

**No database needed!** The current file-based system works great:

```
sessions/
  sess_abc123/
    session.json    # FastAPI reads this for state
    logs.jsonl      # FastAPI streams this for monitoring
```

FastAPI just needs to:
- **Read** `session.json` to get current state
- **Read** `logs.jsonl` to stream logs
- **Call CLI tools** via subprocess to modify sessions

## WebSocket Support (Future)

For real-time streaming, FastAPI can:
1. Open WebSocket connection to client
2. Start CLI tool as subprocess with `--stream` flag
3. Stream stdout line-by-line to WebSocket
4. Close WebSocket when CLI exits

```python
from fastapi import WebSocket

@router.websocket("/sessions/{session_id}/stream")
async def stream_conversation(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    process = subprocess.Popen(
        ["tsx", "rc/cli-tools/send-message.ts", 
         "--session-id", session_id, 
         "--stream"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Stream output to WebSocket
    for line in process.stdout:
        await websocket.send_text(line)
    
    await websocket.close()
```

## Migration Path (If Needed Later)

If subprocess approach becomes bottleneck:
1. **Profile hot paths** - Identify slow operations
2. **Port incrementally** - Rewrite only bottleneck functions in Python
3. **Hybrid approach** - Keep fast operations in TypeScript, slow ones in Python
4. **Or use Node.js backend** - Express.js/Fastify calling TypeScript directly (no subprocess)

## Quick Start

```bash
# 1. Create FastAPI project
mkdir api
cd api
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn

# 2. Create minimal main.py (see example above)

# 3. Create CLI tools in rc/cli-tools/

# 4. Run FastAPI
uvicorn main:app --reload

# 5. Test endpoint
curl -X POST http://localhost:8000/sessions \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "aniket", "customer_name": "Aniket Sharma"}'
```

## Summary

**Don't rewrite. Wrap.**

The TypeScript CLI already handles:
- ✅ Session management
- ✅ Agent conversations
- ✅ Order processing
- ✅ Profile learning
- ✅ Logging

FastAPI should just:
- Expose HTTP/WebSocket endpoints
- Call CLI tools via subprocess
- Read session files directly
- Handle authentication (future)
- Format responses as JSON

This gets you a working API in **30 minutes not hours**, with all the sophisticated agent logic already battle-tested in the CLI.

