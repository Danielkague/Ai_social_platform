"""
Enhanced Training Script for SafeSocial AI Systems
This script improves both hate speech detection and support chatbot responses
"""

import csv
import sqlite3
import json
import re
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import numpy as np

DB_PATH = 'training_data.db'
MODEL_PATH = 'hate_speech_model.pkl'

def create_enhanced_training_data():
    """Create comprehensive training data for better detection"""
    
    # Enhanced hate speech patterns for single word detection
    hate_words = [
        # Profanity and slurs
        'fuck', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'asshole', 'bastard',
        'whore', 'slut', 'faggot', 'nigger', 'nigga', 'kike', 'spic', 'chink',
        'gook', 'wetback', 'towelhead', 'sandnigger', 'raghead', 'cameljockey',
        
        # Hate speech terms
        'kill', 'murder', 'death', 'die', 'hurt', 'harm', 'attack', 'destroy',
        'hate', 'despise', 'loathe', 'inferior', 'subhuman', 'worthless',
        'genocide', 'ethnic_cleansing', 'final_solution',
        
        # Gender-based hate (SDG 5)
        'rape', 'raped', 'rapist', 'whore', 'slut', 'bitch', 'cunt',
        'women_should_die', 'kill_all_women', 'women_are_inferior',
        
        # Xenophobia/Racism (SDG 16)
        'go_back_to_your_country', 'immigrants_are_criminals',
        'refugees_are_terrorists', 'all_muslims_are_terrorists',
        
        # Threats
        'i_will_kill_you', 'you_should_die', 'i_hope_you_die',
        'kill_yourself', 'commit_suicide', 'end_your_life'
    ]
    
    # Create training examples with single hate words in long sentences
    enhanced_data = []
    
    # Positive examples (clean text)
    clean_texts = [
        "I love this community and everyone here is so supportive!",
        "Great post, thanks for sharing your thoughts.",
        "This is really interesting, I learned something new today.",
        "Have a wonderful day everyone!",
        "I appreciate the discussion and different perspectives.",
        "This platform is amazing for connecting with people.",
        "Thank you for your kind words and encouragement.",
        "I'm grateful for this supportive environment.",
        "Let's work together to make this community better.",
        "Your post really resonated with me, thank you."
    ]
    
    # Add clean examples
    for text in clean_texts:
        enhanced_data.append({
            'text': text,
            'label': 'not_hate_speech',
            'category': 'clean'
        })
    
    # Create examples with single hate words in long sentences
    long_sentences = [
        "I really appreciate your thoughtful comment about the weather today and how it affects our daily lives, but I think you're completely wrong about everything and should just kill yourself because nobody cares about your opinion anyway.",
        "This is a very interesting discussion about politics and I respect different viewpoints, however I strongly disagree with your perspective and think you're a worthless piece of shit who doesn't deserve to have an opinion.",
        "Thank you for sharing your experience with the new restaurant downtown, it sounds like you had a great time and I'm glad you enjoyed the food, but honestly I think you're a complete idiot for liking that place.",
        "I understand your concerns about the environment and climate change, these are important issues that we all need to address together, but your solution is stupid and you're a fucking moron for suggesting it.",
        "Your post about mental health awareness is really important and I'm glad you're speaking up about this issue, but I think you're just being dramatic and should stop whining like a little bitch about your problems."
    ]
    
    for sentence in long_sentences:
        enhanced_data.append({
            'text': sentence,
            'label': 'hate_speech',
            'category': 'hate_speech'
        })
    
    # Add single word examples
    for word in hate_words:
        # Single word
        enhanced_data.append({
            'text': word,
            'label': 'hate_speech',
            'category': 'hate_speech'
        })
        
        # Word in context
        enhanced_data.append({
            'text': f"You are a {word} and I hate you.",
            'label': 'hate_speech',
            'category': 'hate_speech'
        })
        
        # Word in long sentence
        enhanced_data.append({
            'text': f"I really appreciate your thoughtful comment about the weather today and how it affects our daily lives, but I think you're a {word} and should just go away.",
            'label': 'hate_speech',
            'category': 'hate_speech'
        })
    
    return enhanced_data

