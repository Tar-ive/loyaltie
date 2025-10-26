import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { sessionApi, messageApi, Session, MessageResponse } from '../../lib/api';
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  sessionId: string;
  customerName: string;
  onSessionUpdate?: (session: Session) => void;
  onBack?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  customerName,
  onSessionUpdate,
  onBack,
}) => {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Load conversation history when session changes
  useEffect(() => {
    if (sessionId) {
      loadConversation();
    }
  }, [sessionId]);

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      const conversation = await messageApi.getConversation(sessionId);
      setMessages(conversation.conversation || []);
    } catch (error: any) {
      console.error('Failed to load conversation:', error);
      
      // Show specific error messages
      if (error.response?.status === 500) {
        toast.error('Server error: Cannot load conversation history. Backend API is having issues.');
      } else if (error.response?.status === 404) {
        toast.error('Conversation not found. This session may not exist.');
      } else {
        toast.error('Failed to load conversation history');
      }
      
      // Set empty messages array as fallback
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message to UI immediately
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response: MessageResponse = await messageApi.sendMessage(sessionId, {
        message,
      });

      // Add assistant response
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle checkout URL if order was confirmed
      if (response.checkout_url && response.order_id) {
        toast.success(`Order ${response.order_id} confirmed! Redirecting to checkout...`, {
          duration: 5000,
        });

        // Add checkout link message
        const checkoutMessage = {
          role: 'assistant' as const,
          content: `🎉 Great! Your order has been confirmed.\n\n💳 Click here to complete payment:\n${response.checkout_url}\n\nOrder ID: ${response.order_id}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, checkoutMessage]);

        // Optional: Auto-redirect after a delay
        // setTimeout(() => {
        //   window.open(response.checkout_url, '_blank');
        // }, 2000);
      }

      // Show order summary if available
      if (response.order_summary && response.order_state?.phase === 'confirming') {
        toast.success('Order ready for confirmation!', {
          duration: 4000,
        });
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Show more specific error messages
      if (error.response?.status === 500) {
        toast.error('Server error: Backend API is having issues. Please try again later.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid request: Please check your message format.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }

      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* Back button - only visible on mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex-shrink-0 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          )}

          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-xs md:text-sm">
              {customerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-medium text-gray-900 text-sm md:text-base truncate">{customerName}</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {isTyping ? 'EchoEats is typing...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} isTyping={isTyping} />

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || isTyping}
        placeholder="Type your message..."
      />
    </div>
  );
};
