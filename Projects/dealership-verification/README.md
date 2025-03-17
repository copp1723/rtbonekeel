# Dealership Contact Finder

A web application for verifying dealership websites and extracting contact information. Built with Flask, this application provides a user-friendly interface for processing both individual URLs and batch CSV files containing dealership data.

## Features

- **Batch Processing**: Upload CSV files containing dealership data for bulk processing
- **Single URL Verification**: Check individual dealership URLs
- **Real-time Progress Tracking**: Monitor job progress with live updates
- **Manufacturer Identification**: Automatically categorize dealerships by manufacturer
- **Contact Information Extraction**: Scrape and organize contact details from dealership websites
- **Dark Theme Interface**: Modern, eye-friendly design
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Export**: Download results in CSV format

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dealership-contact-finder.git
cd dealership-contact-finder
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to:
- Local access: `http://127.0.0.1:5000`
- Network access: `http://your-ip-address:5000`

3. Use the application:
   - Upload a CSV file containing dealership data (must include Website and DealershipName columns)
   - Or enter a single dealership URL and name for verification
   - Monitor job progress in real-time
   - View and download results

## CSV File Format

Your input CSV file should contain the following columns:
- `Website`: The dealership's website URL
- `DealershipName`: The name of the dealership

Example:
```csv
Website,DealershipName
https://www.example-honda.com,Example Honda Dealership
https://www.example-toyota.com,Example Toyota Dealership
```

## Configuration

The application can be configured through environment variables or by modifying `app.py`:

- `UPLOAD_FOLDER`: Directory for temporary file storage
- `RESULTS_FOLDER`: Directory for processed results
- `MAX_CONTENT_LENGTH`: Maximum file upload size (default: 16MB)

## Development

To run the application in development mode:
```bash
export FLASK_ENV=development
export FLASK_APP=app.py
flask run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 