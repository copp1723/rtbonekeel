#!/bin/bash

# Define the source and destination paths
SOURCE="$HOME/Downloads/Nationwide Dealer List w Addresses.csv"
DEST="./dealership_data.csv"

# Check if the file exists
if [ -f "$SOURCE" ]; then
    echo "📁 Found dealer list in Downloads folder"
    cp "$SOURCE" "$DEST"
    echo "✅ Copied to $DEST"
    echo "🔍 Now you can run ./run_verification.sh"
else
    echo "❌ File not found: $SOURCE"
    echo "Please make sure the file exists and the name is correct."
fi
