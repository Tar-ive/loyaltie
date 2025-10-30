# Frontend Integration Guide

## Overview

This guide explains how to integrate a frontend application (React, Vue, Angular, or any web framework) with the Clay Pit AI FastAPI backend.

## Architecture Flow

```
┌─────────────────┐
│   Frontend      │
│   (Browser)     │
└────────┬────────┘
         │ HTTP REST API
         ▼
┌─────────────────────────────────┐
│   FastAPI Backend              │
│   (Python, Port 8000)          │
└────────┬───────────────────────┘
         │ subprocess calls
         ▼
┌─────────────────────────────────┐
│   TypeScript CLI Tools         │
│   (Create/Send/List sessions)  │
└────────┬───────────────────────┘
         │ file I/O
         ▼
┌─────────────────────────────────┐
│   Session Files                │
│   sessions/{id}/session.json   │
└─────────────────────────────────┘
```

## Basic Flow

### 1. **User Opens Frontend**
```javascript
// User navigates to your web app
// Frontend loads
```

### 2. **Frontend Creates Session**
```javascript
// POST /api/v1/sessions/
const createSession = async () => {
  const response = await fetch('http://localhost:8000/api/v1/sessions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: 'aniket_001',
      customer_name: 'Aniket Sharma'
    })
  });
  
  const session = await response.json();
  return session; // Contains sessionId
};
```

### 3. **User Sends Message**
```javascript
// POST /api/v1/messages/session/{session_id}
const sendMessage = async (sessionId, message) => {
  const response = await fetch(
    `http://localhost:8000/api/v1/messages/session/${sessionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }
  );
  
  const result = await response.json();
  return result; // Contains agent response
};
```

### 4. **Frontend Displays Response**
```javascript
// Show agent response in chat UI
```

## Complete Example (React)

### 1. Create API Client

```javascript
// api/client.js
const API_BASE = 'http://localhost:8000';

class ClayPitAPI {
  async createSession(customerId, customerName) {
    const response = await fetch(`${API_BASE}/api/v1/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, customer_name: customerName })
    });
    
    if (!response.ok) throw new Error('Failed to create session');
    return await response.json();
  }
  
  async sendMessage(sessionId, message) {
    const response = await fetch(
      `${API_BASE}/api/v1/messages/session/${sessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      }
    );
    
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  }
  
  async getConversation(sessionId) {
    const response = await fetch(
      `${API_BASE}/api/v1/messages/session/${sessionId}/conversation`
    );
    
    if (!response.ok) throw new Error('Failed to get conversation');
    return await response.json();
  }
  
  async listSessions(customerId) {
    const response = await fetch(
      `${API_BASE}/api/v1/sessions/customer/${customerId}`
    );
    
    if (!response.ok) throw new Error('Failed to list sessions');
    return await response.json();
  }
}

export default new ClayPitAPI();
```

### 2. Create Chat Component

```javascript
// components/Chat.jsx
import { useState, useEffect } from 'react';
import api from '../api/client';

function Chat() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        // Use existing customer ID or create new
        const sessionData = await api.createSession(
          'aniket_001',
          'Aniket Sharma'
        );
        setSession(sessionData.metadata);
        
        // Load conversation history if exists
        if (sessionData.state.conversationHistory.length > 0) {
          setMessages(parseConversation(sessionData.state.conversationHistory));
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    initSession();
  }, []);
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !session) return;
    
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const result = await api.sendMessage(session.sessionId, input);
      
      const agentMessage = { role: 'assistant', text: result.response };
      setMessages(prev => [...prev, agentMessage]);
      
      // Handle order state if present
      if (result.order_state) {
        console.log('Order state:', result.order_state);
        // Update UI based on order state
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'Error: Failed to send message' 
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <span className="role">{msg.role}:</span>
            <span className="text">{msg.text}</span>
          </div>
        ))}
        {loading && <div className="loading">Agent is typing...</div>}
      </div>
      
      <form onSubmit={handleSend} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

// Helper to parse conversation history
function parseConversation(history) {
  return history
    .filter(item => item.role === 'user' || item.role === 'assistant')
    .map(item => ({
      role: item.role,
      text: item.content?.[0]?.text || ''
    }))
    .filter(msg => msg.text);
}

export default Chat;
```

### 3. Basic CSS

```css
/* chat.css */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f5f5f5;
}

.message {
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 8px;
}

.message.user {
  background: #007bff;
  color: white;
  text-align: right;
}

.message.assistant {
  background: white;
  border: 1px solid #ddd;
}

.message.system {
  background: #ffeaa7;
  text-align: center;
}

.input-form {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
}

.input-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-form button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}
```

## Complete Example (Vue.js)

### 1. API Service

```javascript
// services/api.js
const API_BASE = 'http://localhost:8000';

