const User = require('../models/User');
const Conversation = require('../models/Conversation');

class MemoryService {
  // Retrieve or create user profile
  async getUserProfile(userId) {
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = new User({
        userId,
        profile: {
          preferredTone: 'casual_friendly',
          interests: []
        },
        memory: {
          shortTermFacts: [],
          longTermSummary: '',
          emotionalContext: 'neutral'
        }
      });
      await user.save();
    }
    
    return user;
  }

  // Update user profile with extracted information
  async updateUserProfile(userId, updates) {
    const user = await this.getUserProfile(userId);
    
    // Update profile fields
    // If name is being updated, clear old name-related facts to avoid confusion
    if (updates.name) {
      user.profile.name = updates.name;
      // Remove old name facts if this is a correction
      if (updates.isCorrection) {
        user.memory.shortTermFacts = user.memory.shortTermFacts.filter(
          fact => !fact.toLowerCase().includes("user's name is")
        );
      }
    }
    
    // Handle color updates intelligently
    if (updates.favoriteColor) {
      // If explicitly favorite, store as favorite color
      user.profile.favoriteColor = updates.favoriteColor;
    } else if (updates.color) {
      // If just mentioned a color (not as favorite), store as general color preference
      // Only upgrade to favoriteColor if they explicitly say favorite later
      if (!user.profile.favoriteColor) {
        user.profile.color = updates.color;
      }
    }
    
    if (updates.location) user.profile.location = updates.location;
    if (updates.preferredTone) user.profile.preferredTone = updates.preferredTone;
    
    // Update interests (merge without duplicates)
    if (updates.interests && Array.isArray(updates.interests)) {
      const newInterests = updates.interests.filter(i => !user.profile.interests.includes(i));
      user.profile.interests.push(...newInterests);
    }
    
    // Update memory facts
    if (updates.facts && Array.isArray(updates.facts)) {
      user.memory.shortTermFacts.push(...updates.facts);
      // Keep only last 20 facts
      if (user.memory.shortTermFacts.length > 20) {
        user.memory.shortTermFacts = user.memory.shortTermFacts.slice(-20);
      }
    }
    
    user.lastSeen = Date.now();
    await user.save();
    
    return user;
  }

  // Get conversation history
  async getConversationHistory(userId, sessionId, limit = 10) {
    const conversation = await Conversation.findOne({ userId, sessionId });
    
    if (!conversation) {
      return [];
    }
    
    // Return last N messages for context
    return conversation.messages.slice(-limit);
  }

  // Save message to conversation
  async saveMessage(userId, sessionId, role, content, emotion = null) {
    let conversation = await Conversation.findOne({ userId, sessionId });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId,
        messages: []
      });
    }
    
    conversation.messages.push({
      role,
      content,
      emotion,
      timestamp: Date.now()
    });
    
    // Compress if too many messages (>30)
    if (conversation.messages.length > 30) {
      await this.compressConversation(conversation);
    }
    
    await conversation.save();
    
    // Update user conversation count
    if (role === 'user') {
      await User.updateOne(
        { userId },
        { $inc: { conversationCount: 1 }, $set: { lastSeen: Date.now() } }
      );
    }
    
    return conversation;
  }

  // Compress old messages into summary
  async compressConversation(conversation) {
    // Keep last 15 messages, summarize the rest
    if (conversation.messages.length > 15) {
      const oldMessages = conversation.messages.slice(0, -15);
      const recentMessages = conversation.messages.slice(-15);
      
      // Create a simple summary
      const topics = new Set();
      oldMessages.forEach(msg => {
        if (msg.role === 'user') {
          const words = msg.content.toLowerCase().split(' ');
          words.forEach(word => {
            if (word.length > 5) topics.add(word);
          });
        }
      });
      
      conversation.summary = `Previous conversation topics: ${Array.from(topics).slice(0, 10).join(', ')}`;
      conversation.messages = recentMessages;
    }
  }

  // Build memory context for AI in a natural way
  buildMemoryContext(user, conversationHistory) {
    let context = '';
    
    // Build natural profile description
    const profile = user.profile;
    const profileParts = [];
    const missingInfo = [];
    
    if (profile.name) {
      profileParts.push(`Their name is ${profile.name}`);
    } else {
      missingInfo.push('name');
    }
    
    if (profile.interests && profile.interests.length > 0) {
      if (profile.interests.length === 1) {
        profileParts.push(`they're into ${profile.interests[0]}`);
      } else if (profile.interests.length === 2) {
        profileParts.push(`they're into ${profile.interests[0]} and ${profile.interests[1]}`);
      } else {
        const lastInterest = profile.interests[profile.interests.length - 1];
        const otherInterests = profile.interests.slice(0, -1).join(', ');
        profileParts.push(`they're into ${otherInterests}, and ${lastInterest}`);
      }
    }
    
    if (profile.location) {
      profileParts.push(`they live in ${profile.location}`);
    } else {
      missingInfo.push('location');
    }
    
    if (profile.favoriteColor) {
      profileParts.push(`their favorite color is ${profile.favoriteColor}`);
    } else if (profile.color) {
      profileParts.push(`they mentioned liking the color ${profile.color}`);
    } else {
      missingInfo.push('color preference');
    }
    
    if (profileParts.length > 0) {
      context += profileParts.join(', ') + '.\n';
    } else {
      context += "You're just getting to know them.\n";
    }
    
    // Tell AI what information is missing so it can naturally ask
    if (missingInfo.length > 0) {
      context += `\n⚠️ YOU DON'T KNOW YET: ${missingInfo.join(', ')}\n`;
      context += `💡 Try to naturally discover this during conversation (but don't ask all at once!):\n`;
      missingInfo.forEach(info => {
        if (info === 'name') {
          context += `- Ask their name early in the conversation\n`;
        } else if (info === 'location') {
          context += `- Ask where they're from when it feels natural\n`;
        } else if (info === 'color preference') {
          context += `- Ask about favorite colors casually during chat\n`;
        }
      });
    }
    
    // Add recent facts naturally
    if (user.memory.shortTermFacts && user.memory.shortTermFacts.length > 0) {
      const recentFacts = user.memory.shortTermFacts.slice(-5);
      context += `\nThings they've mentioned recently:\n${recentFacts.map(fact => `- ${fact}`).join('\n')}\n`;
    }
    
    // Add conversation history summary
    if (user.memory.longTermSummary) {
      context += `\nWhat you know from past conversations: ${user.memory.longTermSummary}\n`;
    }
    
    // Add conversation count for context
    const totalConversations = conversationHistory.length;
    if (totalConversations === 0) {
      context += '\nThis is your first conversation with them - make them feel welcome and get to know them!\n';
    } else if (totalConversations < 5) {
      context += '\nYou\'re still getting to know each other - be curious and warm!\n';
    } else {
      context += '\nYou\'ve had many conversations - they feel like a friend now!\n';
    }
    
    return context;
  }

  // Extract information from user message
  extractInformation(message) {
    const extracted = {
      facts: [],
      interests: []
    };
    
    const lowerMessage = message.toLowerCase();
    
    // Extract name - improved to handle corrections and avoid false positives
    // Only extract if user explicitly states their name, not casual words like "also"
    // Patterns: "my name is X", "I'm X", "I am X", "call me X", "no my name is X", "actually my name is X"
    const nameMatch = lowerMessage.match(/(?:no |actually |okay |ok )?(?:my name is|i'm|i am|call me|name's) ([a-z]{2,})/i);
    if (nameMatch) {
      const possibleName = nameMatch[1];
      // Filter out common false positives (not actual names)
      const falsePositives = ['also', 'here', 'good', 'fine', 'okay', 'very', 'really', 'just', 'now', 'then', 'from', 'into', 'with', 'about', 'that', 'this', 'what', 'when', 'where', 'which', 'there', 'their', 'they'];
      if (!falsePositives.includes(possibleName.toLowerCase())) {
        extracted.name = possibleName.charAt(0).toUpperCase() + possibleName.slice(1);
        extracted.facts.push(`User's name is ${extracted.name}`);
        // Flag this as a name correction if user said "no" or "actually"
        if (lowerMessage.includes('no ') || lowerMessage.includes('actually') || lowerMessage.includes('correct')) {
          extracted.isCorrection = true;
        }
      }
    }
    
    // Extract color - smart detection
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 'orange', 'brown', 'gray', 'grey', 'violet', 'indigo', 'cyan'];
    
    // First check if they explicitly say "favorite" or "favourite"
    const favoriteColorMatch = lowerMessage.match(/(?:my )?(?:favorite|favourite|fav|fave) (?:color|colour) (?:is )?(\w+)/i);
    if (favoriteColorMatch && colors.includes(favoriteColorMatch[1].toLowerCase())) {
      const color = favoriteColorMatch[1].charAt(0).toUpperCase() + favoriteColorMatch[1].slice(1);
      extracted.favoriteColor = color;
      extracted.facts.push(`Favorite color is ${color}`);
    } 
    // If not explicitly favorite, check for general color mentions
    else {
      const generalColorMatch = lowerMessage.match(/(?:i like|i love|love|like|prefer|really into) (?:the color |the colour )?(\w+)/i);
      if (generalColorMatch && colors.includes(generalColorMatch[1].toLowerCase())) {
        const color = generalColorMatch[1].charAt(0).toUpperCase() + generalColorMatch[1].slice(1);
        extracted.color = color; // Store as just "color" not "favoriteColor"
        extracted.facts.push(`Likes the color ${color}`);
      }
      
      // Also check for simple color mentions in context
      const simpleColorMatch = lowerMessage.match(/\b(red|blue|green|yellow|purple|pink|black|white|orange|brown|gray|grey|violet|indigo|cyan)\b/i);
      if (simpleColorMatch && (lowerMessage.includes('color') || lowerMessage.includes('colour'))) {
        const color = simpleColorMatch[1].charAt(0).toUpperCase() + simpleColorMatch[1].slice(1);
        if (!extracted.color && !extracted.favoriteColor) {
          extracted.color = color;
          extracted.facts.push(`Mentioned the color ${color}`);
        }
      }
    }
    
    // Extract location
    const locationMatch = lowerMessage.match(/(?:live in|from|located in) ([a-z\s]+?)(?:\.|,|$)/i);
    if (locationMatch) {
      extracted.location = locationMatch[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      extracted.facts.push(`Lives in ${extracted.location}`);
    }
    
    // Extract interests
    const interestKeywords = ['anime', 'coding', 'music', 'gaming', 'sports', 'reading', 'movies', 'travel', 'art', 'photography'];
    interestKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        extracted.interests.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        extracted.facts.push(`Interested in ${keyword}`);
      }
    });
    
    return extracted;
  }

  // Delete a specific message from conversation
  async deleteMessage(userId, sessionId, messageId) {
    try {
      const conversation = await Conversation.findOne({ userId, sessionId });
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Remove message with the given ID
      conversation.messages = conversation.messages.filter(
        msg => msg._id.toString() !== messageId
      );
      
      await conversation.save();
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Clear entire conversation history
  async clearConversationHistory(userId, sessionId) {
    try {
      await Conversation.deleteOne({ userId, sessionId });
      return true;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error;
    }
  }
}

module.exports = new MemoryService();
