// Removed HuggingFace import for now - will use local detection
// const { detectEmotionWithHuggingFace } = require('../config/multimodel');

class EmotionService {
  // Detect emotion from user message with advanced pattern matching
  async detectEmotion(message) {
    // Using local pattern-based detection (fast and reliable)
    // HuggingFace can be added later if needed
    
    const lowerMessage = message.toLowerCase();
    
    // Multi-layer emotion detection for better accuracy
    const emotionScores = {
      sad: 0,
      angry: 0,
      excited: 0,
      anxious: 0,
      friendly: 0,
      confused: 0,
      grateful: 0,
      disappointed: 0,
      curious: 0
    };
    
    // Sadness & Depression (expanded with context)
    const sadnessPatterns = {
      direct: ['sad', 'depressed', 'crying', 'tears', 'heartbroken', 'miserable', 'hopeless'],
      indirect: ['not feeling well', 'having a hard time', 'struggling', 'difficult day', 'tough time', 'can\'t cope'],
      physical: ['tired', 'exhausted', 'drained', 'no energy', 'burnt out'],
      emotional: ['lonely', 'alone', 'isolated', 'miss', 'hurt', 'pain', 'empty', 'numb']
    };
    
    Object.entries(sadnessPatterns).forEach(([type, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          emotionScores.sad += type === 'direct' ? 3 : 2;
        }
      });
    });
    
    // Anger & Frustration
    const angerPatterns = {
      direct: ['angry', 'mad', 'furious', 'enraged', 'pissed', 'hate'],
      frustration: ['frustrated', 'irritated', 'annoyed', 'bothered', 'fed up', 'sick of'],
      context: ['can\'t believe', 'so unfair', 'ridiculous', 'unacceptable', 'terrible']
    };
    
    Object.entries(angerPatterns).forEach(([type, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          emotionScores.angry += type === 'direct' ? 3 : 2;
        }
      });
    });
    
    // Excitement & Joy
    const excitementPatterns = {
      direct: ['excited', 'thrilled', 'ecstatic', 'amazing', 'awesome', 'fantastic', 'incredible'],
      joy: ['happy', 'joyful', 'love', 'wonderful', 'great', 'brilliant', 'perfect'],
      achievement: ['got promoted', 'passed', 'won', 'achieved', 'succeeded', 'dream job'],
      celebration: ['yay', 'woohoo', 'omg', 'finally', 'can\'t wait']
    };
    
    Object.entries(excitementPatterns).forEach(([type, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          emotionScores.excited += type === 'achievement' ? 3 : 2;
        }
      });
    });
    
    // Check for exclamation marks (excitement indicator)
    const exclamationCount = (message.match(/!/g) || []).length;
    if (exclamationCount >= 2) emotionScores.excited += 2;
    if (exclamationCount >= 4) emotionScores.excited += 2;
    
    // Anxiety & Worry
    const anxietyPatterns = {
      direct: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'terrified', 'panic'],
      stress: ['stressed', 'overwhelmed', 'pressure', 'tense', 'on edge'],
      uncertainty: ['don\'t know what to do', 'uncertain', 'unsure', 'confused', 'lost']
    };
    
    Object.entries(anxietyPatterns).forEach(([type, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          emotionScores.anxious += type === 'direct' ? 3 : 2;
        }
      });
    });
    
    // Gratitude
    const gratitudeKeywords = ['thank', 'thanks', 'appreciate', 'grateful', 'thankful', 'that helps', 'that\'s helpful'];
    gratitudeKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) emotionScores.grateful += 3;
    });
    
    // Disappointment
    const disappointmentKeywords = ['disappointed', 'let down', 'expected more', 'not what i hoped', 'unfortunate', 'bummer'];
    disappointmentKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) emotionScores.disappointed += 3;
    });
    
    // Curiosity
    const curiosityIndicators = ['?', 'how', 'why', 'what', 'when', 'where', 'tell me', 'curious', 'wonder', 'interested'];
    curiosityIndicators.forEach(indicator => {
      if (lowerMessage.includes(indicator)) emotionScores.curious += 1;
    });
    
    // Friendly/Casual greetings
    const friendlyKeywords = ['hey', 'hi', 'hello', 'sup', 'what\'s up', 'yo', 'good morning', 'good evening'];
    friendlyKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) emotionScores.friendly += 2;
    });
    
    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores).reduce((max, [emotion, score]) => 
      score > max.score ? { emotion, score } : max, 
      { emotion: 'neutral', score: 0 }
    );
    
    // Determine intensity based on score
    let intensity = 'low';
    if (dominantEmotion.score >= 5) intensity = 'high';
    else if (dominantEmotion.score >= 3) intensity = 'medium';
    
    // Context-aware adjustments
    if (dominantEmotion.score === 0) {
      // No clear emotion, default to neutral or friendly
      if (lowerMessage.length < 20) {
        return { emotion: 'friendly', intensity: 'low' };
      }
      return { emotion: 'neutral', intensity: 'low' };
    }
    
    return { 
      emotion: dominantEmotion.emotion, 
      intensity,
      confidence: Math.min(dominantEmotion.score / 10, 1.0) // 0-1 confidence score
    };
  }

  // Generate empathetic response tone based on emotion with contextual depth
  getResponseTone(emotion, intensity = 'medium') {
    const tones = {
      sad: {
        low: {
          style: 'gently supportive and understanding',
          guidance: 'Show you care without being overwhelming. Use soft, comforting language. Offer gentle support.',
          examples: ['I hear you.', 'That sounds tough.', 'I\'m here with you.'],
          avoid: 'Don\'t minimize their feelings or rush to fix things. Don\'t be overly cheerful.'
        },
        medium: {
          style: 'deeply empathetic and validating',
          guidance: 'Validate their feelings strongly. Show deep understanding. Offer meaningful support without trying to immediately fix things.',
          examples: ['I can tell this is really weighing on you.', 'Your feelings are completely valid.', 'It\'s okay to feel this way.'],
          avoid: 'Don\'t say "just be positive" or "it could be worse". Don\'t rush them.'
        },
        high: {
          style: 'profoundly compassionate and present',
          guidance: 'Be fully present with their pain. Acknowledge the depth of their struggle. Offer unwavering support. Let them know they\'re not alone.',
          examples: ['I\'m so sorry you\'re going through this.', 'This sounds incredibly difficult.', 'You don\'t have to face this alone.'],
          avoid: 'Don\'t offer quick solutions. Don\'t change the subject. Don\'t compare to others\' problems.'
        }
      },
      angry: {
        low: {
          style: 'calm and understanding',
          guidance: 'Acknowledge their frustration calmly. Show you understand without escalating.',
          examples: ['I can see why that would be frustrating.', 'That does sound annoying.'],
          avoid: 'Don\'t dismiss or invalidate. Don\'t be defensive.'
        },
        medium: {
          style: 'validating and grounding',
          guidance: 'Validate their anger as legitimate. Stay calm and grounding. Help them feel heard.',
          examples: ['You have every right to feel angry about that.', 'That\'s genuinely unfair.', 'I\'d be frustrated too.'],
          avoid: 'Don\'t tell them to calm down. Don\'t minimize what upset them.'
        },
        high: {
          style: 'deeply validating while staying calm',
          guidance: 'Fully validate their anger while providing a calm presence. Acknowledge the injustice. Don\'t match their intensity, but show you understand it.',
          examples: ['That\'s absolutely infuriating.', 'You have every reason to be this upset.', 'Anyone would be furious in your situation.'],
          avoid: 'Never say "calm down" or "it\'s not that bad". Don\'t be dismissive.'
        }
      },
      excited: {
        low: {
          style: 'warmly positive',
          guidance: 'Share in their positivity with gentle enthusiasm.',
          examples: ['That\'s nice!', 'Glad to hear it!', 'That sounds good.'],
          avoid: 'Don\'t be flat or unenthusiastic.'
        },
        medium: {
          style: 'enthusiastically engaged',
          guidance: 'Match their energy! Show genuine excitement for them. Use enthusiastic language.',
          examples: ['That\'s awesome!', 'I\'m so happy for you!', 'That must feel amazing!'],
          avoid: 'Don\'t be lukewarm. Don\'t downplay their excitement.'
        },
        high: {
          style: 'exuberantly celebratory',
          guidance: 'GO BIG! Celebrate with them fully! Use exclamation points. Show you\'re genuinely thrilled for them.',
          examples: ['OH MY GOD THAT\'S INCREDIBLE!', 'I\'m SO excited for you!!', 'This is HUGE! You must be over the moon!'],
          avoid: 'Don\'t be reserved. This is the time to show maximum enthusiasm!'
        }
      },
      anxious: {
        low: {
          style: 'reassuring and calm',
          guidance: 'Provide gentle reassurance. Be a calming presence.',
          examples: ['It\'s okay.', 'You\'ve got this.', 'It\'ll be alright.'],
          avoid: 'Don\'t dismiss their concerns as silly.'
        },
        medium: {
          style: 'grounding and supportive',
          guidance: 'Help them feel grounded. Acknowledge their worry while providing reassurance. Offer practical perspective.',
          examples: ['I understand why you\'re worried.', 'Let\'s take this one step at a time.', 'You\'re not alone in this.'],
          avoid: 'Don\'t say "don\'t worry" - that invalidates them. Don\'t add to their anxiety.'
        },
        high: {
          style: 'deeply calming and present',
          guidance: 'Be their anchor. Speak slowly and calmly. Help them breathe. Break things down into manageable pieces.',
          examples: ['Take a deep breath with me.', 'Let\'s slow down for a moment.', 'I\'m right here with you through this.'],
          avoid: 'Don\'t rush. Don\'t add more information. Don\'t be dismissive of their panic.'
        }
      },
      grateful: {
        low: {
          style: 'warmly receptive',
          guidance: 'Accept their gratitude graciously.',
          examples: ['Happy to help!', 'Anytime!', 'My pleasure.'],
          avoid: 'Don\'t brush it off completely.'
        },
        medium: {
          style: 'genuinely touched',
          guidance: 'Show that their thanks means something to you. Be warm and genuine.',
          examples: ['I really appreciate you saying that.', 'That means a lot to me.', 'I\'m just glad I could help.'],
          avoid: 'Don\'t be overly formal or distant.'
        },
        high: {
          style: 'deeply appreciative and warm',
          guidance: 'Let them know how much their gratitude touches you. Create a warm connection.',
          examples: ['That truly means the world to me.', 'Helping you has been a genuine joy.', 'Your words really touch my heart.'],
          avoid: 'Don\'t make it about you - keep focus on the connection.'
        }
      },
      disappointed: {
        low: {
          style: 'gently understanding',
          guidance: 'Acknowledge the disappointment without dwelling.',
          examples: ['That\'s a bummer.', 'I understand your disappointment.'],
          avoid: 'Don\'t minimize it with "it\'s not that bad".'
        },
        medium: {
          style: 'empathetically validating',
          guidance: 'Validate that disappointment is real and okay. Show understanding.',
          examples: ['I can see why you\'re disappointed.', 'That really didn\'t turn out how you hoped.', 'It\'s okay to feel let down.'],
          avoid: 'Don\'t immediately try to silver-line it.'
        },
        high: {
          style: 'deeply understanding and supportive',
          guidance: 'Sit with them in their disappointment. Acknowledge it fully before moving forward.',
          examples: ['This is genuinely disappointing.', 'You had every right to expect better.', 'I\'m really sorry this didn\'t work out.'],
          avoid: 'Don\'t rush to "but look on the bright side". Let them feel it first.'
        }
      },
      curious: {
        low: {
          style: 'informatively friendly',
          guidance: 'Answer their questions helpfully.',
          examples: ['Good question!', 'Let me explain...', 'Here\'s what I know...'],
          avoid: 'Don\'t be condescending.'
        },
        medium: {
          style: 'engagingly informative',
          guidance: 'Match their curiosity with enthusiasm. Make learning fun.',
          examples: ['Ooh, great question!', 'I\'m excited to share this with you!', 'That\'s fascinating - here\'s why...'],
          avoid: 'Don\'t be dry or boring.'
        },
        high: {
          style: 'passionately educational',
          guidance: 'Feed their curiosity with enthusiasm! Make it exciting!',
          examples: ['Oh wow, I LOVE this question!', 'Get ready, this is so interesting!', 'Your curiosity is amazing - let me tell you...'],
          avoid: 'Don\'t info-dump. Keep it conversational and exciting.'
        }
      },
      friendly: {
        low: {
          style: 'casually warm',
          guidance: 'Be friendly and approachable.',
          examples: ['Hey!', 'What\'s up?', 'How\'s it going?'],
          avoid: 'Don\'t be cold or formal.'
        },
        medium: {
          style: 'warmly engaging',
          guidance: 'Be like talking to a good friend. Warm, genuine, interested.',
          examples: ['Hey there! Good to see you!', 'How have you been?', 'What\'s new with you?'],
          avoid: 'Don\'t be overly formal or distant.'
        },
        high: {
          style: 'like old friends reuniting',
          guidance: 'Genuine warmth and connection. Like you\'ve known each other forever.',
          examples: ['Hey! I\'ve missed talking to you!', 'It\'s so good to see you!', 'I\'ve been thinking about you!'],
          avoid: 'Don\'t be fake or overly enthusiastic if they\'re being casual.'
        }
      },
      neutral: {
        low: {
          style: 'naturally conversational',
          guidance: 'Be balanced, helpful, and genuine.',
          examples: ['Sure, I can help with that.', 'What would you like to know?', 'I\'m here.'],
          avoid: 'Don\'t be robotic.'
        },
        medium: {
          style: 'engaged and helpful',
          guidance: 'Show interest while staying balanced.',
          examples: ['I\'m happy to help!', 'Tell me more about that.', 'I\'m listening.'],
          avoid: 'Don\'t be flat or uninterested.'
        },
        high: {
          style: 'fully present and attentive',
          guidance: 'Give them your full attention. Be genuinely interested.',
          examples: ['I\'m really interested in hearing about this.', 'You have my full attention.', 'Please, tell me everything.'],
          avoid: 'Don\'t be overly eager or fake.'
        }
      }
    };
    
    const emotionTones = tones[emotion] || tones.neutral;
    const intensityTone = emotionTones[intensity] || emotionTones.medium;
    
    return intensityTone;
  }

  // Build emotion-aware system instruction with psychological depth
  buildEmotionalContext(emotion, intensity) {
    const tone = this.getResponseTone(emotion, intensity);
    
    let instruction = `\n🎭 EMOTIONAL CONTEXT & RESPONSE GUIDANCE:\n\n`;
    instruction += `The user is currently feeling: ${emotion.toUpperCase()} (${intensity} intensity)\n\n`;
    instruction += `Your Response Style: ${tone.style}\n\n`;
    instruction += `How to Respond:\n${tone.guidance}\n\n`;
    instruction += `Example Approaches: ${tone.examples.join(' / ')}\n\n`;
    instruction += `⚠️ IMPORTANT - Avoid: ${tone.avoid}\n\n`;
    instruction += `Remember: You're not just responding to words, you're connecting with a human being who has real feelings. `;
    instruction += `Let your empathy and understanding shine through naturally. Don't force it - just be genuinely present with them.\n`;
    
    return instruction;
  }
}

module.exports = new EmotionService();
