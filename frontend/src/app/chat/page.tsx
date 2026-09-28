'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { sessionApi, Session } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [currentCustomerName, setCurrentCustomerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const customerId = 'aniket-sharma-nvidia';
      const sessionsData = await sessionApi.listSessions(customerId);
      setSessions(sessionsData);
      
      // Auto-select the first session if available
      if (sessionsData.length > 0 && !currentSessionId) {
        setCurrentSessionId(sessionsData[0].session_id);
        setCurrentCustomerName(sessionsData[0].customer_name ?? '');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await sessionApi.createSession({
        customer_id: 'aniket-sharma-nvidia',
        customer_name: 'Aniket Sharma',
      });
      
      console.log('Created session:', newSession);
      console.log('Session ID:', newSession.session_id);
      console.log('Customer name:', newSession.customer_name);
      console.log('Full session object keys:', Object.keys(newSession));
      console.log('Session metadata:', newSession.metadata);
      
      // Extract session ID and customer name from metadata
      const sessionId = newSession.metadata?.sessionId || newSession.session_id;
      const customerName = newSession.metadata?.customerName || newSession.customer_name;
      
      console.log('Extracted session ID:', sessionId);
      console.log('Extracted customer name:', customerName);
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
      setCurrentCustomerName(customerName ?? '');
      setShowSidebar(false); // Hide sidebar on mobile when new session is created

      console.log('Current session ID set to:', sessionId);

      toast.success('New conversation started!');
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create new conversation');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.session_id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setCurrentCustomerName(session.customer_name ?? '');
      setShowSidebar(false); // Hide sidebar on mobile when session is selected
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true); // Show sidebar on mobile
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false); // Close sidebar on mobile
  };

  const handleOpenSidebar = () => {
    setShowSidebar(true); // Open sidebar on mobile
  };

  const handleSessionUpdate = (updatedSession: Session) => {
    setSessions(prev => 
      prev.map(s => s.session_id === updatedSession.session_id ? updatedSession : s)
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      {/* Sidebar - Controlled by showSidebar on mobile, always visible on desktop */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex md:w-80 w-full`}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          customerName={currentCustomerName}
          onClose={handleCloseSidebar}
        />
      </div>

      {/* Main Chat Area - Controlled by showSidebar on mobile, always visible on desktop */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
        {currentSessionId ? (
          <ChatInterface
            sessionId={currentSessionId}
            customerName={currentCustomerName}
            onSessionUpdate={handleSessionUpdate}
            onBack={handleBackToSidebar}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Header with hamburger menu - only on mobile */}
            <div className="md:hidden p-4 border-b border-gray-200 bg-white">
              <button
                onClick={handleOpenSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Empty state */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                  Welcome to EchoEats
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  Start a new conversation to begin chatting with our AI assistant.
                </p>
                <button
                  onClick={handleNewSession}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full md:w-auto"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}