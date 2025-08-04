"""
Enhanced Python Flask server for real-time hate speech detection and abuse reporting
This implementation includes a sophisticated ML model for hate speech detection
"""

import json
import logging
import os
import pickle
import re
import sqlite3
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
CORS(app, origins=["http://localhost:3000", "https://*.vercel.app"],
     methods=["GET", "POST"],
     allow_headers=["Content-Type"])

# Thread-safe model updates
model_lock = Lock()


class AdvancedHateSpeechDetector:
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
        self.abuse_patterns = self._load_abuse_patterns()
        self.severity_weights = {
            'threat': 1.0,
            'hate_speech': 0.9,
            'harassment': 0.8,
            'offensive': 0.7,
            'profanity': 0.5,
            'spam': 0.3
        }

    def _load_abuse_patterns(self):
        """Load comprehensive abuse detection patterns, expanded for SDG 5 (gender) and SDG 16 (violence/xenophobia)"""
        patterns = {
            'threat': [
                r'\b(kill|murder|death|die|hurt|harm|attack|destroy)\b.*\b(you|them|him|her)\b',
                r'\b(going to|gonna|will)\b.*\b(kill|hurt|harm|destroy)\b',
                r'\bwish.*\b(dead|death|die)\b',
                r'\b(shoot|stab|beat|punch)\b.*\b(you|them)\b',
                # SDG 16: Incitement/violence against groups
                r'\b(kill|attack|destroy|eliminate)\b.*\b(all|every|these|those)\b.*\b(people|group|race|religion|immigrants|refugees)\b',
                r'\b(ethnic cleansing|final solution)\b',
                # Enhanced single word detection
                r'\b(kill|murder|death|die|hurt|harm|attack|destroy)\b',
                r'\b(shoot|stab|beat|punch|hit|slap)\b',
            ],
            'hate_speech': [
                r'\b(hate|despise|loathe)\b.*\b(because|for being|all)\b',
                r'\b(all|every)\b.*\b(are|should be)\b.*\b(killed|removed|eliminated)\b',
                r'\b(inferior|subhuman|worthless)\b.*\b(race|people|group)\b',
                r'\b(genocide|ethnic cleansing|final solution)\b',
                # SDG 5: Gender-based hate
                r'\b(women|girls|females)\b.*\b(should|must|deserve|are|be)\b.*\b(killed|raped|hurt|inferior|worthless|slaves?)\b',
                r'\b(you are just a girl)\b',
                r'\b(women should not have rights)\b',
                # SDG 16: Xenophobia/racism
                r'\b(go back to your country)\b',
                r'\b([a-z]+s? are criminals)\b',
                # Enhanced single word detection for hate speech
                r'\b(fuck|shit|bitch|cunt|dick|pussy|asshole|bastard|whore|slut|faggot)\b',
                r'\b(nigger|nigga|kike|spic|chink|gook|wetback|towelhead|raghead)\b',
                r'\b(hate|despise|loathe|inferior|subhuman|worthless)\b',
            ],
            'harassment': [
                r'\b(stalking|following|watching)\b.*\byou\b',
                r'\b(doxx|dox|expose|find)\b.*\b(address|location|info)\b',
                r'\bshut up\b.*\b(stupid|idiot|moron)\b',
                r'\b(constantly|always|keep)\b.*\b(bothering|annoying|messaging)\b',
                # SDG 5: Sexual harassment
                r'\bsend nudes\b',
                r'\b(sexual (harassment|abuse|assault))\b',
                r'\b(rape|raped|rapist)\b',
                r'\b(you should be raped)\b',
                # Enhanced single word detection for harassment
                r'\b(stupid|idiot|moron|dumb|retard|imbecile)\b',
                r'\b(rape|raped|rapist|harassment|stalking)\b',
            ],
            'offensive': [
                r'\b(stupid|idiot|moron|dumb|retard|mental)\b',
                r'\b(ugly|fat|gross|disgusting)\b.*\b(you|face|body)\b',
                r'\b(loser|failure|pathetic|worthless)\b',
                r'\b(shut up|go away|get lost)\b',
                # SDG 5: Body shaming
                r'\b(so fat|so ugly|no man will love you|too ugly for love)\b',
            ],
            'profanity': [
                r'\bbitch\b',
                r'\bslut\b',
                r'\bwhore\b',
                r'\bcunt\b',
                r'\bf[u*][c*]k\b',
                r'\bs[h*][i*]t\b',
                r'\bb[i*]tch\b',
                r'\ba[s*][s*]hole\b',
                r'\bd[a*]mn\b',
                r'\bc[r*]ap\b',
            ],
            'spam': [
                r'\b(buy now|click here|limited time|act now)\b',
                r'\b(free money|get rich|guaranteed)\b',
                r'\b(winner|congratulations|selected)\b.*\b(prize|lottery|money)\b'
            ]
        }
        # Compile regex patterns for efficiency
        compiled_patterns = {}
        for category, pattern_list in patterns.items():
            compiled_patterns[category] = [re.compile(pattern, re.IGNORECASE)
                                           for pattern in pattern_list]
        return compiled_patterns

    def _preprocess_text(self, text):
        """Advanced text preprocessing"""
        # Remove URLs
        text = re.sub(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)

        # Remove mentions and hashtags
        text = re.sub(r'@\w+|#\w+', '', text)

        # Handle character repetition (e.g., "sooooo" -> "so")
        text = re.sub(r'(.)\1{2,}', r'\1\1', text)

        # Handle deliberate misspellings and l33t speak
        replacements = {
            '@': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't',
            '4': 'a', '$': 's', '!': 'i', '+': 't'
        }
        for old, new in replacements.items():
            text = text.replace(old, new)

        # Remove excessive punctuation
        text = re.sub(r'[^\w\s]', ' ', text)

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def _pattern_based_detection(self, text):
        """Pattern-based abuse detection for immediate response"""
        text_processed = self._preprocess_text(text)
        detected_categories = []
        confidence_scores = []

        for category, patterns in self.abuse_patterns.items():
            category_matches = 0
            for pattern in patterns:
                if pattern.search(text_processed):
                    category_matches += 1

            if category_matches > 0:
                detected_categories.append(category)
                # Calculate confidence based on pattern matches
                confidence = min(category_matches / len(patterns), 1.0)
                confidence_scores.append(
                    confidence * self.severity_weights.get(category, 0.5))

        return detected_categories, confidence_scores

    def predict(self, text):
        """Enhanced prediction with pattern-based and ML-based detection"""
        if not text or len(text.strip()) < 2:
            return {
                'is_hate_speech': False,
                'confidence': 0.0,
                'categories': [],
                'severity': 'none',
                'requires_immediate_action': False
            }

        # Pattern-based detection for immediate response
        pattern_categories, pattern_confidences = self._pattern_based_detection(
            text)

        # ML-based detection if model is trained
        ml_confidence = 0.0
        if self.is_trained:
            try:
                text_processed = self._preprocess_text(text)
                text_vectorized = self.vectorizer.transform([text_processed])
                ml_probability = self.model.predict_proba(text_vectorized)[0]
                ml_confidence = ml_probability[1] if len(
                    ml_probability) > 1 else 0.0
            except Exception as e:
                logger.error(f"ML prediction error: {e}")
                ml_confidence = 0.0

        # Combine pattern-based and ML-based results
        max_pattern_confidence = max(
            pattern_confidences) if pattern_confidences else 0.0
        combined_confidence = max(max_pattern_confidence, ml_confidence)

        # Determine if it's hate speech
        is_hate_speech = combined_confidence > 0.5

        # Determine severity and immediate action requirement
        severity = self._calculate_severity(
            pattern_categories, combined_confidence)
        requires_immediate_action = (
            'threat' in pattern_categories or
            'hate_speech' in pattern_categories or
            combined_confidence > 0.85
        )

        return {
            'is_hate_speech': is_hate_speech,
            'confidence': float(combined_confidence),
            'categories': pattern_categories,
            'severity': severity,
            'requires_immediate_action': requires_immediate_action,
            'ml_confidence': float(ml_confidence),
            'pattern_confidence': float(max_pattern_confidence)
        }

    def _calculate_severity(self, categories, confidence):
        """Calculate abuse severity level"""
        if not categories:
            return 'none'

        max_severity_weight = max(
            self.severity_weights.get(cat, 0.0) for cat in categories)

        if max_severity_weight >= 0.9 or confidence > 0.9:
            return 'critical'
        elif max_severity_weight >= 0.7 or confidence > 0.7:
            return 'high'
        elif max_severity_weight >= 0.5 or confidence > 0.5:
            return 'medium'
        else:
            return 'low'

    def train(self, texts, labels):
        """Train the ML model with provided data"""
        try:
            # Preprocess texts
            processed_texts = [self._preprocess_text(text) for text in texts]

            # Fit vectorizer and transform texts
            X = self.vectorizer.fit_transform(processed_texts)
            y = np.array(labels)

            # Split data for training and validation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            # Train the model
            self.model.fit(X_train, y_train)

            # Evaluate model
            train_accuracy = accuracy_score(
                y_train, self.model.predict(X_train))
            test_accuracy = accuracy_score(y_test, self.model.predict(X_test))

            self.is_trained = True

            logger.info(
                f"Model trained successfully. Train accuracy: {train_accuracy:.3f}, Test accuracy: {test_accuracy:.3f}")

            return {
                'success': True,
                'train_accuracy': train_accuracy,
                'test_accuracy': test_accuracy,
                'training_samples': len(texts)
            }

        except Exception as e:
            logger.error(f"Training error: {e}")
            return {'success': False, 'error': str(e)}

    def save_model(self, filepath):
        """Save the trained model and vectorizer"""
        try:
            with open(filepath, 'wb') as f:
                pickle.dump({
                    'vectorizer': self.vectorizer,
                    'model': self.model,
                    'is_trained': self.is_trained
                }, f)
            return True
        except Exception as e:
            logger.error(f"Model save error: {e}")
            return False

    def load_model(self, filepath):
        """Load a pre-trained model and vectorizer"""
        try:
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    saved_data = pickle.load(f)
                    self.vectorizer = saved_data['vectorizer']
                    self.model = saved_data['model']
                    self.is_trained = saved_data['is_trained']
                logger.info("Model loaded successfully")
                return True
        except Exception as e:
            logger.error(f"Model load error: {e}")
        return False