export const api = {
  async createSession(customerId, customerName) {
    const res = await fetch(`${API_BASE}/api/v1/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, customer_name: customerName })
    });
    return res.json();
  },
  
  async sendMessage(sessionId, message) {
    const res = await fetch(`${API_BASE}/api/v1/messages/session/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  }
};
```

### 2. Vue Component

```vue
<template>
  <div class="chat">
    <div class="messages">
      <div 
        v-for="(msg, idx) in messages" 
        :key="idx"
        :class="['message', msg.role]"
      >
        {{ msg.text }}
      </div>
      <div v-if="loading" class="loading">Agent is typing...</div>
    </div>
    
    <form @submit.prevent="sendMessage" class="input-form">
      <input 
        v-model="input" 
        placeholder="Type your message..."
        :disabled="loading"
      />
      <button :disabled="loading">Send</button>
    </form>
  </div>
</template>

<script>
import { api } from '@/services/api';

export default {
  data() {
    return {
      session: null,
      messages: [],
      input: '',
      loading: false
    };
  },
  
  async mounted() {
    // Create session
    const sessionData = await api.createSession('aniket_001', 'Aniket Sharma');
    this.session = sessionData.metadata;
  },
  
  methods: {
    async sendMessage() {
      if (!this.input.trim() || !this.session) return;
      
      const userMsg = { role: 'user', text: this.input };
      this.messages.push(userMsg);
      const message = this.input;
      this.input = '';
      this.loading = true;
      
      try {
        const result = await api.sendMessage(this.session.sessionId, message);
        this.messages.push({ role: 'assistant', text: result.response });
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({ role: 'system', text: 'Error sending message' });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## Complete Example (Vanilla JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Clay Pit AI Chat</title>
  <link rel="stylesheet" href="chat.css">
</head>
<body>
  <div class="chat-container">
    <div class="messages" id="messages"></div>
    <form id="chat-form" class="input-form">
      <input type="text" id="message-input" placeholder="Type your message..." />
      <button type="submit">Send</button>
    </form>
  </div>

  <script>
    const API_BASE = 'http://localhost:8000';
    let sessionId = null;
    
    // Initialize session
    async function initSession() {
      const response = await fetch(`${API_BASE}/api/v1/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 'aniket_001',
          customer_name: 'Aniket Sharma'
        })
      });
      
      const data = await response.json();
      sessionId = data.metadata.sessionId;
      addMessage('system', 'Session created. How can I help you?');
    }
    
    // Send message
    async function sendMessage(message) {
      addMessage('user', message);
      
      const response = await fetch(
        `${API_BASE}/api/v1/messages/session/${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        }
      );
      
      const result = await response.json();
      addMessage('assistant', result.response);
      
      // Handle order state if present
      if (result.order_state) {
        console.log('Order state:', result.order_state);
      }
    }
    
    // Add message to UI
    function addMessage(role, text) {
      const messagesDiv = document.getElementById('messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role}`;
      messageDiv.innerHTML = `<strong>${role}:</strong> ${text}`;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    // Handle form submission
    document.getElementById('chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('message-input');
      if (input.value.trim()) {
        sendMessage(input.value);
        input.value = '';
      }
    });
    
    // Initialize
    initSession();
  </script>
</body>
</html>
```

## Data Flow Example

### Step-by-Step Flow

1. **User opens frontend**
   ```
   Frontend loads → User sees chat interface
   ```

2. **Frontend creates session**
   ```
   POST /api/v1/sessions/ 
   → FastAPI receives request
   → Calls: tsx rc/cli-tools/create-session.ts
   → Creates session file: sessions/sess_123/session.json
   → Returns JSON: { metadata: { sessionId: "sess_123", ... } }
   ```

3. **User types message**
   ```
   User types: "I need lunch for 8 people tomorrow"
   → Frontend stores: { role: 'user', text: '...' }
   ```

4. **Frontend sends message**
   ```
   POST /api/v1/messages/session/sess_123
   { message: "I need lunch for 8 people tomorrow" }
   
   → FastAPI receives request
   → Calls: tsx rc/cli-tools/send-message.ts
   → Loads session from sessions/sess_123/session.json
   → Creates agent with Aniket's profile
   → Runs conversation through OpenAI
   → Agent responds: "Perfect! I can help with that..."
   → Updates session file with conversation history
   → Returns JSON: { response: "...", order_state: {...} }
   ```

5. **Frontend displays response**
   ```
   Frontend receives response
   → Displays: { role: 'assistant', text: '...' }
   → Updates order UI based on order_state
   ```

## Handling Order State

The agent can return `order_state` in responses:

```javascript
const result = await api.sendMessage(sessionId, message);

if (result.order_state) {
  switch (result.order_state.phase) {
    case 'chatting':
      // Normal conversation
      break;
    case 'confirming':
      // Show order confirmation UI
      showConfirmationUI(result.order_state.draft);
      break;
    case 'processing':
      // Show checkout UI
      showCheckoutUI(result.order_state);
      break;
    case 'completed':
      // Show success message
      showSuccessMessage();
      break;
  }
}
```

## CORS Configuration

The backend has CORS enabled for all origins. For production, update `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error Handling

```javascript
try {
  const result = await api.sendMessage(sessionId, message);
} catch (error) {
  if (error.message === 'Failed to send message') {
    // Handle message send error
    showError('Unable to send message. Please try again.');
  } else {
    // Handle other errors
    console.error('Error:', error);
  }
}
```

## Session Management

### Store Session in localStorage

```javascript
// Save session
localStorage.setItem('sessionId', sessionId);

// Load session on page reload
const savedSessionId = localStorage.getItem('sessionId');
if (savedSessionId) {
  // Resume conversation
  const conversation = await api.getConversation(savedSessionId);
  setMessages(parseConversation(conversation.conversation));
}
```

## Production Considerations

1. **Move API URL to config**
   ```javascript
   const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   ```

2. **Add loading states**
   ```javascript
   {loading && <Spinner />}
   ```

3. **Handle reconnection**
   ```javascript
   // Retry on error
   let retries = 0;
   while (retries < 3) {
     try {
       const result = await api.sendMessage(sessionId, message);
       return result;
     } catch (error) {
       retries++;
       await sleep(1000);
     }
   }
   ```

4. **Add typing indicators**
   ```javascript
   // Show when waiting for agent response
   {loading && <TypingIndicator />}
   ```

## Summary

The frontend interacts with the backend like this:

1. **Create Session** → Get sessionId
2. **Send Message** → Get agent response
3. **Display Response** → Show in chat UI
4. **Repeat** → Continue conversation

The backend handles all the AI logic through TypeScript CLI tools, and the frontend just makes HTTP requests!
