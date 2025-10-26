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
        'flex items-start space-x-2 md:space-x-3 mb-3 md:mb-4 animate-slide-up',
        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-secondary-100 text-secondary-600'
        )}
      >
        {isUser ? <User size={14} className="md:w-4 md:h-4" /> : <Bot size={14} className="md:w-4 md:h-4" />}
      </div>

      {/* Message Content */}
      <div
        className={clsx(
          'max-w-[75%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-secondary-100 text-secondary-900'
        )}
      >
        <div className="text-xs md:text-sm leading-relaxed">
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
