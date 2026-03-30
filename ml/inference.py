"""
Inference module for requirement classification and ambiguity detection.
"""
import os
import re
import joblib
import numpy as np
from typing import List, Tuple

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'classifier.pkl')

# Lazy load model
_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            # Auto-train if model doesn't exist
            from train_model import train
            _model = train()
    return _model

AMBIGUOUS_TERMS = [
    'fast', 'faster', 'fastest', 'slow', 'quick', 'quickly',
    'efficient', 'efficiently', 'efficiency',
    'scalable', 'scalability', 'scale well',
    'user-friendly', 'user friendly', 'easy to use', 'easy to learn',
    'robust', 'robustness', 'reliable', 'reliability',
    'optimize', 'optimized', 'optimizable', 'optimize for',
    'high performance', 'highly available', 'highly scalable',
    'modern', 'intuitive', 'seamless', 'smooth', 'lightweight',
    'as soon as possible', 'asap', 'immediately', 'instantly',
    'frequently', 'rarely', 'sometimes', 'usually', 'generally',
    'often', 'occasionally', 'periodically', 'regularly',
    'simple', 'simply', 'straightforward', 'minimal', 'easy',
    'flexible', 'flexible architecture', 'flexible design',
    'powerful', 'comprehensive', 'advanced', 'sophisticated',
    'appropriate', 'adequate', 'sufficient', 'reasonable',
]

def preprocess(text: str) -> str:
    """Clean and normalize text."""
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def classify(text: str) -> dict:
    """Classify a requirement as FR or NFR with confidence score."""
    model = get_model()
    clean_text = preprocess(text)
    
    proba = model.predict_proba([clean_text])[0]
    classes = model.classes_
    pred_class = classes[np.argmax(proba)]
    confidence = float(np.max(proba))
    
    return {
        'type': pred_class,
        'confidence': round(confidence, 4),
        'probabilities': {c: round(float(p), 4) for c, p in zip(classes, proba)}
    }

def detect_ambiguity(text: str) -> dict:
    """Detect ambiguous terms in requirement text."""
    lower_text = text.lower()
    found_terms = []
    
    for term in AMBIGUOUS_TERMS:
        if term in lower_text:
            found_terms.append(term)
    
    # Remove duplicates while preserving order
    found_terms = list(dict.fromkeys(found_terms))
    
    # Calculate ambiguity score (0-1)
    score = min(len(found_terms) / 3.0, 1.0)
    
    return {
        'ambiguityFlag': len(found_terms) > 0,
        'ambiguityScore': round(score, 3),
        'ambiguousTerms': found_terms
    }

def analyze(text: str) -> dict:
    """Full analysis: classify + detect ambiguity."""
    classification = classify(text)
    ambiguity = detect_ambiguity(text)
    return {**classification, **ambiguity}

def batch_analyze(texts: List[str]) -> List[dict]:
    """Analyze multiple requirements."""
    return [analyze(text) for text in texts]
