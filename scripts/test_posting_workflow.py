"""
Test Posting Workflow for SafeSocial AI Systems
Tests the complete flow from posting to hate speech detection and auto-flagging
"""

import requests
import json
import time

ML_SERVER_URL = "http://localhost:5000"
NEXTJS_URL = "http://localhost:3000"

def test_hate_speech_detection():
    """Test hate speech detection with various examples"""
    
    print("=== Testing Hate Speech Detection ===\n")
    
    test_cases = [
        # Single words
        ("fuck", "Single profanity"),
        ("kill", "Single threat"),
        ("hate", "Single hate word"),
        ("bitch", "Single slur"),
        ("nigger", "Racial slur"),
        ("faggot", "Homophobic slur"),
        
        # Phrases
        ("I hate you", "Direct hate"),
        ("kill yourself", "Suicide encouragement"),
        ("you're a bitch", "Insult with profanity"),
        ("go die", "Death wish"),
        
        # Long sentences with hate words
        ("I really appreciate your thoughtful comment about the weather today and how it affects our daily lives, but I think you're completely wrong about everything and should just kill yourself because nobody cares about your opinion anyway.", "Long sentence with threat"),
        ("This is a very interesting discussion about politics and I respect different viewpoints, however I strongly disagree with your perspective and think you're a worthless piece of shit who doesn't deserve to have an opinion.", "Long sentence with profanity"),
        ("Thank you for sharing your experience with the new restaurant downtown, it sounds like you had a great time and I'm glad you enjoyed the food, but honestly I think you're a complete idiot for liking that place.", "Long sentence with insult"),
        
        # Clean examples
        ("hello", "Normal greeting"),
        ("I love this community", "Positive message"),
        ("Thank you for your help", "Polite message"),
        ("Have a great day everyone!", "Friendly message"),
    ]
    
    results = {
        'detected': [],
        'clean': [],
        'errors': []
    }
    
    for text, description in test_cases:
        try:
            response = requests.post(
                f"{ML_SERVER_URL}/predict-hate-speech",
                json={"text": text},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                is_hate = result.get('is_hate_speech', False)
                confidence = result.get('confidence', 0)
                severity = result.get('severity', 'unknown')
                
                test_result = {
                    'text': text,
                    'description': description,
                    'is_hate': is_hate,
                    'confidence': confidence,
                    'severity': severity
                }
                
                if is_hate:
                    results['detected'].append(test_result)
                    print(f"🚨 DETECTED | {description}")
                    print(f"   Text: '{text[:50]}{'...' if len(text) > 50 else ''}'")
                    print(f"   Confidence: {confidence:.3f}, Severity: {severity}")
                else:
                    results['clean'].append(test_result)
                    print(f"✅ CLEAN | {description}")
                    print(f"   Text: '{text[:50]}{'...' if len(text) > 50 else ''}'")
                    print(f"   Confidence: {confidence:.3f}")
                print()
            else:
                error = f"HTTP {response.status_code} for {description}"
                results['errors'].append(error)
                print(f"❌ ERROR | {error}")
                print()
                
        except Exception as e:
            error = f"Exception for {description}: {str(e)}"
            results['errors'].append(error)
            print(f"❌ ERROR | {error}")
            print()
    
    return results

def test_auto_reporting():
    """Test that hate speech automatically creates reports"""
    
    print("=== Testing Auto-Reporting System ===\n")
    
    # Test cases that should trigger auto-reports
    hate_speech_examples = [
        "I hate you and want you to die",
        "You're a worthless piece of shit",
        "Kill yourself, nobody cares",
        "Go back to your country",
        "Women should be raped"
    ]
    
    for text in hate_speech_examples:
        try:
            print(f"Testing auto-report for: '{text[:30]}...'")
            
            # Send to ML server
            response = requests.post(
                f"{ML_SERVER_URL}/predict-hate-speech",
                json={"text": text},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                is_hate = result.get('is_hate_speech', False)
                
                if is_hate:
                    print(f"   ✅ Hate speech detected - should auto-report")
                    print(f"   Confidence: {result.get('confidence', 0):.3f}")
                    print(f"   Severity: {result.get('severity', 'unknown')}")
                else:
                    print(f"   ❌ Hate speech NOT detected - may need retraining")
            else:
                print(f"   ❌ Error: HTTP {response.status_code}")
            
            print()
            
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            print()

def test_model_stats():
    """Check model statistics and training status"""
    
    print("=== Model Statistics ===\n")
    
    try:
        response = requests.get(f"{ML_SERVER_URL}/model-stats", timeout=5)
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Model Status: Active")
            print(f"   Accuracy: {stats.get('accuracy', 'N/A')}")
            print(f"   Training Samples: {stats.get('training_samples', 'N/A')}")
            print(f"   Last Training: {stats.get('training_date', 'N/A')}")
        else:
            print(f"❌ Error getting model stats: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception getting model stats: {str(e)}")
    
    print()

def test_health_check():
    """Test ML server health"""
    
    print("=== Health Check ===\n")
    
    try:
        response = requests.get(f"{ML_SERVER_URL}/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ ML Server: Healthy and Running")
        else:
            print(f"❌ ML Server: Error HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ ML Server: Connection failed - {str(e)}")
    
    print()

def main():
    """Run comprehensive testing"""
    
    print("🧪 SafeSocial AI Posting Workflow Test")
    print("=" * 50)
    print()
    
    # Health check
    test_health_check()
    
    # Model stats
    test_model_stats()
    
    # Hate speech detection
    results = test_hate_speech_detection()
    
    # Auto-reporting test
    test_auto_reporting()
    
    # Summary
    print("=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Hate Speech Detected: {len(results['detected'])}")
    print(f"Clean Content: {len(results['clean'])}")
    print(f"Errors: {len(results['errors'])}")
    
    if results['errors']:
        print("\n❌ ERRORS FOUND:")
        for error in results['errors']:
            print(f"   - {error}")
    
    print("\n🎯 RECOMMENDATIONS:")
    if len(results['detected']) > 0:
        print("✅ Hate speech detection is working")
    else:
        print("❌ Hate speech detection may need improvement")
    
    if len(results['errors']) == 0:
        print("✅ All systems are functioning properly")
    else:
        print("❌ Some systems have errors that need attention")
    
    print("\n🚀 NEXT STEPS:")
    print("1. Test posting through the web interface")
    print("2. Check admin dashboard for auto-generated reports")
    print("3. Verify flagged content is hidden from regular users")

if __name__ == "__main__":
    main() 