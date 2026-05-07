#!/usr/bin/env python3
"""
VeriNews AI - Server Startup Script
Handles common issues and starts the Flask server
"""

import os
import sys
import subprocess
import time

def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print(f"❌ Python {version.major}.{version.minor} is not supported")
        print("Please use Python 3.7 or higher")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_virtual_environment():
    """Check if virtual environment is activated"""
    in_venv = (
        hasattr(sys, 'real_prefix') or 
        (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    )
    
    if in_venv:
        print("✅ Virtual environment detected")
        return True
    else:
        print("⚠️  No virtual environment detected")
        print("Consider using: python -m venv venv && source venv/bin/activate")
        return False

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ], check=True, capture_output=True)
        print("✅ Requirements installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def download_nltk_data():
    """Download required NLTK data"""
    print("📚 Downloading NLTK data...")
    
    import nltk
    
    required_data = ['punkt', 'stopwords', 'wordnet']
    
    for data_name in required_data:
        try:
            nltk.download(data_name, quiet=True)
        except Exception as e:
            print(f"⚠️  Failed to download {data_name}: {e}")
    
    print("✅ NLTK data ready")

def download_spacy_model():
    """Download spaCy model"""
    print("🧠 Downloading spaCy model...")
    
    try:
        subprocess.run([
            sys.executable, '-m', 'spacy', 'download', 'en_core_web_sm'
        ], check=True, capture_output=True)
        print("✅ spaCy model downloaded")
        return True
    except subprocess.CalledProcessError:
        print("⚠️  Failed to download spaCy model (NER will be disabled)")
        return False

def check_model_files():
    """Check if model files exist"""
    required_files = ['model.pkl', 'vectorizer.pkl']
    
    missing_files = []
    for filename in required_files:
        if os.path.exists(filename):
            print(f"✅ {filename}")
        else:
            print(f"❌ {filename} (missing)")
            missing_files.append(filename)
    
    return len(missing_files) == 0

def train_model():
    """Train the model if files are missing"""
    print("🎯 Training model...")
    
    try:
        subprocess.run([sys.executable, 'train_model.py'], check=True)
        print("✅ Model training completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Model training failed: {e}")
        return False

def start_flask_server():
    """Start the Flask server"""
    print("🚀 Starting Flask server...")
    print()
    
    try:
        # Import and run the app
        from app import app, load_models
        
        if not load_models():
            print("❌ Failed to load models")
            return False
        
        port = int(os.environ.get('PORT', 5000))
        
        print(f"🌐 Server starting at http://localhost:{port}")
        print("📡 API endpoints:")
        print(f"   - GET  http://localhost:{port}/health")
        print(f"   - POST http://localhost:{port}/predict")
        print(f"   - GET  http://localhost:{port}/metrics")
        print()
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        return True
    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main startup function"""
    print("🔧 VeriNews AI - Server Startup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        return 1
    
    # Check virtual environment
    check_virtual_environment()
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ app.py not found")
        print("Please run this script from the ml-model directory")
        return 1
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        return 1
    
    # Download NLTK data
    download_nltk_data()
    
    # Download spaCy model (optional)
    download_spacy_model()
    
    # Check model files
    if not check_model_files():
        print("📊 Model files missing, training model...")
        if not train_model():
            print("❌ Failed to train model")
            return 1
    
    print()
    print("✅ All checks passed!")
    print()
    
    # Start server
    if start_flask_server():
        return 0
    else:
        return 1

if __name__ == "__main__":
    exit(main())