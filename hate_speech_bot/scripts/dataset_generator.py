import pandas as pd
import numpy as np
import json
from typing import List, Tuple, Dict
import random
from datetime import datetime, timedelta

class HateSpeechDatasetGenerator:
    def __init__(self):
        # Safe examples for demonstration - focusing on non-hate speech with some borderline cases
        self.clean_templates = [
            "I love spending time with {}",
            "What a beautiful {} today",
            "I'm excited about {}",
            "Thank you for {}",
            "I appreciate your {}",
            "This {} makes me happy",
            "I enjoy {} very much",
            "Looking forward to {}",
            "I'm grateful for {}",
            "What an amazing {}",
            "I support {} rights",
            "Everyone deserves {}",
            "I believe in {} equality",
            "Diversity makes us {}",
            "I respect different {}",
            "We should celebrate {}",
            "I'm proud of our {}",
            "Unity brings us {}",
            "Kindness is {}",
            "Compassion helps us {}"
        ]
        
        self.neutral_templates = [
            "I disagree with {}",
            "That {} was disappointing",
            "I don't like this {}",
            "This {} is frustrating",
            "I'm annoyed by {}",
            "That {} doesn't work",
            "I'm not happy with {}",
            "This {} is problematic",
            "I question this {}",
            "That {} seems wrong"
        ]
        
        self.borderline_templates = [
            "I really dislike {}",
            "That {} is terrible",
            "I can't stand {}",
            "This {} is awful",
            "That {} is stupid",
            "I'm angry about {}",
            "This {} is ridiculous",
            "That {} is nonsense",
            "I'm fed up with {}",
            "This {} is unacceptable"
        ]
        
        # Safe context words
        self.contexts = [
            "my family", "the weather", "this movie", "that book", "the traffic",
            "this song", "the food", "my job", "the game", "this situation",
            "the policy", "the decision", "the outcome", "the process", "the system",
            "diversity", "inclusion", "equality", "justice", "fairness",
            "respect", "kindness", "understanding", "cooperation", "unity",
            "human rights", "civil rights", "equal opportunities", "social justice",
            "community", "society", "culture", "tradition", "progress"
        ]
        
        # Intensity modifiers
        self.intensifiers = ["really", "very", "extremely", "quite", "somewhat", ""]
        
    def generate_clean_samples(self, n_samples: int = 500) -> List[Tuple[str, int]]:
        """Generate clean, non-hate speech samples"""
        samples = []
        
        for _ in range(n_samples):
            template = random.choice(self.clean_templates)
            context = random.choice(self.contexts)
            intensifier = random.choice(self.intensifiers)
            
            if intensifier:
                text = template.format(f"{intensifier} {context}")
            else:
                text = template.format(context)
            
            samples.append((text, 0))  # 0 = not hate speech
        
        return samples
    
    def generate_neutral_samples(self, n_samples: int = 300) -> List[Tuple[str, int]]:
        """Generate neutral samples (criticism but not hate speech)"""
        samples = []
        
        for _ in range(n_samples):
            template = random.choice(self.neutral_templates)
            context = random.choice(self.contexts)
            intensifier = random.choice(self.intensifiers)
            
            if intensifier:
                text = template.format(f"{intensifier} {context}")
            else:
                text = template.format(context)
            
            samples.append((text, 0))  # 0 = not hate speech
        
        return samples
    
    def generate_borderline_samples(self, n_samples: int = 200) -> List[Tuple[str, int]]:
        """Generate borderline samples (strong language but context-dependent)"""
        samples = []
        
        for _ in range(n_samples):
            template = random.choice(self.borderline_templates)
            context = random.choice(self.contexts)
            
            text = template.format(context)
            
            # Most borderline cases are still not hate speech in this safe context
            label = 0 if random.random() > 0.2 else 1  # 20% chance of being labeled as hate speech
            samples.append((text, label))
        
        return samples
    
    def generate_synthetic_dataset(self, total_samples: int = 1000) -> pd.DataFrame:
        """Generate a complete synthetic dataset"""
        print(f"Generating synthetic dataset with {total_samples} samples...")
        
        # Calculate proportions
        clean_samples = int(total_samples * 0.5)  # 50% clean
        neutral_samples = int(total_samples * 0.3)  # 30% neutral
        borderline_samples = int(total_samples * 0.2)  # 20% borderline
        
        # Generate samples
        clean_data = self.generate_clean_samples(clean_samples)
        neutral_data = self.generate_neutral_samples(neutral_samples)
        borderline_data = self.generate_borderline_samples(borderline_samples)
        
        # Combine all samples
        all_samples = clean_data + neutral_data + borderline_data
        
        # Shuffle the dataset
        random.shuffle(all_samples)
        
        # Create DataFrame
        df = pd.DataFrame(all_samples, columns=['text', 'label'])
        
        # Add metadata
        df['source'] = 'synthetic'
        df['confidence'] = df['label'].apply(lambda x: random.uniform(0.7, 0.95) if x == 1 else random.uniform(0.8, 0.99))
        df['length'] = df['text'].str.len()
        df['word_count'] = df['text'].str.split().str.len()
        
        print(f"Dataset generated successfully!")
        print(f"Total samples: {len(df)}")
        print(f"Hate speech samples: {df['label'].sum()}")
        print(f"Clean samples: {len(df) - df['label'].sum()}")
        
        return df

