# Hope Social Media - AI-Powered Safe Social Platform

A revolutionary social media platform built with Next.js, React, and Supabase, featuring advanced AI-powered content moderation, psychological support, and comprehensive safety features.

## 🌟 **Key Features**

### 🤖 **AI-Powered Safety Systems**

- **Advanced Hate Speech Detection** - Real-time content analysis using machine learning
- **Psychological Support AI** - 24/7 mental health companion with crisis intervention
- **Automatic Content Moderation** - Instant flagging and reporting of harmful content
- **Pattern-Based Detection** - Enhanced accuracy with regex patterns and ML models

### 💙 **Mental Health & Support**

- **Hope AI Chatbot** - Empathetic psychological support and counseling
- **Crisis Intervention** - Immediate access to suicide prevention and emergency resources
- **Professional Referrals** - Direct connections to licensed therapists and support groups
- **Trauma-Informed Care** - AI trained for abuse, harassment, and mental health support

### 🛡️ **Content Safety**

- **Real-time Moderation** - Posts and comments analyzed instantly
- **Auto-Reporting System** - Flagged content automatically sent to admins
- **User Protection** - Harmful content hidden from regular users
- **Admin Dashboard** - Comprehensive moderation tools and user management

### 👥 **Social Features**

- **User Authentication** - Secure registration and login with Supabase
- **Social Feed** - Post creation, commenting, and interaction
- **Like System** - User engagement and content appreciation
- **User Profiles** - Personalized profiles with avatars and information

## 🚀 **Tech Stack**

### **Frontend**

- **Next.js 15** - React framework with App Router
- **React 18.3.1** - Stable React version with full compatibility
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### **Backend & Database**

- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Secure authentication system
- **Row Level Security** - Database-level security policies

### **AI & Machine Learning**

- **Python Flask** - ML server for content moderation
- **Scikit-learn** - Machine learning models for hate speech detection
- **Custom AI Models** - Trained on comprehensive datasets
- **Pattern Recognition** - Regex-based content analysis

## 📦 **Installation & Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/hope-social-media.git
cd hope-social-media
```

### **2. Install Dependencies**

```bash
# Install Node.js dependencies
npm install --legacy-peer-deps

# Create and activate Python virtual environment
python -m venv .venv
# On Windows:
& "c:/path/to/project/.venv/Scripts/Activate.ps1"
# On macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install flask flask-cors numpy scikit-learn pandas
```

### **3. Environment Configuration**

Create a `.env.local` file in the project root:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Services URLs (for Railway deployment)
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_HOPE_AI_URL=http://localhost:5001
```

**Note:** For Railway deployment, you'll need to set these environment variables in your Railway project settings.

### **4. Database Setup**

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase_schema.sql` in your Supabase SQL Editor
3. Add an admin user: `UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';`

### **5. Start All Services**

#### **Start AI Servers (Terminal 1)**

```bash
# Activate virtual environment
& "c:/path/to/project/.venv/Scripts/Activate.ps1"

# Start ML Integration Server (Hate Speech Detection)
python scripts/ml-integration-example.py

# Start Hope AI Server (Psychological Support) - New Terminal
python scripts/Hope.py
```

#### **Start Frontend (Terminal 2)**

```bash
npm run dev
```