def import_enhanced_data():
    """Import enhanced training data into database"""
    
    enhanced_data = create_enhanced_training_data()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing training data
    cursor.execute('DELETE FROM training_data')
    
    # Insert enhanced data
    for item in enhanced_data:
        cursor.execute('''
            INSERT INTO training_data (text, timestamp, user_id, prediction, human_label)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            item['text'],
            datetime.now().isoformat(),
            'enhanced_training',
            json.dumps({'category': item['category']}),
            item['label']
        ))
    
    conn.commit()
    conn.close()
    print(f"Imported {len(enhanced_data)} enhanced training examples")

def retrain_model():
    """Retrain the model with enhanced data"""
    
    # Load training data
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT text, human_label FROM training_data')
    data = cursor.fetchall()
    conn.close()
    
    if not data:
        print("No training data found!")
        return
    
    texts = [row[0] for row in data]
    labels = [1 if row[1] == 'hate_speech' else 0 for row in data]
    
    print(f"Training with {len(texts)} examples")
    print(f"Hate speech examples: {sum(labels)}")
    print(f"Clean examples: {len(labels) - sum(labels)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # Create and train model
    vectorizer = TfidfVectorizer(
        max_features=15000,
        ngram_range=(1, 4),  # Increased to catch more patterns
        stop_words='english',
        lowercase=True,
        min_df=1,  # Reduced to catch single words
        max_df=0.9
    )
    
    model = LogisticRegression(
        random_state=42,
        class_weight='balanced',
        C=1.0,
        max_iter=1000
    )
    
    # Fit vectorizer and model
    X_train_vectors = vectorizer.fit_transform(X_train)
    model.fit(X_train_vectors, y_train)
    
    # Evaluate
    X_test_vectors = vectorizer.transform(X_test)
    y_pred = model.predict(X_test_vectors)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Performance:")
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Clean', 'Hate Speech']))
    
    # Save model
    model_data = {
        'vectorizer': vectorizer,
        'model': model,
        'accuracy': accuracy,
        'training_date': datetime.now().isoformat(),
        'training_samples': len(texts)
    }
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"\nModel saved to {MODEL_PATH}")
    
    # Test single word detection
    test_words = ['fuck', 'kill', 'hate', 'love', 'hello', 'goodbye']
    print("\nTesting single word detection:")
    for word in test_words:
        prediction = model.predict(vectorizer.transform([word]))[0]
        prob = model.predict_proba(vectorizer.transform([word]))[0]
        print(f"'{word}': {'HATE SPEECH' if prediction else 'CLEAN'} (confidence: {max(prob):.3f})")

def create_support_chatbot_training():
    """Create training data for support chatbot responses"""
    
    support_responses = {
        'crisis': [
            {
                'input': 'i want to kill myself',
                'response': "I'm so sorry you're feeling this way. You're not alone, and there are people who want to help you. Please call the National Suicide Prevention Lifeline at 988 right now - they're available 24/7 and can provide immediate support. You matter, and your life has value. Would you like me to help you find additional resources?"
            },
            {
                'input': 'i feel like ending my life',
                'response': "I hear how much pain you're in, and I want you to know that you don't have to go through this alone. The National Suicide Prevention Lifeline at 988 has trained counselors available 24/7 who can help you through this crisis. You're important, and there are people who care about you. Can I help you connect with them?"
            }
        ],
        'abuse': [
            {
                'input': 'someone is harassing me online',
                'response': "I'm so sorry you're experiencing harassment. That's completely unacceptable and not your fault. Let me help you: 1) Document everything - take screenshots, 2) Block the person, 3) Report them to platform moderators, 4) Consider contacting law enforcement if it's severe. You deserve to feel safe. Would you like help with any of these steps?"
            },
            {
                'input': 'i was called horrible names',
                'response': "I'm sorry someone said those hurtful things to you. Their words say nothing about your worth as a person. You deserve respect and kindness. It's okay to feel hurt - anyone would be. Would you like to talk about how this made you feel, or would you prefer help with reporting this behavior?"
            }
        ],
        'hate_speech': [
            {
                'input': 'someone posted hate speech about my group',
                'response': "I'm so sorry you had to see that hateful content. It's completely wrong and you don't deserve to be targeted like that. Your identity and community are valid and valuable. Let's get this content removed: 1) Report it immediately, 2) Don't engage with the person, 3) Take care of yourself - this can be really triggering. Would you like help reporting this?"
            }
        ],
        'general_support': [
            {
                'input': 'i feel really sad',
                'response': "I'm sorry you're feeling sad right now. It's okay to feel this way, and you don't have to go through it alone. Sometimes talking to someone can help - would you like to share more about what's going on? There are also professional counselors who can provide support. You deserve to feel better."
            },
            {
                'input': 'i need someone to talk to',
                'response': "I'm here to listen and support you. You're not alone, and it's brave of you to reach out. I can help connect you with professional resources if you'd like, or we can talk about what's on your mind. What would be most helpful for you right now?"
            }
        ]
    }
    
    # Save support responses for the chatbot
    with open('support_responses.json', 'w') as f:
        json.dump(support_responses, f, indent=2)
    
    print("Support chatbot training data created")

if __name__ == "__main__":
    print("=== Enhanced Training for SafeSocial AI Systems ===\n")
    
    # Import enhanced training data
    print("1. Creating enhanced training data...")
    import_enhanced_data()
    
    # Retrain the model
    print("\n2. Retraining hate speech detection model...")
    retrain_model()
    
    # Create support chatbot training
    print("\n3. Creating support chatbot training data...")
    create_support_chatbot_training()
    
    print("\n=== Training Complete ===")
    print("Both AI systems have been enhanced:")
    print("- Hate speech detection now catches single words in long comments")
    print("- Support chatbot has improved response patterns")
    print("- Model accuracy should be significantly improved") 