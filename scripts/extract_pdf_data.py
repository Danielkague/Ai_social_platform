import csv
import re
from pathlib import Path
from typing import List

import pdfplumber

PDF_PATH = 'Online hate speech.pdf'
RAW_CSV_PATH = 'extracted_pdf_data_raw.csv'
AUTO_CSV_PATH = 'extracted_pdf_data_auto.csv'
DB_PATH = 'training_data.db'

# Simple keyword-based heuristics for auto-labeling
def auto_label(text: str) -> str:
    hate_keywords = [
        'kill', 'hate', 'die', 'worthless', 'rape', 'slut', 'bitch', 'go back', 'inferior', 'trash',
        'no rights', 'criminals', 'disgusting', 'attack', 'destroy', 'subhuman', 'genocide', 'fat', 'ugly',
        'stupid', 'idiot', 'moron', 'dumb', 'shut up', 'send nudes', 'harassment', 'violence', 'threat',
        'racist', 'xenophobic', 'misogynistic', 'sexist', 'abuse', 'harm', 'hurt', 'loser', 'pathetic'
    ]
    text_lower = text.lower()
    for kw in hate_keywords:
        if kw in text_lower:
            return 'hate_speech'
    return 'not_hate_speech'

def extract_pdf_text(pdf_path: str) -> List[str]:
    lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                # Split into lines/paragraphs
                for line in text.split('\n'):
                    clean_line = line.strip()
                    if clean_line:
                        lines.append(clean_line)
    return lines

def save_to_csv(lines: List[str], csv_path: str, auto_labeling: bool = False):
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        if auto_labeling:
            writer.writerow(['text', 'auto_label'])
            for line in lines:
                label = auto_label(line)
                writer.writerow([line, label])
        else:
            writer.writerow(['text'])
            for line in lines:
                writer.writerow([line])

def main():
    if not Path(PDF_PATH).exists():
        print(f'PDF file not found: {PDF_PATH}')
        return
    print(f'Extracting text from {PDF_PATH}...')
    lines = extract_pdf_text(PDF_PATH)
    print(f'Extracted {len(lines)} lines/paragraphs.')
    print(f'Saving raw extracted data to {RAW_CSV_PATH}...')
    save_to_csv(lines, RAW_CSV_PATH, auto_labeling=False)
    print(f'Saving auto-labeled data to {AUTO_CSV_PATH}...')
    save_to_csv(lines, AUTO_CSV_PATH, auto_labeling=True)
    print('Done.')

if __name__ == '__main__':
    main() 