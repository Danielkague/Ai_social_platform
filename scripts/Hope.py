"""
HOPE - Advanced Psychological Counseling AI System
A comprehensive AI-powered mental health support system for SafeSocial platform
"""

import json
import logging
import os
import pickle
import re
import sqlite3
import random
from datetime import datetime
from threading import Lock

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import traceback

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS properly for Next.js integration
CORS(app, origins=["http://localhost:3000", "https://*.vercel.app", "https://*.railway.app", "https://*.onrender.com"],
     methods=["GET", "POST"],
     allow_headers=["Content-Type"])

# Thread-safe model updates
model_lock = Lock()

# Database path for Hope's training data
DB_PATH = "hope_training_data.db"

class HopeCounselingAI:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 3),
            stop_words='english',
            lowercase=True,
            min_df=2,
            max_df=0.8
        )
        self.model = LogisticRegression(
            random_state=42,
            class_weight='balanced',
            C=1.0
        )
        self.is_trained = False
        self.counseling_patterns = self._load_counseling_patterns()
        self.user_memory = {}  # Store user conversation history
        self.crisis_keywords = self._load_crisis_keywords()
        
    def _load_counseling_patterns(self):
        """Load comprehensive counseling and mental health support patterns"""
        patterns = {
            'crisis_suicide': [
                r'\b(kill.*self|suicide|want.*die|end.*life|don.*want.*live)\b',
                r'\b(better.*off.*dead|no.*reason.*live|everyone.*better.*without.*me)\b',
                r'\b(want.*end.*it|life.*not.*worth|no.*point.*living)\b'
            ],
            'crisis_self_harm': [
                r'\b(hurt.*self|cut.*self|self.*harm|want.*pain|deserve.*pain)\b',
                r'\b(self.*injury|burn.*self|hit.*self)\b'
            ],
            'abuse_domestic': [
                r'\b(girlfriend|boyfriend|partner|spouse|husband|wife).*abusive\b',
                r'\b(domestic.*violence|physical.*abuse|emotional.*abuse)\b',
                r'\b(being.*hit|being.*yelled.*at|being.*controlled)\b',
                r'\b(partner.*violent|relationship.*toxic)\b'
            ],
            'abuse_online': [
                r'\b(harass.*online|cyber.*bully|online.*bully|stalk.*online)\b',
                r'\b(someone.*following|threat.*online|hate.*messages)\b',
                r'\b(being.*stalked|online.*threats|cyber.*stalking)\b'
            ],
            'hate_speech': [
                r'\b(hate.*speech|called.*names|racial.*slur|discrimination)\b',
                r'\b(targeted.*because|hate.*content|offensive.*comments)\b',
                r'\b(racist.*comments|homophobic|transphobic|sexist)\b',
                r'\b(religious.*hate|ethnic.*slur)\b'
            ],
            'depression': [
                r'\b(depression|depressed|clinical.*depression|major.*depression)\b',
                r'\b(feeling.*down|no.*energy|can.*t.*get.*out.*bed)\b',
                r'\b(hopeless|worthless|empty|sad|miserable)\b'
            ],
            'anxiety': [
                r'\b(anxious|worried|nervous|panic|stress|overwhelm)\b',
                r'\b(scared|fear|anxiety|panic.*attack|overwhelmed)\b'
            ],
            'grief': [
                r'\b(grief|grieving|lost.*someone|death|passed.*away)\b',
                r'\b(bereaved|mourning)\b'
            ],
            'relationship': [
                r'\b(relationship.*problems|marriage.*problems|dating.*problems)\b',
                r'\b(breakup|divorce|cheating|trust.*issues|communication.*problems)\b'
            ],
            'work_stress': [
                r'\b(work.*stress|job.*problems|boss.*problems|workplace.*bully)\b',
                r'\b(job.*loss|unemployment|career.*problems)\b'
            ],
            'financial': [
                r'\b(money.*problems|financial.*stress|debt|bills)\b',
                r'\b(can.*t.*pay|financial.*crisis|money.*worries)\b'
            ],
            'health': [
                r'\b(health.*problems|medical.*issues|chronic.*pain|illness)\b',
                r'\b(sick|health.*worries|medical.*stress)\b'
            ],
            'lonely': [
                r'\b(lonely|alone|no.*friends|isolated|no.*one.*cares)\b',
                r'\b(no.*support|by.*myself|no.*one.*understands|friendless)\b'
            ],
            'call_help': [
                r'\b(call.*help|need.*help|emergency|urgent|immediate.*help)\b',
                r'\b(crisis|help.*now)\b'
            ]
        }
        return patterns

    def _load_crisis_keywords(self):
        """Load crisis keywords for immediate intervention"""
        return {
            'suicide': ['kill myself', 'suicide', 'want to die', 'end my life', 'better off dead'],
            'self_harm': ['hurt myself', 'cut myself', 'self harm', 'want pain'],
            'abuse': ['abusive', 'domestic violence', 'being hit', 'threatened'],
            'emergency': ['emergency', 'urgent', 'crisis', 'help now', 'immediate help']
        }

    def _preprocess_text(self, text):
        """Preprocess text for analysis"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def _pattern_based_analysis(self, text):
        """Analyze text using pattern matching for counseling categories"""
        text_lower = text.lower()
        categories = {}
        max_confidence = 0.0
        
        for category, patterns in self.counseling_patterns.items():
            matches = 0
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    matches += 1
            
            if matches > 0:
                # Calculate confidence based on pattern matches
                confidence = min(0.8 + (matches / len(patterns)) * 0.2, 1.0)
                categories[category] = confidence
                max_confidence = max(max_confidence, confidence)
        
        return categories, max_confidence

    def _check_crisis_level(self, text):
        """Check for crisis-level situations requiring immediate intervention"""
        text_lower = text.lower()
        crisis_level = 'none'
        
        # Check for suicide crisis
        for keyword in self.crisis_keywords['suicide']:
            if keyword in text_lower:
                return 'suicide_crisis'
        
        # Check for self-harm crisis
        for keyword in self.crisis_keywords['self_harm']:
            if keyword in text_lower:
                return 'self_harm_crisis'
        
        # Check for abuse crisis
        for keyword in self.crisis_keywords['abuse']:
            if keyword in text_lower:
                return 'abuse_crisis'
        
        # Check for general emergency
        for keyword in self.crisis_keywords['emergency']:
            if keyword in text_lower:
                return 'emergency'
        
        return crisis_level

    def analyze_message(self, text, user_id=None):
        """Analyze user message and provide counseling response"""
        try:
            processed_text = self._preprocess_text(text)
            
            # Check crisis level first
            crisis_level = self._check_crisis_level(processed_text)
            
            # Pattern-based analysis
            categories, pattern_confidence = self._pattern_based_analysis(processed_text)
            
            # ML-based analysis if model is trained
            ml_confidence = 0.0
            if self.is_trained:
                try:
                    features = self.vectorizer.transform([processed_text])
                    ml_confidence = self.model.predict_proba(features)[0][1]
                except Exception as e:
                    logger.warning(f"ML analysis failed: {e}")
            
            # Determine primary concern
            primary_concern = 'general_support'
            if crisis_level != 'none':
                primary_concern = crisis_level
            elif categories:
                primary_concern = max(categories, key=categories.get)
            
            # Generate appropriate response
            response = self._generate_counseling_response(primary_concern, crisis_level, user_id)
            
            # Update user memory
            if user_id:
                self._update_user_memory(user_id, text, primary_concern)
            
            return {
                'primary_concern': primary_concern,
                'crisis_level': crisis_level,
                'categories': categories,
                'pattern_confidence': pattern_confidence,
                'ml_confidence': ml_confidence,
                'response': response,
                'requires_immediate_attention': crisis_level != 'none'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing message: {e}")
            traceback.print_exc()
            return {
                'primary_concern': 'error',
                'crisis_level': 'none',
                'categories': {},
                'pattern_confidence': 0.0,
                'ml_confidence': 0.0,
                'response': "I'm here to listen and support you. How are you feeling right now?",
                'requires_immediate_attention': False
            }

    def _generate_counseling_response(self, concern, crisis_level, user_id=None):
        """Generate appropriate counseling response based on concern"""
        
        # Crisis responses
        if crisis_level == 'suicide_crisis':
            return "🚨 CRISIS ALERT: I'm so sorry you're feeling this way. This is a medical emergency and you need immediate help. Please call 988 RIGHT NOW - this is the National Suicide Prevention Lifeline with trained counselors available 24/7. You matter, your life has value, and there is hope. If you can't call, text HOME to 741741 for crisis support. You don't have to face this alone."
        
        elif crisis_level == 'self_harm_crisis':
            return "🚨 CRISIS: I'm so sorry you're feeling this way. Self-harm is a medical emergency. Please call 988 immediately or text HOME to 741741 for crisis support. You don't have to go through this alone. There are professionals who can help you find healthier ways to cope. Your safety is the most important thing right now."
        
        elif crisis_level == 'abuse_crisis':
            return "🚨 SAFETY ALERT: I'm so sorry you're experiencing this. Domestic abuse is never your fault. Your safety is the priority. Please call the National Domestic Violence Hotline at 1-800-799-7233 immediately - they can help you create a safety plan, find shelter, and connect you with legal resources. If you're in immediate danger, call 911. You deserve to be safe and treated with respect."
        
        elif crisis_level == 'emergency':
            return "🚨 EMERGENCY: If you're in immediate danger, please call 911 right now. For crisis support, call 988 for the National Suicide Prevention Lifeline, or text HOME to 741741 for Crisis Text Line. You don't have to face this alone - there are trained professionals ready to help you right now."
        
        # Specific concern responses
        concern_responses = {
            'abuse_domestic': "🚨 SAFETY FIRST: Domestic abuse is never your fault. Please call 1-800-799-7233 right now for immediate support. They can help you create a safety plan and find local resources. If you're in immediate danger, call 911. You deserve to be safe and there are people who want to help you.",
            
            'abuse_online': "🚨 HARASSMENT ALERT: Online harassment is serious and you don't deserve this. Please: 1) Document everything (screenshots, messages) 2) Block the person 3) Report to the platform 4) If threatening, report to law enforcement. Call Cyber Civil Rights Initiative at 844-878-2274 for support. You deserve to feel safe online.",
            
            'hate_speech': "🚨 HATE SPEECH ALERT: I'm so sorry you experienced this. Hate speech is completely unacceptable and you don't deserve this treatment. Please document everything and report it to the platform. You can also report to Anti-Defamation League or Southern Poverty Law Center. Your identity is valid and you matter. Would you like help finding support groups?",
            
            'depression': "💙 I'm so sorry you're feeling depressed. Depression is a serious mental health condition that requires professional help. Please consider reaching out to a mental health professional. You can call 988 for crisis support or find a therapist through Psychology Today. You deserve to feel better, and there is help available.",
            
            'anxiety': "💙 I'm so sorry you're feeling anxious. That can be really overwhelming and scary. Your feelings are valid, and it's okay to feel this way. Sometimes talking about what's making you anxious can help. Would you like to share more about what's going on? I'm here to listen and support you.",
            
            'grief': "💙 I'm so sorry for your loss. Grief is a deeply personal experience and there's no right or wrong way to feel. Your feelings are valid. Sometimes talking about your loved one or your feelings can help. Would you like to share more? You don't have to go through this alone.",
            
            'relationship': "💙 I'm so sorry you're having relationship difficulties. Relationships can be really challenging and your feelings are valid. Sometimes talking about what's going on can help us see things more clearly. Would you like to share more about what's happening? I'm here to listen and support you.",
            
            'work_stress': "💙 I'm so sorry you're having work-related stress. Work can be really challenging and your feelings are valid. Sometimes talking about what's going on can help us see things more clearly. Would you like to share more about what's happening at work? I'm here to listen and support you.",
            
            'financial': "💙 I'm so sorry you're having financial difficulties. Money stress can be really overwhelming and your feelings are valid. Sometimes talking about what's going on can help us see things more clearly. Would you like to share more? There are also financial counseling services available that might help.",
            
            'health': "💙 I'm so sorry you're having health concerns. Health issues can be really scary and your feelings are valid. Sometimes talking about what's going on can help us process our feelings. Would you like to share more? Remember to reach out to healthcare professionals for medical advice.",
            
            'lonely': "💙 I'm so sorry you're feeling lonely. That can be really hard, and your feelings are completely valid. You're not alone in feeling this way. Sometimes reaching out to friends, family, or joining support groups can help. Would you like help finding ways to connect with others? I'm here to listen and support you.",
            
            'call_help': "🚨 EMERGENCY: If you're in immediate danger, please call 911 right now. For crisis support, call 988 for the National Suicide Prevention Lifeline, or text HOME to 741741 for Crisis Text Line. You don't have to face this alone - there are trained professionals ready to help you right now."
        }
        
        # Return specific response or default
        return concern_responses.get(concern, "💙 I'm here to listen and support you. You're not alone, and it's brave of you to reach out. I'd love to hear more about what's on your mind. What would be most helpful for you right now?")

    def _update_user_memory(self, user_id, message, concern):
        """Update user conversation memory for personalized responses"""
        if user_id not in self.user_memory:
            self.user_memory[user_id] = {
                'conversation_count': 0,
                'concerns': [],
                'last_interaction': datetime.now(),
                'conversation_history': []
            }
        
        memory = self.user_memory[user_id]
        memory['conversation_count'] += 1
        memory['concerns'].append(concern)
        memory['last_interaction'] = datetime.now()
        memory['conversation_history'].append({
            'message': message,
            'concern': concern,
            'timestamp': datetime.now()
        })
        
        # Keep only last 10 interactions
        if len(memory['conversation_history']) > 10:
            memory['conversation_history'] = memory['conversation_history'][-10:]

    def train(self, texts, labels):
        """Train the counseling AI model"""
        try:
            logger.info(f"Training Hope with {len(texts)} examples")
            
            # Preprocess texts
            processed_texts = [self._preprocess_text(text) for text in texts]
            
            # Fit vectorizer and transform texts
            X = self.vectorizer.fit_transform(processed_texts)
            
            # Train model
            self.model.fit(X, labels)
            
            # Calculate accuracy
            y_pred = self.model.predict(X)
            accuracy = accuracy_score(labels, y_pred)
            
            self.is_trained = True
            
            logger.info(f"Hope training completed. Accuracy: {accuracy:.2%}")
            return accuracy
            
        except Exception as e:
            logger.error(f"Error training Hope: {e}")
            traceback.print_exc()
            return 0.0

    def save_model(self, filepath):
        """Save the trained model"""
        try:
            model_data = {
                'vectorizer': self.vectorizer,
                'model': self.model,
                'is_trained': self.is_trained,
                'user_memory': self.user_memory
            }
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            logger.info(f"Hope model saved to {filepath}")
        except Exception as e:
            logger.error(f"Error saving Hope model: {e}")

    def load_model(self, filepath):
        """Load a trained model"""
        try:
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.vectorizer = model_data['vectorizer']
                self.model = model_data['model']
                self.is_trained = model_data['is_trained']
                self.user_memory = model_data.get('user_memory', {})
                
                logger.info(f"Hope model loaded from {filepath}")
                return True
            else:
                logger.warning(f"Hope model file not found: {filepath}")
                return False
        except Exception as e:
            logger.error(f"Error loading Hope model: {e}")
            return False

# Initialize Hope AI
hope_ai = HopeCounselingAI()

def init_hope_db():
    """Initialize Hope's training database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create training data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS hope_training_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                label TEXT NOT NULL,
                category TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create conversation history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS hope_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                concern TEXT,
                crisis_level TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create user profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS hope_user_profiles (
                user_id TEXT PRIMARY KEY,
                conversation_count INTEGER DEFAULT 0,
                primary_concerns TEXT,
                last_interaction DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Hope database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing Hope database: {e}")

# Initialize database
init_hope_db()

# Load existing model if available
hope_model_path = "hope_model.pkl"
hope_ai.load_model(hope_model_path)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Hope"""
    try:
        return jsonify({
            'status': 'healthy',
            'service': 'Hope Counseling AI',
            'model_trained': hope_ai.is_trained,
            'active_users': len(hope_ai.user_memory),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

def convert_types(obj):
    """Convert numpy types to standard Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    return obj

@app.route('/counsel', methods=['POST'])
def counsel_user():
    """Main counseling endpoint for Hope"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        user_id = data.get('user_id', 'anonymous')
        
        # Analyze message with Hope
        analysis = hope_ai.analyze_message(message, user_id)
        
        # Store conversation in database
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO hope_conversations (user_id, message, response, concern, crisis_level)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, message, analysis['response'], analysis['primary_concern'], analysis['crisis_level']))
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.warning(f"Failed to store conversation: {e}")
        
        # Convert numpy types for JSON serialization
        response_data = {
            'response': analysis['response'],
            'primary_concern': analysis['primary_concern'],
            'crisis_level': analysis['crisis_level'],
            'requires_immediate_attention': analysis['requires_immediate_attention'],
            'confidence': max(analysis['pattern_confidence'], analysis['ml_confidence']),
            'timestamp': datetime.now().isoformat()
        }
        
        # Convert any numpy types
        response_data = json.loads(json.dumps(response_data, default=convert_types))
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in counseling endpoint: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'An error occurred while processing your request',
            'response': "I'm here to listen and support you. How are you feeling right now?"
        }), 500

@app.route('/train-hope', methods=['POST'])
def train_hope():
    """Train Hope with new counseling data"""
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data or 'labels' not in data:
            return jsonify({'error': 'Texts and labels are required'}), 400
        
        texts = data['texts']
        labels = data['labels']
        
        if len(texts) != len(labels):
            return jsonify({'error': 'Texts and labels must have the same length'}), 400
        
        # Train Hope
        accuracy = hope_ai.train(texts, labels)
        
        # Save the trained model
        hope_ai.save_model(hope_model_path)
        
        return jsonify({
            'message': 'Hope training completed successfully',
            'accuracy': accuracy,
            'training_samples': len(texts)
        })
        
    except Exception as e:
        logger.error(f"Error training Hope: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Training failed'}), 500

@app.route('/hope-stats', methods=['GET'])
def get_hope_stats():
    """Get Hope's statistics and performance metrics"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get conversation count
        cursor.execute('SELECT COUNT(*) FROM hope_conversations')
        total_conversations = cursor.fetchone()[0]
        
        # Get unique users
        cursor.execute('SELECT COUNT(DISTINCT user_id) FROM hope_conversations')
        unique_users = cursor.fetchone()[0]
        
        # Get crisis interventions
        cursor.execute('SELECT COUNT(*) FROM hope_conversations WHERE crisis_level != "none"')
        crisis_interventions = cursor.fetchone()[0]
        
        # Get recent conversations
        cursor.execute('''
            SELECT concern, COUNT(*) as count 
            FROM hope_conversations 
            WHERE timestamp > datetime('now', '-7 days')
            GROUP BY concern 
            ORDER BY count DESC 
            LIMIT 5
        ''')
        recent_concerns = dict(cursor.fetchall())
        
        conn.close()
        
        return jsonify({
            'total_conversations': total_conversations,
            'crisis_detected': crisis_interventions,
            'accuracy': hope_ai.model.score(hope_ai.vectorizer.transform([""]), [0]), # Placeholder, actual accuracy is logged
            'last_training': hope_ai.is_trained,
            'model_trained': hope_ai.is_trained,
            'active_users': len(hope_ai.user_memory),
            'recent_concerns': recent_concerns,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting Hope stats: {e}")
        return jsonify({'error': 'Failed to get statistics'}), 500

@app.route('/hope-conversations', methods=['GET'])
def get_hope_conversations():
    """Get recent conversations for analysis"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, message, response, concern, crisis_level, timestamp
            FROM hope_conversations
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        
        conversations = []
        for row in cursor.fetchall():
            conversations.append({
                'user_id': row[0],
                'message': row[1],
                'response': row[2],
                'concern': row[3],
                'crisis_level': row[4],
                'timestamp': row[5]
            })
        
        conn.close()
        
        return jsonify({
            'conversations': conversations,
            'count': total_conversations
        })
        
    except Exception as e:
        logger.error(f"Error getting conversations: {e}")
        return jsonify({'error': 'Failed to get conversations'}), 500

if __name__ == '__main__':
    print("Starting Hope - Advanced Psychological Counseling AI...")
    print("Features:")
    print("- Crisis intervention and suicide prevention")
    print("- Domestic abuse and online harassment support")
    print("- Mental health counseling and emotional support")
    print("- Relationship and life stress guidance")
    print("- Professional resource referrals")
    print("Endpoints available:")
    print("- POST /counsel - Main counseling endpoint")
    print("- POST /train-hope - Train Hope with new data")
    print("- GET /hope-stats - Get Hope's statistics")
    print("- GET /hope-conversations - Get conversation history")
    print("- GET /health - Health check")
    
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
