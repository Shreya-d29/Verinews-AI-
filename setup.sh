#!/bin/bash

# VeriNews AI - Complete Setup Script
# Sets up the entire application stack

set -e

echo "=== VeriNews AI - Complete Setup ==="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check if Node.js is installed (optional)
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Skipping Node.js API gateway setup."
    SKIP_NODE=true
else
    SKIP_NODE=false
fi

echo "Setting up ML Model Backend..."
echo "================================"

# Setup ML model
cd ml-model

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_status "Python dependencies installed"

# Run setup script
echo "Setting up ML environment..."
python setup.py
print_status "ML environment setup complete"

# Train model
echo "Training ML model..."
python train_model.py
if [ $? -eq 0 ]; then
    print_status "Model training completed successfully"
else
    print_error "Model training failed"
    exit 1
fi

cd ..

# Setup Node.js backend (optional)
if [ "$SKIP_NODE" = false ]; then
    echo
    echo "Setting up Node.js API Gateway..."
    echo "================================="
    
    cd backend
    
    # Install Node.js dependencies
    echo "Installing Node.js dependencies..."
    npm install
    print_status "Node.js dependencies installed"
    
    # Create .env file
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_status ".env file created"
    fi
    
    cd ..
fi

# Setup frontend dependencies
echo
echo "Setting up Frontend..."
echo "====================="

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install
print_status "Frontend dependencies installed"

echo
echo "=== Setup Complete ==="
echo
echo "Next steps:"
echo "1. Start the ML API server:"
echo "   cd ml-model"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python app.py"
echo

if [ "$SKIP_NODE" = false ]; then
    echo "2. (Optional) Start the Node.js API gateway:"
    echo "   cd backend"
    echo "   npm run dev"
    echo
fi

echo "3. Start the frontend development server:"
echo "   npm run dev"
echo
echo "4. Open your browser to http://localhost:3000"
echo
echo "API Endpoints:"
echo "- Flask ML API: http://localhost:5000"
if [ "$SKIP_NODE" = false ]; then
    echo "- Node.js Gateway: http://localhost:3001"
fi
echo "- Frontend: http://localhost:3000"
echo

print_status "VeriNews AI setup completed successfully!"