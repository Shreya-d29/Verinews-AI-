#!/usr/bin/env python3
"""
Test script for VeriNews AI Flask API
"""

import requests
import json
import sys

def test_api(base_url="http://localhost:5000"):
    """Test the Flask API endpoints"""
    
    print("=== VeriNews AI - API Test ===")
    print(f"Testing API at: {base_url}")
    print()
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False
    
    print()
    
    # Test prediction endpoint
    test_articles = [
        {
            "text": "Scientists at Harvard University have published a groundbreaking study in Nature journal showing promising results for a new cancer treatment.",
            "expected": "Real"
        },
        {
            "text": "SHOCKING: Doctors HATE this one weird trick that ELIMINATES belly fat overnight! Click here to discover the secret that pharmaceutical companies don't want you to know!",
            "expected": "Fake"
        },
        {
            "text": "Breaking: Local man discovers miracle cure that doctors don't want you to know about! You won't believe what happens next!",
            "expected": "Fake"
        }
    ]
    
    for i, article in enumerate(test_articles, 1):
        print(f"Test {i}: Analyzing article...")
        print(f"Text: {article['text'][:100]}...")
        print(f"Expected: {article['expected']}")
        
        try:
            response = requests.post(
                f"{base_url}/predict",
                json={"text": article["text"]},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                prediction = result.get("prediction", "Unknown")
                confidence = result.get("confidence", 0)
                
                print(f"✓ Prediction: {prediction} (confidence: {confidence:.3f})")
                
                # Check NLP features
                nlp = result.get("nlp", {})
                print(f"  Keywords: {nlp.get('top_keywords', [])[:5]}")
                print(f"  Sentiment: {nlp.get('sentiment', 0):.3f}")
                print(f"  Clickbait Score: {nlp.get('clickbait_score', 0):.3f}")
                print(f"  Entities: {len(nlp.get('entities', []))}")
                
                if result.get("explanation"):
                    print(f"  Explanation: {result['explanation'][:100]}...")
                
                # Check if prediction matches expectation
                if prediction == article["expected"]:
                    print("  ✓ Prediction matches expectation")
                else:
                    print(f"  ⚠ Prediction mismatch (expected {article['expected']})")
                
            else:
                print(f"✗ Prediction failed: {response.status_code}")
                print(f"  Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Prediction failed: {e}")
        
        print()
    
    # Test metrics endpoint
    try:
        response = requests.get(f"{base_url}/metrics")
        if response.status_code == 200:
            metrics = response.json()
            print("✓ Metrics endpoint working")
            print(f"  Accuracy: {metrics.get('accuracy', 'N/A')}")
            print(f"  Precision: {metrics.get('precision', 'N/A')}")
            print(f"  Recall: {metrics.get('recall', 'N/A')}")
            print(f"  F1-Score: {metrics.get('f1_score', 'N/A')}")
        else:
            print(f"✗ Metrics failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Metrics failed: {e}")
    
    print()
    print("=== API Test Complete ===")
    return True

if __name__ == "__main__":
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    success = test_api(base_url)
    sys.exit(0 if success else 1)