class RealWorldDatasetLoader:
    """Load and process real-world hate speech datasets"""
    
    def __init__(self):
        self.supported_formats = ['csv', 'json', 'tsv']
    
    def load_hatespeech_dataset(self) -> pd.DataFrame:
        """Load a simulated real-world dataset structure"""
        print("Loading simulated real-world hate speech dataset...")
        
        # Simulate loading from various sources
        datasets = []
        
        # Simulate Twitter-like data
        twitter_data = self._generate_social_media_data(500, platform="twitter")
        datasets.append(twitter_data)
        
        # Simulate Reddit-like data
        reddit_data = self._generate_social_media_data(300, platform="reddit")
        datasets.append(reddit_data)
        
        # Simulate news comments data
        news_data = self._generate_news_comments_data(200)
        datasets.append(news_data)
        
        # Combine all datasets
        combined_df = pd.concat(datasets, ignore_index=True)
        
        # Add processing metadata
        combined_df['processed_at'] = datetime.now()
        combined_df['dataset_version'] = '1.0'
        
        print(f"Real-world dataset loaded: {len(combined_df)} samples")
        return combined_df
    
    def _generate_social_media_data(self, n_samples: int, platform: str) -> pd.DataFrame:
        """Generate social media-like data"""
        social_posts = [
            "Just had the best coffee ever! ☕",
            "Beautiful sunset today 🌅",
            "Excited for the weekend!",
            "Thanks everyone for the birthday wishes 🎂",
            "Can't wait for the concert tonight 🎵",
            "Love spending time with family",
            "Great movie recommendation, thanks!",
            "This weather is perfect for hiking",
            "Proud of my team's hard work",
            "Grateful for all the support",
            "Amazing food at this restaurant",
            "Looking forward to vacation",
            "Congrats on your graduation! 🎓",
            "What a productive day at work",
            "Enjoying this book so much 📚",
            "Traffic is really bad today 😤",
            "This service was disappointing",
            "Not happy with this purchase",
            "Frustrated with the delay",
            "This policy doesn't make sense"
        ]
        
        data = []
        for _ in range(n_samples):
            text = random.choice(social_posts)
            # Add some variation
            if random.random() > 0.7:
                text += f" #{random.choice(['life', 'mood', 'thoughts', 'daily', 'update'])}"
            
            # Most social media posts are clean
            label = 1 if random.random() < 0.05 else 0  # 5% hate speech
            
            data.append({
                'text': text,
                'label': label,
                'source': platform,
                'engagement': random.randint(0, 1000),
                'timestamp': datetime.now() - timedelta(days=random.randint(0, 365))
            })
        
        return pd.DataFrame(data)
    
    def _generate_news_comments_data(self, n_samples: int) -> pd.DataFrame:
        """Generate news comment-like data"""
        news_comments = [
            "Great article, very informative",
            "Thanks for sharing this perspective",
            "I learned something new today",
            "Well researched piece",
            "Interesting point of view",
            "This explains a lot",
            "Good journalism here",
            "Appreciate the balanced reporting",
            "This is important information",
            "Glad this issue is being covered",
            "I disagree with this analysis",
            "The data seems incomplete",
            "This conclusion is questionable",
            "More research is needed",
            "I have a different opinion",
            "This article is biased",
            "The facts don't support this",
            "This is misleading information",
            "Poor journalism in my opinion",
            "This doesn't make sense"
        ]
        
        data = []
        for _ in range(n_samples):
            text = random.choice(news_comments)
            label = 1 if random.random() < 0.08 else 0  # 8% hate speech (slightly higher for news comments)
            
            data.append({
                'text': text,
                'label': label,
                'source': 'news_comments',
                'article_category': random.choice(['politics', 'sports', 'technology', 'health', 'entertainment']),
                'timestamp': datetime.now() - timedelta(days=random.randint(0, 30))
            })
        
        return pd.DataFrame(data)
    
    def load_custom_dataset(self, file_path: str, text_column: str = 'text', label_column: str = 'label') -> pd.DataFrame:
        """Load a custom dataset from file"""
        try:
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.json'):
                df = pd.read_json(file_path)
            elif file_path.endswith('.tsv'):
                df = pd.read_csv(file_path, sep='\t')
            else:
                raise ValueError(f"Unsupported file format. Supported: {self.supported_formats}")
            
            # Standardize column names
            if text_column in df.columns and label_column in df.columns:
                df = df.rename(columns={text_column: 'text', label_column: 'label'})
                df['source'] = 'custom'
                print(f"Custom dataset loaded: {len(df)} samples")
                return df
            else:
                raise ValueError(f"Required columns '{text_column}' and '{label_column}' not found")
        
        except Exception as e:
            print(f"Error loading custom dataset: {e}")
            return pd.DataFrame()

