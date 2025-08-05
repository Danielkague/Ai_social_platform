# Render Deployment Guide - Hope Social Media Platform

## 🚀 **Complete Deployment on Render**

This guide explains how to deploy the Hope Social Media platform on Render, including the Next.js frontend and two Python AI servers with full database functionality.

## **Prerequisites**

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Supabase Database**: Already configured

## **Deployment Steps**

### **Step 1: Connect to Render**

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign in with your account

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

### **Step 2: Configure Services**

The `render.yaml` file will automatically create 3 services:

#### **1. Frontend Service (Next.js)**
- **Name**: `hope-social-frontend`
- **Environment**: Node.js
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: Automatically configured

#### **2. ML Server (Hate Speech Detection)**
- **Name**: `ml-server`
- **Environment**: Python
- **Build Command**: `pip install -r scripts/requirements.txt`
- **Start Command**: `cd scripts && python ml-integration-example.py`
- **Port**: 5000

#### **3. Hope AI Server (Psychological Support)**
- **Name**: `hope-ai-server`
- **Environment**: Python
- **Build Command**: `pip install -r scripts/requirements.txt`
- **Start Command**: `cd scripts && python Hope.py`
- **Port**: 5001

### **Step 3: Deploy**

1. **Review Configuration**
   - Render will show you all 3 services
   - Verify the configuration looks correct

2. **Deploy All Services**
   - Click "Apply" to deploy all services
   - Render will build and deploy each service

3. **Monitor Deployment**
   - Watch the build logs for each service
   - Ensure all services start successfully

## **Service URLs**

After deployment, you'll get URLs like:
- **Frontend**: `https://hope-social-frontend.onrender.com`
- **ML Server**: `https://ml-server.onrender.com`
- **Hope AI**: `https://hope-ai-server.onrender.com`

## **Environment Variables**

The `render.yaml` automatically configures:

```env
# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://iwemxnniterxwqzdrqka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZW14bm5pdGVyeHdxemRycWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzgwMDAsImV4cCI6MjA2ODA1NDAwMH0.xa50m2oeq7efKQH-HBcf-aQSb6En5ueN-a1M1hS42_0
NEXT_PUBLIC_ML_SERVICE_URL=https://ml-server.onrender.com
NEXT_PUBLIC_HOPE_AI_URL=https://hope-ai-server.onrender.com

# AI Services Environment Variables
PORT=5000  # for ML Server
PORT=5001  # for Hope AI
```

## **Testing the Deployment**

### **1. Test Frontend**
```bash
curl https://hope-social-frontend.onrender.com
```

### **2. Test ML Server**
```bash
curl https://ml-server.onrender.com/health
```

### **3. Test Hope AI**
```bash
curl https://hope-ai-server.onrender.com/health
```

### **4. Test ML Prediction**
```bash
curl -X POST https://ml-server.onrender.com/predict-hate-speech \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test message"}'
```

### **5. Test Hope AI Counseling**
```bash
curl -X POST https://hope-ai-server.onrender.com/counsel \
  -H "Content-Type: application/json" \
  -d '{"message": "I need someone to talk to", "user_id": "test_user"}'
```

## **Database Functionality**

### **SQLite Databases**
Both AI services use SQLite databases that are automatically created:

- **ML Server**: `training_data.db` (training data, abuse reports, model metrics)
- **Hope AI**: `hope_training_data.db` (conversations, user profiles, training data)

### **Database Features**
- ✅ **Persistent Storage**: Data persists between deployments
- ✅ **Training Data Collection**: ML model improves over time
- ✅ **Conversation History**: Hope AI remembers user interactions
- ✅ **Abuse Reports**: Automatic reporting system
- ✅ **Model Metrics**: Performance tracking

## **Monitoring and Maintenance**

### **Health Checks**
- **Frontend**: `/` (main page)
- **ML Server**: `/health`
- **Hope AI**: `/health`

### **Logs**
- View logs in Render dashboard for each service
- Monitor for errors and performance issues

### **Scaling**
- Render automatically scales based on traffic
- Free tier available for testing
- Paid plans for production use

## **Troubleshooting**

### **Common Issues**

1. **Build Failures**
   - Check Python dependencies in `scripts/requirements.txt`
   - Verify Node.js dependencies in `package.json`

2. **Service Not Starting**
   - Check logs for Python import errors
   - Verify port configuration

3. **Database Issues**
   - SQLite databases are created automatically
   - Check file permissions if needed

4. **CORS Issues**
   - CORS is configured for Render domains
   - Check browser console for errors

### **Support**
- Render provides excellent documentation
- Check service logs for detailed error messages
- Contact Render support if needed

## **Benefits of Render Deployment**

✅ **Full Database Functionality**: SQLite databases work perfectly
✅ **Automatic Scaling**: Handles traffic spikes
✅ **Easy Configuration**: Single `render.yaml` file
✅ **Cost Effective**: Free tier available
✅ **Reliable**: 99.9% uptime guarantee
✅ **Fast**: Global CDN and edge locations

## **Next Steps**

1. **Deploy to Render** using the `render.yaml` file
2. **Test all functionality** including AI services
3. **Monitor performance** and logs
4. **Scale as needed** for production use

Your Hope Social Media platform will be fully functional with all AI capabilities and database persistence! 