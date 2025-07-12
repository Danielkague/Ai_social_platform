# ML Integration Guide

This guide explains how to integrate the Python ML server with your Next.js social media platform for real-time hate speech detection and content moderation.

## 🚀 Quick Start

### 1. Start the ML Server

```bash
cd scripts
python ml-integration-example.py
```

The ML server will start on `http://localhost:5000` with the following endpoints:

- `POST /predict-hate-speech` - Analyze text for hate speech
- `POST /report-abuse` - Submit abuse reports
- `POST /store-training-data` - Store data for model improvement
- `POST /retrain-model` - Retrain the ML model
- `GET /model-stats` - Get model statistics
- `GET /get-pending-reports` - Get pending abuse reports
- `GET /health` - Health check

### 2. Start the Next.js Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Test the Integration

```bash
cd scripts
python test-integration.py
```

## 🏗️ Architecture

### ML Server (Python Flask)

- **AdvancedHateSpeechDetector**: Main ML model with pattern-based and ML-based detection
- **Real-time processing**: Analyzes posts as they're created
- **Automatic reporting**: Flags content that requires immediate action
- **Model training**: Collects data and retrains the model
- **Database storage**: SQLite database for training data and abuse reports

### Next.js Frontend

- **ML Service**: TypeScript service for communicating with ML server
- **API Routes**: Next.js API routes that integrate with ML server
- **Real-time UI**: Shows moderation status and ML statistics
- **Fallback detection**: Works even when ML server is unavailable

## 📁 File Structure

```
├── scripts/
│   ├── ml-integration-example.py    # ML server
│   └── test-integration.py          # Integration tests
├── lib/
│   ├── ml-config.ts                 # ML configuration
│   └── ml-service.ts                # ML service client
├── app/
│   ├── api/
│   │   ├── posts/route.ts           # Post creation with ML moderation
│   │   ├── report-abuse/route.ts    # Abuse reporting
│   │   └── ml-stats/route.ts        # ML statistics
│   ├── components/
│   │   └── ml-status.tsx            # ML status component
│   └── page.tsx                     # Main page with ML integration
└── ML_INTEGRATION_README.md         # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
# ML Server Configuration
ML_SERVER_URL=http://localhost:5000
USE_ML_MODEL=true

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ML Server Configuration

The ML server can be configured in `scripts/ml-integration-example.py`:

```python
# Model parameters
self.vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 3),
    stop_words='english',
    lowercase=True,
    min_df=2,
    max_df=0.8
)

# Severity weights
self.severity_weights = {
    'threat': 1.0,
    'hate_speech': 0.9,
    'harassment': 0.8,
    'offensive': 0.7,
    'profanity': 0.5,
    'spam': 0.3
}
```

## 🎯 Features

### Real-time Content Moderation

- **Pattern-based detection**: Immediate response using regex patterns
- **ML-based detection**: Advanced machine learning analysis
- **Severity assessment**: Categorizes content by risk level
- **Automatic flagging**: Flags content that requires immediate action

### Abuse Reporting System

- **Manual reporting**: Users can report abusive content
- **Automatic reporting**: System automatically reports high-risk content
- **Moderation queue**: Pending reports for human review
- **Training data collection**: Improves model over time

### Model Management

- **Real-time training**: Collects data from user interactions
- **Model retraining**: Periodically retrains with new data
- **Performance monitoring**: Tracks accuracy and performance metrics
- **Fallback detection**: Works when ML server is unavailable

## 🔍 How It Works

### 1. Post Creation Flow

```
User creates post → Next.js API → ML Server → Analysis → Response → UI Update
```

1. User submits a post
2. Next.js API sends text to ML server
3. ML server analyzes text using pattern-based and ML-based detection
4. Response includes moderation status, severity, and categories
5. Post is stored with moderation results
6. UI shows appropriate badges and warnings

### 2. ML Analysis Process

```
Text Input → Preprocessing → Pattern Detection → ML Detection → Combined Result
```

1. **Preprocessing**: Clean text, handle misspellings, remove URLs
2. **Pattern Detection**: Check against regex patterns for immediate response
3. **ML Detection**: Use trained model for advanced analysis
4. **Combined Result**: Merge both approaches for final decision

### 3. Training Data Collection

```
User Interaction → Data Storage → Model Retraining → Improved Detection
```

1. All posts are stored as training data
2. Human moderators can label content
3. Model retrains with new labeled data
4. Improved detection accuracy over time

## 🧪 Testing

### Manual Testing

1. Start both servers
2. Create posts with different content types:
   - Normal content: "Hello, how are you?"
   - Offensive content: "You are stupid"
   - Threatening content: "I will kill you"
   - Hate speech: "I hate all people from that group"
3. Check moderation results in the UI
4. Verify ML status component shows correct information

### Automated Testing

Run the test script to verify integration:

```bash
cd scripts
python test-integration.py
```

## 🚨 Troubleshooting

### ML Server Issues

- **Port 5000 in use**: Change port in `ml-integration-example.py`
- **Import errors**: Install required packages: `pip install flask flask-cors scikit-learn numpy`
- **Database errors**: Check SQLite permissions and file paths

### Next.js Issues

- **CORS errors**: Verify ML server CORS configuration
- **API timeouts**: Increase timeout in `ml-service.ts`
- **Connection refused**: Ensure ML server is running

### Integration Issues

- **Fallback mode**: Check ML server logs for errors
- **No moderation**: Verify ML server is accessible from Next.js
- **Performance issues**: Check network latency and server resources

## 📊 Monitoring

### ML Status Component

The ML Status component shows:

- Connection status to ML server
- Model training status
- Accuracy metrics
- Training data statistics
- Pending abuse reports

### Server Logs

- **ML Server**: Check console for prediction logs and errors
- **Next.js**: Check browser console and server logs
- **Database**: Check SQLite database for stored data

## 🔄 Model Improvement

### Automatic Improvement

- All posts are stored as training data
- Model retrains automatically with sufficient data
- Performance metrics are tracked over time

### Manual Improvement

1. Access ML server endpoints directly
2. Submit training data with human labels
3. Trigger manual retraining
4. Monitor accuracy improvements

### Data Quality

- **Labeled data**: Human-verified content classifications
- **Diverse samples**: Various content types and languages
- **Regular updates**: Continuous data collection and model updates

## 🛡️ Security Considerations

### Data Privacy

- Text content is processed locally on ML server
- No sensitive data is stored permanently
- Training data can be anonymized

### Rate Limiting

- Implement rate limiting on ML endpoints
- Monitor for abuse of the system
- Protect against DoS attacks

### Model Security

- Validate input data
- Sanitize text before processing
- Monitor for adversarial attacks

## 📈 Performance Optimization

### ML Server

- **Caching**: Cache frequent predictions
- **Batch processing**: Process multiple texts at once
- **Model optimization**: Use lighter models for faster inference

### Next.js Frontend

- **Request batching**: Batch multiple API calls
- **Caching**: Cache ML responses
- **Lazy loading**: Load ML components on demand

## 🔮 Future Enhancements

### Advanced Features

- **Multi-language support**: Detect hate speech in multiple languages
- **Image analysis**: Detect harmful images and memes
- **Context awareness**: Consider conversation context
- **User behavior analysis**: Track user patterns

### Integration Options

- **WebSocket**: Real-time communication
- **Message queues**: Asynchronous processing
- **Microservices**: Distributed architecture
- **Cloud deployment**: Scalable cloud infrastructure

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review server logs for errors
3. Test individual components
4. Verify network connectivity
5. Check configuration settings

The integration provides a robust foundation for content moderation that can be extended and improved over time.
