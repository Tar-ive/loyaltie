'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Users, 
  Utensils, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  User,
  Plus,
  ShoppingBag,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ChatInterface } from '../../components/chat/ChatInterface';
import { sessionApi, messageApi, Session } from '../../lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [currentCustomerName, setCurrentCustomerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Orders');
  const [chatView, setChatView] = useState<'dashboard' | 'chat' | 'customers'>('dashboard');
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsWithMessages, setSessionsWithMessages] = useState<Session[]>([]);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async (showLoading = false) => {
    try {
      if (showLoading) {
        setSessionsLoading(true);
      } else {
        setIsLoading(true);
      }
      
      const customerId = 'aniket-sharma-nvidia';
      const sessionsData = await sessionApi.listSessions(customerId);
      console.log('Fetched sessions:', sessionsData);
      setSessions(sessionsData);
      
      // Filter sessions that have actual conversations
      try {
        const sessionsWithMessages = await filterSessionsWithMessages(sessionsData);
        console.log('Sessions with messages:', sessionsWithMessages);
        setSessionsWithMessages(sessionsWithMessages);
      } catch (error) {
        console.error('Error filtering sessions:', error);
        // Fallback: show all sessions if filtering fails
        setSessionsWithMessages(sessionsData);
      }
      
      // Auto-select the first session if available and not in chat view
      if (sessionsData.length > 0 && !currentSessionId && chatView !== 'chat') {
        const firstSession = sessionsData[0];
        setCurrentSessionId(firstSession.sessionId || firstSession.session_id);
        setCurrentCustomerName(firstSession.customerName || firstSession.customer_name || 'Unknown Customer');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      if (showLoading) {
        setSessionsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await sessionApi.createSession({
        customer_id: 'aniket-sharma-nvidia',
        customer_name: 'Aniket Sharma',
      });
      
      const sessionId = newSession.metadata?.sessionId || newSession.session_id;
      const customerName = newSession.metadata?.customerName || newSession.customer_name;
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
      setCurrentCustomerName(customerName);
      setChatView('chat');

      toast.success('New conversation started!');
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create new conversation');
    }
  };

  const handleSelectSession = (sessionId: string) => {
    console.log('Selecting session:', sessionId);
    const session = sessionsWithMessages.find(s => (s.sessionId || s.session_id) === sessionId);
    console.log('Found session:', session);
    if (session) {
      setCurrentSessionId(sessionId);
      setCurrentCustomerName(session.customerName || session.customer_name || 'Unknown Customer');
      setChatView('chat');
      console.log('Opening chat for session:', sessionId, 'with customer:', session.customerName || session.customer_name);
    }
  };

  const handleSessionUpdate = (updatedSession: Session) => {
    setSessions(prev => 
      prev.map(s => s.session_id === updatedSession.session_id ? updatedSession : s)
    );
  };

  const handleShowChats = async () => {
    setChatView('chat');
    setCurrentSessionId(undefined); // Reset to show session list
    await loadSessions(true); // Refresh sessions from backend with loading state
  };

  const handleShowCustomers = () => {
    setChatView('customers');
  };

  const handleBackToDashboard = () => {
    setChatView('dashboard');
  };

  // Check if a session has actual messages
  const checkSessionHasMessages = async (sessionId: string): Promise<boolean> => {
    try {
      const conversation = await messageApi.getConversation(sessionId);
      return conversation.conversation && conversation.conversation.length > 0;
    } catch (error) {
      console.error('Error checking session messages:', error);
      return false;
    }
  };

  // Filter sessions that have actual conversations
  const filterSessionsWithMessages = async (allSessions: Session[]) => {
    const sessionsWithMessages = [];
    
    for (const session of allSessions) {
      const sessionId = session.sessionId || session.session_id;
      if (sessionId) {
        try {
          const hasMessages = await checkSessionHasMessages(sessionId);
          if (hasMessages) {
            sessionsWithMessages.push(session);
          }
        } catch (error) {
          console.error(`Error checking session ${sessionId}:`, error);
          // If we can't check, include the session anyway to be safe
          sessionsWithMessages.push(session);
        }
      }
    }
    
    return sessionsWithMessages;
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
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
                  <h1 className="text-lg font-semibold text-gray-900">Loyaltie</h1>
              <p className="text-sm text-gray-600">Restaurant Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button 
              onClick={() => setChatView('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'dashboard' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>
            <button 
              onClick={() => setChatView('orders')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'orders' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button 
              onClick={handleShowChats}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'chat' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>AI Conversations</span>
            </button>
            <button 
              onClick={handleShowCustomers}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'customers' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Customers</span>
            </button>
            <button 
              onClick={() => setChatView('menu')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'menu' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span>Menu Management</span>
            </button>
            <button 
              onClick={() => setChatView('analytics')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'analytics' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => setChatView('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                chatView === 'settings' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
              <p className="text-gray-600">Monitor AI-powered customer service and orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Today - {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {chatView === 'chat' ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI Conversations</h2>
                <button
                  onClick={handleNewSession}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                >
                  Start Conversation
                </button>
              </div>
              {currentSessionId ? (
                <div className="h-[calc(100vh-200px)] border border-gray-200 rounded-lg">
                  <ChatInterface
                    sessionId={currentSessionId}
                    customerName={currentCustomerName}
                    onSessionUpdate={handleSessionUpdate}
                    onBack={() => setCurrentSessionId(undefined)}
                  />
                </div>
              ) : (
                <div className="h-[calc(100vh-200px)] border border-gray-200 rounded-lg bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Chat Sessions</h3>
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">Loading sessions...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const validSessions = sessionsWithMessages.filter(session => session && (session.sessionId || session.session_id));
                        console.log('All sessions:', sessions);
                        console.log('Sessions with messages:', sessionsWithMessages);
                        console.log('Valid sessions:', validSessions);
                        return validSessions.length > 0;
                      })() ? (
                        sessionsWithMessages.filter(session => session && (session.sessionId || session.session_id)).map((session) => {
                          const sessionId = session.sessionId || session.session_id || session.metadata?.sessionId;
                          const customerName = session.customerName || session.customer_name || session.metadata?.customerName || 'Unknown Customer';
                          const createdAt = session.createdAt || session.metadata?.createdAt;
                          const lastAccessed = session.lastAccessedAt || session.metadata?.lastAccessedAt;
                          
                          return (
                            <div 
                              key={sessionId} 
                              onClick={() => handleSelectSession(sessionId!)}
                              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md cursor-pointer transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-sm font-medium">
                                    {customerName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900 truncate">{customerName}</h4>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-xs text-gray-500">
                                        {lastAccessed ? new Date(lastAccessed).toLocaleDateString() : 'Active'}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">
                                    Session: {sessionId?.slice(-8)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {createdAt ? `Created: ${new Date(createdAt).toLocaleDateString()}` : 'Click to open conversation'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Conversations</h3>
                          <p className="text-gray-600">No chat sessions found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : chatView === 'customers' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Profiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.filter(session => session && session.session_id).map((session) => (
                  <div key={session.session_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {(session.customer_name || 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.customer_name}</h3>
                        <p className="text-sm text-gray-600">Customer ID: {session.customer_id}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sessions:</span>
                        <span className="text-sm text-gray-900">1</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : chatView === 'orders' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Orders Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #1234</h3>
                      <p className="text-sm text-gray-600">Status: In Kitchen</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Items:</span>
                      <span className="text-sm text-gray-900">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm text-gray-900">$24.50</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #1235</h3>
                      <p className="text-sm text-gray-600">Status: Ready</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Items:</span>
                      <span className="text-sm text-gray-900">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm text-gray-900">$18.75</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : chatView === 'menu' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Menu Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Burger Deluxe</h3>
                      <p className="text-sm text-gray-600">Price: $12.99</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm text-green-600 font-medium">Available</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm text-gray-900">Main Course</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : chatView === 'analytics' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Revenue Growth</h3>
                      <p className="text-sm text-gray-600">+15% this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : chatView === 'settings' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Notifications</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auto-responder</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Orders Today</p>
                      <p className="text-3xl font-bold text-gray-900">142</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+18%</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">AI Success Rate</p>
                      <p className="text-3xl font-bold text-gray-900">96.4%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+2.1%</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg Response</p>
                      <p className="text-3xl font-bold text-gray-900">2.3s</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">-0.8s</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                      <p className="text-3xl font-bold text-gray-900">89</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12%</span>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button 
                  onClick={handleShowChats}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Conversations</h3>
                      <p className="text-sm text-gray-600">View active chats</p>
                    </div>
                  </div>
                </button>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pending Orders</h3>
                      <p className="text-sm text-gray-600">3 orders in kitchen</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleShowCustomers}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Customer Profiles</h3>
                      <p className="text-sm text-gray-600">Manage preferences</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Analytics</h3>
                  <p className="text-sm text-gray-600 mb-4">Daily orders and AI handling performance</p>
                  
                  <div className="flex space-x-1 mb-4">
                    <button 
                      onClick={() => setActiveTab('Orders')}
                      className={`px-3 py-1 text-sm rounded ${
                        activeTab === 'Orders' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Orders
                    </button>
                    <button 
                      onClick={() => setActiveTab('Revenue')}
                      className={`px-3 py-1 text-sm rounded ${
                        activeTab === 'Revenue' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Revenue
                    </button>
                    <button 
                      onClick={() => setActiveTab('AI Rate')}
                      className={`px-3 py-1 text-sm rounded ${
                        activeTab === 'AI Rate' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      AI Rate
                    </button>
                  </div>

                  {/* Chart Visualization */}
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="h-full flex items-end space-x-2">
                      {/* Sample data for the chart */}
                      {[
                        { day: 'Mon', orders: 45, aiHandled: 42 },
                        { day: 'Tue', orders: 52, aiHandled: 48 },
                        { day: 'Wed', orders: 38, aiHandled: 35 },
                        { day: 'Thu', orders: 67, aiHandled: 62 },
                        { day: 'Fri', orders: 89, aiHandled: 84 },
                        { day: 'Sat', orders: 95, aiHandled: 90 },
                        { day: 'Sun', orders: 72, aiHandled: 68 }
                      ].map((data, index) => (
                        <div key={data.day} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex flex-col items-center space-y-1 mb-2">
                            {/* AI Handled Bar */}
                            <div 
                              className="w-full bg-green-500 rounded-t"
                              style={{ height: `${(data.aiHandled / 100) * 120}px` }}
                              title={`AI Handled: ${data.aiHandled}`}
                            ></div>
                            {/* Total Orders Bar */}
                            <div 
                              className="w-full bg-orange-500 rounded-t"
                              style={{ height: `${(data.orders / 100) * 120}px` }}
                              title={`Total Orders: ${data.orders}`}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{data.day}</span>
                        </div>
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span className="text-xs text-gray-600">Orders</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-xs text-gray-600">AI Handled</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Revenue</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">$4,120</div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orders</span>
                      <span className="font-medium">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Order Value</span>
                      <span className="font-medium">$29.01</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>

                  <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}