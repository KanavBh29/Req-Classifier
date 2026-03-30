"""
FastAPI ML Service for Requirement Classification & Ambiguity Detection
Run: uvicorn api:app --host 0.0.0.0 --port 8000 --reload
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os

from inference import classify, detect_ambiguity, analyze, batch_analyze, get_model

app = FastAPI(
    title="ReqTrace ML Service",
    description="ML-powered requirement classification and ambiguity detection API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=2000)

class BatchRequest(BaseModel):
    texts: List[str] = Field(..., max_items=100)

class ClassificationResponse(BaseModel):
    type: str
    confidence: float
    probabilities: dict

class AmbiguityResponse(BaseModel):
    ambiguityFlag: bool
    ambiguityScore: float
    ambiguousTerms: List[str]

class FullAnalysisResponse(BaseModel):
    type: str
    confidence: float
    probabilities: dict
    ambiguityFlag: bool
    ambiguityScore: float
    ambiguousTerms: List[str]

@app.on_event("startup")
async def startup():
    """Pre-load model on startup."""
    try:
        get_model()
        print("✅ ML Model loaded successfully")
    except Exception as e:
        print(f"⚠️ Model load warning: {e}")

@app.get("/")
def root():
    return {"service": "ReqTrace ML API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True}

@app.post("/classify", response_model=ClassificationResponse)
def classify_requirement(request: TextRequest):
    """Classify a single requirement as FR or NFR."""
    try:
        result = classify(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=FullAnalysisResponse)
def analyze_requirement(request: TextRequest):
    """Full analysis: classify + detect ambiguity."""
    try:
        result = analyze(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ambiguity", response_model=AmbiguityResponse)
def detect_ambiguity_endpoint(request: TextRequest):
    """Detect ambiguous terms in a requirement."""
    try:
        result = detect_ambiguity(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch")
def batch_analyze_endpoint(request: BatchRequest):
    """Analyze multiple requirements in batch."""
    try:
        results = batch_analyze(request.texts)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