# Initialize the enhanced model
detector = AdvancedHateSpeechDetector()

# Try to load existing model
model_path = 'hate_speech_model.pkl'
detector.load_model(model_path)

# Database setup for training data and abuse reports
DB_PATH = 'training_data.db'


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Training data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS training_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            user_id INTEGER,
            prediction TEXT,
            human_label TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Abuse reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS abuse_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            user_id INTEGER,
            reported_user_id INTEGER,
            prediction TEXT,
            severity TEXT,
            requires_immediate_action BOOLEAN,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            moderator_id INTEGER
        )
    ''')

    # Model performance metrics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS model_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            accuracy REAL,
            precision_score REAL,
            recall_score REAL,
            f1_score REAL,
            training_samples INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()


init_db()

# Add a health check endpoint


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'model_trained': detector.is_trained,
        'endpoints': {
            'predict': '/predict-hate-speech',
            'report_abuse': '/report-abuse',
            'store_data': '/store-training-data',
            'retrain': '/retrain-model',
            'stats': '/model-stats'
        }
    })


def convert_types(obj):
    import numpy as np
    if isinstance(obj, dict):
        return {k: convert_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_types(v) for v in obj]
    elif isinstance(obj, (np.generic,)):
        return obj.item()
    elif isinstance(obj, (bool, int, float, str, type(None))):
        return obj
    return str(obj)


@app.route('/predict-hate-speech', methods=['POST'])
def predict_hate_speech():
    """
    Enhanced endpoint for hate speech prediction
    Expected input: {"text": "content to analyze", "userId": optional}
    Returns: Enhanced prediction with severity and action requirements
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        user_id = data.get('userId')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Get prediction from enhanced model
        with model_lock:
            prediction = detector.predict(text)

        # Convert all values to standard types
        prediction = convert_types(prediction)

        # If requires immediate action, automatically create abuse report
        if prediction['requires_immediate_action']:
            try:
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()

                cursor.execute('''
                    INSERT INTO abuse_reports (text, user_id, prediction, severity, requires_immediate_action)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    text,
                    user_id,
                    json.dumps(prediction),
                    prediction['severity'],
                    int(prediction['requires_immediate_action'])
                ))

                conn.commit()
                conn.close()

                prediction['auto_reported'] = True
                logger.warning(
                    f"Automatic abuse report created for user {user_id}")

            except Exception as e:
                logger.error(f"Auto-report creation error: {e}")
                prediction['auto_reported'] = False

        return jsonify(prediction)

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500


