import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  // Send chat message
  async sendMessage(userId, message, sessionId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        userId,
        message,
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
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
