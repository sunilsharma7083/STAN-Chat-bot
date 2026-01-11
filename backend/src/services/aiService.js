const { groq, MODEL } = require('../config/groq');
// Removed multi-model for now - using Groq directly
// const { generateMultiModelResponse } = require('../config/multimodel');
const memoryService = require('./memoryService');
const emotionService = require('./emotionService');
const promptBuilder = require('../utils/promptBuilder');

class AIService {
  // Main method to generate AI response
  async generateResponse(userId, sessionId, userMessage) {
    try {
      console.log('🎯 START generateResponse for:', userId, 'message:', userMessage);
      
      // 1. Get user profile and memory
      const user = await memoryService.getUserProfile(userId);
      console.log('✅ Got user profile');
      
      // 2. Get conversation history FIRST (to prevent repeating)
      const conversationHistory = await memoryService.getConversationHistory(
        userId, 
        sessionId, 
        15 // Last 15 messages for better context
      );
      console.log(`✅ Got conversation history: ${conversationHistory.length} messages`);
      
      // 3. Check if last response was the same (prevent infinite loops)
      const lastAssistantMessage = conversationHistory
        .filter(msg => msg.role === 'assistant')
        .slice(-1)[0];
      
      if (lastAssistantMessage) {
        console.log('📝 Last response:', lastAssistantMessage.content);
      }
      
      // 4. Extract information from user message
      const extracted = memoryService.extractInformation(userMessage);
      console.log('✅ Extracted info:', extracted);
      
      // 5. Update user profile with extracted info
      if (Object.keys(extracted).length > 0) {
        await memoryService.updateUserProfile(userId, extracted);
        console.log('✅ Updated user profile with new info');
      }
      
      // 6. Detect emotion from user message (AI-enhanced)
      console.log('🔍 Detecting emotion...');
      const { emotion, intensity, confidence } = await emotionService.detectEmotion(userMessage);
      console.log(`💭 Detected emotion: ${emotion} (${intensity}) - confidence: ${confidence || 'local'}`);
      
      // 7. Build memory context (use updated profile)
      const updatedUser = await memoryService.getUserProfile(userId);
      const memoryContext = memoryService.buildMemoryContext(updatedUser, conversationHistory);
      
      // 8. Build emotional context
      const emotionalContext = emotionService.buildEmotionalContext(emotion, intensity);
      
      // 9. Build system instruction with memory and emotion
      const systemInstruction = promptBuilder.buildSystemInstruction(
        memoryContext, 
        emotionalContext
      );
      
      // 10. Build messages for API with conversation history
      const messages = [
        {
          role: "system",
          content: systemInstruction
        },
        // Add conversation history for context
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        // Add current message
        {
          role: "user",
          content: userMessage
        }
      ];
      
      console.log('🚀 Calling Groq API with full context...');
      console.log(`📨 Sending ${messages.length} messages (${conversationHistory.length} history + current)`);
      
      // 11. Generate response using Groq API
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: 0.8, // Higher temperature for more varied responses
        max_tokens: 1024,
        top_p: 0.95, // Higher for more diversity
        frequency_penalty: 0.6, // Penalize repetition
        presence_penalty: 0.3, // Encourage new topics
      });
      
      console.log('📥 Groq API Response received');
      
      let aiResponse = completion.choices[0]?.message?.content || 
        "hey something's weird. try again?";
      
      // 12. Apply post-processing to humanize response
      aiResponse = promptBuilder.simplifyResponse(aiResponse);
      
      // 13. Check if response is too similar to last response
      if (lastAssistantMessage && 
          this.isSimilarResponse(aiResponse, lastAssistantMessage.content)) {
        console.log('⚠️ Response too similar, regenerating...');
        // Add variation instruction
        messages.push({
          role: "system",
          content: "Your last response was too similar. Give a completely different response. Be more specific and varied."
        });
        
        const retryCompletion = await groq.chat.completions.create({
          model: MODEL,
          messages: messages,
          temperature: 0.9,
          max_tokens: 1024,
          frequency_penalty: 0.8,
          presence_penalty: 0.5,
        });
        
        aiResponse = retryCompletion.choices[0]?.message?.content || aiResponse;
        aiResponse = promptBuilder.simplifyResponse(aiResponse);
      }
      
      console.log(`✅ Response generated: "${aiResponse}"`);
      
