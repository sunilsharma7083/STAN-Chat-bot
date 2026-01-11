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
      
      // 2. Extract information from user message
      const extracted = memoryService.extractInformation(userMessage);
      console.log('✅ Extracted info:', extracted);
      
      // 3. Update user profile with extracted info
      if (Object.keys(extracted).length > 0) {
        await memoryService.updateUserProfile(userId, extracted);
        console.log('✅ Updated user profile');
      }
      
      // 4. Detect emotion from user message (AI-enhanced)
      console.log('🔍 Detecting emotion...');
      const { emotion, intensity, confidence } = await emotionService.detectEmotion(userMessage);
      console.log(`💭 Detected emotion: ${emotion} (${intensity}) - confidence: ${confidence || 'local'}`);
      
      // 5. Get conversation history
      const conversationHistory = await memoryService.getConversationHistory(
        userId, 
        sessionId, 
        10 // Last 10 messages
      );
      
      // 6. Build memory context
      const memoryContext = memoryService.buildMemoryContext(user, conversationHistory);
      
      // 7. Build emotional context
      const emotionalContext = emotionService.buildEmotionalContext(emotion, intensity);
      
      // 8. Build system instruction
      const systemInstruction = promptBuilder.buildSystemInstruction(
        memoryContext, 
        emotionalContext
      );
      
      // 9. Build full prompt
      let prompt = promptBuilder.buildPrompt(
        systemInstruction,
        conversationHistory,
        userMessage
      );
      
      // 10. Optimize prompt to reduce tokens
      prompt = promptBuilder.optimizePrompt(prompt);
      
      // 11. Generate response using Groq API directly
      const messages = [
        {
          role: "system",
          content: systemInstruction
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: "user",
          content: userMessage
        }
      ];
      
      console.log('🚀 Calling Groq API...');
      console.log('📨 Messages sent:', JSON.stringify(messages, null, 2));
      
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
      });
      
      console.log('📥 Groq API Response received');
      
      let aiResponse = completion.choices[0]?.message?.content || 
        "hey, something's off. try again?";
      
      // Apply post-processing to simplify and humanize the response
      aiResponse = promptBuilder.simplifyResponse(aiResponse);
      
      console.log(`✅ Response generated successfully`);
      
      // 12. Save messages to conversation
      await memoryService.saveMessage(userId, sessionId, 'user', userMessage, emotion);
      await memoryService.saveMessage(userId, sessionId, 'assistant', aiResponse);
      
      // 13. Return response with metadata
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
