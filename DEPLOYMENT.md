# Deployment Guide - Hope Social Media Platform

This guide explains how to deploy the Hope Social Media platform on Render, including the Next.js frontend and two Python AI servers.

## 🚀 **Deployment Overview**

The platform consists of three services:
1. **Frontend** - Next.js application (Port 3000)
2. **ML Server** - Hate speech detection AI (Port 5000)
3. **Hope AI** - Psychological support AI (Port 5001)

## 📋 **Prerequisites**

1. **Render Account** - Sign up at [render.com](https://render.com)
2. **Supabase Project** - Set up at [supabase.com](https://supabase.com)
3. **GitHub Repository** - Push your code to GitHub

## 🔧 **Step 1: Prepare Your Repository**

### **Repository Structure**
```
hope-social-media/
├── app/                    # Next.js frontend
├── scripts/
│   ├── ml-integration-example.py  # Hate speech detection
│   └── Hope.py                    # Psychological support
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
├── render.yaml            # Render configuration
└── README.md
```

### **Environment Variables**
Create these in your Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎯 **Step 2: Deploy on Render**

### **Option A: Using render.yaml (Recommended)**

1. **Push to GitHub** - Ensure your code is in a GitHub repository
2. **Connect to Render** - Link your GitHub repository in Render
3. **Auto-Deploy** - Render will automatically detect the `render.yaml` file
4. **Configure Environment Variables** - Add your Supabase credentials

### **Option B: Manual Deployment**

#### **1. Deploy Frontend**
- **Service Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_SUPABASE_URL=your-supabase-url`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`

#### **2. Deploy ML Server (Hate Speech Detection)**
- **Service Type**: Web Service
- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python scripts/ml-integration-example.py`
- **Environment Variables**:
  - `PYTHON_VERSION=3.11`
  - `PORT=5000`

#### **3. Deploy Hope AI Server (Psychological Support)**
- **Service Type**: Web Service
- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python scripts/Hope.py`
- **Environment Variables**:
  - `PYTHON_VERSION=3.11`
  - `PORT=5001`

## 🔗 **Step 3: Update Frontend Configuration**

After deployment, update the frontend to use the new AI server URLs:

### **Update API Routes**
In your frontend code, replace localhost URLs with Render URLs:

```javascript
// Before (local development)
const ML_SERVER_URL = 'http://localhost:5000';
const HOPE_SERVER_URL = 'http://localhost:5001';

// After (production)
const ML_SERVER_URL = 'https://your-ml-server.onrender.com';
const HOPE_SERVER_URL = 'https://your-hope-server.onrender.com';
```

### **Files to Update**
- `app/api/posts/route.ts`
- `app/api/comments/route.ts`
- `app/api/support-chat/route.ts`

## 🌐 **Step 4: Configure CORS**

The AI servers are already configured with CORS for production. If you need to update:

```python
# In both AI server files
CORS(app, origins=[
    "http://localhost:3000",
    "https://your-frontend.onrender.com",
    "https://*.vercel.app"
])
```

## 🔍 **Step 5: Test Deployment**

### **Health Checks**
Test each service:

```bash
# Frontend
curl https://your-frontend.onrender.com

# ML Server
curl https://your-ml-server.onrender.com/health

# Hope AI
curl https://your-hope-server.onrender.com/health
```

### **Functionality Tests**
1. **User Registration/Login** - Test authentication
2. **Post Creation** - Test AI moderation
3. **Support Chat** - Test Hope AI integration
4. **Admin Dashboard** - Test moderation tools

## 📊 **Step 6: Monitor and Maintain**

### **Render Dashboard**
- Monitor service health
- Check logs for errors
- Monitor resource usage
- Set up alerts

### **Performance Optimization**
- Enable auto-scaling if needed
- Monitor response times
- Optimize database queries
- Cache frequently accessed data

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Check Python dependencies
pip install -r requirements.txt

# Check Node.js dependencies
npm install --legacy-peer-deps
```

#### **Service Not Starting**
- Check environment variables
- Verify port configuration
- Review service logs

#### **CORS Errors**
- Update CORS origins in AI servers
- Check frontend URL configuration

#### **Database Connection**
- Verify Supabase credentials
- Check database schema
- Test connection strings

### **Logs and Debugging**
```bash
# View service logs in Render dashboard
# Check for specific error messages
# Verify environment variables are set
```

## 🔒 **Security Considerations**

### **Environment Variables**
- Never commit sensitive data
- Use Render's secure environment variable storage
- Rotate keys regularly

### **API Security**
- Implement rate limiting
- Add authentication for admin endpoints
- Monitor for abuse

### **Data Protection**
- Enable Supabase RLS policies
- Encrypt sensitive data
- Regular security audits

## 📈 **Scaling Considerations**

### **Auto-Scaling**
- Configure based on traffic patterns
- Set appropriate thresholds
- Monitor costs

### **Database Scaling**
- Upgrade Supabase plan as needed
- Optimize queries for performance
- Consider read replicas

### **CDN Integration**
- Use Render's CDN for static assets
- Optimize image delivery
- Implement caching strategies

## 🎉 **Success Metrics**

### **Performance**
- Page load times < 3 seconds
- API response times < 1 second
- 99.9% uptime

### **User Experience**
- Successful user registration
- Working AI moderation
- Functional support chatbot
- Responsive admin dashboard

### **Technical**
- All health checks passing
- No critical errors in logs
- Proper CORS configuration
- Secure data transmission

---

## 📞 **Support**

For deployment issues:
1. Check Render documentation
2. Review service logs
3. Test locally first
4. Contact support if needed

**Happy Deploying! 🚀** 