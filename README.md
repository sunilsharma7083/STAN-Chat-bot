# 🤖 STAN AI - Intelligent Conversational Chatbot

<div align="center">

![STAN AI](https://img.shields.io/badge/STAN-AI%20Chatbot-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![LLaMA](https://img.shields.io/badge/LLaMA-3.3--70B-purple?style=for-the-badge)

**A sophisticated AI chatbot with persistent memory, emotional intelligence, and human-like conversations**

[Live Demo](#) • [Documentation](#setup-instructions) • [Report Bug](#)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Memory Strategy](#-memory-strategy)
- [Setup Instructions](#-setup-instructions)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Limitations & Future Improvements](#-limitations--future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**STAN AI** is an advanced conversational AI chatbot that maintains contextual awareness across conversations. Unlike traditional chatbots that forget previous interactions, STAN remembers user preferences, past conversations, and builds a comprehensive user profile over time.

### What Makes STAN Unique?

- **🧠 Persistent Memory**: Remembers user details, preferences, and conversation history across sessions
- **😊 Emotional Intelligence**: Detects and responds appropriately to user emotions
- **💬 Human-like Responses**: Powered by LLaMA 3.3 70B model for natural conversations
- **📊 Conversation Analytics**: Provides insights into chat patterns and topics
- **🎨 Modern UI/UX**: Clean interface with emoji support and smooth animations

### Use Cases

- Personal AI assistant that learns about you over time
- Customer support bot with memory of previous interactions
- Educational companion that tracks learning progress
- Mental health support with emotional awareness

---

## ✨ Key Features

### 🤖 **AI-Powered Conversations**
- Utilizes **Groq API** with **LLaMA 3.3 70B Versatile** model
- Context-aware responses based on conversation history
- Multi-turn dialogue support with coherent context retention

### 🧠 **Advanced Memory System**
- **Profile Building**: Automatically extracts and stores user information (name, preferences, interests)
- **Conversation History**: Complete chat logs stored in MongoDB
- **Smart Information Extraction**: Identifies key details from natural conversation
- **Session Management**: Maintains context across multiple chat sessions

### 😊 **Emotion Detection & Response**
- Real-time sentiment analysis of user messages
- Adaptive tone based on detected emotions (happy, sad, angry, neutral)
- Empathetic responses to emotional states

### � **Data Persistence**
- MongoDB Atlas for scalable cloud storage
- Automatic save on every message
- History loads seamlessly on page refresh
- Delete individual messages or clear entire chat

### 🎨 **Modern User Interface**
- Clean, responsive React-based frontend
- Emoji picker for expressive communication
- Real-time typing indicators
- Smooth animations and transitions
- Mobile-friendly design

### 📊 **Conversation Insights**
- Chat statistics and analytics
- Topic analysis
- Emotion trends over time
- Message frequency patterns

---

## �️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| JavaScript (ES6+) | - | Programming Language |
| CSS3 | - | Styling & Animations |
| emoji-picker-react | 4.16.1 | Emoji Selection |
| Axios | 1.6.5 | HTTP Client |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime Environment |
| Express.js | 4.21.2 | Web Framework |
| MongoDB | 8.9.3 | Database (NoSQL) |
| Mongoose | 8.9.3 | ODM for MongoDB |
| Groq SDK | 0.37.0 | LLM Integration |

### **AI/ML Models**
| Model | Provider | Purpose |
|-------|----------|---------|
| LLaMA 3.3 70B Versatile | Groq | Primary conversation model |
| Gemini (Optional) | Google | Backup AI model |

### **Deployment & DevOps**
| Service | Purpose |
|---------|---------|
| Render | Backend hosting |
| Vercel | Frontend hosting (optional) |
| MongoDB Atlas | Cloud database |
| Git/GitHub | Version control |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│              (React Frontend - Port 3001)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    EXPRESS.JS SERVER                         │
│                  (Node.js - Port 3000)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Chat       │  │   Memory     │  │   Emotion    │     │
│  │ Controller   │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Prompt       │  │   AI         │  │  Database    │     │
│  │ Builder      │  │  Service     │  │   Config     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────┬──────────────────────────────┬───────────────┘
              │                              │
              │                              │
        ┌─────▼─────┐                  ┌────▼─────┐
        │   GROQ    │                  │ MongoDB  │
        │    API    │                  │  Atlas   │
        │ (LLaMA)   │                  │ Database │
        └───────────┘                  └──────────┘
```

### Request Flow

1. **User Input** → Frontend captures message and sends to backend
2. **API Route** → Express server receives POST `/api/chat`
3. **Memory Retrieval** → Fetches user profile and conversation history from MongoDB
4. **Context Building** → Combines user profile + history + new message
5. **Emotion Detection** → Analyzes sentiment of user message
6. **AI Processing** → Sends enriched prompt to Groq API (LLaMA model)
7. **Response Generation** → LLaMA generates contextual response
8. **Memory Update** → Extracts new information and updates user profile
9. **Database Save** → Stores message and response in MongoDB
10. **Response Delivery** → Sends AI response back to frontend

### Data Flow Diagram

```
User Message
    │
    ▼
┌─────────────────────┐
│  Message Input      │
│  + Emoji Selection  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  API Call (POST)    │
│  /api/chat          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────┐
│  Load User Profile  │────→│   MongoDB    │
│  + Chat History     │←────│   Database   │
└──────────┬──────────┘     └──────────────┘
           │
           ▼
┌─────────────────────┐
│  Build Context      │
│  Detect Emotion     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────┐
│  Generate Prompt    │────→│  Groq API    │
│  Send to LLaMA      │     │  (LLaMA 3.3) │
└──────────┬──────────┘     └──────────────┘
           │                        │
           │                        │
           ▼                        │
┌─────────────────────┐            │
│  Extract Info       │            │
│  Update Profile     │            │
└──────────┬──────────┘            │
           │                        │
           ▼                        │
┌─────────────────────┐            │
│  Save to Database   │            │
└──────────┬──────────┘            │
           │                        │
           │         AI Response    │
           │◄───────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Return Response    │
│  to Frontend        │
└──────────┬──────────┘
           │
           ▼
     Display to User
```

---

## 🧠 Memory Strategy

STAN AI implements a sophisticated **multi-layer memory system** that enables true conversational continuity:

### 1. **Short-Term Memory (Session)**
- **Storage**: In-memory during active session
- **Lifespan**: Current conversation only
- **Purpose**: Immediate context for ongoing dialogue
- **Data**: Last 10-15 messages for context window

### 2. **Long-Term Memory (Persistent)**
- **Storage**: MongoDB database
- **Lifespan**: Permanent (until manually cleared)
- **Purpose**: User profile and complete history
- **Data**: All conversations, extracted information, preferences

### 3. **Profile-Based Memory**

```javascript
User Profile Structure:
{
  userId: "unique_session_id",
  profile: {
    name: "John Doe",
    interests: ["AI", "programming", "music"],
    preferences: {
      favoriteColor: "blue",
      hobbies: ["reading", "gaming"]
    },
    occupation: "Software Engineer",
    location: "New York"
  },
  conversations: [
    {
      sessionId: "session_123",
      messages: [
        { role: "user", content: "...", timestamp: "..." },
        { role: "assistant", content: "...", timestamp: "..." }
      ],
      emotion: "happy",
      topics: ["work", "weekend plans"]
    }
  ]
}
```

### 4. **Information Extraction Pipeline**

```
User Message
    │
    ▼
┌──────────────────┐
│ NLP Processing   │  → Identify named entities (name, location, etc.)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Pattern Matching │  → "My name is X", "I like Y", "I work at Z"
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Validation       │  → Remove false positives (common words)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update Profile   │  → Merge with existing profile
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Save to MongoDB  │  → Persist for future sessions
└──────────────────┘
```

### 5. **Memory Retrieval Strategy**

When generating a response:
1. **Load User Profile** from database
2. **Fetch Recent History** (last N messages)
3. **Build Contextual Prompt**:
   ```
   System: You are STAN AI. Here's what you know about the user:
   - Name: [user.profile.name]
   - Interests: [user.profile.interests]
   - Previous conversations: [summary]
   
   User: [current message]
   
   Respond naturally, referencing past conversations when relevant.
   ```

### 6. **Memory Update Triggers**

- **Every Message**: Scan for new information
- **Session End**: Summarize key topics
- **Profile Changes**: Update immediately
- **Emotion Shifts**: Log emotional state changes

---

## 🚀 Setup Instructions

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Groq API Key** - [Get it here](https://console.groq.com/)
- **Git** - [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/sunilsharma7083/STAN-Chat-bot.git
cd STAN-Chat-bot
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env` with your credentials:**

```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key (optional)
NODE_ENV=development
```

**Start the backend server:**

```bash
node src/server.js
```

✅ Backend should be running at: `http://localhost:3000`

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Start the frontend
PORT=3001 npm start
```

✅ Frontend should open automatically at: `http://localhost:3001`

### 4. Verify Installation

- **Backend Health Check**: Visit `http://localhost:3000/health`
  - Should return: `{"status":"ok","message":"STAN AI is online"}`

- **Frontend**: Open `http://localhost:3001`
  - You should see the chat interface
  - Try sending a message!

---

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create Account**: https://render.com/
2. **New Web Service** → Connect GitHub repository
3. **Configuration**:
   ```
   Name: stan-chatbot-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: node src/server.js
   ```
4. **Environment Variables**: Add all variables from `.env`
5. **Deploy** → Copy the live URL

### Frontend Deployment (Vercel/Render)

1. **Create Project** in Vercel/Render
2. **Configuration**:
   ```
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```
3. **Environment Variable**:
   ```
   REACT_APP_API_URL=your_backend_url
   ```
4. **Deploy**

### MongoDB Atlas Setup

1. **Create Cluster** at https://cloud.mongodb.com/
2. **Network Access** → Allow access from anywhere (0.0.0.0/0)
3. **Database Access** → Create user with password
4. **Connect** → Copy connection string
5. **Update** `MONGODB_URI` in environment variables

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:3000
Production: https://your-backend.onrender.com
```

### Endpoints

#### 1. **Send Message**
```http
POST /api/chat
```

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "userId": "user_123",
  "sessionId": "session_456"
}
```

**Response:**
```json
{
  "response": "I'm doing great! How can I help you today?",
  "emotion": "happy",
  "timestamp": "2026-01-11T10:30:00.000Z"
}
```

#### 2. **Get User Memory**
```http
GET /api/memory/:userId
```

**Response:**
```json
{
  "userId": "user_123",
  "profile": {
    "name": "John Doe",
    "interests": ["AI", "coding"],
    "preferences": {}
  },
  "totalMessages": 45
}
```

#### 3. **Get Conversation History**
```http
GET /api/history/:userId/:sessionId
```

**Response:**
```json
{
  "sessionId": "session_456",
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "..."
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help?",
      "timestamp": "..."
    }
  ]
}
```

#### 4. **Clear Chat History**
```http
DELETE /api/history/:userId/:sessionId
```

#### 5. **Health Check**
```http
GET /health
```

---

## ⚠️ Limitations & Future Improvements

### Current Limitations

1. **Memory Capacity**
   - Limited to MongoDB storage constraints
   - No automatic cleanup of old conversations
   - Large conversation histories may slow response time

2. **Language Support**
   - Currently optimized for English only
   - Limited multilingual capabilities

3. **Context Window**
   - LLaMA model has token limit (~8K tokens)
   - Very long conversations may lose early context

4. **Emotion Detection**
   - Basic keyword-based sentiment analysis
   - May not catch nuanced emotions or sarcasm

5. **Response Time**
   - Depends on Groq API availability
   - Cold starts on free tier (Render) take ~30 seconds

### Planned Improvements

#### 🔜 Short-term (1-3 months)

- [ ] **Voice Input/Output**: Add speech recognition and text-to-speech
- [ ] **Multi-language Support**: Integrate translation API
- [ ] **Image Understanding**: Add vision capabilities for image analysis
- [ ] **Better Emotion Detection**: Use ML model for sentiment analysis
- [ ] **User Authentication**: Add login system for secure profiles
- [ ] **Export Chat**: Allow users to download conversation history

#### 🚀 Long-term (3-6 months)

- [ ] **Mobile App**: React Native version for iOS/Android
- [ ] **RAG System**: Integrate vector database for document Q&A
- [ ] **Custom Training**: Fine-tune model on specific use cases
- [ ] **Multi-modal**: Support for images, PDFs, and documents
- [ ] **Collaboration**: Multi-user conversations and shared chats
- [ ] **Analytics Dashboard**: Admin panel for usage statistics
- [ ] **WebSocket Support**: Real-time streaming responses
- [ ] **Plugin System**: Allow third-party integrations

#### 💡 Advanced Features

- **Memory Summarization**: Automatic compression of long conversations
- **Proactive Suggestions**: AI suggests topics based on user interests
- **Personality Customization**: Users can adjust AI tone and style
- **Context Switching**: Handle multiple conversation threads
- **Knowledge Base Integration**: Connect to external data sources

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sunil Kumar Sharma**
- GitHub: [@sunilsharma7083](https://github.com/sunilsharma7083)
- Repository: [STAN-Chat-bot](https://github.com/sunilsharma7083/STAN-Chat-bot)

---

## 🙏 Acknowledgments

- **Groq** for providing fast LLaMA inference API
- **MongoDB Atlas** for scalable database hosting
- **React** team for amazing frontend framework
- **Open source community** for inspiration and support

---

## 📞 Support

If you encounter any issues or have questions:

1. Check [existing issues](https://github.com/sunilsharma7083/STAN-Chat-bot/issues)
2. Create a [new issue](https://github.com/sunilsharma7083/STAN-Chat-bot/issues/new)
3. Read the [documentation](#setup-instructions)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ and ☕ by Sunil Kumar Sharma

</div>

4. Start the backend server:
```bash
node src/server.js
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
PORT=3001 npm start
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## API Endpoints

- `POST /api/chat` - Send message and get AI response
- `GET /api/memory/:userId` - Get user's memory/profile
- `GET /api/history/:userId/:sessionId` - Get conversation history
- `DELETE /api/history/:userId/:sessionId` - Clear all chat history

## Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/stan-ai
GROQ_API_KEY=your_groq_api_key_here
```

## Usage

1. Open the app in your browser
2. Start chatting with the AI
3. Use the emoji button (😊) to add emojis
4. Your conversation history is automatically saved
5. Use "Clear Chat" button to reset conversation

## License

MIT License
website:- https://stan-chat-bot-hgsg-od0wm6h4m.vercel.app/
