import requests
import json

def test_chatbot_response():
    """Test the support chatbot with abuse-related messages"""
    
    test_messages = [
        "My girlfriend is abusive",
        "I'm being harassed online",
        "I want to kill myself",
        "Someone called me horrible names",
        "I feel really sad and alone"
    ]
    
    print("Testing Support Chatbot Responses:")
    print("=" * 50)
    
    for message in test_messages:
        try:
            print(f"\n🧪 Testing: '{message}'")
            
            payload = {
                "messages": [
                    {"role": "user", "content": message}
                ],
                "reportData": {
                    "userId": "test_user",
                    "type": "abuse_report"
                }
            }
            
            response = requests.post(
                "http://localhost:3000/api/support-chat",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"✅ Status: {response.status_code}")
                print(f"✅ Response received successfully")
                
                # Check if it's a stream response
                content_type = response.headers.get('content-type', '')
                if 'text/plain' in content_type or 'application/json' in content_type:
                    try:
                        response_text = response.text
                        print(f"📝 Response preview: {response_text[:200]}...")
                    except:
                        print("📝 Stream response received (check frontend for full content)")
                else:
                    print("📝 Stream response received (check frontend for full content)")
                    
            else:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"❌ Response: {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"❌ Timeout error - chatbot took too long to respond")
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
        
        print("-" * 30)

def test_chatbot_health():
    """Test if the chatbot endpoint is accessible"""
    
    print("\n🔍 Testing Chatbot Health:")
    print("=" * 30)
    
    try:
        # Test basic connectivity
        response = requests.get("http://localhost:3000/api/support-chat", timeout=5)
        print(f"GET endpoint status: {response.status_code}")
    except Exception as e:
        print(f"GET endpoint error: {str(e)}")
    
    try:
        # Test with empty payload
        response = requests.post(
            "http://localhost:3000/api/support-chat",
            json={},
            timeout=10
        )
        print(f"Empty payload status: {response.status_code}")
    except Exception as e:
        print(f"Empty payload error: {str(e)}")

if __name__ == "__main__":
    test_chatbot_health()
    test_chatbot_response() 