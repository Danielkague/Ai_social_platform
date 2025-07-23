import csv
from datetime import datetime

input_csv = input('Enter the path to your input CSV file: ').strip()
output_csv = 'supabase_training_data.csv'

with open(input_csv, newline='', encoding='utf-8') as infile, \
     open(output_csv, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = ['text', 'user_id', 'timestamp', 'prediction', 'human_label']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        # Try to get text from 'text' or 'tweet' columns
        text = row.get('text') or row.get('tweet') or ''
        user_id = row.get('user_id', '')
        timestamp = row.get('timestamp') or datetime.now().isoformat()
        prediction = row.get('prediction', '{}')
        # Try to get label from several possible columns
        human_label = row.get('human_label') or row.get('auto_label') or row.get('label') or ''
        writer.writerow({
            'text': text,
            'user_id': user_id,
            'timestamp': timestamp,
            'prediction': prediction,
            'human_label': human_label
        })
print(f'CSV converted for Supabase import: {output_csv}') 