import React from 'react';
import './ConversationInsights.css';

const ConversationInsights = ({ insights, userName }) => {
  return (
    <div className="conversation-insights">
      <div className="insights-header">
        <h3>📊 Conversation Insights</h3>
        <p>{userName || 'User'} activity summary</p>
      </div>

      <div className="insight-card">
        <div className="insight-icon">💬</div>
        <div className="insight-content">
          <div className="insight-value">{insights?.totalConversations || 0}</div>
          <div className="insight-label">Total Chats</div>
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-icon">📅</div>
        <div className="insight-content">
          <div className="insight-value">{insights?.activityPattern || 'New Friend'}</div>
          <div className="insight-label">Activity Pattern</div>
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-icon">⭐</div>
        <div className="insight-content">
          <div className="insight-value">{insights?.engagementLevel || 'Getting Started'}</div>
          <div className="insight-label">Engagement Level</div>
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-icon">🎭</div>
        <div className="insight-content">
          <div className="insight-value">
            {insights?.preferredTone?.replace('_', ' & ') || 'Casual & Friendly'}
          </div>
          <div className="insight-label">Preferred Tone</div>
        </div>
      </div>

      {insights?.lastActive && (
        <div className="insight-footer">
          <span className="footer-label">Last active:</span>
          <span className="footer-value">
            {new Date(insights.lastActive).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ConversationInsights;
