@echo off
REM VeriNews AI - Complete Setup Script for Windows

echo === VeriNews AI - Complete Setup ===
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python 3 is required but not installed
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Warning: Node.js not found. Skipping Node.js API gateway setup.
    set SKIP_NODE=true
) else (
    set SKIP_NODE=false
)

echo Setting up ML Model Backend...
echo ================================

REM Setup ML model
cd ml-model

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo Virtual environment created
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo Python dependencies installed

REM Run setup script
echo Setting up ML environment...
python setup.py
echo ML environment setup complete

REM Train model
echo Training ML model...
python train_model.py
if errorlevel 1 (
    echo Model training failed
    pause
    exit /b 1
)
echo Model training completed successfully

cd ..

REM Setup Node.js backend (optional)
if "%SKIP_NODE%"=="false" (
    echo.
    echo Setting up Node.js API Gateway...
    echo =================================
    
    cd backend
    
    REM Install Node.js dependencies
    echo Installing Node.js dependencies...
    npm install
    echo Node.js dependencies installed
    
    REM Create .env file
    if not exist ".env" (
        copy .env.example .env
        echo .env file created
    )
    
    cd ..
)

REM Setup frontend dependencies
echo.
echo Setting up Frontend...
echo =====================

REM Install frontend dependencies
echo Installing frontend dependencies...
npm install
echo Frontend dependencies installed

echo.
echo === Setup Complete ===
echo.
echo Next steps:
echo 1. Start the ML API server:
echo    cd ml-model
echo    venv\Scripts\activate
echo    python app.py
echo.

if "%SKIP_NODE%"=="false" (
    echo 2. ^(Optional^) Start the Node.js API gateway:
    echo    cd backend
    echo    npm run dev
    echo.
)

echo 3. Start the frontend development server:
echo    npm run dev
echo.
echo 4. Open your browser to http://localhost:3000
echo.
echo API Endpoints:
echo - Flask ML API: http://localhost:5000
if "%SKIP_NODE%"=="false" (
    echo - Node.js Gateway: http://localhost:3001
)
echo - Frontend: http://localhost:3000
echo.

echo VeriNews AI setup completed successfully!
pause