# Deployment Guide - Hope Social Media Platform (Railway)

This guide explains how to deploy the Hope Social Media platform on Railway, including the Next.js frontend and two Python AI servers.

## 🚀 **Deployment Overview**

The platform consists of three services:
1. **Frontend** - Next.js application
2. **ML Server** - Hate speech detection AI
3. **Hope AI** - Psychological support AI

## 📋 **Prerequisites**

1. **Railway Account** - Sign up at [railway.app](https://railway.app)
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
├── railway.json           # Railway configuration
└── README.md
```

### **Environment Variables**
Create these in your Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎯 **Step 2: Deploy on Railway**

### **Option A: Using Railway Dashboard (Recommended)**

#### **1. Deploy Frontend**
1. **Create New Project** - Go to Railway dashboard
2. **Deploy from GitHub** - Connect your repository
3. **Select Service Type** - Choose "Web Service"
4. **Configure Settings**:
   - **Name**: `hope-social-media-frontend`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js (auto-detected)

#### **2. Deploy ML Server (Hate Speech Detection)**
1. **Add Service** - In the same project
2. **Select Repository** - Same GitHub repo
3. **Configure Settings**:
   - **Name**: `hope-ml-server`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python scripts/ml-integration-example.py`
   - **Environment**: Python (auto-detected)

#### **3. Deploy Hope AI Server (Psychological Support)**
1. **Add Service** - In the same project
2. **Select Repository** - Same GitHub repo
3. **Configure Settings**:
   - **Name**: `hope-ai-server`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python scripts/Hope.py`
   - **Environment**: Python (auto-detected)

### **Option B: Using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy services
railway up
```

## 🔗 **Step 3: Configure Environment Variables**

### **Frontend Environment Variables**
In Railway dashboard → Frontend service → Variables:
```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **AI Servers Environment Variables**
For both ML Server and Hope AI Server:
```
PYTHON_VERSION=3.11
PORT=5000  # or 5001 for Hope AI
```

## 🌐 **Step 4: Update Frontend Configuration**

After deployment, update the frontend to use the new AI server URLs:

### **Update API Routes**
In your frontend code, replace localhost URLs with Railway URLs:

```javascript
// Before (local development)
const ML_SERVER_URL = 'http://localhost:5000';
const HOPE_SERVER_URL = 'http://localhost:5001';

// After (production)
const ML_SERVER_URL = 'https://your-ml-server.railway.app';
const HOPE_SERVER_URL = 'https://your-hope-server.railway.app';
```

### **Files to Update**
- `app/api/posts/route.ts`
- `app/api/comments/route.ts`
- `app/api/support-chat/route.ts`

## 🔍 **Step 5: Test Deployment**

### **Health Checks**
Test each service:

```bash
# Frontend
curl https://your-frontend.railway.app

# ML Server
curl https://your-ml-server.railway.app/health

# Hope AI
curl https://your-hope-server.railway.app/health
```

### **Functionality Tests**
1. **User Registration/Login** - Test authentication
2. **Post Creation** - Test AI moderation
3. **Support Chat** - Test Hope AI integration
4. **Admin Dashboard** - Test moderation tools

## 📊 **Step 6: Monitor and Maintain**

### **Railway Dashboard**
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
# View service logs in Railway dashboard
# Check for specific error messages
# Verify environment variables are set
```

## 🔒 **Security Considerations**

### **Environment Variables**
- Never commit sensitive data
- Use Railway's secure environment variable storage
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
- Use Railway's CDN for static assets
- Optimize image delivery
- Implement caching strategies

## 💰 **Railway Pricing**

### **Free Tier**
- **$5 credit** - Monthly free credit
- **Shared CPU** - Basic performance
- **512MB RAM** - Limited memory
- **Perfect for development/testing**

### **Pro Plan**
- **Pay-as-you-use** - Only pay for what you use
- **Dedicated CPU** - Better performance
- **More RAM** - Higher memory limits
- **Custom domains** - Professional URLs

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
1. Check Railway documentation
2. Review service logs
3. Test locally first
4. Contact Railway support if needed

**Happy Deploying on Railway! 🚀** 