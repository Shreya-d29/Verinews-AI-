#!/usr/bin/env python3
"""
Quick test to verify the Flask server is working
"""

import requests
import json
import time
import sys

def test_server(base_url="http://localhost:5000", timeout=30):
    """Test if the server is responding"""
    
    print(f"🧪 Testing server at {base_url}")
    print("=" * 40)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    
    for i in range(timeout):
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ Server is running! (took {i+1}s)")
                break
        except requests.exceptions.RequestException:
            pass
        
        time.sleep(1)
        if i % 5 == 4:
            print(f"   Still waiting... ({i+1}s)")
    else:
        print("❌ Server did not start within timeout")
        return False
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check passed")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Model loaded: {health_data.get('model_loaded')}")
            print(f"   Vectorizer loaded: {health_data.get('vectorizer_loaded')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test prediction endpoint
    try:
        test_text = "Scientists at Harvard University published a study showing promising cancer treatment results."
        
        response = requests.post(
            f"{base_url}/predict",
            json={"text": test_text},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction endpoint working")
            print(f"   Text: {test_text[:50]}...")
            print(f"   Prediction: {result.get('prediction')}")
            print(f"   Confidence: {result.get('confidence'):.3f}")
            print(f"   Keywords: {result.get('nlp', {}).get('top_keywords', [])[:3]}")
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False
    
    # Test metrics endpoint
    try:
        response = requests.get(f"{base_url}/metrics")
        if response.status_code == 200:
            metrics = response.json()
            print("✅ Metrics endpoint working")
            print(f"   Accuracy: {metrics.get('accuracy', 'N/A')}")
        else:
            print(f"⚠️  Metrics endpoint: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Metrics error: {e}")
    
    print()
    print("🎉 Server is working correctly!")
    print(f"🌐 You can now access the API at: {base_url}")
    print()
    print("📋 Available endpoints:")
    print(f"   - GET  {base_url}/health")
    print(f"   - POST {base_url}/predict")
    print(f"   - GET  {base_url}/metrics")
    print()
    print("📝 Example curl command:")
    print(f'curl -X POST {base_url}/predict \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"text": "Your news article text here"}\'')
    
    return True

if __name__ == "__main__":
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    
    success = test_server(base_url)
    sys.exit(0 if success else 1)