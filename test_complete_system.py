#!/usr/bin/env python3
"""
Complete system test for VeriNews AI
Tests both backend and frontend connectivity
"""

import requests
import time
import sys

def test_backend():
    """Test the Flask ML backend"""
    print("🧠 Testing ML Backend (Flask API)")
    print("=" * 40)
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print("✅ Backend is running")
            print(f"   Status: {health.get('status')}")
            print(f"   Model loaded: {health.get('model_loaded')}")
            print(f"   Vectorizer loaded: {health.get('vectorizer_loaded')}")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
        
        # Test prediction
        test_data = {
            "text": "Breaking: Scientists discover shocking method that doctors don't want you to know!"
        }
        
        response = requests.post(
            "http://localhost:5000/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction working")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Confidence: {result.get('confidence'):.3f}")
            print(f"   Keywords: {result.get('nlp', {}).get('top_keywords', [])[:3]}")
            print(f"   Sentiment: {result.get('nlp', {}).get('sentiment', 0):.3f}")
            print(f"   Clickbait Score: {result.get('nlp', {}).get('clickbait_score', 0):.3f}")
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend")
        print("   Make sure Flask server is running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Backend error: {e}")
        return False

def test_frontend():
    """Test the frontend"""
    print("\n🌐 Testing Frontend")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
            print("   URL: http://localhost:3000")
            return True
        else:
            print(f"⚠️  Frontend returned status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("⚠️  Frontend not accessible on port 3000")
        print("   This is normal if you haven't started it yet")
        print("   Run: npm run dev")
        return False
    except Exception as e:
        print(f"⚠️  Frontend error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 VeriNews AI - Complete System Test")
    print("=" * 50)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n📊 Test Results")
    print("=" * 20)
    
    if backend_ok:
        print("✅ Backend (ML API): Working")
    else:
        print("❌ Backend (ML API): Failed")
    
    if frontend_ok:
        print("✅ Frontend: Working")
    else:
        print("⚠️  Frontend: Not running")
    
    print("\n🎯 Next Steps")
    print("=" * 15)
    
    if backend_ok and frontend_ok:
        print("🎉 Complete system is working!")
        print("🌐 Open your browser to: http://localhost:3000")
        print("📡 API available at: http://localhost:5000")
    elif backend_ok:
        print("✅ Backend is working!")
        print("📡 API available at: http://localhost:5000")
        print("🔧 To start frontend: npm run dev")
        print("🌐 Then open: http://localhost:3000")
    else:
        print("🔧 Backend needs to be started:")
        print("   cd ml-model")
        print("   python app.py")
    
    print("\n📋 Available URLs:")
    print("   - Backend API: http://localhost:5000")
    print("   - Health Check: http://localhost:5000/health")
    print("   - Frontend: http://localhost:3000")
    
    return 0 if backend_ok else 1

if __name__ == "__main__":
    exit(main())