const aiService = require('../services/aiService');
const memoryService = require('../services/memoryService');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  // Handle chat message
  async sendMessage(req, res) {
    try {
      const { userId, message, sessionId } = req.body;
      
      // Validate input
      if (!userId || !message) {
        return res.status(400).json({
          error: 'Missing required fields: userId and message'
        });
      }
      
      // Generate or use provided sessionId
      const activeSessionId = sessionId || uuidv4();
      
      // Generate AI response
      const result = await aiService.generateResponse(
        userId,
        activeSessionId,
        message
      );
      
      // Return response
      res.json({
        ...result,
        sessionId: activeSessionId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Chat Controller Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get user memory/profile
  async getUserMemory(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'Missing userId parameter'
        });
      }
      
      const user = await memoryService.getUserProfile(userId);
      
      res.json({
        userId: user.userId,
        profile: user.profile,
        memory: user.memory,
        conversationCount: user.conversationCount,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      });
      
    } catch (error) {
      console.error('Get Memory Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get conversation history
  async getConversationHistory(req, res) {
    try {
      const { userId, sessionId } = req.params;
      const { limit } = req.query;
      
      if (!userId || !sessionId) {
        return res.status(400).json({
          error: 'Missing userId or sessionId parameter'
        });
      }
      
      const history = await memoryService.getConversationHistory(
        userId,
        sessionId,
        limit ? parseInt(limit) : 20
      );
      
      res.json({
        userId,
        sessionId,
        messages: history,
        count: history.length
      });
      
    } catch (error) {
      console.error('Get History Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Update user profile manually
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      if (!userId) {
        return res.status(400).json({
          error: 'Missing userId parameter'
        });
      }
      
      const user = await memoryService.updateUserProfile(userId, updates);
      
      res.json({
        message: 'Profile updated successfully',
        profile: user.profile
      });
      
    } catch (error) {
      console.error('Update Profile Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Delete a specific message
  async deleteMessage(req, res) {
    try {
      const { userId, sessionId, messageId } = req.params;
      
      if (!userId || !sessionId || !messageId) {
        return res.status(400).json({
          error: 'Missing required parameters'
        });
      }
      
      await memoryService.deleteMessage(userId, sessionId, messageId);
      
      res.json({
        message: 'Message deleted successfully',
        messageId
      });
      
    } catch (error) {
      console.error('Delete Message Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Clear conversation history
  async clearHistory(req, res) {
    try {
      const { userId, sessionId } = req.params;
      
      if (!userId || !sessionId) {
        return res.status(400).json({
          error: 'Missing userId or sessionId parameter'
        });
      }
      
      await memoryService.clearConversationHistory(userId, sessionId);
      
      res.json({
        message: 'Conversation history cleared successfully',
        userId,
        sessionId
      });
      
    } catch (error) {
      console.error('Clear History Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Get conversation insights
  async getConversationInsights(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          error: 'Missing userId parameter'
        });
      }
      
      const user = await memoryService.getUserProfile(userId);
      
      // Calculate insights
      const insights = {
        totalConversations: user.conversationCount,
        lastActive: user.lastSeen,
        memberSince: user.createdAt,
        preferredTone: user.profile.preferredTone,
        topInterests: user.profile.interests.slice(0, 5),
        activityPattern: this.calculateActivityPattern(user),
        engagementLevel: this.calculateEngagementLevel(user)
      };
      
      res.json(insights);
      
    } catch (error) {
      console.error('Get Insights Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Helper: Calculate activity pattern
  calculateActivityPattern(user) {
    const hoursSinceLastSeen = (Date.now() - user.lastSeen) / (1000 * 60 * 60);
    
    if (hoursSinceLastSeen < 1) {
      return 'Very Active';
    } else if (hoursSinceLastSeen < 24) {
      return 'Active Today';
    } else if (hoursSinceLastSeen < 168) {
      return 'Active This Week';
    } else {
      return 'Casual User';
    }
  }

  // Helper: Calculate engagement level
  calculateEngagementLevel(user) {
    const conversationCount = user.conversationCount;
    
    if (conversationCount > 50) {
      return 'Highly Engaged';
    } else if (conversationCount > 20) {
      return 'Regular User';
    } else if (conversationCount > 5) {
      return 'Growing Connection';
    } else {
      return 'New Friend';
    }
  }
}

module.exports = new ChatController();