      // 14. Save messages to conversation
      await memoryService.saveMessage(userId, sessionId, 'user', userMessage, emotion);
      await memoryService.saveMessage(userId, sessionId, 'assistant', aiResponse);
      
      // 15. Return response with metadata
      return {
        response: aiResponse,
        provider: 'groq',
        emotion: emotion,
        memoryUpdated: Object.keys(extracted).length > 0,
        extractedInfo: extracted
      };
      
    } catch (error) {
      console.error('AI Service Error:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fallback response
      return {
        response: "aw man, something's not working. try again?",
        emotion: 'neutral',
        memoryUpdated: false,
        error: error.message
      };
    }
  }

  // Check if two responses are too similar
  isSimilarResponse(response1, response2) {
    if (!response1 || !response2) return false;
    
    const normalize = (str) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
    const norm1 = normalize(response1);
    const norm2 = normalize(response2);
    
    // Check exact match
    if (norm1 === norm2) return true;
    
    // Check if 80% similar (simple word overlap)
    const words1 = new Set(norm1.split(/\s+/));
    const words2 = new Set(norm2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const similarity = intersection.size / Math.max(words1.size, words2.size);
    
    return similarity > 0.8;
  }

  // Get diverse, natural greeting based on context
  generateGreeting(user) {
    const hour = new Date().getHours();
    const isFirstTime = !user.conversations || user.conversations.length === 0;
    
    // First time greetings - warm welcome with questions
    if (isFirstTime) {
      const firstTimeGreetings = [
        "Hey! I'm Alex 😊 What's your name?",
        "Hi! I'm Alex. Nice to meet you! What should I call you?",
        "Hey there! Alex here 👋 What brings you here today?",
        "Hi! I'm Alex. How's it going?",
        "Hey! What's up? I'm Alex btw 😊"
      ];
      return firstTimeGreetings[Math.floor(Math.random() * firstTimeGreetings.length)];
    }
    
    // Personalized greetings with name - always with a question
    if (user.profile.name) {
      const personalGreetings = [
        `Hey ${user.profile.name}! What's up?`,
        `${user.profile.name}! How's it going?`,
        `Oh hey ${user.profile.name}! What's new?`,
        `Yo ${user.profile.name}! What's on your mind?`,
        `Hey ${user.profile.name}! How've you been?`,
        `${user.profile.name}! Good to see you! What's happening?`,
        `Hey! How are you today, ${user.profile.name}?`
      ];
      return personalGreetings[Math.floor(Math.random() * personalGreetings.length)];
    }
    
    // Time-based greetings for returning users - with questions
    if (hour < 6) {
      const lateNightGreetings = [
        "You're up late! Can't sleep?",
        "Still awake? What's on your mind?",
        "Night owl! What are you up to?"
      ];
      return lateNightGreetings[Math.floor(Math.random() * lateNightGreetings.length)];
    } else if (hour < 12) {
      const morningGreetings = [
        "Morning! How's your day starting?",
        "Hey! What's the plan for today?",
        "Good morning! Sleep well?"
      ];
      return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
    } else if (hour < 17) {
      const afternoonGreetings = [
        "Hey! How's your day going?",
        "Afternoon! What are you up to?",
        "Hi! What's happening today?"
      ];
      return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
    } else if (hour < 21) {
      const eveningGreetings = [
        "Evening! How was your day?",
        "Hey! How'd today go?",
        "Evening! What's new?"
      ];
      return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
    } else {
      const nightGreetings = [
        "Hey! What's keeping you up?",
        "Evening! How was your day?",
        "Hey night owl! What's going on?"
      ];
      return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
    }
  }

  // Generate context-aware follow-up suggestions
  generateFollowUpSuggestions(emotion, userProfile) {
    const suggestions = {
      sad: [
        "Want to talk about what's bothering you?",
        "How can I help cheer you up?",
        "Would you like some anime recommendations to lift your spirits?"
      ],
      excited: [
        "Tell me more about what's got you so pumped!",
        "That's awesome! What else is going well?",
        "I love your energy! What are you looking forward to?"
      ],
      neutral: [
        "What's something interesting that happened recently?",
        "Discovered any cool new music or shows lately?",
        "What are you working on these days?"
      ]
    };
    
    return suggestions[emotion] || suggestions.neutral;
  }
}

module.exports = new AIService();
