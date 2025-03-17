#!/bin/bash

# Base directory setup
BASE_DIR=/home/copp1723/dealership-verification

# Check Python version (require 3.8+)
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
if (( $(echo "$PYTHON_VERSION < 3.8" | bc -l) )); then
    echo "Error: Python 3.8 or newer is required. Current version: $PYTHON_VERSION"
    exit 1
fi

# Create base directory if it doesn't exist
if [ ! -d "$BASE_DIR" ]; then
    echo "Creating base directory..."
    mkdir -p "$BASE_DIR"
fi

# Navigate to base directory
cd "$BASE_DIR" || exit

# Create necessary directories
echo "Creating required directories..."
dirs=("templates" "static" "static/css" "static/js" "uploads" "results" "logs")
for dir in "${dirs[@]}"; do
    mkdir -p "$dir"
    chmod 755 "$dir"
done

# Set up virtual environment
echo "Setting up virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install dependencies from requirements.txt if it exists
echo "Installing dependencies..."
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    # Fallback to installing required packages directly
    pip install flask==3.0.2 pandas==2.2.1 requests==2.31.0 tqdm==4.66.2 \
                fuzzywuzzy==0.18.0 python-Levenshtein==0.25.0 selenium==4.18.1 \
                beautifulsoup4==4.12.3 webdriver-manager==4.0.1 werkzeug==3.0.1
fi

# Create and set permissions for data files
echo "Setting up data files..."
data_files=("verification_progress.csv" "verified_dealerships.csv" "dealership_contacts.csv")
for file in "${data_files[@]}"; do
    touch "$file"
    chmod 644 "$file"
done

# Create and set permissions for log files
echo "Setting up log files..."
touch logs/app.log logs/error.log
chmod 644 logs/app.log logs/error.log

# Check if application files exist
required_files=("app.py" "wsgi.py" "verify_all_dealerships.py" "config.py" "templates/index.html")
missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

echo "\nSetup completed successfully!"

# Report any missing files
if [ ${#missing_files[@]} -ne 0 ]; then
    echo "\nWarning: The following required files are missing:"
    printf '%s\n' "${missing_files[@]}"
    echo "Please upload these files to $BASE_DIR"
fi

echo "\nNext steps:"
echo "1. Configure your web app in PythonAnywhere dashboard:"
echo "   - Source code directory: $BASE_DIR"
echo "   - Virtual environment: $BASE_DIR/venv"
echo "   - Static files URL: /static/"
echo "   - Static files path: $BASE_DIR/static"
echo "2. Update your WSGI configuration file"
echo "3. Reload your web application"

echo "\nNote: Make sure all application files are properly uploaded to $BASE_DIR"
