#!/usr/bin/env python3
"""
VeriNews AI - Setup Validation Script
Validates that all components are properly configured
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✓ {description}: {filepath}")
        return True
    else:
        print(f"✗ {description}: {filepath} (missing)")
        return False

def check_python_package(package_name):
    """Check if a Python package is installed"""
    try:
        __import__(package_name)
        print(f"✓ Python package: {package_name}")
        return True
    except ImportError:
        print(f"✗ Python package: {package_name} (not installed)")
        return False

def check_node_package(package_name, directory="."):
    """Check if a Node.js package is installed"""
    package_json_path = os.path.join(directory, "package.json")
    node_modules_path = os.path.join(directory, "node_modules", package_name)
    
    if os.path.exists(package_json_path) and os.path.exists(node_modules_path):
        print(f"✓ Node.js package: {package_name} (in {directory})")
        return True
    else:
        print(f"✗ Node.js package: {package_name} (not installed in {directory})")
        return False

def validate_ml_model():
    """Validate ML model setup"""
    print("\n=== ML Model Validation ===")
    
    issues = []
    
    # Check required files
    ml_files = [
        ("ml-model/requirements.txt", "Requirements file"),
        ("ml-model/train_model.py", "Training script"),
        ("ml-model/app.py", "Flask API"),
        ("ml-model/setup.py", "Setup script"),
    ]
    
    for filepath, description in ml_files:
        if not check_file_exists(filepath, description):
            issues.append(f"Missing {description}")
    
    # Check if model is trained
    model_files = [
        ("ml-model/model.pkl", "Trained model"),
        ("ml-model/vectorizer.pkl", "TF-IDF vectorizer"),
        ("ml-model/metrics.json", "Model metrics"),
    ]
    
    trained = True
    for filepath, description in model_files:
        if not check_file_exists(filepath, description):
            trained = False
    
    if not trained:
        print("⚠ Model not trained yet. Run: cd ml-model && python train_model.py")
    
    # Check Python packages (if virtual environment is activated)
    python_packages = [
        "flask", "sklearn", "pandas", "numpy", "nltk", "textblob", "joblib"
    ]
    
    venv_active = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    
    if venv_active:
        print("✓ Virtual environment detected")
        for package in python_packages:
            check_python_package(package)
    else:
        print("⚠ No virtual environment detected. Consider using: python -m venv venv")
    
    return issues

def validate_backend():
    """Validate Node.js backend setup"""
    print("\n=== Backend Validation ===")
    
    issues = []
    
    # Check if backend directory exists
    if not os.path.exists("backend"):
        print("⚠ Backend directory not found (optional component)")
        return issues
    
    # Check required files
    backend_files = [
        ("backend/package.json", "Package.json"),
        ("backend/server.js", "Express server"),
        ("backend/.env.example", "Environment template"),
    ]
    
    for filepath, description in backend_files:
        if not check_file_exists(filepath, description):
            issues.append(f"Missing {description}")
    
    # Check Node.js packages
    node_packages = [
        "express", "cors", "helmet", "morgan", "axios"
    ]
    
    for package in node_packages:
        check_node_package(package, "backend")
    
    return issues

def validate_frontend():
    """Validate frontend setup"""
    print("\n=== Frontend Validation ===")
    
    issues = []
    
    # Check required files
    frontend_files = [
        ("package.json", "Package.json"),
        ("src/lib/api.ts", "API integration"),
        ("src/components/Header.tsx", "Header component"),
        ("src/components/ResultCard.tsx", "Result component"),
    ]
    
    for filepath, description in frontend_files:
        if not check_file_exists(filepath, description):
            issues.append(f"Missing {description}")
    
    # Check Node.js packages
    frontend_packages = [
        "react", "typescript", "vite", "@tanstack/react-router"
    ]
    
    for package in frontend_packages:
        check_node_package(package, ".")
    
    return issues

def validate_dataset():
    """Validate dataset"""
    print("\n=== Dataset Validation ===")
    
    issues = []
    
    dataset_path = "FakeNewsNet.csv"
    if check_file_exists(dataset_path, "Training dataset"):
        try:
            # Try to read first few lines
            with open(dataset_path, 'r', encoding='utf-8') as f:
                header = f.readline().strip()
                if 'title' in header and 'real' in header:
                    print("✓ Dataset format appears correct")
                else:
                    print(f"⚠ Dataset header: {header}")
                    print("  Expected columns: title, real")
                    issues.append("Dataset format may be incorrect")
        except Exception as e:
            print(f"✗ Error reading dataset: {e}")
            issues.append("Cannot read dataset file")
    else:
        issues.append("Missing training dataset")
    
    return issues

def validate_docker():
    """Validate Docker setup (optional)"""
    print("\n=== Docker Validation (Optional) ===")
    
    # Check Docker files
    docker_files = [
        ("ml-model/Dockerfile", "ML API Dockerfile"),
        ("backend/Dockerfile", "Backend Dockerfile"),
        ("docker-compose.yml", "Docker Compose"),
    ]
    
    docker_available = True
    for filepath, description in docker_files:
        if not check_file_exists(filepath, description):
            docker_available = False
    
    if docker_available:
        print("✓ Docker configuration files present")
    else:
        print("⚠ Some Docker files missing (optional)")
    
    # Check if Docker is installed
    try:
        result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ Docker installed: {result.stdout.strip()}")
        else:
            print("✗ Docker not working properly")
    except FileNotFoundError:
        print("⚠ Docker not installed (optional)")

def main():
    """Main validation function"""
    print("=== VeriNews AI - Setup Validation ===")
    print(f"Working directory: {os.getcwd()}")
    print()
    
    all_issues = []
    
    # Validate each component
    all_issues.extend(validate_dataset())
    all_issues.extend(validate_ml_model())
    all_issues.extend(validate_backend())
    all_issues.extend(validate_frontend())
    validate_docker()
    
    # Summary
    print("\n=== Validation Summary ===")
    
    if not all_issues:
        print("✓ All components validated successfully!")
        print("\nNext steps:")
        print("1. Train the model: cd ml-model && python train_model.py")
        print("2. Start ML API: cd ml-model && python app.py")
        print("3. Start frontend: npm run dev")
        return 0
    else:
        print(f"✗ Found {len(all_issues)} issues:")
        for issue in all_issues:
            print(f"  - {issue}")
        print("\nPlease resolve these issues before proceeding.")
        return 1

if __name__ == "__main__":
    exit(main())