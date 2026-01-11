# Backend Documentation - STAN AI

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── groq.js              # Groq AI client
│   ├── controllers/
│   │   ├── chatController.js    # Chat endpoint logic
│   │   ├── memoryController.js  # Memory endpoints
│   │   └── insightsController.js # Insights endpoints
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Conversation.js      # Conversation schema
│   ├── routes/
│   │   ├── chat.js              # Chat routes
│   │   ├── memory.js            # Memory routes
│   │   └── insights.js          # Insights routes
│   ├── services/
│   │   ├── aiService.js         # Main AI orchestration
│   │   ├── emotionService.js    # Emotion detection
│   │   ├── memoryService.js     # Memory management
│   │   └── conversationService.js # Conversation tracking
│   ├── utils/
│   │   └── promptBuilder.js     # System prompt builder
│   └── server.js                # Express server entry point
├── cleanup-memory.js            # Database cleanup script
├── .env                         # Environment variables
├── .env.example                 # Environment template
└── package.json
```

---

## 🔧 Core Services

### 1. AI Service (`aiService.js`)

**Purpose**: Main orchestrator for AI responses

**Key Functions**:
```javascript
async generateResponse(userId, userMessage)
```

**Flow**:
1. Detect emotion from user message
2. Fetch user memory from database
3. Build context-aware system prompt
4. Call Groq API with llama-3.3-70b-versatile model
5. Save conversation to database
6. Update user memory
7. Return AI response

**Configuration**:
- Model: `llama-3.3-70b-versatile`
- Temperature: `0.7`
- Max Tokens: `1024`

---

### 2. Emotion Service (`emotionService.js`)

**Purpose**: Detect user emotions from text

**Method**: Local pattern-based detection

**Supported Emotions**:
```javascript
{
  sad: ['sad', 'depressed', 'unhappy', 'down', 'miserable'],
  angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated'],
  excited: ['excited', 'thrilled', 'amazing', 'awesome', 'yay'],
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed'],
  friendly: ['hi', 'hello', 'hey', 'thanks', 'thank you'],
  confused: ['confused', 'don\'t understand', 'what', 'huh'],
  grateful: ['grateful', 'appreciate', 'thankful'],
  disappointed: ['disappointed', 'let down', 'failed']
}
```

**Returns**:
```javascript
{
  emotion: 'friendly',
  intensity: 'medium',
  confidence: 0.8,
  method: 'local'
}
```

---

### 3. Memory Service (`memoryService.js`)

**Purpose**: Extract and manage user information

#### Key Functions

##### `extractInformation(message)`
Extracts user details from conversation:

**Patterns**:
- **Name**: `/(?:my name is|i'm|i am|call me) ([a-z]{3,})/i`
  - Examples: "My name is Sunil", "I'm Alex", "Call me John"
  - Filters: Excludes words like 'also', 'feel', 'sad', 'so', etc.

- **Location**: `/(?:live in|from|located in) ([a-z\s]+?)(?:\.|,|$)/i`
  - Examples: "I live in Delhi", "I'm from Mumbai"

- **Favorite Color**: `/(?:favorite color|fav color|like) (?:is )?(\w+)/i`
  - Examples: "My favorite color is blue"
  - Supported: red, blue, green, yellow, purple, pink, black, white, orange

- **Interests**: Keyword matching
  - Keywords: anime, coding, music, gaming, sports, reading, movies, travel, art, photography

**Returns**:
```javascript
{
  name: 'Sunil',
  location: 'Delhi',
  favoriteColor: 'Blue',
  interests: ['Coding', 'Music'],
  facts: [
    "User's name is Sunil",
    "Lives in Delhi",
    "Interested in coding"
  ],
  isCorrection: false  // true if user is correcting wrong info
}
```

##### `updateUserProfile(userId, extracted)`
Updates user profile with new information:
- Stores name, location, favorite color
- Adds facts to short-term memory
- Adds interests to interest list
- **Special**: If `isCorrection` is true, clears old conflicting facts

##### `getMemoryContext(userId)`
Builds context string for AI prompt:
```javascript
"What you remember about this user:
- Name: Sunil
- Location: Delhi
- Recent facts: Interested in coding, Likes music
- Conversation count: 6 chats"
```

---

### 4. Prompt Builder (`promptBuilder.js`)

**Purpose**: Creates system instructions for AI

**Function**: `buildSystemInstruction(emotion, memoryContext)`

**System Prompt Structure**:
```
You are Alex, a friendly AI chatbot.

MEMORY RULES:
- Never assume personal facts about the user
- If memory has conflicting information: acknowledge uncertainty calmly
- When user corrects you: accept naturally, apologize once, move forward
- Treat memory like a human brain - humans can forget, humans clarify

EMOTION: [detected emotion with guidance]

CONVERSATION STYLE:
- Keep responses 2-4 sentences
- Use casual language
- Be warm and authentic
- Match the user's energy

[User's memory context]
```

---

## 🗄️ Database Models

### User Model (`User.js`)

```javascript
{
  userId: String,        // Unique user identifier
  profile: {
    name: String,
    favoriteColor: String,
    location: String,
    preferredTone: String
  },
  memory: {
    shortTermFacts: [String],    // Recent conversation facts
    longTermMemories: [String],  // Important persistent info
    interests: [String]          // User interests
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Model (`Conversation.js`)

```javascript
{
  userId: String,
  messages: [{
    role: String,        // 'user' or 'assistant'
    content: String,
    timestamp: Date,
    emotion: String      // Detected emotion (if user message)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Configuration

### Groq AI Client (`groq.js`)

```javascript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile';

export { groq, MODEL };
```

**Model Details**:
- Name: `llama-3.3-70b-versatile`
- Provider: Groq
- Context Window: 32,768 tokens
- Free Tier: 14,400 requests/day
- Speed: ~500 tokens/second

---

## 🚀 Server Setup (`server.js`)

```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/insights', insightsRoutes);

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 STAN AI SERVER running on port ${PORT}`);
});
```

---

## 🔐 Environment Variables

Create `.env` file in backend folder:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=your_mongodb_uri_here

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# CORS (if needed)
ALLOWED_ORIGINS=http://localhost:3001
```

---

## 🛠️ Development Commands

### Start development server
```bash
npm run dev
```

### Start production server
```bash
npm start
```

### Clean up incorrect memory data
```bash
node cleanup-memory.js
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
lsof -ti:3000
kill $(lsof -ti:3000)
# Or kill all nodemon processes
pkill -f nodemon
```

### MongoDB connection issues
1. Check MongoDB URI in `.env`
2. Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for development)
3. Check MongoDB cluster status

