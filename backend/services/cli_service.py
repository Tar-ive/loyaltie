import subprocess
import json
import os
from pathlib import Path
from typing import Dict, List, Any

class CLIService:
    def __init__(self):
        """Initialize CLI service with paths to TypeScript tools"""
        # Get the root directory (parent of backend)
        self.root_dir = Path(__file__).parent.parent.parent
        self.tsx_bin = self.root_dir / "node_modules" / ".bin" / "tsx"
        self.sessions_dir = self.root_dir / "sessions"
        
        # Ensure sessions directory exists
        self.sessions_dir.mkdir(exist_ok=True)
        
    def run_cli_command(self, script: str, *args, input_data: str = None):
        """Execute a TypeScript CLI command via subprocess"""
        cmd = [str(self.tsx_bin), script, *args]
        
        try:
            process = subprocess.run(
                cmd,
                cwd=str(self.root_dir),
                capture_output=True,
                text=True,
                input=input_data,
                timeout=60  # 60 second timeout
            )
            
            if process.returncode != 0:
                error_msg = process.stderr or process.stdout
                raise Exception(f"CLI command failed: {error_msg}")
            
            return process.stdout
        except subprocess.TimeoutExpired:
            raise Exception("CLI command timed out after 60 seconds")
        except Exception as e:
            raise Exception(f"Failed to execute CLI command: {str(e)}")
    
    def create_session(self, customer_id: str, customer_name: str) -> Dict[str, Any]:
        """Create a new session"""
        script = "rc/cli-tools/create-session.ts"
        output = self.run_cli_command(
            script,
            "--customer-id", customer_id,
            "--customer-name", customer_name
        )
        return json.loads(output)
    
    def send_message(self, session_id: str, message: str) -> Dict[str, Any]:
        """Send a message to an existing session"""
        script = "rc/cli-tools/send-message.ts"
        output = self.run_cli_command(
            script,
            "--session-id", session_id,
            "--message", message
        )
        return json.loads(output)
    
    def list_sessions(self, customer_id: str) -> List[Dict[str, Any]]:
        """List all active sessions for a customer"""
        script = "rc/cli-tools/list-sessions.ts"
        output = self.run_cli_command(
            script,
            "--customer-id", customer_id
        )
        return json.loads(output)
    
    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Get session details by reading session.json directly"""
        session_file = self.sessions_dir / session_id / "session.json"
        
        if not session_file.exists():
            raise Exception(f"Session {session_id} not found")
        
        with open(session_file, 'r') as f:
            return json.load(f)
    
    def delete_session(self, session_id: str):
        """Delete a session by removing its directory"""
        session_dir = self.sessions_dir / session_id
        
        if not session_dir.exists():
            raise Exception(f"Session {session_id} not found")
        
        import shutil
        shutil.rmtree(session_dir)
    
    def get_session_logs(self, session_id: str) -> List[Dict[str, Any]]:
        """Read logs.jsonl file for a session"""
        log_file = self.sessions_dir / session_id / "logs.jsonl"
        
        if not log_file.exists():
            return []
        
        logs = []
        with open(log_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    logs.append(json.loads(line))
        
        return logs
    
    def get_conversation(self, session_id: str) -> Dict[str, Any]:
        """Get full conversation history from session"""
        session = self.get_session(session_id)
        return {
            "session_id": session_id,
            "conversation": session.get("state", {}).get("conversationHistory", []),
            "order_state": session.get("state", {}).get("orderState", {})
        }
