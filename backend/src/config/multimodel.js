const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face client (free tier)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'hf_free_token');

// Best free models for different tasks
const MODELS = {
  // Primary conversation model (Groq - fastest)
  conversation: {
    provider: 'groq',
    model: 'mixtral-8x7b-32768'
  },
  
  // Fallback conversation models (Hugging Face - free)
  fallbackConversation: [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'meta-llama/Meta-Llama-3-8B-Instruct',
    'microsoft/DialoGPT-large'
  ],
  
  // Emotion detection (specialized models)
  emotion: [
    'j-hartmann/emotion-english-distilroberta-base',
    'bhadresh-savani/distilbert-base-uncased-emotion'
  ],
  
  // Sentiment analysis (for tone detection)
  sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest'
};

// Hugging Face emotion detection (enhanced accuracy)
async function detectEmotionWithHuggingFace(text) {
  try {
    const result = await hf.textClassification({
      model: MODELS.emotion[0],
      inputs: text
    });
    
    // Map HF emotions to our system
    const emotionMap = {
      'joy': 'excited',
      'happiness': 'excited',
      'sadness': 'sad',
      'anger': 'angry',
      'fear': 'anxious',
      'surprise': 'curious',
      'disgust': 'disappointed',
      'neutral': 'friendly'
    };
    
    const topEmotion = result[0];
    const mappedEmotion = emotionMap[topEmotion.label.toLowerCase()] || 'friendly';
    
    return {
      emotion: mappedEmotion,
      confidence: topEmotion.score,
      raw: result
    };
  } catch (error) {
    console.log('HuggingFace emotion detection unavailable, using local');
    return null;
  }
}

// Hugging Face conversational response (fallback)
async function generateWithHuggingFace(messages, systemPrompt) {
  try {
    // Format conversation for HF model
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');
    
    const prompt = `${systemPrompt}\n\n${conversationText}\nAssistant:`;
    
    const response = await hf.textGeneration({
      model: MODELS.fallbackConversation[0],
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.9,
        top_p: 0.95,
        return_full_text: false
      }
    });
    
    return response.generated_text.trim();
  } catch (error) {
    console.log('HuggingFace generation unavailable:', error.message);
    return null;
  }
}

// Multi-model response generation (tries multiple APIs)
async function generateMultiModelResponse(groq, messages, systemPrompt, MODEL) {
  // Try Groq first (fastest and best)
  try {
    console.log('🚀 Trying Groq API (Primary)...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: MODEL,
      temperature: 0.9,
      max_tokens: 1024,
      top_p: 0.95,
    });
    
    const response = chatCompletion.choices[0]?.message?.content;
    if (response) {
      console.log('✅ Groq API successful');
      return { response, provider: 'groq' };
    }
  } catch (error) {
    console.log('⚠️ Groq API failed:', error.message);
  }
  
  // Try Hugging Face as fallback
  try {
    console.log('🔄 Trying Hugging Face API (Fallback)...');
    const response = await generateWithHuggingFace(messages, systemPrompt);
    if (response) {
      console.log('✅ Hugging Face API successful');
      return { response, provider: 'huggingface' };
    }
  } catch (error) {
    console.log('⚠️ Hugging Face API failed:', error.message);
  }
  
  // If all fail, return intelligent fallback
  return {
    response: "Hey! I'm having a moment here, but I'm still listening. Tell me more about what's on your mind?",
    provider: 'fallback'
  };
}

module.exports = {
  MODELS,
  detectEmotionWithHuggingFace,
  generateWithHuggingFace,
  generateMultiModelResponse
};
