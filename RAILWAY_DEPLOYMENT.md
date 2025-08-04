# Railway Deployment Guide

## 🚀 **Simple Railway Deployment**

### **Step 1: Deploy Frontend**

1. **Go to Railway**: [railway.app](https://railway.app)
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select Repository**: `Ai_social_platform`
4. **Railway will automatically deploy the frontend**

### **Step 2: Add Environment Variables**

In your Railway project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://iwemxnniterxwqzdrqka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZW14bm5pdGVyeHdxemRycWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzgwMDAsImV4cCI6MjA2ODA1NDAwMH0.xa50m2oeq7efKQH-HBcf-aQSb6En5ueN-a1M1hS42_0
```

### **Step 3: Create ML Server Service**

1. **Click "New Service"** in your Railway project
2. **Choose "GitHub Repo"**
3. **Select the same repository**: `Ai_social_platform`
4. **Set Root Directory**: `scripts`
5. **Set Build Command**: `pip install -r ../requirements.txt`
6. **Set Start Command**: `python ml-integration-example.py`
7. **Add Environment Variable**: `PORT=5000`

### **Step 4: Create Hope AI Service**

1. **Click "New Service"** again
2. **Choose "GitHub Repo"**
3. **Select the same repository**: `Ai_social_platform`
4. **Set Root Directory**: `scripts`
5. **Set Build Command**: `pip install -r ../requirements.txt`
6. **Set Start Command**: `python Hope.py`
7. **Add Environment Variable**: `PORT=5001`

### **Step 5: Update Frontend Environment Variables**

Once both AI services are deployed, get their URLs and add to frontend:

```
NEXT_PUBLIC_ML_SERVICE_URL=https://your-ml-service-url.railway.app
NEXT_PUBLIC_HOPE_AI_URL=https://your-hope-ai-url.railway.app
```

## ✅ **Expected Result**

You'll have 3 services running:
- **Frontend**: `https://your-frontend.railway.app`
- **ML Server**: `https://your-ml-server.railway.app`
- **Hope AI**: `https://your-hope-ai.railway.app`

## 🔧 **Troubleshooting**

### **Build Issues**
- Make sure you're using the latest code from GitHub
- Check that all environment variables are set correctly

### **AI Services Not Starting**
- Verify Python dependencies are installed
- Check the service logs in Railway dashboard
- Ensure PORT environment variables are set

### **Frontend Not Connecting to AI Services**
- Verify the AI service URLs are correct in environment variables
- Check that AI services are running and accessible 