# AI Services Deployment Guide

## 🚀 **Manual AI Services Deployment on Railway**

Since Railway might only automatically deploy the frontend, you need to manually create the AI services.

### **Step 1: Deploy ML Server (Hate Speech Detection)**

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Open your project

2. **Create New Service**
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Set **Source Directory** to: `scripts`
   - Set **Root Directory** to: `scripts`

3. **Configure Build Settings**
   - **Build Command**: `python3 -m venv /app/venv && /app/venv/bin/pip install --upgrade pip && /app/venv/bin/pip install --only-binary=all -r requirements.txt`
   - **Start Command**: `/app/venv/bin/python ml-integration-example.py`
   - **Health Check Path**: `/health`

4. **Add Environment Variables**
   ```env
   PORT=5000
   ```

### **Step 2: Deploy Hope AI (Psychological Support)**

1. **Create Another New Service**
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Set **Source Directory** to: `scripts`
   - Set **Root Directory** to: `scripts`

2. **Configure Build Settings**
   - **Build Command**: `python3 -m venv /app/venv && /app/venv/bin/pip install --upgrade pip && /app/venv/bin/pip install --only-binary=all -r requirements.txt`
   - **Start Command**: `/app/venv/bin/python Hope.py`
   - **Health Check Path**: `/health`

3. **Add Environment Variables**
   ```env
   PORT=5001
   ```

### **Step 3: Update Frontend Environment Variables**

In your **frontend service**, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://iwemxnniterxwqzdrqka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZW14bm5pdGVyeHdxemRycWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzgwMDAsImV4cCI6MjA2ODA1NDAwMH0.xa50m2oeq7efKQH-HBcf-aQSb6En5ueN-a1M1hS42_0
NEXT_PUBLIC_ML_SERVICE_URL=https://your-ml-server-url.railway.app
NEXT_PUBLIC_HOPE_AI_URL=https://your-hope-ai-url.railway.app
```

### **Step 4: Test the Services**

1. **Test ML Server**: Visit `https://your-ml-server-url.railway.app/health`
2. **Test Hope AI**: Visit `https://your-hope-ai-url.railway.app/health`
3. **Test Frontend**: Visit your main app URL

### **Expected Result**

You should have 3 services running:
- **Frontend**: Your main app
- **ML Server**: Hate speech detection API
- **Hope AI**: Psychological support API

### **Troubleshooting**

If services fail to start:
1. Check the build logs for Python dependency issues
2. Verify the source directory is set to `scripts`
3. Ensure environment variables are set correctly
4. Check that the health check endpoints are accessible

### **Alternative: Local AI Services**

If Railway deployment is problematic, you can run AI services locally:

```bash
# Terminal 1: ML Server
cd scripts
python ml-integration-example.py

# Terminal 2: Hope AI
cd scripts
python Hope.py
```

Then update your frontend environment variables to point to localhost:
```env
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_HOPE_AI_URL=http://localhost:5001
``` 