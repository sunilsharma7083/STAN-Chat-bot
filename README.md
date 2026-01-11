# Stan AI Chatbot 🤖

A modern AI chatbot with conversation memory, emoji support, and persistent chat history.

## Features ✨

- 🤖 **AI-Powered Conversations** - Uses Groq API with LLaMA model
- 💾 **Conversation History** - Automatically saves and loads chat history
- 😊 **Emoji Picker** - Easy emoji selection while typing
- 🗑️ **Clear Chat** - Clear conversation history with confirmation
- 🧠 **Memory System** - Remembers user preferences and past conversations
- 📊 **Conversation Insights** - View conversation analytics

## Tech Stack

### Backend
- Node.js + Express
- MongoDB (Local or Atlas)
- Groq API (LLaMA 3.3 70B)

### Frontend
- React 18
- emoji-picker-react
- Modern CSS with animations

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or Atlas account)
- Groq API key ([Get it here](https://console.groq.com))

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri_here
GROQ_API_KEY=your_groq_api_key_here
```

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
