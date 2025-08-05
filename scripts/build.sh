#!/bin/bash
set -e

echo "Starting build process..."

# Create virtual environment
python3 -m venv /app/venv

# Activate virtual environment
source /app/venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies from local requirements.txt
echo "Installing dependencies from requirements.txt..."
pip install --only-binary=all -r requirements.txt

echo "Build completed successfully!"

# Start the application
exec /app/venv/bin/python ml-integration-example.py 