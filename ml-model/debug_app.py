#!/usr/bin/env python3
"""
Debug script to identify Flask app issues
"""

import sys
import os
import traceback

def check_imports():
    """Check if all required packages can be imported"""
    print("=== Checking Python Imports ===")
    
    required_packages = [
        'flask',
        'flask_cors', 
        'joblib',
        'nltk',
        'textblob',
        'spacy',
        'sklearn',
        'pandas',
        'numpy'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package}")
        except ImportError as e:
            print(f"✗ {package}: {e}")
            missing_packages.append(package)
    
    return missing_packages

def check_nltk_data():
    """Check NLTK data availability"""
    print("\n=== Checking NLTK Data ===")
    
    import nltk
    
    required_data = {
        'punkt': 'tokenizers/punkt',
        'stopwords': 'corpora/stopwords', 
        'wordnet': 'corpora/wordnet'
    }
    
    missing_data = []
    
    for name, path in required_data.items():
        try:
            nltk.data.find(path)
            print(f"✓ {name}")
        except LookupError:
            try:
                # Try alternative path for wordnet
                if name == 'wordnet':
                    nltk.data.find('corpora/wordnet.zip')
                    print(f"✓ {name} (zip format)")
                else:
                    print(f"✗ {name} (missing)")
                    missing_data.append(name)
            except LookupError:
                print(f"✗ {name} (missing)")
                missing_data.append(name)
    
    return missing_data

def check_spacy_model():
    """Check spaCy model availability"""
    print("\n=== Checking spaCy Model ===")
    
    try:
        import spacy
        nlp = spacy.load('en_core_web_sm')
        print("✓ en_core_web_sm model loaded")
        return True
    except OSError:
        print("✗ en_core_web_sm model not found")
        return False
    except Exception as e:
        print(f"✗ spaCy error: {e}")
        return False

def check_model_files():
    """Check if model files exist and can be loaded"""
    print("\n=== Checking Model Files ===")
    
    import joblib
    
    files_to_check = ['model.pkl', 'vectorizer.pkl']
    
    for filename in files_to_check:
        if os.path.exists(filename):
            print(f"✓ {filename} exists")
            try:
                obj = joblib.load(filename)
                print(f"  ✓ {filename} loads successfully")
            except Exception as e:
                print(f"  ✗ {filename} load error: {e}")
                return False
        else:
            print(f"✗ {filename} missing")
            return False
    
    return True

def test_flask_app():
    """Test Flask app initialization"""
    print("\n=== Testing Flask App ===")
    
    try:
        # Import the app
        sys.path.insert(0, '.')
        from app import app, load_models
        
        print("✓ Flask app imported successfully")
        
        # Test model loading
        if load_models():
            print("✓ Models loaded successfully")
        else:
            print("✗ Model loading failed")
            return False
        
        # Test app configuration
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/health')
            if response.status_code == 200:
                print("✓ Health endpoint working")
                print(f"  Response: {response.get_json()}")
            else:
                print(f"✗ Health endpoint failed: {response.status_code}")
                return False
            
            # Test root endpoint
            response = client.get('/')
            if response.status_code == 200:
                print("✓ Root endpoint working")
            else:
                print(f"✗ Root endpoint failed: {response.status_code}")
                return False
        
        return True
        
    except Exception as e:
        print(f"✗ Flask app error: {e}")
        traceback.print_exc()
        return False

def main():
    """Main diagnostic function"""
    print("=== VeriNews AI - Flask App Diagnostics ===")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print()
    
    # Check all components
    missing_packages = check_imports()
    missing_nltk = check_nltk_data()
    spacy_ok = check_spacy_model()
    models_ok = check_model_files()
    
    if missing_packages:
        print(f"\n❌ Missing packages: {missing_packages}")
        print("Run: pip install -r requirements.txt")
        return 1
    
    if missing_nltk:
        print(f"\n❌ Missing NLTK data: {missing_nltk}")
        print("Run: python setup.py")
        return 1
    
    if not models_ok:
        print("\n❌ Model files missing or corrupted")
        print("Run: python train_model.py")
        return 1
    
    # Test Flask app
    if test_flask_app():
        print("\n✅ All diagnostics passed!")
        print("Flask app should work correctly.")
        print("Try running: python app.py")
        return 0
    else:
        print("\n❌ Flask app test failed")
        return 1

if __name__ == "__main__":
    exit(main())