#!/bin/bash

# Dealership Verification Runner Script
# This script helps run the dealership verification process

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Check if requirements are installed
if ! pip list | grep -q "pandas"; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Function to run sample verification
run_sample() {
    echo "Running sample verification..."
    python verify_dealerships.py dealership_data.csv --sample 10
}

# Function to run full verification
run_full() {
    echo "Running full verification..."
    python verify_all_dealerships.py dealership_data.csv --batch-size 10 --save-interval 20
}

# Main menu
echo "🚗 Dealership Verification System"
echo "--------------------------------"
echo "1. Run sample verification (10 dealerships)"
echo "2. Run full verification (all dealerships)"
echo "3. View verification results"
echo "4. Exit"
echo

read -p "Select an option (1-4): " option

case $option in
    1)
        run_sample
        ;;
    2)
        run_full
        ;;
    3)
        if [ -f "verified_sample.csv" ]; then
            echo "Sample verification results:"
            head -n 5 verified_sample.csv
            echo "..."
        fi
        
        if [ -f "verified_dealerships.csv" ]; then
            echo "Full verification results:"
            head -n 5 verified_dealerships.csv
            echo "..."
            echo "Total records: $(wc -l < verified_dealerships.csv) (including header)"
        fi
        
        if [ ! -f "verified_sample.csv" ] && [ ! -f "verified_dealerships.csv" ]; then
            echo "No verification results found. Run verification first."
        fi
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option. Please select 1-4."
        ;;
esac

# Make script executable
chmod +x run_verification.sh 