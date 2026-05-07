<!-- # VeriNews AI - ML Model Backend

This directory contains the machine learning backend for VeriNews AI, providing fake news detection with comprehensive NLP analysis.

## Features

- **ML Classification**: Logistic Regression with TF-IDF vectorization
- **NLP Analysis**: Tokenization, keyword extraction, sentiment analysis, NER, clickbait detection
- **Flask API**: RESTful endpoints for prediction and metrics
- **Production Ready**: CORS enabled, error handling, health checks

# VeriNews AI - ML Model Backend

This directory contains the machine learning backend for VeriNews AI, providing fake news detection with comprehensive NLP analysis.

## 🚀 Quick Start (Recommended)

### Option 1: Automated Startup
```bash
cd ml-model
python start_server.py
```

This script will:
- Check Python version and dependencies
- Install requirements automatically
- Download NLTK data and spaCy models
- Train the model if needed
- Start the Flask server

### Option 2: Manual Setup
```bash
cd ml-model

# 1. Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
python setup.py

# 4. Train model
python train_model.py

# 5. Start server
python app.py
```

### Option 3: Debug Issues
```bash
cd ml-model
python debug_app.py  # Diagnose problems
python quick_test.py # Test server after starting
```

## 🔧 Troubleshooting

### Common Issues

#### "Model files not found"
```bash
cd ml-model
python train_model.py
```

#### "NLTK data not found"
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

#### "spaCy model not found"
```bash
python -m spacy download en_core_web_sm
```

#### "Port already in use"
```bash
# Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:5000 | xargs kill -9
```

#### "Import errors"
```bash
pip install --upgrade -r requirements.txt
```

### Server Not Starting?

1. **Check you're in the right directory:**
   ```bash
   ls -la  # Should see app.py, train_model.py, etc.
   ```

2. **Run diagnostics:**
   ```bash
   python debug_app.py
   ```

3. **Check Python version:**
   ```bash
   python --version  # Should be 3.7+
   ```

4. **Use the startup script:**
   ```bash
   python start_server.py
   ```

## 📡 Testing the API

Once the server is running, test it:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test prediction
curl -X POST http://localhost:5000/predict \
     -H "Content-Type: application/json" \
     -d '{"text": "Breaking news: Scientists discover amazing new method!"}'

# Or use the test script
python quick_test.py
```

## 🌐 Server URLs

When running locally:
- **API Base:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **Prediction:** http://localhost:5000/predict (POST)
- **Metrics:** http://localhost:5000/metrics

## 📊 Expected Output

When the server starts successfully, you should see:
```
=== VeriNews AI - Flask API ===
Python version: 3.x.x
Working directory: /path/to/ml-model

Loading models and dependencies...
Loading model.pkl...
Loading vectorizer.pkl...
Initializing NLTK tools...
✓ spaCy model loaded successfully
✓ All models loaded successfully!

✅ Server ready to start!
Host: 0.0.0.0
Port: 5000
Debug mode: False

API endpoints:
- http://localhost:5000/ - API information
- http://localhost:5000/health - Health check
- http://localhost:5000/predict - Analyze news article (POST)
- http://localhost:5000/metrics - Model performance (GET)

Starting Flask server...
Press Ctrl+C to stop

 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[your-ip]:5000
```

## API Endpoints

### POST /predict

Analyze news article for fake/real classification.

**Request:**
```json
{
  "text": "Breaking: Scientists discover shocking new method..."
}
```

**Response:**
```json
{
  "prediction": "Fake",
  "confidence": 0.847,
  "nlp": {
    "tokens": ["breaking", "scientists", "discover", "shocking"],
    "top_keywords": ["shocking", "scientists", "method"],
    "sentiment": -0.2,
    "entities": ["ORG: Scientists"],
    "clickbait_score": 0.6
  },
  "explanation": "High confidence (84.7%) in fake classification. Highly negative emotional language detected. Contains clickbait-style language."
}
```

### GET /metrics

Get model performance metrics.

**Response:**
```json
{
  "accuracy": 0.93,
  "precision": 0.91,
  "recall": 0.94,
  "f1_score": 0.92
}
```

### GET /health

Health check endpoint.

## Model Architecture

- **Preprocessing**: Lowercasing, tokenization, stopword removal, lemmatization
- **Vectorization**: TF-IDF with max 5000 features, 1-2 grams
- **Classifier**: Logistic Regression with L2 regularization
- **NLP Features**: TextBlob sentiment, spaCy NER, custom clickbait detection

## Files

- `train_model.py` - ML training pipeline
- `app.py` - Flask API server
- `setup.py` - Environment setup script
- `requirements.txt` - Python dependencies
- `model.pkl` - Trained classifier (generated)
- `vectorizer.pkl` - TF-IDF vectorizer (generated)
- `metrics.json` - Performance metrics (generated)

## Production Deployment

For production deployment:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `FLASK_ENV` - Set to 'development' for debug mode -->