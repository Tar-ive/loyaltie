import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Clay Pit AI API",
    description="Persona-aware customer service API for Clay Pit restaurant",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class SessionCreate(BaseModel):
    customer_id: str
    customer_name: str

class MessageRequest(BaseModel):
    message: str

class SessionResponse(BaseModel):
    session_id: str
    customer_id: str
    customer_name: str
    metadata: Dict[str, Any]

class MessageResponse(BaseModel):
    session_id: str
    response: str
    order_state: Optional[Dict[str, Any]] = None

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Clay Pit AI API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import routers
from routers import sessions, messages

app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["Sessions"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messages"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
