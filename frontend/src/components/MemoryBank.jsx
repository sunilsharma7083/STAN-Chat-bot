import React from 'react';
import './MemoryBank.css';

const MemoryBank = ({ memory }) => {
  return (
    <div className="memory-bank">
      <div className="memory-header">
        <h3>💾 Memory Bank</h3>
        <p>What I remember about you</p>
      </div>

      <div className="memory-section">
        <div className="memory-item">
          <div className="memory-label">
            {memory?.profile?.favoriteColor ? 'Favorite Color' : 'Color Preference'}
          </div>
          <div className="memory-value">
            {memory?.profile?.favoriteColor || memory?.profile?.color || (
              <span className="empty">Not mentioned yet</span>
            )}
          </div>
        </div>

        <div className="memory-item">
          <div className="memory-label">Location</div>
          <div className="memory-value">
            {memory?.profile?.location || (
              <span className="empty">Not mentioned yet</span>
            )}
          </div>
        </div>

        <div className="memory-item">
          <div className="memory-label">Preferred Tone</div>
          <div className="memory-value">
            {memory?.profile?.preferredTone?.replace('_', ' & ') || 'Casual & Friendly'}
          </div>
        </div>

        {memory?.profile?.name && (
          <div className="memory-item">
            <div className="memory-label">Name</div>
            <div className="memory-value">{memory.profile.name}</div>
          </div>
        )}
      </div>

      {memory?.profile?.interests && memory.profile.interests.length > 0 && (
        <div className="memory-section">
          <div className="section-title">🎯 Interests</div>
          <div className="interests-tags">
            {memory.profile.interests.map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {memory?.memory?.shortTermFacts && memory.memory.shortTermFacts.length > 0 && (
        <div className="memory-section">
          <div className="section-title">📝 Recent Facts</div>
          <ul className="facts-list">
            {memory.memory.shortTermFacts.slice(-5).map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MemoryBank;
