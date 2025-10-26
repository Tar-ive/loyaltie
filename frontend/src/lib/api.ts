import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface SessionCreate {
  customer_id: string;
  customer_name: string;
}

export interface Session {
  session_id?: string;
  customer_id?: string;
  customer_name?: string;
  metadata?: {
    sessionId?: string;
    customerId?: string;
    customerName?: string;
    createdAt?: string;
    lastAccessedAt?: string;
    [key: string]: any;
  };
}

export interface MessageRequest {
  message: string;
}

export interface MessageResponse {
  session_id: string;
  response: string;
  order_state?: Record<string, any>;
  checkout_url?: string;
  order_id?: string;
  order_summary?: string;
}

export interface Conversation {
  session_id: string;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  order_state?: Record<string, any>;
}

// API Functions
export const sessionApi = {
  // Create a new session
  createSession: async (data: SessionCreate): Promise<Session> => {
    const response = await api.post('/api/v1/sessions/', data);
    return response.data;
  },

  // List sessions for a customer
  listSessions: async (customerId: string): Promise<Session[]> => {
    const response = await api.get(`/api/v1/sessions/customer/${customerId}`);
    return response.data.sessions || [];
  },

  // Get session details
  getSession: async (sessionId: string): Promise<Session> => {
    const response = await api.get(`/api/v1/sessions/${sessionId}`);
    return response.data;
  },

  // Delete a session
  deleteSession: async (sessionId: string): Promise<{ status: string; session_id: string }> => {
    const response = await api.delete(`/api/v1/sessions/${sessionId}`);
    return response.data;
  },
};

export const messageApi = {
  // Send a message to a session
  sendMessage: async (sessionId: string, data: MessageRequest): Promise<MessageResponse> => {
    const response = await api.post(`/api/v1/messages/session/${sessionId}`, data);
    return response.data;
  },

  // Get conversation history
  getConversation: async (sessionId: string): Promise<Conversation> => {
    const response = await api.get(`/api/v1/messages/session/${sessionId}/conversation`);
    return response.data;
  },

  // Get session logs
  getLogs: async (sessionId: string): Promise<{ logs: any[] }> => {
    const response = await api.get(`/api/v1/messages/session/${sessionId}/logs`);
    return response.data;
  },
};

export default api;
