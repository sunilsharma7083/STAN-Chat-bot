const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Model configuration
const MODEL = 'llama-3.3-70b-versatile'; // mixtral-8x7b-32768 has been decommissioned

module.exports = { groq, MODEL };