@app.route('/report-abuse', methods=['POST'])
def report_abuse():
    """
    Endpoint for manual abuse reporting
    Expected input: {
        "text": "abusive content",
        "userId": int,
        "reportedUserId": int,
        "additionalInfo": "optional context"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        user_id = data.get('userId')
        reported_user_id = data.get('reportedUserId')
        additional_info = data.get('additionalInfo', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Get prediction for the reported content
        with model_lock:
            prediction = detector.predict(text)

        # Store abuse report
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO abuse_reports (text, user_id, reported_user_id, prediction, severity, requires_immediate_action)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            text,
            user_id,
            reported_user_id,
            json.dumps(prediction),
            prediction['severity'],
            prediction['requires_immediate_action']
        ))

        report_id = cursor.lastrowid
        conn.commit()
        conn.close()

        logger.info(f"Abuse report {report_id} created by user {user_id}")

        return jsonify({
            'status': 'success',
            'report_id': report_id,
            'prediction': prediction,
            'message': 'Abuse report submitted successfully'
        })

    except Exception as e:
        logger.error(f"Abuse reporting error: {e}")
        return jsonify({'error': 'Failed to submit abuse report'}), 500


@app.route('/store-training-data', methods=['POST'])
def store_training_data():
    """
    Endpoint to store training data for model improvement
    Expected input: {
        "text": "content",
        "timestamp": "ISO date",
        "userId": int,
        "prediction": {},
        "humanLabel": "hate_speech" or "not_hate_speech"
    }
    """
    try:
        data = request.get_json()

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO training_data (text, timestamp, user_id, prediction, human_label)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('text'),
            data.get('timestamp'),
            data.get('userId'),
            json.dumps(data.get('prediction', {})),
            data.get('humanLabel')
        ))

        conn.commit()
        conn.close()

        return jsonify({'status': 'success'})

    except Exception as e:
        logger.error(f"Storage error: {e}")
        return jsonify({'error': 'Failed to store data'}), 500


@app.route('/retrain-model', methods=['POST'])
def retrain_model():
    """
    Endpoint to trigger model retraining with new data
    """
    try:
        # Fetch training data from database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT text, human_label FROM training_data 
            WHERE human_label IS NOT NULL
        ''')

        training_data = cursor.fetchall()
        conn.close()

        if len(training_data) < 50:  # Minimum data requirement
            return jsonify({'error': 'Insufficient training data (minimum 50 samples required)'}), 400

        # Prepare training data
        texts = [row[0] for row in training_data]
        labels = [1 if row[1] == 'hate_speech' else 0 for row in training_data]

        # Retrain model
        with model_lock:
            training_result = detector.train(texts, labels)

        if training_result['success']:
            # Save the retrained model
            detector.save_model(model_path)

            # Store training metrics
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO model_metrics (accuracy, training_samples)
                VALUES (?, ?)
            ''', (
                training_result['test_accuracy'],
                training_result['training_samples']
            ))

            conn.commit()
            conn.close()

            logger.info(
                f"Model retrained successfully with {len(training_data)} samples")

            return jsonify({
                'status': 'success',
                'message': f'Model retrained with {len(training_data)} samples',
                'accuracy': training_result['test_accuracy'],
                'training_samples': training_result['training_samples']
            })
        else:
            return jsonify({'error': training_result['error']}), 500

    except Exception as e:
        logger.error(f"Retraining error: {e}")
        return jsonify({'error': 'Retraining failed'}), 500


@app.route('/model-stats', methods=['GET'])
def get_model_stats():
    """Get comprehensive model and system statistics"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get training data stats
        cursor.execute('SELECT COUNT(*) FROM training_data')
        total_samples = cursor.fetchone()[0]

        cursor.execute(
            'SELECT COUNT(*) FROM training_data WHERE human_label IS NOT NULL')
        labeled_samples = cursor.fetchone()[0]

        # Get abuse report stats
        cursor.execute('SELECT COUNT(*) FROM abuse_reports')
        total_reports = cursor.fetchone()[0]

        cursor.execute(
            'SELECT COUNT(*) FROM abuse_reports WHERE requires_immediate_action = 1')
        critical_reports = cursor.fetchone()[0]

        cursor.execute(
            'SELECT COUNT(*) FROM abuse_reports WHERE status = "pending"')
        pending_reports = cursor.fetchone()[0]

        # Get recent model performance
        cursor.execute(
            'SELECT accuracy FROM model_metrics ORDER BY created_at DESC LIMIT 1')
        latest_accuracy = cursor.fetchone()
        accuracy = latest_accuracy[0] if latest_accuracy else None

        # Get abuse categories distribution
        cursor.execute(
            'SELECT severity, COUNT(*) FROM abuse_reports GROUP BY severity')
        severity_distribution = dict(cursor.fetchall())

        conn.close()

        return jsonify({
            'status': 'active',
            'model_info': {
                'is_trained': detector.is_trained,
                'accuracy': accuracy,
                'last_updated': datetime.now().isoformat()
            },
            'training_data': {
                'total_samples': total_samples,
                'labeled_samples': labeled_samples,
                'unlabeled_samples': total_samples - labeled_samples
            },
            'abuse_reports': {
                'total_reports': total_reports,
                'critical_reports': critical_reports,
                'pending_reports': pending_reports,
                'severity_distribution': severity_distribution
            },
            'detection_capabilities': {
                'real_time_detection': True,
                'pattern_based_detection': True,
                'ml_based_detection': detector.is_trained,
                'automatic_reporting': True,
                'severity_assessment': True
            },
            'endpoints': {
                'predict': '/predict-hate-speech',
                'report_abuse': '/report-abuse',
                'store_data': '/store-training-data',
                'retrain': '/retrain-model',
                'health': '/health'
            }
        })

    except Exception as e:
        logger.error(f"Stats error: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/get-pending-reports', methods=['GET'])
def get_pending_reports():
    """Get pending abuse reports for moderation"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, text, user_id, reported_user_id, severity, 
                   requires_immediate_action, created_at
            FROM abuse_reports 
            WHERE status = "pending"
            ORDER BY requires_immediate_action DESC, created_at DESC
            LIMIT 50
        ''')

        reports = []
        for row in cursor.fetchall():
            reports.append({
                'id': row[0],
                'text': row[1],
                'user_id': row[2],
                'reported_user_id': row[3],
                'severity': row[4],
                'requires_immediate_action': bool(row[5]),
                'created_at': row[6]
            })

        conn.close()

        return jsonify({
            'status': 'success',
            'reports': reports,
            'total_pending': len(reports)
        })

    except Exception as e:
        logger.error(f"Get pending reports error: {e}")
        return jsonify({'error': 'Failed to fetch pending reports'}), 500


if __name__ == '__main__':
    print("Starting Enhanced ML Integration Server...")
    print("Features:")
    print("- Advanced hate speech detection")
    print("- Real-time abuse reporting")
    print("- Pattern-based + ML-based detection")
    print("- Automatic severity assessment")
    print("- Model retraining capabilities")
    print("\nEndpoints available:")
    print("- POST /predict-hate-speech")
    print("- POST /report-abuse")
    print("- POST /store-training-data")
    print("- POST /retrain-model")
    print("- GET /model-stats")
    print("- GET /get-pending-reports")
    print("- GET /health")

    app.run(debug=True, host='0.0.0.0', port=5000)
