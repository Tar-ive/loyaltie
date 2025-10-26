from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services.cli_service import CLIService
from services.session_manager import SessionManager

router = APIRouter()
cli = CLIService()
session_manager = SessionManager()

class SessionCreate(BaseModel):
    customer_id: str
    customer_name: str

class SessionListResponse(BaseModel):
    sessions: List[Dict[str, Any]]

@router.post("/", response_model=Dict[str, Any])
async def create_session(data: SessionCreate):
    """Create a new conversation session"""
    try:
        session = cli.create_session(data.customer_id, data.customer_name)
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer/{customer_id}", response_model=SessionListResponse)
async def list_sessions(customer_id: str):
    """List all active sessions for a customer"""
    try:
        sessions = cli.list_sessions(customer_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    try:
        session = cli.get_session(session_id)
        return session
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    try:
        cli.delete_session(session_id)
        return {"status": "deleted", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
