import React from 'react';
import { Plus, MessageSquare, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Session {
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

interface SidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  customerName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onNewSession,
  onSelectSession,
  customerName = 'Customer',
}) => {
  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              EchoEats
            </h1>
            <p className="text-sm text-gray-600">
              AI Customer Service
            </p>
          </div>
        </div>
        
        <Button
          onClick={onNewSession}
          className="w-full"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          New Conversation
        </Button>
      </div>
      
      {/* Customer Info */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{customerName}</p>
            <p className="text-xs text-gray-600">Active Customer</p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3">
          Recent Conversations
        </h3>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No conversations yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Start a new conversation to begin
            </p>
          </div>
        ) : (
          sessions.filter(session => session && (session.session_id || session.metadata?.sessionId)).map((session) => {
            const sessionId = session.session_id || session.metadata?.sessionId || '';
            const customerName = session.customer_name || session.metadata?.customerName || 'Unknown Customer';
            
            return (
              <Card
                key={sessionId}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  currentSessionId === sessionId
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-white'
                }`}
                padding="sm"
                onClick={() => onSelectSession(sessionId)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customerName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Session {sessionId ? sessionId.slice(-8) : 'Unknown'}
                    </p>
                    {session.metadata?.lastMessage && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {session.metadata.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};