import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from sklearn.pipeline import Pipeline
import pickle
import string
from typing import Dict, List, Tuple, Any
import joblib
from .dataset_generator import DatasetManager
from .text_utils import preprocess_text

class EnhancedMLDetector:
    def __init__(self):
        self.models = {}
        self.vectorizers = {}
        self.pipelines = {}
        self.is_trained = False
        self.best_model_name = None
        self.dataset_manager = DatasetManager()
        
    def create_feature_pipelines(self) -> Dict[str, Pipeline]:
        """Create different feature extraction and model pipelines"""
        pipelines = {}
        
        # TF-IDF + Logistic Regression
        pipelines['tfidf_lr'] = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=10000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                preprocessor=preprocess_text
            )),
            ('classifier', LogisticRegression(random_state=42, max_iter=1000))
        ])
        
        # TF-IDF + Random Forest
        pipelines['tfidf_rf'] = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                preprocessor=preprocess_text
            )),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        # TF-IDF + SVM
        pipelines['tfidf_svm'] = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=8000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                preprocessor=preprocess_text
            )),
            ('classifier', SVC(probability=True, random_state=42))
        ])
        
        # Count Vectorizer + Naive Bayes
        pipelines['count_nb'] = Pipeline([
            ('count', CountVectorizer(
                max_features=8000,
                ngram_range=(1, 2),
                stop_words='english',
                lowercase=True,
                preprocessor=preprocess_text
            )),
            ('classifier', MultinomialNB())
        ])
        
        return pipelines
    
    def train_models(self, dataset: pd.DataFrame = None) -> Dict[str, Dict]:
        """Train multiple models and compare performance"""
        print("🚀 Training enhanced ML models for hate speech detection...")
        
        # Load or create dataset
        if dataset is None:
            print("Creating comprehensive dataset...")
            dataset = self.dataset_manager.create_comprehensive_dataset(
                synthetic_samples=1500,
                include_realworld=True
            )
        
        # Prepare data
        X = dataset['text'].values
        y = dataset['label'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Create pipelines
        self.pipelines = self.create_feature_pipelines()
        
        # Train and evaluate each model
        results = {}
        
        for name, pipeline in self.pipelines.items():
            print(f"\nTraining {name}...")
            
            # Train the model
            pipeline.fit(X_train, y_train)
            
            # Make predictions
            y_pred = pipeline.predict(X_test)
            y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            
            # Cross-validation score
            cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='f1')
            
            results[name] = {
                'accuracy': accuracy,
                'f1_score': f1,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'predictions': y_pred,
                'probabilities': y_pred_proba,
                'classification_report': classification_report(y_test, y_pred),
                'confusion_matrix': confusion_matrix(y_test, y_pred)
            }
            
            print(f"Accuracy: {accuracy:.3f}")
            print(f"F1 Score: {f1:.3f}")
            print(f"CV Score: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        # Find best model
        best_f1 = 0
        for name, result in results.items():
            if result['f1_score'] > best_f1:
                best_f1 = result['f1_score']
                self.best_model_name = name
        # Defensive: if no best model found, pick the first one
        if self.best_model_name is None and results:
            self.best_model_name = list(results.keys())[0]

        print(f"\n\U0001F3C6 Best model: {self.best_model_name} (F1: {best_f1:.3f})")
        
        self.is_trained = True
        self.training_results = results
        
        return results
    
    def hyperparameter_tuning(self, model_name: str = 'tfidf_lr') -> Dict:
        """Perform hyperparameter tuning for a specific model"""
        print(f"🔧 Performing hyperparameter tuning for {model_name}...")
        
        if not self.is_trained:
            print("Models not trained yet. Training first...")
            self.train_models()
        
        # Create dataset
        dataset = self.dataset_manager.create_comprehensive_dataset(
            synthetic_samples=1000,
            include_realworld=True
        )
        
        X = dataset['text'].values
        y = dataset['label'].values
        
        # Define parameter grids
        param_grids = {
            'tfidf_lr': {
                'tfidf__max_features': [5000, 10000, 15000],
                'tfidf__ngram_range': [(1, 1), (1, 2), (1, 3)],
                'classifier__C': [0.1, 1, 10]
            },
            'tfidf_rf': {
                'tfidf__max_features': [3000, 5000, 8000],
                'tfidf__ngram_range': [(1, 1), (1, 2)],
                'classifier__n_estimators': [50, 100, 200],
                'classifier__max_depth': [10, 20, None]
            }
        }
        
        if model_name not in param_grids:
            print(f"Hyperparameter tuning not available for {model_name}")
            return {}
        
        # Perform grid search
        pipeline = self.pipelines[model_name]
        param_grid = param_grids[model_name]
        
        grid_search = GridSearchCV(
            pipeline, 
            param_grid, 
            cv=3, 
            scoring='f1',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X, y)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best F1 score: {grid_search.best_score_:.3f}")
        
        # Update the pipeline with best parameters
        self.pipelines[f"{model_name}_tuned"] = grid_search.best_estimator_
        
        return {
            'best_params': grid_search.best_params_,
            'best_score': grid_search.best_score_,
            'best_estimator': grid_search.best_estimator_
        }
    
    def predict(self, text: str, model_name: str = None) -> Dict:
        """Make prediction using specified or best model"""
        if not self.is_trained:
            print("Models not trained yet. Training now...")
            self.train_models()
        # Use best model if not specified
        if model_name is None:
            model_name = self.best_model_name
        if model_name is None:
            raise ValueError("No trained model is available. Please train the model first.")
        if model_name not in self.pipelines:
            raise ValueError(f"Model {model_name} not found")
        
        pipeline = self.pipelines[model_name]
        
        # Make prediction
        prediction = pipeline.predict([text])[0]
        probabilities = pipeline.predict_proba([text])[0]
        
        return {
            'text': text,
            'is_hate_speech': bool(prediction),
            'hate_probability': probabilities[1],
            'clean_probability': probabilities[0],
            'confidence': max(probabilities),
            'model_used': model_name
        }
    
    def batch_predict(self, texts: List[str], model_name: str = None) -> List[Dict]:
        """Make predictions for multiple texts"""
        if model_name is None:
            model_name = self.best_model_name
        
        pipeline = self.pipelines[model_name]
        
        predictions = pipeline.predict(texts)
        probabilities = pipeline.predict_proba(texts)
        
        results = []
        for i, text in enumerate(texts):
            results.append({
                'text': text,
                'is_hate_speech': bool(predictions[i]),
                'hate_probability': probabilities[i][1],
                'clean_probability': probabilities[i][0],
                'confidence': max(probabilities[i]),
                'model_used': model_name
            })
        
        return results
    
    def save_models(self, filepath: str = 'enhanced_hate_speech_models.pkl'):
        """Save all trained models"""
        if not self.is_trained:
            print("No trained models to save.")
            return
        
        model_data = {
            'pipelines': self.pipelines,
            'best_model_name': self.best_model_name,
            'training_results': self.training_results,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        print(f"Models saved to {filepath}")
    
    def load_models(self, filepath: str = 'enhanced_hate_speech_models.pkl'):
        """Load pre-trained models"""
        try:
            model_data = joblib.load(filepath)
            
            self.pipelines = model_data['pipelines']
            self.best_model_name = model_data['best_model_name']
            self.training_results = model_data.get('training_results', {})
            self.is_trained = model_data['is_trained']
            
            print(f"Models loaded from {filepath}")
            print(f"Best model: {self.best_model_name}")
            return True
        
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def get_model_comparison(self) -> pd.DataFrame:
        """Get comparison of all trained models"""
        if not self.is_trained:
            print("Models not trained yet.")
            return pd.DataFrame()
        
        comparison_data = []
        for name, results in self.training_results.items():
            comparison_data.append({
                'Model': name,
                'Accuracy': results['accuracy'],
                'F1 Score': results['f1_score'],
                'CV Mean': results['cv_mean'],
                'CV Std': results['cv_std']
            })
        
        df = pd.DataFrame(comparison_data)
        return df.sort_values('F1 Score', ascending=False)

# Demo function
def demo_enhanced_ml_detector():
    """Demonstrate the enhanced ML detector"""
    print("🤖 Enhanced ML Hate Speech Detector Demo\n")
    
    # Create detector
    detector = EnhancedMLDetector()
    
    # Train models
    results = detector.train_models()
    
    # Show model comparison
    print("\n📊 Model Comparison:")
    comparison = detector.get_model_comparison()
    print(comparison.to_string(index=False))
    
    # Test predictions
    test_texts = [
        "I love this community, everyone is so supportive!",
        "This weather is absolutely terrible today",
        "I disagree with this policy decision",
        "Thank you for your help and kindness",
        "This situation is really frustrating me"
    ]
    
    print(f"\n🧪 Testing predictions with best model ({detector.best_model_name}):")
    for text in test_texts:
        result = detector.predict(text)
        status = "🚨 FLAGGED" if result['is_hate_speech'] else "✅ CLEAN"
        print(f"{status} '{text}' (Confidence: {result['confidence']:.2%})")
    
    # Save models
    detector.save_models()
    
    return detector

if __name__ == "__main__":
    # Try to load real-world dataset if available
    import os
    import pandas as pd
    from .dataset_generator import DatasetManager
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'labeled_data.csv')
    if os.path.exists(data_path):
        print("\n📥 Loading real-world dataset from data/labeled_data.csv ...")
        manager = DatasetManager()
        df = manager.load_custom_dataset(data_path, text_column="tweet", label_column="class")
        # Davidson: 0=hate, 1=offensive, 2=neither. We want hate=1, else=0
        df['label'] = df['label'].map(lambda x: 1 if x == 0 else 0)
        print(f"Loaded {len(df)} samples. Hate speech: {df['label'].sum()} Clean: {len(df)-df['label'].sum()}")
        detector = EnhancedMLDetector()
        detector.train_models(df)
        detector.save_models()
    else:
        detector = demo_enhanced_ml_detector()
        detector.save_models()
