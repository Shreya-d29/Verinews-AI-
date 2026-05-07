#!/usr/bin/env python3
"""
VeriNews AI - ML Training Module
Trains a fake news classifier using TF-IDF and Logistic Regression
"""

import pandas as pd
import numpy as np
import re
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class FakeNewsClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 2)
        )
        self.model = LogisticRegression(random_state=42, max_iter=1000)
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
    def preprocess_text(self, text):
        """Apply NLP preprocessing pipeline"""
        if pd.isna(text) or not isinstance(text, str):
            return ""
        
        # Lowercase
        text = text.lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenization
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        processed_tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token not in self.stop_words and len(token) > 2
        ]
        
        return ' '.join(processed_tokens)
    
    def load_and_prepare_data(self, csv_path):
        """Load and prepare the dataset"""
        print("Loading dataset...")
        df = pd.read_csv(csv_path)
        
        # Check if we have the expected columns
        if 'title' in df.columns and 'real' in df.columns:
            # Use title as text and real as label (1=Real, 0=Fake)
            df['text'] = df['title']
            df['label'] = df['real']
        else:
            raise ValueError("Dataset must have 'title' and 'real' columns")
        
        # Remove rows with missing text
        df = df.dropna(subset=['text'])
        
        print(f"Dataset shape: {df.shape}")
        print(f"Label distribution:\n{df['label'].value_counts()}")
        
        return df
    
    def train(self, csv_path):
        """Train the fake news classifier"""
        # Load data
        df = self.load_and_prepare_data(csv_path)
        
        # Preprocess text
        print("Preprocessing text...")
        df['processed_text'] = df['text'].apply(self.preprocess_text)
        
        # Remove empty processed texts
        df = df[df['processed_text'].str.len() > 0]
        
        # Split data
        X = df['processed_text']
        y = df['label']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")
        
        # Vectorize text
        print("Vectorizing text with TF-IDF...")
        X_train_tfidf = self.vectorizer.fit_transform(X_train)
        X_test_tfidf = self.vectorizer.transform(X_test)
        
        # Train model
        print("Training Logistic Regression model...")
        self.model.fit(X_train_tfidf, y_train)
        
        # Make predictions
        y_pred = self.model.predict(X_test_tfidf)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1_score': f1_score(y_test, y_pred)
        }
        
        print("\n=== Model Performance ===")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1-Score: {metrics['f1_score']:.4f}")
        
        print("\n=== Detailed Classification Report ===")
        print(classification_report(y_test, y_pred, target_names=['Fake', 'Real']))
        
        return metrics
    
    def save_model(self, model_path='model.pkl', vectorizer_path='vectorizer.pkl'):
        """Save trained model and vectorizer"""
        joblib.dump(self.model, model_path)
        joblib.dump(self.vectorizer, vectorizer_path)
        print(f"Model saved to {model_path}")
        print(f"Vectorizer saved to {vectorizer_path}")
    
    def save_metrics(self, metrics, metrics_path='metrics.json'):
        """Save evaluation metrics"""
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        print(f"Metrics saved to {metrics_path}")

def main():
    """Main training pipeline"""
    print("=== VeriNews AI - Model Training ===")
    
    # Initialize classifier
    classifier = FakeNewsClassifier()
    
    # Train model
    try:
        metrics = classifier.train('../FakeNewsNet_updated_balanced.csv')
        
        # Save artifacts
        classifier.save_model()
        classifier.save_metrics(metrics)
        
        print("\n=== Training Complete ===")
        print("Artifacts saved:")
        print("- model.pkl")
        print("- vectorizer.pkl") 
        print("- metrics.json")
        
    except Exception as e:
        print(f"Training failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())