### **6. Access the Application**

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **ML Server**: [http://localhost:5000](http://localhost:5000)
- **Hope AI**: [http://localhost:5001](http://localhost:5001)

## 🚀 **Deployment on Railway**

### **Quick Deploy**

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** repository
3. **Railway will automatically deploy the frontend**
4. **Manually create AI services** (see detailed guide below)
5. **Add environment variables**

### **Detailed Deployment Guide**

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for step-by-step instructions on deploying all 3 services.

### **Configuration Files**

The project includes:

- `railway.json` - Railway configuration for frontend
- `RAILWAY_DEPLOYMENT.md` - Complete deployment guide

### **Detailed Instructions**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive Railway deployment guide.

## 🎯 **Core Features Deep Dive**

### **🤖 AI Content Moderation**

The platform uses a sophisticated two-tier approach:

1. **Pattern-Based Detection**: Regex patterns for immediate identification of hate speech, slurs, and harmful content
2. **Machine Learning Models**: Trained on comprehensive datasets including:
   - Hate speech datasets
   - Online harassment patterns
   - Abusive language identification
   - Xenophobic and discriminatory content

**Features:**

- Real-time content analysis
- Confidence scoring (0-1 scale)
- Severity assessment (low, medium, high, critical)
- Automatic categorization (hate_speech, harassment, abuse)
- Immediate content flagging and admin notification

### **💙 Hope AI - Psychological Support**

A comprehensive mental health support system:

**Crisis Intervention:**

- Suicide prevention protocols
- Domestic abuse support
- Emergency contact information
- Safety planning resources

**Mental Health Support:**

- Depression and anxiety guidance
- Grief and loss counseling
- Relationship stress management
- Professional therapy referrals

**Resource Database:**

- Licensed therapists directory
- Support group connections
- Crisis hotlines (988, Crisis Text Line)
- Online therapy platforms (BetterHelp, Talkspace)

### **🛡️ Safety & Moderation**

**Content Protection:**

- Automatic flagging of harmful content
- Hidden flagged content from regular users
- Admin review and moderation tools
- User appeal system via support chatbot

**User Safety:**

- Anonymous reporting system
- Admin dashboard for content review
- User banning capabilities
- Content removal and restoration

## 🔧 **API Endpoints**

### **ML Integration Server (Port 5000)**

- `POST /predict-hate-speech` - Content analysis
- `POST /report-abuse` - Manual abuse reporting
- `GET /model-stats` - Model performance metrics
- `GET /health` - Server health check

### **Hope AI Server (Port 5001)**

- `POST /counsel` - Psychological support
- `POST /train-hope` - AI training endpoint
- `GET /hope-stats` - Support statistics
- `GET /health` - Server health check

### **Frontend API Routes**

- `POST /api/posts` - Create posts with AI moderation
- `POST /api/comments` - Create comments with AI moderation
- `POST /api/support-chat` - Hope AI integration
- `GET /api/admin/reports` - Admin report management

## 🎨 **User Experience**

### **Landing Page**

- Beautiful gradient design
- Login/registration forms
- Feature highlights and safety information
- Professional branding with Hope Social Media theme

### **Social Feed**

- Clean, modern interface
- Post creation with real-time moderation
- Like and comment functionality
- User profiles and avatars
- Support chatbot access

### **Admin Dashboard**

- Comprehensive moderation tools
- Report management interface
- User management capabilities
- Content review and approval system

### **Support System**

- Floating support button
- Modal-based chatbot interface
- Resource library access
- Crisis intervention tools

## 🔒 **Security Features**

### **Authentication**

- Supabase Auth integration
- Secure session management
- Protected routes
- Role-based access control

### **Content Safety**

- AI-powered content filtering
- Automatic harmful content detection
- Admin oversight and moderation
- User reporting system

### **Data Protection**

- Row Level Security (RLS)
- Encrypted data transmission
- Secure API endpoints
- Privacy-focused design

## 🚀 **Performance Optimizations**

### **Frontend**

- Next.js App Router for optimal routing
- React 19 with latest performance features
- Optimized component rendering
- Efficient state management

### **AI Systems**

- Fast pattern-based detection
- Optimized ML model loading
- Efficient API communication
- Real-time response processing

### **Database**

- Optimized Supabase queries
- Efficient data relationships
- Real-time subscriptions
- Proper indexing

## 🐛 **Troubleshooting**

### **Common Issues**

**AI Servers Not Starting:**

```bash
# Check Python dependencies
pip install flask flask-cors numpy scikit-learn pandas

# Verify virtual environment activation
& "c:/path/to/project/.venv/Scripts/Activate.ps1"
```

**Frontend Styling Issues:**

```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
npm install --legacy-peer-deps
```

**Authentication Problems:**

- Verify Supabase environment variables
- Check database schema installation
- Ensure RLS policies are configured

### **Health Checks**

```bash
# Test ML Server
curl http://localhost:5000/health

# Test Hope AI
curl http://localhost:5001/health

# Test Frontend
curl http://localhost:3000
```

## 📈 **Future Enhancements**

### **Planned Features**

- **Real-time Notifications** - Push notifications for interactions
- **Advanced Analytics** - User engagement and safety metrics
- **Mobile App** - React Native mobile application
- **Enhanced AI** - More sophisticated content analysis
- **Community Features** - Groups, events, and communities

### **AI Improvements**

- **Multi-language Support** - Content moderation in multiple languages
- **Context Awareness** - Better understanding of content context
- **Learning System** - AI that improves from user feedback
- **Personalized Support** - Tailored mental health recommendations

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines for:

- Code standards and practices
- Testing requirements
- Documentation updates
- Feature proposals

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 **About Hope Social Media**

Hope Social Media is more than just a social platform - it's a safe space where technology protects users and fosters meaningful connections. Our AI systems work tirelessly to ensure every user feels safe, supported, and heard.

**Mission**: To create the world's safest social media platform where AI protects users and fosters genuine human connection.

**Vision**: A digital world where technology serves humanity's mental health and well-being.

---

**Built with ❤️ for a safer, more supportive online community.**
