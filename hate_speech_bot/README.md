# Hate Speech Detection Bot

This project is a modern hate speech detection bot with:
- **Backend**: FastAPI (Python) serving a trained ML model
- **Frontend**: Simple HTML5/JS page for user interaction
- **Dataset**: Synthetic and simulated real-world data generation

## Usage

### 1. Install Python dependencies
```sh
pip install -r requirements.txt
```

### 2. Generate dataset and train model
```sh
python scripts/enhanced_ml_detector.py
```

### 3. Start the backend API
```sh
uvicorn backend.api:app --reload
```

### 4. Open the frontend
Open `frontend/index.html` in your browser.

## Project Structure
- `scripts/` - Python scripts for dataset, model, and integration
- `backend/` - FastAPI backend (to be created)
- `frontend/` - HTML/JS frontend (to be created)

## Notes
- The backend and frontend are in the same repo for simplicity.
- The dataset is generated using `scripts/dataset_generator.py`.
- The ML model is trained and saved by `scripts/enhanced_ml_detector.py`.