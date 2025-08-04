import requests
import json

def test_simple_chatbot():
    """Simple test to debug chatbot issue"""
    
    print("🔍 Simple Chatbot Debug Test")
    print("=" * 40)
    
    # Test 1: Basic connectivity
    try:
        response = requests.get("http://localhost:3000/api/support-chat", timeout=5)
        print(f"GET test: {response.status_code}")
    except Exception as e:
        print(f"GET test error: {e}")
    
    # Test 2: Minimal payload
    try:
        payload = {
            "messages": [
                {"role": "user", "content": "Hello"}
            ]
        }
        
        response = requests.post(
            "http://localhost:3000/api/support-chat",
            json=payload,
            timeout=30
        )
        
        print(f"Minimal payload status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                content = response.text
                print(f"Response content (first 500 chars): {content[:500]}")
            except Exception as e:
                print(f"Error reading response: {e}")
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Minimal payload error: {e}")
    
    # Test 3: Check environment
    print("\n🔧 Environment Check:")
    try:
        import os
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key:
            print(f"✅ OpenAI API key found (length: {len(openai_key)})")
        else:
            print("❌ OpenAI API key not found")
    except Exception as e:
        print(f"❌ Environment check error: {e}")

if __name__ == "__main__":
    test_simple_chatbot() 