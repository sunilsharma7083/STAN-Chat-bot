import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import apiService from '../services/api';
import './ChatInterface.css';

const ChatInterface = forwardRef(({ userId, sessionId, onMessageSent, empathyMode }, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiService.getConversationHistory(userId, sessionId);
        
        if (history && history.messages && history.messages.length > 0) {
          // Convert backend format to UI format
          const formattedMessages = history.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            emotion: msg.emotion,
            timestamp: msg.timestamp
          }));
          
          setMessages(formattedMessages);
          setHistoryLoaded(true);
        } else {
          // No history found, show welcome message
          setMessages([{
            role: 'assistant',
            content: "Hey there! It's great to see you back. How's your day going so far?",
            emotion: 'friendly',
            timestamp: new Date().toISOString()
          }]);
          setHistoryLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        // Show welcome message on error
        setMessages([{
          role: 'assistant',
          content: "Hey there! It's great to see you back. How's your day going so far?",
          emotion: 'friendly',
          timestamp: new Date().toISOString()
        }]);
        setHistoryLoaded(true);
      }
    };

    if (!historyLoaded) {
      loadHistory();
    }
  }, [userId, sessionId, historyLoaded]);

  // Add initial greeting (OLD - now replaced by history loading)
  // useEffect(() => {
  //   if (messages.length === 0) {
  //     setMessages([{
  //       role: 'assistant',
  //       content: "Hey there! It's great to see you back. How's your day going so far?",
  //       emotion: 'friendly',
  //       timestamp: new Date().toISOString()
  //     }]);
  //   }
  // }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiObject) => {
    setInputMessage(prev => prev + emojiObject.emoji);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to UI
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Send to parent component
    if (onMessageSent) {
      onMessageSent(inputMessage, userMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to be called from parent to add assistant message
  const addAssistantMessage = (content, emotion) => {
    const assistantMessage = {
      role: 'assistant',
      content,
      emotion,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Function to clear all chat history
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      return;
    }

    try {
      await apiService.clearHistory(userId, sessionId);
      
      // Clear messages in UI and show welcome message
      setMessages([{
        role: 'assistant',
        content: "Hey! Fresh start. How can I help you today?",
        emotion: 'friendly',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history. Please try again.');
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    addAssistantMessage,
    clearHistory: handleClearHistory
  }));

  const getEmotionTag = (emotion) => {
    const tags = {
      friendly: { label: 'friendly', color: '#10b981' },
      empathetic: { label: 'empathetic', color: '#ec4899' },
      enthusiastic: { label: 'enthusiastic', color: '#f59e0b' },
      sad: { label: 'empathetic', color: '#8b5cf6' },
      excited: { label: 'enthusiastic', color: '#f59e0b' }
    };
    
    return tags[emotion] || tags.friendly;
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="header-left">
          <div className="stan-avatar">
            <span className="avatar-icon">🤖</span>
          </div>
          <div className="header-info">
            <h2>STAN AI</h2>
            <p className="status">
              <span className="status-dot online"></span>
              STAN is online
            </p>
          </div>
        </div>
        <div className="header-right">
          <button 
            className="clear-chat-button"
            onClick={handleClearHistory}
            title="Clear chat history"
          >
            🗑️ Clear Chat
          </button>
          {empathyMode && (
            <div className="empathy-badge">
              <span className="empathy-icon">💜</span>
              Empathy Mode
            </div>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar">
                <span className="avatar-icon">🤖</span>
              </div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                {msg.content}
              </div>
              {msg.role === 'assistant' && msg.emotion && (
                <div 
                  className="emotion-tag" 
                  style={{ backgroundColor: getEmotionTag(msg.emotion).color }}
                >
                  {getEmotionTag(msg.emotion).label}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="message-avatar user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar">
              <span className="avatar-icon">🤖</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="emoji-picker-wrapper" ref={emojiPickerRef}>
          <button 
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            type="button"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
              />
            </div>
          )}
        </div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="message-input"
        />
        <button 
          onClick={handleSendMessage}
          className="send-button"
          disabled={!inputMessage.trim()}
        >
          <span className="send-icon">➤</span>
        </button>
      </div>

      <div className="footer-note">
        Made with Replit ⚡
      </div>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
