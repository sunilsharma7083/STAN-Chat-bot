const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  profile: {
    name: String,
    color: String,  // General color preference (when just mentioned)
    favoriteColor: String,  // Explicitly stated favorite color
    location: String,
    preferredTone: {
      type: String,
      default: 'casual_friendly'
    },
    interests: [String]
  },
  memory: {
    shortTermFacts: [String], // Recent facts mentioned
    longTermSummary: String,  // Compressed conversation summary
    emotionalContext: String  // Overall emotional state
  },
  conversationCount: {
    type: Number,
    default: 0
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ userId: 1, lastSeen: -1 });

module.exports = mongoose.model('User', userSchema);
