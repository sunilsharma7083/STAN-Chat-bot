import axios from 'axios';

// Detect if running on mobile/remote device
const isLocalhost = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '';
};

// Use deployed backend if not on localhost, or env variable if set
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     (isLocalhost() ? 'http://localhost:3000' : 'https://stan-chatbot-backend.onrender.com');

console.log('🌐 API Base URL:', API_BASE_URL);

class ApiService {
  // Send chat message
  async sendMessage(userId, message, sessionId) {
    try {
      console.log('📤 Sending message:', { userId, message, sessionId });
      console.log('🌐 API URL:', `${API_BASE_URL}/chat`);
      
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        userId,
        message,
        sessionId
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - server is slow or unreachable');
      } else if (error.response?.status === 500) {
        throw new Error('Server error - please try again');
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error('Network error - check your connection or backend URL');
      }
      
      throw error;
    }
  }

  // Get user memory
  async getUserMemory(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/memory/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get conversation history
  async getConversationHistory(userId, sessionId, limit = 20) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/history/${userId}/${sessionId}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get insights
  async getInsights(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/insights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Delete a specific message
  async deleteMessage(userId, sessionId, messageId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/history/${userId}/${sessionId}/${messageId}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Clear conversation history
  async clearHistory(userId, sessionId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/history/${userId}/${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export default new ApiService();
