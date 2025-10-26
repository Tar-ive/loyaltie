from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.cli_service import CLIService

router = APIRouter()
cli = CLIService()

class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    session_id: str
    response: str
    order_state: Optional[Dict[str, Any]] = None

@router.post("/session/{session_id}", response_model=MessageResponse)
async def send_message(session_id: str, data: MessageRequest):
    """Send a message to the agent and get a response"""
    try:
        result = cli.send_message(session_id, data.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}/conversation")
async def get_conversation(session_id: str):
    """Get full conversation history for a session"""
    try:
        conversation = cli.get_conversation(session_id)
        return conversation
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/session/{session_id}/logs")
async def get_logs(session_id: str):
    """Get session logs"""
    try:
        logs = cli.get_session_logs(session_id)
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
