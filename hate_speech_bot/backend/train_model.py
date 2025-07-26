import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import os

DATA_PATH = "../../hate_speech_dataset.csv"
MODEL_PATH = "enhanced_hate_speech_models.pkl"

# Load dataset
df = pd.read_csv(DATA_PATH)
X = df['text']
y = df['label']

# Train model
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)
model = LogisticRegression(max_iter=500)
model.fit(X_vec, y)

# Save in the format expected by your API
from sklearn.pipeline import Pipeline  # Add this at the top with your imports
pipelines = {"LogisticRegression": Pipeline([("vectorizer", vectorizer), ("clf", model)])}
best_model_name = "LogisticRegression"
joblib.dump({"pipelines": pipelines, "best_model_name": best_model_name}, MODEL_PATH)

print("Model trained and saved to", MODEL_PATH)