### Groq API errors
1. Verify API key is correct
2. Check daily quota (14,400 requests/day)
3. Ensure model name is correct: `llama-3.3-70b-versatile`

### Backend crashes or restarts
1. Check for syntax errors in recent changes
2. Remove emoji characters from JavaScript files (can cause issues)
3. Check nodemon logs for error details

---

## 📊 Performance Tips

1. **Reduce API Calls**: Cache responses when appropriate
2. **Optimize Memory Queries**: Use indexes on userId fields
3. **Limit Context Size**: Keep conversation history manageable
4. **Monitor Groq Usage**: Track daily request count

---

## 🔄 Recent Changes

### v1.2 (Current)
- ✅ Improved name extraction (filters false positives)
- ✅ Enhanced memory conflict handling
- ✅ Added correction detection ("no my name is X")
- ✅ Created cleanup script for bad data
- ✅ Switched to llama-3.3-70b-versatile model

### v1.1
- ✅ Fixed decommissioned model issue (mixtral-8x7b-32768)
- ✅ Removed emoji syntax errors
- ✅ Simplified emotion detection
- ✅ Improved system prompt

### v1.0
- ✅ Initial release with Groq integration
- ✅ Basic memory system
- ✅ Emotion detection
- ✅ MongoDB integration

---

## 📝 Code Examples

### Example: Calling AI Service

```javascript
const aiService = require('./services/aiService');

const response = await aiService.generateResponse(
  'user_123',
  'Hello! My name is Sunil and I love coding'
);

console.log(response);
// Output: "Hey Sunil! Nice to meet you 😊 Coding is awesome..."
```

### Example: Manual Memory Update

```javascript
const memoryService = require('./services/memoryService');

await memoryService.updateUserProfile('user_123', {
  name: 'Sunil',
  location: 'Delhi',
  interests: ['Coding', 'Music'],
  facts: ['User is a developer']
});
```

---

## 👨‍💻 Development Notes

- Always test name extraction with edge cases
- Monitor Groq API usage to avoid quota limits
- Keep system prompts updated for better responses
- Regular database cleanup recommended
- Use nodemon for auto-restart during development

---

Last Updated: January 10, 2026
