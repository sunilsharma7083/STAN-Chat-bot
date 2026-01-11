# Vercel Deployment Guide

## Issue Fixed: 404 NOT_FOUND Error

The error was caused by missing Vercel configuration. Now fixed!

## Deployment Options

### Option 1: Deploy Frontend and Backend Separately (Recommended)

#### Deploy Backend:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your repository: `STAN_Chat-bot`
4. **Root Directory**: Set to `backend`
5. **Framework Preset**: Other
6. **Build Command**: Leave empty
7. **Output Directory**: Leave empty
8. **Environment Variables** (IMPORTANT):
   - `MONGODB_URI`: Your MongoDB connection string
   - `GROQ_API_KEY`: Your Groq API key
   - `NODE_ENV`: production
9. Click "Deploy"
10. **Copy the backend URL** (e.g., `https://your-backend.vercel.app`)

#### Deploy Frontend:
1. Go to Vercel Dashboard again
2. Click "Add New" → "Project"
3. Import the same repository
4. **Root Directory**: Set to `frontend`
5. **Framework Preset**: Create React App
6. **Build Command**: `npm run build`
7. **Output Directory**: `build`
8. **Environment Variables**:
   - `REACT_APP_API_URL`: Paste your backend URL from step 10 above
9. Click "Deploy"

### Option 2: Deploy as Monorepo

If you want both in one deployment:

1. Keep the root `vercel.json` file
2. Set **Root Directory**: Leave as root `/`
3. Add Environment Variables for both frontend and backend
4. Deploy

## Environment Variables Setup

### Backend Environment Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stan-ai
GROQ_API_KEY=gsk_your_groq_api_key_here
NODE_ENV=production
PORT=3000
```

### Frontend Environment Variables:
```
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## Post-Deployment Steps

1. **Test Backend**:
   - Visit `https://your-backend.vercel.app/health`
   - Should return: `{"status": "ok", "message": "STAN AI is online"}`

2. **Update Frontend API URL**:
   - Go to frontend Vercel project → Settings → Environment Variables
   - Update `REACT_APP_API_URL` with your backend URL
   - Redeploy frontend

3. **Test Frontend**:
   - Visit your frontend URL
   - Try chatting with the bot

## Troubleshooting

### 404 Error:
- ✅ Fixed with `vercel.json` configuration
- Make sure `module.exports = app;` is in `server.js`

### CORS Error:
- Add your frontend URL to CORS whitelist in `backend/src/server.js`

### Database Connection Error:
- Verify `MONGODB_URI` environment variable
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### API Key Error:
- Verify `GROQ_API_KEY` is set correctly in backend environment variables

## Files Changed:
- ✅ `vercel.json` (root) - Monorepo config
- ✅ `backend/vercel.json` - Backend-only config
- ✅ `backend/src/server.js` - Added `module.exports = app`
- ✅ `frontend/package.json` - Added `"homepage": "."`

## Quick Deploy Commands:

```bash
# Commit changes
git add .
git commit -m "fix: Add Vercel deployment configuration"
git push origin master

# Then deploy via Vercel dashboard or CLI
vercel --prod
```

## Success Indicators:
✅ Backend health check returns 200 OK
✅ Frontend loads without errors
✅ Chat functionality works
✅ Conversation history persists
✅ Emoji picker works

Your chatbot should now be live! 🚀
