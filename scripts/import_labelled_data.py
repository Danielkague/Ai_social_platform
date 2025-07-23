import csv
import sqlite3
from datetime import datetime

DB_PATH = 'training_data.db'
CSV_PATH = 'scripts/labeled_data.csv'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # Map class: 0 (hate_speech), 1 (offensive_language) => 'hate_speech', 2 (neither) => 'not_hate_speech'
        label = 'hate_speech' if row['class'] in ['0', '1'] else 'not_hate_speech'
        cursor.execute('''
            INSERT INTO training_data (text, timestamp, user_id, prediction, human_label)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            row['tweet'],
            datetime.now().isoformat(),
            None,
            '{}',
            label
        ))
conn.commit()
conn.close()
print('Imported labeled_data.csv.') 