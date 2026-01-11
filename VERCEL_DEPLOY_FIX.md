# Quick Vercel Deployment Fix

## Current Status:
✅ Code cloned successfully
⏳ Waiting for build to complete

## If Build Fails, Follow These Steps:

### Deploy Backend and Frontend Separately (Recommended)

#### Step 1: Deploy Backend
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import: `STAN_Chat-bot`
4. **Framework Preset**: Other
5. **Root Directory**: `backend`
6. **Build Command**: (leave empty)
7. **Output Directory**: (leave empty)
8. **Install Command**: `npm install`

**Environment Variables (CRITICAL):**
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/stan-ai
GROQ_API_KEY=gsk_your_groq_api_key_here
NODE_ENV=production
```

9. Click **Deploy**
10. **Save the backend URL**: e.g., `https://your-backend.vercel.app`

#### Step 2: Deploy Frontend
1. Add New Project
2. Import same `STAN_Chat-bot` repo
3. **Framework Preset**: Create React App
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build`
6. **Output Directory**: `build`
7. **Install Command**: `npm install`

**Environment Variables:**
```
REACT_APP_API_URL=https://your-backend.vercel.app
```

8. Click **Deploy**

## Alternative: Fix Monorepo Deployment

If you want to keep deploying together, update the root vercel.json:

1. Delete the current Vercel project
2. Set Root Directory to `/` (empty)
3. Use the vercel.json we created

## Test After Deployment:

1. **Backend Health Check**:
   - Visit: `https://your-backend.vercel.app/health`
   - Should return: `{"status": "ok"}`

2. **Frontend Test**:
   - Visit: `https://your-frontend.vercel.app`
   - Try chatting with the bot

## Common Build Errors & Fixes:

### Error: "No build output found"
**Fix**: Set correct output directory
- Frontend: `build`
- Backend: leave empty

### Error: "Module not found"
**Fix**: Make sure `package.json` is in the root directory you specified

### Error: "Database connection failed"
**Fix**: Add `MONGODB_URI` to environment variables

### Error: "GROQ_API_KEY not defined"
**Fix**: Add `GROQ_API_KEY` to backend environment variables

## Your Current Deployment:

The logs show cloning is successful. If build fails:
- Check the build logs in Vercel dashboard
- Look for specific error messages
- Follow the separate deployment steps above

## Need Help?
Share the complete build logs from Vercel dashboard for specific error diagnosis.
