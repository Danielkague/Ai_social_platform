from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os

MODEL_PATH = 'enhanced_hate_speech_models.pkl'

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str

# Load model at startup
@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file {MODEL_PATH} not found. Please train the model first.")
    model = joblib.load(MODEL_PATH)
    # model['pipelines'], model['best_model_name']

@app.post("/predict")
def predict(req: PredictRequest):
    pipeline = model['pipelines'][model['best_model_name']]
    probabilities = pipeline.predict_proba([req.text])[0]
    prediction = int(probabilities[1] > 0.5)
    return {
        "is_hate_speech": bool(prediction),
        "hate_probability": float(probabilities[1]),
        "clean_probability": float(probabilities[0]),
        "confidence": float(max(probabilities)),
        "text": req.text
    } 