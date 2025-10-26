import React from 'react';
import { clsx } from 'clsx';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  };
  isTyping?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isTyping = false,
}) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={clsx(
        'flex items-start space-x-3 mb-4 animate-slide-up',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-secondary-100 text-secondary-600'
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      {/* Message Content */}
      <div
        className={clsx(
          'max-w-xs lg:max-w-md px-4 py-3 rounded-lg',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-secondary-100 text-secondary-900'
        )}
      >
        <div className="text-sm leading-relaxed">
          {isTyping ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce-gentle"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce-gentle" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce-gentle" style={{ animationDelay: '0.2s' }}></div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        {message.timestamp && (
          <div
            className={clsx(
              'text-xs mt-1',
              isUser ? 'text-primary-100' : 'text-secondary-500'
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
