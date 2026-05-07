#!/usr/bin/env python3
"""
VeriNews AI - Flask Inference API
Provides ML-powered fake news detection with comprehensive NLP analysis
"""

import os
import re
import sys
import json
import traceback
import joblib 
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from textblob import TextBlob

# Try to import spacy, but make it optional
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    print("Warning: spaCy not installed. NER features will be disabled.")
    spacy = None
    SPACY_AVAILABLE = False

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"])

# Global variables for model artifacts
model = None
vectorizer = None
lemmatizer = None
stop_words = None
nlp = None

# Clickbait keywords for detection
CLICKBAIT_KEYWORDS = [
    'shocking', 'unbelievable', 'amazing', 'incredible', "you won't believe",
    'this will blow your mind', 'doctors hate', 'one weird trick', 'secret',
    'exposed', 'revealed', 'banned', 'forbidden', 'urgent', 'breaking',
    'exclusive', 'leaked', 'scandal', 'bombshell', 'devastating'
]


def load_models():
    """Load trained model and preprocessing artifacts"""
    global model, vectorizer, lemmatizer, stop_words, nlp

    try:
        print("Loading model artifacts...")
        
        # Check if model files exist
        if not os.path.exists('model.pkl'):
            raise FileNotFoundError("model.pkl not found. Run 'python train_model.py' first.")
        
        if not os.path.exists('vectorizer.pkl'):
            raise FileNotFoundError("vectorizer.pkl not found. Run 'python train_model.py' first.")

        # Load ML artifacts
        print("Loading model.pkl...")
        model = joblib.load('model.pkl')
        
        print("Loading vectorizer.pkl...")
        vectorizer = joblib.load('vectorizer.pkl')

        # Initialize NLTK tools
        print("Initializing NLTK tools...")
        
        # Download NLTK data if needed
        required_nltk_data = {
            'punkt': 'tokenizers/punkt',
            'stopwords': 'corpora/stopwords',
            'wordnet': 'corpora/wordnet'
        }
        
        for name, path in required_nltk_data.items():
            try:
                nltk.data.find(path)
            except LookupError:
                print(f"Downloading NLTK {name}...")
                nltk.download(name, quiet=True)
        
        lemmatizer = WordNetLemmatizer()
        stop_words = set(stopwords.words('english'))

        # Load spaCy model for NER (optional)
        nlp = None
        if SPACY_AVAILABLE:
            try:
                print("Loading spaCy model...")
                nlp = spacy.load('en_core_web_sm')
                print("[OK] spaCy model loaded successfully")
            except OSError:
                print("Warning: spaCy model 'en_core_web_sm' not found.")
                print("Install with: python -m spacy download en_core_web_sm")
                print("NER features will be disabled.")
            except Exception as e:
                print(f"Warning: spaCy error: {e}")
                print("NER features will be disabled.")

        print("[OK] All models loaded successfully!")
        return True

    except Exception as e:
        print(f"[Error] Error loading models: {e}")
        traceback.print_exc()
        return False


def preprocess_text(text):
    """Apply same preprocessing as training"""
    try:
        if not isinstance(text, str) or not text.strip():
            return ""

        # Lowercase
        text = text.lower()

        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)

        # Tokenization
        tokens = word_tokenize(text)

        # Remove stopwords and lemmatize
        processed_tokens = [
            lemmatizer.lemmatize(token)
            for token in tokens
            if token not in stop_words and len(token) > 2
        ]

        return ' '.join(processed_tokens)
    
    except Exception as e:
        print(f"Error in preprocess_text: {e}")
        return ""


def extract_keywords(text, top_n=10):
    """Extract top TF-IDF keywords"""
    try:
        processed = preprocess_text(text)
        if not processed:
            return []

        tfidf_matrix = vectorizer.transform([processed])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]

        top_indices = scores.argsort()[-top_n:][::-1]
        keywords = [feature_names[i] for i in top_indices if scores[i] > 0]

        return keywords

    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return []


def analyze_sentiment(text):
    """Analyze sentiment using TextBlob"""
    try:
        blob = TextBlob(text)
        return blob.sentiment.polarity
    except Exception:
        return 0.0


def extract_entities(text):
    """Extract named entities using spaCy"""
    if not nlp:
        return []

    try:
        doc = nlp(text[:1000])
        entities = []

        for ent in doc.ents:
            if ent.label_ in ['PERSON', 'ORG', 'GPE', 'EVENT']:
                entities.append(f"{ent.label_}: {ent.text}")

        return entities[:10]

    except Exception as e:
        print(f"Error extracting entities: {e}")
        return []


def calculate_clickbait_score(text):
    """Calculate clickbait score based on keywords"""
    text_lower = text.lower()
    matches = sum(1 for keyword in CLICKBAIT_KEYWORDS if keyword in text_lower)

    max_possible = min(len(CLICKBAIT_KEYWORDS), 5)
    return min(matches / max_possible, 1.0)


