# VeriNews AI

A comprehensive fake news detection system powered by machine learning and advanced NLP analysis. Built with React frontend, Flask ML backend, and optional Node.js API gateway.

## 🚀 Features

### ML-Powered Detection
- **Logistic Regression** classifier trained on real dataset
- **TF-IDF Vectorization** with 5000+ features
- **High Accuracy** with precision/recall metrics

### Advanced NLP Analysis
- **Tokenization & Lemmatization** for text preprocessing
- **Keyword Extraction** using TF-IDF scores
- **Sentiment Analysis** with polarity scoring
- **Named Entity Recognition** (NER) for credibility assessment
- **Clickbait Detection** using pattern matching
- **Human-Readable Explanations** for predictions

### Modern Web Interface
- **React + TypeScript** frontend with TanStack Router
- **Tailwind CSS** with shadcn/ui components
- **Real-time Analysis** with confidence scoring
- **Analysis History** with local storage
- **Responsive Design** for all devices

### Production-Ready Backend
- **Flask API** for ML inference
- **Node.js Gateway** (optional) for enhanced features
- **CORS & Security** headers
- **Rate Limiting** and error handling
- **Health Checks** and monitoring

## 📁 Project Structure

```
verinews-ai/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── lib/            # API and utilities
│   │   └── routes/         # Page routes
│   └── package.json
├── ml-model/                # Python ML backend
│   ├── train_model.py      # Model training script
│   ├── app.py             # Flask API server
│   ├── setup.py           # Environment setup
│   ├── requirements.txt   # Python dependencies
│   ├── model.pkl          # Trained model (generated)
│   ├── vectorizer.pkl     # TF-IDF vectorizer (generated)
│   └── metrics.json       # Performance metrics (generated)
├── backend/                 # Node.js API gateway (optional)
│   ├── server.js          # Express server
│   ├── package.json       # Node dependencies
│   └── .env.example       # Environment template
├── dataset/
│   └── FakeNewsNet.csv    # Training dataset
├── setup.sh              # Unix setup script
├── setup.bat             # Windows setup script
└── README.md
```

## 🛠️ Quick Start

### Automated Setup

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Manual Setup

#### 1. ML Backend Setup

```bash
cd ml-model

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment (downloads models)
python setup.py

# Train the model
python train_model.py

# Start Flask API
python app.py
```

#### 2. Node.js Gateway (Optional)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start server
npm run dev
```

#### 3. Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 API Endpoints

### Flask ML API (Port 5000)

#### POST /predict
Analyze news article for fake/real classification.

**Request:**
```json
{
  "text": "Breaking: Scientists discover shocking new method that doctors don't want you to know!"
}
```

**Response:**
```json
{
  "prediction": "Fake",
  "confidence": 0.847,
  "nlp": {
    "tokens": ["breaking", "scientists", "discover", "shocking"],
    "top_keywords": ["shocking", "scientists", "method", "doctors"],
    "sentiment": -0.2,
    "entities": ["ORG: Scientists"],
    "clickbait_score": 0.6
  },
  "explanation": "High confidence (84.7%) in fake classification. Highly negative emotional language detected. Contains clickbait-style language."
}
```

#### GET /metrics
```json
{
  "accuracy": 0.93,
  "precision": 0.91,
  "recall": 0.94,
  "f1_score": 0.92
}
```

### Node.js Gateway (Port 3001)

#### POST /api/analyze
Enhanced analysis with metadata and error handling.

#### POST /api/analyze/batch
Batch processing for multiple articles (max 10).

## 🧠 ML Model Details

### Architecture
- **Preprocessing**: Lowercasing, tokenization, stopword removal, lemmatization
- **Vectorization**: TF-IDF with max 5000 features, 1-2 grams
- **Classifier**: Logistic Regression with L2 regularization
- **Training Data**: FakeNewsNet dataset with real/fake labels

### NLP Features
- **Tokenization**: NLTK word tokenization
- **Keywords**: Top TF-IDF weighted terms
- **Sentiment**: TextBlob polarity analysis (-1 to 1)
- **Entities**: spaCy NER for PERSON, ORG, GPE, EVENT
- **Clickbait**: Pattern matching against known clickbait phrases

### Performance Metrics
- **Accuracy**: ~93% on test set
- **Precision**: ~91% (fake news detection)
- **Recall**: ~94% (fake news detection)
- **F1-Score**: ~92% (balanced performance)

## 🔧 Configuration

### Environment Variables

**Flask (.env in ml-model/):**
```bash
FLASK_ENV=development
PORT=5000
```

**Node.js (.env in backend/):**
```bash
PORT=3001
FLASK_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend Configuration

The frontend automatically detects and connects to available backends:
1. Node.js Gateway (if available)
2. Flask API (direct connection)
3. Demo mode (fallback)

## 🚀 Production Deployment

### Flask API
```bash
cd ml-model
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Node.js Gateway
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

## 📊 Model Training

The training pipeline:

1. **Data Loading**: Loads FakeNewsNet.csv with title and real/fake labels
2. **Preprocessing**: Applies NLP preprocessing pipeline
3. **Feature Extraction**: TF-IDF vectorization with 5000 features
4. **Model Training**: Logistic Regression with cross-validation
5. **Evaluation**: Comprehensive metrics and classification report
6. **Artifact Saving**: Saves model.pkl, vectorizer.pkl, metrics.json

To retrain the model:
```bash
cd ml-model
python train_model.py
```

## 🛡️ Security Features

- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes and validates all inputs
- **Error Handling**: Secure error messages without sensitive data
- **Helmet.js**: Security headers for Node.js
- **Request Size Limits**: Prevents large payload attacks

## 🧪 Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
cd backend
npm test
```

### ML Model
```bash
cd ml-model
python -m pytest tests/
```

## 📈 Monitoring

- **Health Checks**: `/health` endpoints for service monitoring
- **Metrics**: Model performance metrics via `/metrics`
- **Logging**: Comprehensive request/error logging
- **Performance**: Response time and accuracy tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **FakeNewsNet Dataset** for training data
- **scikit-learn** for ML algorithms
- **NLTK & spaCy** for NLP processing
- **React & TanStack** for frontend framework
- **Flask** for ML API backend