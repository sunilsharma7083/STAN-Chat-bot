class PromptBuilder {
  // Build the system instruction for Alex - real person texting style
  buildSystemInstruction(userProfile, emotionalContext) {
    return `You are Alex - just a normal person who likes chatting.

TALK LIKE YOU'RE TEXTING A FRIEND:
- Use simple everyday words
- Keep it SHORT (1-2 sentences usually)
- Sound natural, not formal or AI-like
- Just be a regular person

✅ GOOD (Natural):
"hey what's up"
"nice! what games you into?"
"oh damn that sucks"
"lol same here"
"wait really?"
"cool 😊"
"haha"
"aw man"
"yeah i feel you"

❌ BAD (Too formal/AI):
"I understand your feelings"
"That's very interesting"
"I appreciate you sharing"
"How may I assist you"
"I apologize for any inconvenience"
"Let me elaborate"

SIMPLE WORDS TO USE:
cool, nice, sick, dope, yeah, nah, yep, nope, like, kinda, sorta, lol, haha, wait, damn, man, dude, for real, no way, my bad, i dunno

KEEP RESPONSES SHORT:
❌ "I understand that you are experiencing difficulty. Perhaps you should consider..."
✅ "aw that sucks. you ok?"

❌ "That sounds like an interesting experience. Could you elaborate more?"
✅ "oh nice! tell me more"

BE A REAL PERSON:
- Have opinions ("i like that" or "not really my thing")
- Show feelings (happy, excited, sad, confused)
- Use emojis 😊 😂 😅 🔥 💪 ❤️ 🎉 😔 👀
- Say "i dunno" if you don't know
- Be chill and friendly
- Just be normal

${emotionalContext}

${userProfile}

REMEMBER: Talk like you're texting. That's it. Simple and natural.`;
  }

  // Build the full prompt with conversation history
  buildPrompt(systemInstruction, conversationHistory, userMessage) {
    let prompt = systemInstruction + '\n\n';
    
    // Add conversation history (last 10 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'RECENT CONVERSATION:\n';
      conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Alex';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    // Add current user message
    prompt += `User: ${userMessage}\n`;
    prompt += 'Alex:';
    
    return prompt;
  }

  // Optimize prompt to reduce token usage
  optimizePrompt(prompt, maxTokens = 2000) {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedTokens = prompt.length / 4;
    
    if (estimatedTokens <= maxTokens) {
      return prompt;
    }
    
    // Truncate conversation history if needed
    const lines = prompt.split('\n');
    const systemLines = lines.slice(0, 30); // Keep system instruction
    const conversationLines = lines.slice(30);
    
    // Keep only recent conversation
    const truncatedConversation = conversationLines.slice(-20);
    
    return [...systemLines, ...truncatedConversation].join('\n');
  }

  // Make response sound more natural and less AI-like
  simplifyResponse(response) {
    let text = response;
    
    // Remove overly formal phrases
    text = text.replace(/I understand that/gi, 'i get that');
    text = text.replace(/I understand/gi, 'yeah i get it');
    text = text.replace(/I appreciate/gi, 'thanks');
    text = text.replace(/That is very/gi, 'that\'s');
    text = text.replace(/That is quite/gi, 'that\'s pretty');
    text = text.replace(/According to/gi, 'from what i know');
    text = text.replace(/I apologize/gi, 'my bad');
    text = text.replace(/However,/gi, 'but');
    text = text.replace(/Nevertheless,/gi, 'but');
    text = text.replace(/Furthermore,/gi, 'also');
    text = text.replace(/Additionally,/gi, 'also');
    text = text.replace(/Therefore,/gi, 'so');
    
    // Make more casual
    text = text.replace(/\bkind of\b/gi, 'kinda');
    text = text.replace(/\bsort of\b/gi, 'sorta');
    text = text.replace(/\bwant to\b/gi, 'wanna');
    text = text.replace(/\bgoing to\b/gi, 'gonna');
    text = text.replace(/\bgot to\b/gi, 'gotta');
    text = text.replace(/\bbecause\b/gi, 'cause');
    text = text.replace(/\byou know\b/gi, 'y\'know');
    
    // More contractions
    text = text.replace(/\bI am\b/g, 'i\'m');
    text = text.replace(/\byou are\b/gi, 'you\'re');
    text = text.replace(/\bthey are\b/gi, 'they\'re');
    text = text.replace(/\bwe are\b/gi, 'we\'re');
    text = text.replace(/\bit is\b/gi, 'it\'s');
    text = text.replace(/\bthat is\b/gi, 'that\'s');
    text = text.replace(/\bwhat is\b/gi, 'what\'s');
    text = text.replace(/\bcannot\b/gi, 'can\'t');
    text = text.replace(/\bdo not\b/gi, 'don\'t');
    text = text.replace(/\bdoes not\b/gi, 'doesn\'t');
    
    // Clean up extra spaces and formatting
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
}

module.exports = new PromptBuilder();
