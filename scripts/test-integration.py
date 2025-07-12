#!/usr/bin/env python3
"""
Test script to verify ML integration with Next.js frontend
"""

import requests
import json
import time

# Configuration
ML_SERVER_URL = "http://localhost:5000"
NEXTJS_URL = "http://localhost:3000"


def test_ml_server():
    """Test ML server endpoints"""
    print("🧪 Testing ML Server...")

    # Test health check
    try:
        response = requests.get(f"{ML_SERVER_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ ML Server health check: PASSED")
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Model trained: {data.get('model_trained')}")
        else:
            print(
                f"❌ ML Server health check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ ML Server health check: FAILED ({e})")
        return False

    # Test hate speech prediction
    test_texts = [
        "Hello, how are you today?",
        "I hate all people from that group",
        "You should kill yourself",
        "This is a great community!"
    ]

    print("\n🔍 Testing hate speech detection...")
    for i, text in enumerate(test_texts, 1):
        try:
            response = requests.post(
                f"{ML_SERVER_URL}/predict-hate-speech",
                json={"text": text},
                timeout=5
            )
            if response.status_code == 200:
                result = response.json()
                status = "🚨 FLAGGED" if result.get(
                    'is_hate_speech') else "✅ SAFE"
                confidence = result.get('confidence', 0)
                categories = result.get('categories', [])
                print(
                    f"   Test {i}: {status} (Confidence: {confidence:.2f}, Categories: {categories})")
            else:
                print(
                    f"   Test {i}: ❌ FAILED (Status: {response.status_code})")
        except Exception as e:
            print(f"   Test {i}: ❌ FAILED ({e})")

    return True


def test_nextjs_api():
    """Test Next.js API endpoints"""
    print("\n🧪 Testing Next.js API...")

    # Test ML stats endpoint
    try:
        response = requests.get(f"{NEXTJS_URL}/api/ml-stats", timeout=5)
        if response.status_code == 200:
            print("✅ Next.js ML stats endpoint: PASSED")
            data = response.json()
            print(f"   ML Server status: {data.get('status')}")
        else:
            print(
                f"❌ Next.js ML stats endpoint: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Next.js ML stats endpoint: FAILED ({e})")
        return False

    # Test post creation with ML moderation
    test_post = {
        "content": "This is a test post with normal content",
        "userId": 1,
        "username": "testuser",
        "fullName": "Test User",
        "avatar": None
    }

    try:
        response = requests.post(
            f"{NEXTJS_URL}/api/posts",
            json=test_post,
            timeout=10
        )
        if response.status_code == 200:
            print("✅ Next.js post creation with ML moderation: PASSED")
            data = response.json()
            print(f"   Post status: {data.get('moderationStatus')}")
            print(f"   Flagged: {data.get('flagged')}")
        else:
            print(
                f"❌ Next.js post creation: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Next.js post creation: FAILED ({e})")
        return False

    return True


def main():
    """Main test function"""
    print("🚀 Starting ML Integration Test Suite")
    print("=" * 50)

    # Test ML server
    ml_ok = test_ml_server()

    # Test Next.js API
    nextjs_ok = test_nextjs_api()

    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   ML Server: {'✅ PASSED' if ml_ok else '❌ FAILED'}")
    print(f"   Next.js API: {'✅ PASSED' if nextjs_ok else '❌ FAILED'}")

    if ml_ok and nextjs_ok:
        print("\n🎉 All tests passed! Integration is working correctly.")
        print("\n📝 Next steps:")
        print("   1. Start your Next.js development server: npm run dev")
        print("   2. Open http://localhost:3000 in your browser")
        print("   3. Create posts to test the ML moderation")
        print("   4. Check the ML Status component for real-time stats")
    else:
        print("\n⚠️  Some tests failed. Please check:")
        print("   1. ML server is running on http://localhost:5000")
        print("   2. Next.js server is running on http://localhost:3000")
        print("   3. No firewall or network issues blocking connections")


if __name__ == "__main__":
    main()
