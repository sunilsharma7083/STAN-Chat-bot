# 🚀 Quick Reference Guide - STAN AI

## ⚡ Quick Commands

### Start Everything
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### Stop Everything
```bash
# Kill backend
pkill -f nodemon

# Kill frontend
lsof -ti:3001 | xargs kill
```

---

## 📡 API Quick Reference

### Send Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","message":"Hello!"}'
```

### Get Memory
```bash
curl http://localhost:3000/api/memory/user_123
```

### Get Insights
```bash
curl http://localhost:3000/api/insights/user_123
```

---

## 🗄️ Database Quick Queries

### MongoDB Shell
```bash
mongosh "mongodb+srv://cluster0.gaz0jns.mongodb.net/stan-ai" --username mrsunilkumarsharma7083_db_user
```

### Find User
```javascript
db.users.findOne({ userId: "user_cycw0tbwn" })
```

### Count Users
```javascript
db.users.countDocuments()
```

### Recent Conversations
```javascript
db.conversations.find().sort({ createdAt: -1 }).limit(5)
```

---

## 🐛 Quick Fixes

### Port Already in Use
```bash
# Backend (3000)
kill $(lsof -ti:3000)

# Frontend (3001)
kill $(lsof -ti:3001)
```

### Reset Database User
```bash
cd backend
node cleanup-memory.js
```

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 File Locations

| Item | Location |
|------|----------|
| Backend Entry | `backend/src/server.js` |
| Frontend Entry | `frontend/src/index.js` |
| AI Service | `backend/src/services/aiService.js` |
| Memory Service | `backend/src/services/memoryService.js` |
| System Prompt | `backend/src/utils/promptBuilder.js` |
| Backend .env | `backend/.env` |
| Frontend .env | `frontend/.env` |

---

## 🔑 Environment Variables

### Backend
```env
PORT=3000
MONGODB_URI=your_mongodb_uri_here
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:3000
PORT=3001
```

---

## 🎯 Testing Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] MongoDB connection successful
- [ ] Groq API responding
- [ ] Memory extraction working
- [ ] Emotion detection working
- [ ] UI updating in real-time

---

## 📈 Monitoring

### Check Backend Logs
```bash
# Backend should show:
✅ MongoDB Connected
🤖 STAN AI SERVER running on port 3000
```

### Check API Health
```bash
curl http://localhost:3000/api/health
```

### Monitor Groq Usage
- Dashboard: https://console.groq.com
- Daily Limit: 14,400 requests

---

## 🔧 Common Tasks

### Add New Emotion
Edit: `backend/src/services/emotionService.js`
```javascript
const emotionKeywords = {
  yourEmotion: ['keyword1', 'keyword2']
};
```

### Change Bot Name
Edit: `backend/src/utils/promptBuilder.js`
```javascript
You are YourName, a friendly AI chatbot...
```

### Modify Memory Extraction
Edit: `backend/src/services/memoryService.js`
```javascript
const nameMatch = lowerMessage.match(/your_pattern/i);
```

---

## 📞 Quick Support

| Issue | Solution |
|-------|----------|
| Backend crash | Check logs, restart with `npm run dev` |
| Frontend blank | Check browser console, verify API URL |
| Memory not saving | Check MongoDB connection, verify user ID |
| API errors | Check Groq API key, verify quota |

---

## 🎓 Learning Resources

- [Node.js Docs](https://nodejs.org/docs)
- [React Docs](https://react.dev)
- [MongoDB Manual](https://docs.mongodb.com)
- [Groq Documentation](https://console.groq.com/docs)
- [Express.js Guide](https://expressjs.com)

---

## 📚 Documentation Links

- [Main README](../README.md)
- [Backend Docs](./backend/README.md)
- [Frontend Docs](./frontend/README.md)
- [Database Docs](./database/README.md)
- [API Docs](./api/README.md)

---

Last Updated: January 10, 2026
