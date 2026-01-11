import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import MemoryBank from './components/MemoryBank';
import ConversationInsights from './components/ConversationInsights';
import apiService from './services/api';
import './App.css';

function App() {
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [sessionId] = useState('session_' + Date.now());
  const [memory, setMemory] = useState(null);
  const [insights, setInsights] = useState(null);
  const [empathyMode, setEmpathyMode] = useState(false);
  const chatRef = useRef(null);

  // Load initial memory and insights
  useEffect(() => {
    loadMemory();
    loadInsights();
    
    // Refresh memory periodically
    const interval = setInterval(() => {
      loadMemory();
      loadInsights();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId]);

  const loadMemory = async () => {
    try {
      const memoryData = await apiService.getUserMemory(userId);
      setMemory(memoryData);
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const insightsData = await apiService.getInsights(userId);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const handleMessageSent = async (message, userMessage) => {
    try {
      // Send message to API
      const response = await apiService.sendMessage(userId, message, sessionId);
      
      // Update empathy mode based on emotion
      if (['sad', 'angry', 'anxious'].includes(response.emotion)) {
        setEmpathyMode(true);
        setTimeout(() => setEmpathyMode(false), 5000);
      }
      
      // Add assistant message to chat
      if (chatRef.current) {
        chatRef.current.addAssistantMessage(response.response, response.emotion);
      }
      
      // Reload memory if updated
      if (response.memoryUpdated) {
        setTimeout(() => {
          loadMemory();
          loadInsights();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show error message in chat
      if (chatRef.current) {
        chatRef.current.addAssistantMessage(
          "aw man, something went wrong. try again?",
          'neutral'
        );
      }
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <div className="left-sidebar">
          <div className="sidebar-header">
            <div className="user-profile">
              <div className="user-avatar">
                <span className="avatar-letter">
                  {memory?.profile?.name ? memory.profile.name[0].toUpperCase() : 'A'}
                </span>
              </div>
              <div className="user-info">
                <h3>{memory?.profile?.name || 'Alex'}</h3>
                <p className="user-status">
                  <span className="status-dot"></span>
                  Last seen 1 day ago
                </p>
              </div>
            </div>
            <div className="chats-count">
              <span className="count-badge">{insights?.totalConversations || 0}</span>
              <span className="count-label">12 chats</span>
            </div>
            <div className="badge-row">
              <span className="badge curious">🔍 curious</span>
            </div>
          </div>

          <MemoryBank memory={memory} />
        </div>

        <div className="main-content">
          <ChatInterface
            ref={chatRef}
            userId={userId}
            sessionId={sessionId}
            onMessageSent={handleMessageSent}
            empathyMode={empathyMode}
          />
        </div>

        <div className="right-sidebar">
          <ConversationInsights 
            insights={insights} 
            userName={memory?.profile?.name}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
