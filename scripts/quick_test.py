import requests

def test_xenophobic_phrases():
    """Quick test for xenophobic phrase detection"""
    
    test_phrases = [
        "Go back to your country",
        "All immigrants are criminals",
        "Refugees are terrorists",
        "You don't belong here",
        "Go back where you came from"
    ]
    
    print("Testing xenophobic phrase detection:")
    print("=" * 40)
    
    for phrase in test_phrases:
        try:
            response = requests.post(
                "http://localhost:5000/predict-hate-speech",
                json={"text": phrase},
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                is_hate = result.get('is_hate_speech', False)
                confidence = result.get('confidence', 0)
                
                status = "🚨 DETECTED" if is_hate else "✅ CLEAN"
                print(f"{status} | '{phrase}'")
                print(f"   Confidence: {confidence:.3f}")
            else:
                print(f"❌ ERROR | '{phrase}' - HTTP {response.status_code}")
            
            print()
            
        except Exception as e:
            print(f"❌ ERROR | '{phrase}' - {str(e)}")
            print()

if __name__ == "__main__":
    test_xenophobic_phrases() 