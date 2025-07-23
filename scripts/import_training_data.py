import csv
import sqlite3
from datetime import datetime

DB_PATH = 'training_data.db'
CSV_PATH = 'scripts/foul_language_training_data.csv'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        label = 'hate_speech' if row['category'] in ['hate_speech', 'threat', 'harassment', 'offensive', 'profanity'] else 'not_hate_speech'
        cursor.execute('''
            INSERT INTO training_data (text, timestamp, user_id, prediction, human_label)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            row['text'],
            datetime.now().isoformat(),
            None,
            '{}',
            label
        ))
conn.commit()
conn.close()
print('Imported training data.') 