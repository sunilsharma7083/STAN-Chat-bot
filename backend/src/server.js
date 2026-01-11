require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const chatController = require('./controllers/chatController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'STAN AI is online',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.post('/api/chat', chatController.sendMessage.bind(chatController));
app.post('/chat', chatController.sendMessage.bind(chatController)); // ✅ Added this for frontend
app.get('/api/memory/:userId', chatController.getUserMemory.bind(chatController));
app.get('/memory/:userId', chatController.getUserMemory.bind(chatController)); // ✅ Added this
app.put('/api/memory/:userId', chatController.updateUserProfile.bind(chatController));
app.get('/api/history/:userId/:sessionId', chatController.getConversationHistory.bind(chatController));
app.delete('/api/history/:userId/:sessionId/:messageId', chatController.deleteMessage.bind(chatController)); // ✅ Delete single message
app.delete('/api/history/:userId/:sessionId', chatController.clearHistory.bind(chatController)); // ✅ Clear all history
app.delete('/history/:userId/:sessionId/:messageId', chatController.deleteMessage.bind(chatController)); // ✅ No /api prefix
app.delete('/history/:userId/:sessionId', chatController.clearHistory.bind(chatController)); // ✅ No /api prefix
app.get('/api/insights/:userId', chatController.getConversationInsights.bind(chatController));
app.get('/insights/:userId', chatController.getConversationInsights.bind(chatController)); // ✅ Added this

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to STAN AI API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat',
      memory: 'GET /api/memory/:userId',
      updateMemory: 'PUT /api/memory/:userId',
      history: 'GET /api/history/:userId/:sessionId',
      insights: 'GET /api/insights/:userId'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║         🤖 STAN AI SERVER             ║
║                                        ║
║  Status: ✅ Online                    ║
║  Port: ${PORT}                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                        ║
║  API: http://localhost:${PORT}         ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down STAN AI gracefully...');
  process.exit(0);
});

startServer();

// Export for Vercel serverless
module.exports = app;