def tokenize_text(text):
    """Tokenize text for display"""
    try:
        tokens = word_tokenize(text.lower())
        filtered_tokens = [
            token for token in tokens
            if token.isalpha() and len(token) > 2
        ]
        return filtered_tokens[:20]
    except Exception:
        return []


def generate_explanation(prediction, confidence, nlp_features):
    """Generate human-readable explanation"""
    explanations = []

    if confidence > 0.8:
        explanations.append(f"High confidence ({confidence:.1%}) in {prediction.lower()} classification")
    elif confidence > 0.6:
        explanations.append(f"Moderate confidence ({confidence:.1%}) in {prediction.lower()} classification")
    else:
        explanations.append(f"Low confidence ({confidence:.1%}) - classification uncertain")

    sentiment = nlp_features.get('sentiment', 0)
    if sentiment < -0.3:
        explanations.append("Highly negative emotional language detected")
    elif sentiment > 0.3:
        explanations.append("Positive emotional tone detected")

    clickbait_score = nlp_features.get('clickbait_score', 0)
    if clickbait_score > 0.3:
        explanations.append("Contains clickbait-style language")

    entities = nlp_features.get('entities', [])
    if len(entities) == 0:
        explanations.append("Limited verifiable entities found")
    elif len(entities) > 3:
        explanations.append("Multiple verifiable entities present")

    return ". ".join(explanations) if explanations else "Analysis based on text patterns and ML model"


@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    """Main prediction endpoint"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        if model is None or vectorizer is None:
            return jsonify({'error': 'Model not loaded'}), 500

        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text field'}), 400

        text = data['text']
        if not text or not text.strip():
            return jsonify({'error': 'Empty text provided'}), 400

        if len(text) > 50000:
            return jsonify({'error': 'Text too large'}), 400

        processed_text = preprocess_text(text)
        if not processed_text:
            return jsonify({'error': 'Text could not be processed'}), 400

        text_vector = vectorizer.transform([processed_text])
        prediction_prob = model.predict_proba(text_vector)[0]
        prediction_class = model.predict(text_vector)[0]

        prediction = 'Real' if prediction_class == 1 else 'Fake'
        confidence = float(max(prediction_prob))

        tokens = tokenize_text(text)
        keywords = extract_keywords(text)
        sentiment = analyze_sentiment(text)
        entities = extract_entities(text)
        clickbait_score = calculate_clickbait_score(text)

        nlp_features = {
            'tokens': tokens,
            'top_keywords': keywords,
            'sentiment': round(sentiment, 3),
            'entities': entities,
            'clickbait_score': round(clickbait_score, 3)
        }

        explanation = generate_explanation(prediction, confidence, nlp_features)

        response = {
            'prediction': prediction,
            'confidence': round(confidence, 3),
            'nlp': nlp_features,
            'explanation': explanation
        }

        return jsonify(response)

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/metrics', methods=['GET'])
def get_metrics():
    """Return model performance metrics"""
    try:
        if os.path.exists('metrics.json'):
            with open('metrics.json', 'r') as f:
                metrics = json.load(f)
            return jsonify(metrics)
        return jsonify({'error': 'Metrics not available'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'vectorizer_loaded': vectorizer is not None
    })


@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'name': 'VeriNews AI API',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': 'Analyze news article for fake/real classification',
            'GET /metrics': 'Get model performance metrics',
            'GET /health': 'Health check'
        }
    })


if __name__ == '__main__':
    print('=== VeriNews AI - Flask API ===')
    print(f'Python version: {sys.version}')
    print(f'Working directory: {os.getcwd()}')
    print()

    # Check if we're in the right directory
    if not os.path.exists('train_model.py'):
        print('Error: Not in ml-model directory or train_model.py not found')
        print('Please run this script from the ml-model directory')
        sys.exit(1)

    # Load models with detailed error reporting
    print('Loading models and dependencies...')
    if not load_models():
        print()
        print('[FAIL] Failed to load models!')
        print()
        print('Troubleshooting steps:')
        print('1. Ensure you are in the ml-model directory')
        print('2. Run: python train_model.py')
        print('3. Check that model.pkl and vectorizer.pkl exist')
        print('4. Run: python debug_app.py (for detailed diagnostics)')
        sys.exit(1)

    # Get configuration
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    host = '0.0.0.0'  # Allow external connections

    print()
    print('[READY] Server ready to start!')
    print(f'Host: {host}')
    print(f'Port: {port}')
    print(f'Debug mode: {debug}')
    print()
    print('API endpoints:')
    print(f'- http://localhost:{port}/ - API information')
    print(f'- http://localhost:{port}/health - Health check')
    print(f'- http://localhost:{port}/predict - Analyze news article (POST)')
    print(f'- http://localhost:{port}/metrics - Model performance (GET)')
    print()
    print('Starting Flask server...')
    print('Press Ctrl+C to stop')
    print()

    try:
        app.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        print('\nBye Server stopped by user')
    except Exception as e:
        print(f'\n[FAIL] Server error: {e}')
        traceback.print_exc()