class DatasetManager:
    """Manage and combine multiple datasets"""
    
    def __init__(self):
        self.generator = HateSpeechDatasetGenerator()
        self.loader = RealWorldDatasetLoader()
        self.datasets = {}
    
    def create_comprehensive_dataset(self, 
                                   synthetic_samples: int = 1000,
                                   include_realworld: bool = True,
                                   save_path: str = None) -> pd.DataFrame:
        """Create a comprehensive dataset combining multiple sources"""
        print("Creating comprehensive hate speech dataset...")
        
        datasets_to_combine = []
        
        # Add synthetic data
        synthetic_df = self.generator.generate_synthetic_dataset(synthetic_samples)
        datasets_to_combine.append(synthetic_df)
        
        # Add real-world simulated data
        if include_realworld:
            realworld_df = self.loader.load_hatespeech_dataset()
            datasets_to_combine.append(realworld_df)
        
        # Combine all datasets
        combined_df = pd.concat(datasets_to_combine, ignore_index=True, sort=False)
        
        # Clean and standardize
        combined_df = self._clean_dataset(combined_df)
        
        # Add final metadata
        combined_df['dataset_id'] = range(len(combined_df))
        combined_df['created_at'] = datetime.now()
        
        # Save if path provided
        if save_path:
            self.save_dataset(combined_df, save_path)
        
        # Store in memory
        self.datasets['comprehensive'] = combined_df
        
        print(f"\nComprehensive dataset created!")
        print(f"Total samples: {len(combined_df)}")
        print(f"Hate speech samples: {combined_df['label'].sum()}")
        print(f"Clean samples: {len(combined_df) - combined_df['label'].sum()}")
        print(f"Hate speech percentage: {(combined_df['label'].sum() / len(combined_df)) * 100:.1f}%")
        
        return combined_df
    
    def _clean_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize the dataset"""
        # Remove duplicates
        df = df.drop_duplicates(subset=['text'], keep='first')
        
        # Remove empty texts
        df = df[df['text'].str.strip() != '']
        
        # Standardize labels (ensure 0/1)
        df['label'] = df['label'].astype(int)
        
        # Add text statistics
        df['text_length'] = df['text'].str.len()
        df['word_count'] = df['text'].str.split().str.len()
        df['char_count'] = df['text'].str.len()
        
        return df
    
    def get_dataset_statistics(self, dataset_name: str = 'comprehensive') -> Dict:
        """Get comprehensive statistics about the dataset"""
        if dataset_name not in self.datasets:
            print(f"Dataset '{dataset_name}' not found")
            return {}
        
        df = self.datasets[dataset_name]
        
        stats = {
            'total_samples': len(df),
            'hate_speech_samples': int(df['label'].sum()),
            'clean_samples': int(len(df) - df['label'].sum()),
            'hate_speech_percentage': (df['label'].sum() / len(df)) * 100,
            'avg_text_length': df['text_length'].mean(),
            'avg_word_count': df['word_count'].mean(),
            'sources': df['source'].value_counts().to_dict() if 'source' in df.columns else {},
            'label_distribution': df['label'].value_counts().to_dict()
        }
        
        return stats
    
    def save_dataset(self, df: pd.DataFrame, file_path: str):
        """Save dataset to file"""
        try:
            if file_path.endswith('.csv'):
                df.to_csv(file_path, index=False)
            elif file_path.endswith('.json'):
                df.to_json(file_path, orient='records', indent=2)
            elif file_path.endswith('.parquet'):
                df.to_parquet(file_path, index=False)
            else:
                # Default to CSV
                file_path += '.csv'
                df.to_csv(file_path, index=False)
            
            print(f"Dataset saved to: {file_path}")
        
        except Exception as e:
            print(f"Error saving dataset: {e}")
    
    def load_dataset(self, file_path: str) -> pd.DataFrame:
        """Load dataset from file"""
        try:
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.json'):
                df = pd.read_json(file_path)
            elif file_path.endswith('.parquet'):
                df = pd.read_parquet(file_path)
            else:
                raise ValueError("Unsupported file format")
            
            print(f"Dataset loaded from: {file_path}")
            return df
        
        except Exception as e:
            print(f"Error loading dataset: {e}")
            return pd.DataFrame()
    
    def export_training_data(self, dataset_name: str = 'comprehensive', 
                           train_ratio: float = 0.8) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Export data split for training"""
        if dataset_name not in self.datasets:
            print(f"Dataset '{dataset_name}' not found")
            return pd.DataFrame(), pd.DataFrame()
        
        df = self.datasets[dataset_name]
        
        # Stratified split to maintain label distribution
        from sklearn.model_selection import train_test_split
        
        train_df, test_df = train_test_split(
            df, 
            test_size=1-train_ratio, 
            stratify=df['label'], 
            random_state=42
        )
        
        print(f"Training set: {len(train_df)} samples")
        print(f"Test set: {len(test_df)} samples")
        
        return train_df, test_df

