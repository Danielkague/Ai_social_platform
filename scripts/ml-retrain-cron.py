import requests
import time
import logging

ML_SERVER_URL = "http://localhost:5000"
DB_PATH = 'training_data.db'
MIN_LABELED_SAMPLES = 50
LOG_FILE = "ml_retrain_cron.log"

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

def get_model_stats():
    try:
        resp = requests.get(f"{ML_SERVER_URL}/model-stats", timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logging.error(f"Failed to fetch model stats: {e}")
        return None

def trigger_retrain():
    try:
        resp = requests.post(f"{ML_SERVER_URL}/retrain-model", timeout=60)
        resp.raise_for_status()
        logging.info(f"Retrain triggered: {resp.json()}")
        return resp.json()
    except Exception as e:
        logging.error(f"Failed to trigger retrain: {e}")
        return None

def main():
    stats = get_model_stats()
    if not stats or 'training_data' not in stats:
        logging.warning("Could not get training data stats.")
        return
    labeled = stats['training_data'].get('labeled_samples', 0)
    last_accuracy = stats['model_info'].get('accuracy')
    if labeled >= MIN_LABELED_SAMPLES:
        logging.info(f"Enough labeled samples ({labeled}) found. Triggering retrain...")
        result = trigger_retrain()
        if result and result.get('status') == 'success':
            logging.info(f"Retrain successful: {result}")
        else:
            logging.warning(f"Retrain failed or not successful: {result}")
    else:
        logging.info(f"Not enough labeled samples for retrain: {labeled} found.")

if __name__ == "__main__":
    main() 