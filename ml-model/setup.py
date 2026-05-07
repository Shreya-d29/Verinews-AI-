#!/usr/bin/env python3
"""
Setup script for VeriNews AI ML Model
Downloads required models and prepares the environment
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Setup the ML environment"""
    print("=== VeriNews AI - Environment Setup ===")
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        return 1
    
    # Download spaCy model
    if not run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model"):
        print("Warning: spaCy model download failed. NER features will be limited.")
    
    # Download NLTK data
    print("\nDownloading NLTK data...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True) 
        nltk.download('wordnet', quiet=True)
        print("✓ NLTK data downloaded")
    except Exception as e:
        print(f"✗ NLTK data download failed: {e}")
        return 1
    
    print("\n=== Setup Complete ===")
    print("Next steps:")
    print("1. Run: python train_model.py")
    print("2. Run: python app.py")
    
    return 0

if __name__ == "__main__":
    exit(main())