# Demo function
def demo_dataset_creation():
    """Demonstrate dataset creation and management"""
    print("🗃️ Hate Speech Dataset Creation Demo\n")
    
    # Create dataset manager
    manager = DatasetManager()
    
    # Create comprehensive dataset
    dataset = manager.create_comprehensive_dataset(
        synthetic_samples=800,
        include_realworld=True,
        save_path="hate_speech_dataset.csv"
    )
    
    # Show statistics
    print("\n📊 Dataset Statistics:")
    stats = manager.get_dataset_statistics()
    for key, value in stats.items():
        if isinstance(value, dict):
            print(f"{key}:")
            for k, v in value.items():
                print(f"  {k}: {v}")
        else:
            print(f"{key}: {value}")
    
    # Show sample data
    print("\n📝 Sample Data:")
    print("Clean samples:")
    clean_samples = dataset[dataset['label'] == 0].head(3)
    for idx, row in clean_samples.iterrows():
        print(f"  - {row['text']}")
    
    print("\nBorderline/Flagged samples:")
    hate_samples = dataset[dataset['label'] == 1].head(3)
    for idx, row in hate_samples.iterrows():
        print(f"  - {row['text']}")
    
    # Export training data
    print("\n🔄 Exporting training data...")
    train_df, test_df = manager.export_training_data()
    
    return dataset, manager

if __name__ == "__main__":
    demo_dataset_creation()
