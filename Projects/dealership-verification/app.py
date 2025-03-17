#!/usr/bin/env python3

from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for
import os
import pandas as pd
from datetime import datetime
import uuid
import json
import threading
import logging
from werkzeug.utils import secure_filename
from verify_all_dealerships import DealershipVerifier
from config import config

# Import database modules
from database import init_db, create_tables, session_scope
from repositories import DealershipRepository, JobRepository, ErrorRepository, StaffRepository
from models import Dealership, Contact, VerificationJob, ErrorLog, StaffMember
from log_manager import get_logger

# Initialize Flask app with configuration
app = Flask(__name__)
app.config.from_object(config['production'])
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

# Initialize database
db_url = os.environ.get('DATABASE_URL', None)
init_db(db_url)
create_tables()

# Set up logging with our custom logger
logger = get_logger(__name__)

# Initialize application directories
base_dir = os.path.dirname(os.path.abspath(__file__))
for directory in ['uploads', 'results']:
    dir_path = os.path.join(base_dir, directory)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        logger.info(f'Created directory: {dir_path}')

# Constants
ALLOWED_EXTENSIONS = {'csv'}
UPLOADS_FOLDER = os.path.join(base_dir, 'uploads')
RESULTS_FOLDER = os.path.join(base_dir, 'results')

# Job status cache for active jobs
active_jobs = {}

# Function to update job progress (now uses database)
def update_job_progress(job_id, progress, status_msg='Processing'):
    try:
        if job_id in active_jobs:
            active_jobs[job_id]['progress'] = progress
            if status_msg:
                active_jobs[job_id]['status_message'] = status_msg
            
            # Update job status in database
            JobRepository.update_job_status(
                job_id=job_id,
                status='processing',
                processed_dealerships=progress,
                stats={'status_message': status_msg}
            )
    except Exception as e:
        logger.error(f'Failed to update job progress: {e}')

# Initialize active jobs from database on startup
def load_active_jobs():
    try:
        with session_scope() as session:
            active_job_records = session.query(VerificationJob).filter(
                VerificationJob.status.in_(['pending', 'processing'])
            ).all()
            
            for job in active_job_records:
                active_jobs[job.job_id] = {
                    'status': job.status,
                    'progress': job.processed_dealerships,
                    'filename': job.name,
                    'start_time': job.start_time.strftime('%Y-%m-%d %H:%M:%S') if job.start_time else '',
                    'total_dealerships': job.total_dealerships
                }
                logger.info(f"Loaded active job {job.job_id} with status {job.status}")
    except Exception as e:
        logger.error(f'Error loading active jobs: {str(e)}')

# Load active jobs on startup
load_active_jobs()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_dealerships(job_id, input_file, max_websites=0):
    """Process dealerships from a CSV file and store results in the database."""
    try:
        # Create job in database
        JobRepository.create_job(
            job_id=job_id,
            name=os.path.basename(input_file),
            status='processing',
            batch_size=app.config['BATCH_SIZE'],
            max_workers=app.config['MAX_WORKERS']
        )
        
        # Initialize verifier with PythonAnywhere-optimized settings
        verifier = DealershipVerifier(
            input_file=input_file,
            batch_size=app.config['BATCH_SIZE'],
            max_workers=app.config['MAX_WORKERS'],
            save_interval=app.config['SAVE_INTERVAL']
        )
        
        # Read input file
        df = pd.read_csv(input_file)
        if max_websites > 0:
            df = df.head(max_websites)
        
        # Create a job folder for logs and backups
        job_folder = os.path.join(RESULTS_FOLDER, job_id)
        os.makedirs(job_folder, exist_ok=True)
        
        # Process dealerships - this will now use the database
        results = verifier.process_dealerships()
        
        # Store all results in the database using bulk create
        dealerships_data = []
        for _, row in df.iterrows():
            if 'Website' in row and 'DealershipName' in row:
                dealerships_data.append({
                    'Website': row['Website'],
                    'DealershipName': row['DealershipName']
                })
        
        if dealerships_data:
            created, updated = DealershipRepository.bulk_create_or_update(dealerships_data)
            logger.info(f"Stored {created} new dealerships and updated {updated} existing ones")
        
        # Export results to CSV as a backup
        verified_file = os.path.join(job_folder, 'verified_dealerships.csv')
        try:
            results_df = pd.DataFrame(results)
            results_df.to_csv(verified_file, index=False)
            logger.info(f'Saved results to {verified_file}')
        except Exception as e:
            logger.error(f'Failed to save CSV backup: {e}')
        
        # Update job status in database
        contact_count = sum(1 for r in results if 'Contacts' in r and r['Contacts'])
        JobRepository.update_job_status(
            job_id=job_id,
            status='completed',
            processed_dealerships=len(results),
            active_websites=sum(1 for r in results if r.get('IsActive', False)),
            stats={
                'total_processed': len(results),
                'contact_count': contact_count,
                'completion_time': datetime.now().isoformat(),
                'job_folder': job_folder
            }
        )
        
        logger.info(f"Job {job_id} completed: processed {len(results)} dealerships")
        
    except Exception as e:
        # Log error to database and file
        logger.error(f"Error processing job {job_id}: {str(e)}")
        ErrorRepository.log_error(
            error_type="JobProcessingError",
            error_message=str(e),
            job_id=job_id,
            context={'input_file': input_file}
        )
        
        # Update job status in database
        JobRepository.update_job_status(
            job_id=job_id,
            status='failed',
            stats={'error': str(e)}
        )
        
        # Create error log file as backup
        try:
            with open(os.path.join(job_folder, 'error.log'), 'w') as f:
                f.write(str(e))
        except Exception as log_error:
            logger.error(f"Failed to write error log: {str(log_error)}")
    
    finally:
        # Remove from active jobs cache
        if job_id in active_jobs:
            del active_jobs[job_id]

@app.route('/')
def index():
    # Get active jobs from cache
    active_job_list = []
    for job_id, job in active_jobs.items():
        active_job_list.append({
            'id': job_id,
            'status': job['status'],
            'processed': job.get('progress', 0),
            'filename': job.get('filename', ''),
            'start_time': job.get('start_time', '')
        })
    
    # Get recent completed jobs from database
    try:
        recent_jobs = []
        jobs_from_db = JobRepository.get_recent_jobs(10)
        
        for job in jobs_from_db:
            if isinstance(job, dict):
                # Repository returns dictionaries
                job_data = job
            else:
                # Direct ORM object
                job_data = {
                    'job_id': job.job_id,
                    'status': job.status,
                    'processed_dealerships': job.processed_dealerships,
                    'active_websites': job.active_websites,
                    'name': job.name,
                    'start_time': job.start_time.strftime('%Y-%m-%d %H:%M:%S') if job.start_time else '',
                    'end_time': job.end_time.strftime('%Y-%m-%d %H:%M:%S') if job.end_time else ''
                }
            
            recent_jobs.append({
                'id': job_data.get('job_id'),
                'status': job_data.get('status'),
                'processed': job_data.get('processed_dealerships', 0),
                'active_urls': job_data.get('active_websites', 0),
                'filename': job_data.get('name', ''),
                'date': job_data.get('end_time', '')
            })
    except Exception as e:
        logger.error(f"Error getting recent jobs: {str(e)}")
        recent_jobs = []
        
    return render_template('index.html', active_jobs=active_job_list, recent_jobs=recent_jobs)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file selected', 'danger')
        return redirect(url_for('index'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected', 'danger')
        return redirect(url_for('index'))
    
    if not allowed_file(file.filename):
        flash('Invalid file type. Please upload a CSV file.', 'danger')
        return redirect(url_for('index'))
    
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOADS_FOLDER, filename)
        file.save(filepath)
        
        # Create job ID and initialize job status
        job_id = str(uuid.uuid4())
        batch_size = int(request.form.get('batch_size', 50))
        
        active_jobs[job_id] = {
            'status': 'Processing',
            'progress': 0,
            'filename': filename,
            'filepath': filepath,
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Initialize DealershipVerifier
        verifier = DealershipVerifier(
            input_file=filepath,
            batch_size=batch_size,
            max_workers=4,
            save_interval=batch_size
        )
        
        # Start processing in a background thread
        verifier.process_dealerships()
        
        flash('File uploaded successfully. Processing started.', 'success')
        return redirect(url_for('index'))
    
    except Exception as e:
        logging.error(f"Error processing upload: {str(e)}")
        flash(f'Error processing file: {str(e)}', 'danger')
        return redirect(url_for('index'))

@app.route('/verify_single_url', methods=['POST'])
def verify_single_url():
    url = request.form.get('url')
    dealership_name = request.form.get('dealership_name')
    
    if not url or not dealership_name:
        flash('Please provide both URL and dealership name', 'danger')
        return redirect(url_for('index'))
    
    try:
        # Create a single-row DataFrame
        df = pd.DataFrame([{
            'Website': url,
            'DealershipName': dealership_name
        }])
        
        # Save temporary CSV
        temp_file = os.path.join(UPLOADS_FOLDER, f'single_url_{uuid.uuid4()}.csv')
        df.to_csv(temp_file, index=False)
        
        # Create job ID and initialize status
        job_id = str(uuid.uuid4())
        active_jobs[job_id] = {
            'status': 'Processing',
            'progress': 0,
            'filename': 'single_url.csv',
            'filepath': temp_file,
            'start_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Initialize verifier and process
        verifier = DealershipVerifier(
            input_file=temp_file,
            batch_size=1,
            max_workers=1,
            save_interval=1
        )
        
        verifier.process_dealerships()
        
        flash('URL verification started', 'success')
        return redirect(url_for('index'))
    
    except Exception as e:
        logging.error(f"Error processing single URL: {str(e)}")
        flash(f'Error processing URL: {str(e)}', 'danger')
        return redirect(url_for('index'))

@app.route('/job_status/<job_id>')
def job_status(job_id):
    # First check the active jobs cache for real-time status
    if job_id in active_jobs:
        job = active_jobs[job_id]
        return jsonify({
            'status': job['status'],
            'progress': job.get('progress', 0),
            'status_message': job.get('status_message', 'Processing')
        })
    
    # If not in active jobs, check the database
    try:
        job = JobRepository.get_job(job_id)
        if job:
            return jsonify({
                'status': job.get('status', 'unknown'),
                'progress': job.get('processed_dealerships', 0),
                'total': job.get('total_dealerships', 0)
            })
    except Exception as e:
        logger.error(f"Error getting job status: {str(e)}")
    
    return jsonify({'error': 'Job not found'}), 404

@app.route('/view_results/<job_id>')
def view_results(job_id):
    try:
        # Get job from database
        job = JobRepository.get_job(job_id)
        if not job:
            flash('Job not found', 'danger')
            return redirect(url_for('index'))
        
        # Get all dealerships for this job
        job_dealerships = []
        with session_scope() as session:
            # Get the verification job
            verification_job = session.query(VerificationJob).filter(VerificationJob.job_id == job_id).first()
            if verification_job and verification_job.dealerships:
                # Get dealerships from the job
                job_dealerships = verification_job.dealerships
        
        # Fall back to CSV if job doesn't have dealerships in the database
        if not job_dealerships:
            # Try to find the CSV file
            job_folder = os.path.join(RESULTS_FOLDER, job_id)
            results_file = os.path.join(job_folder, 'verified_dealerships.csv')
            if not os.path.exists(results_file):
                results_file = os.path.join(RESULTS_FOLDER, f'verified_dealerships_{job_id}.csv')
            
            if os.path.exists(results_file):
                df = pd.read_csv(results_file)
                results = []
                for _, row in df.iterrows():
                    results.append({
                        'dealership_name': row['DealershipName'],
                        'url': row['Website'],
                        'is_active': row['IsActive'] if 'IsActive' in row else False,
                        'manufacturer': row['Manufacturer'] if 'Manufacturer' in row else 'Unknown',
                        'contacts_found': len(json.loads(row['Contacts'])) if 'Contacts' in row and isinstance(row['Contacts'], str) else 0,
                        'last_checked': row['LastChecked'] if 'LastChecked' in row else ''
                    })
            else:
                # No results available
                flash('No results found for this job', 'warning')
                return redirect(url_for('index'))
        else:
            # Convert dealerships from database to list of dictionaries
            results = []
            for dealership in job_dealerships:
                # Get contacts for this dealership
                contacts = []
                if hasattr(dealership, 'contacts'):
                    contacts = dealership.contacts
                
                results.append({
                    'dealership_name': dealership.name,
                    'url': dealership.website,
                    'is_active': dealership.is_active,
                    'manufacturer': dealership.manufacturer,
                    'contacts_found': len(contacts),
                    'last_checked': dealership.last_checked.strftime('%Y-%m-%d %H:%M:%S') if dealership.last_checked else ''
                })
        
        # Calculate statistics
        stats = {
            'total_records': len(results),
            'active_websites': sum(1 for r in results if r['is_active']),
            'manufacturer_count': len(set(r['manufacturer'] for r in results if r['manufacturer']))
        }
        
        # Calculate manufacturer statistics
        manufacturers = {}
        for r in results:
            mfr = r['manufacturer'] or 'Unknown'
            if mfr not in manufacturers:
                manufacturers[mfr] = {'count': 0, 'active': 0}
            manufacturers[mfr]['count'] += 1
            if r['is_active']:
                manufacturers[mfr]['active'] += 1
        
        manufacturer_stats = []
        for mfr, data in manufacturers.items():
            success_rate = 0
            if data['count'] > 0:
                success_rate = round((data['active'] / data['count']) * 100, 1)
            manufacturer_stats.append({
                'name': mfr,
                'count': data['count'],
                'active_urls': data['active'],
                'success_rate': success_rate
            })
        
        return render_template('view_data.html',
                             job_id=job_id,
                             results=results,
                             stats=stats,
                             manufacturer_stats=manufacturer_stats)
    
    except Exception as e:
        logger.error(f"Error viewing results: {str(e)}")
        flash(f'Error viewing results: {str(e)}', 'danger')
        return redirect(url_for('index'))

@app.route('/download_results/<job_id>')
def download_results(job_id):
    try:
        # Check if we have a file already
        job_folder = os.path.join(RESULTS_FOLDER, job_id)
        results_file = os.path.join(job_folder, 'verified_dealerships.csv')
        if not os.path.exists(results_file):
            results_file = os.path.join(RESULTS_FOLDER, f'verified_dealerships_{job_id}.csv')
        
        # If we don't have a file, generate one from the database
        if not os.path.exists(results_file):
            # Get job data
            job = JobRepository.get_job(job_id)
            if not job:
                flash('Job not found', 'danger')
                return redirect(url_for('index'))
            
            # Get all dealerships for this job and export to CSV
            with session_scope() as session:
                verification_job = session.query(VerificationJob).filter(VerificationJob.job_id == job_id).first()
                
                if verification_job and verification_job.dealerships:
                    # Create directory if it doesn't exist
                    os.makedirs(job_folder, exist_ok=True)
                    
                    # Export to CSV
                    dealerships_data = []
                    for d in verification_job.dealerships:
                        # Get contacts for this dealership
                        contacts_json = '[]'
                        if hasattr(d, 'contacts') and d.contacts:
                            contacts = [{'type': c.type, 'value': c.value} for c in d.contacts]
                            contacts_json = json.dumps(contacts)
                        
                        dealerships_data.append({
                            'DealershipName': d.name,
                            'Website': d.website,
                            'IsActive': d.is_active,
                            'FinalURL': d.final_url,
                            'Manufacturer': d.manufacturer,
                            'Contacts': contacts_json,
                            'LastChecked': d.last_checked.strftime('%Y-%m-%d %H:%M:%S') if d.last_checked else ''
                        })
                    
                    if dealerships_data:
                        df = pd.DataFrame(dealerships_data)
                        df.to_csv(results_file, index=False)
                        logger.info(f"Generated CSV from database for job {job_id}")
                    else:
                        flash('No results found for this job', 'warning')
                        return redirect(url_for('index'))
                else:
                    flash('No results found for this job', 'warning')
                    return redirect(url_for('index'))
        
        # Send the file
        return send_file(results_file,
                        mimetype='text/csv',
                        as_attachment=True,
                        download_name=f'verified_dealerships_{job_id}.csv')
    except Exception as e:
        logger.error(f"Error downloading results: {str(e)}")
        flash(f'Error downloading results: {str(e)}', 'danger')
        return redirect(url_for('index'))

@app.route('/view_staff/<int:dealership_id>')
def view_staff(dealership_id):
    """
    View staff information for a specific dealership.
    """
    try:
        # Get dealership from database
        dealership = DealershipRepository.get_dealership_by_id(dealership_id)
        if not dealership:
            flash('Dealership not found', 'danger')
            return redirect(url_for('index'))
        
        # Get job ID from query parameter
        job_id = request.args.get('job_id', None)
        
        # Get staff members for this dealership
        all_staff = StaffRepository.get_staff_by_dealership(dealership_id)
        management_staff = StaffRepository.get_management_staff(dealership_id)
        sales_staff = [s for s in all_staff if s.role_category == 'sales']
        service_staff = [s for s in all_staff if s.role_category == 'service']
        
        return render_template('view_staff.html', 
                              dealership=dealership,
                              staff=all_staff,
                              management_staff=management_staff,
                              sales_staff=sales_staff,
                              service_staff=service_staff,
                              job_id=job_id)
                              
    except Exception as e:
        logger.error(f"Error viewing staff: {str(e)}")
        flash('Error viewing staff information', 'danger')
        return redirect(url_for('index'))


@app.route('/view_contacts/<int:dealership_id>')
def view_contacts(dealership_id):
    """
    View contact information for a specific dealership.
    """
    try:
        # Get dealership from database
        dealership = DealershipRepository.get_dealership_by_id(dealership_id)
        if not dealership:
            flash('Dealership not found', 'danger')
            return redirect(url_for('index'))
        
        # Get job ID from query parameter
        job_id = request.args.get('job_id', None)
        
        # Get contacts for this dealership
        contacts = DealershipRepository.get_dealership_contacts(dealership_id)
        
        # Organize contacts by type
        emails = [c.value for c in contacts if c.type == 'email']
        phones = [c.value for c in contacts if c.type == 'phone']
        addresses = [c.value for c in contacts if c.type == 'address']
        
        return render_template('view_contacts.html', 
                              dealership=dealership,
                              emails=emails,
                              phones=phones,
                              addresses=addresses,
                              job_id=job_id)
                              
    except Exception as e:
        logger.error(f"Error viewing contacts: {str(e)}")
        flash('Error viewing contact information', 'danger')
        return redirect(url_for('index'))


@app.route('/download_staff/<int:dealership_id>')
def download_staff(dealership_id):
    """
    Download staff information as CSV for a specific dealership.
    """
    try:
        import io
        import csv
        from flask import Response
        
        # Get dealership from database
        dealership = DealershipRepository.get_dealership_by_id(dealership_id)
        if not dealership:
            flash('Dealership not found', 'danger')
            return redirect(url_for('index'))
        
        # Get staff members for this dealership
        staff = StaffRepository.get_staff_by_dealership(dealership_id)
        if not staff:
            flash('No staff information available', 'warning')
            return redirect(url_for('view_staff', dealership_id=dealership_id))
        
        # Create CSV data
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Name', 'Title', 'Role Category', 'Email', 'Phone', 'Photo URL'])
        
        # Write data
        for member in staff:
            writer.writerow([
                member.name,
                member.title,
                member.role_category,
                member.email,
                member.phone,
                member.photo_url
            ])
        
        # Create response
        output.seek(0)
        filename = f"{dealership.name.replace(' ', '_')}_staff.csv"
        
        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error downloading staff: {str(e)}")
        flash('Error generating staff download file', 'danger')
        return redirect(url_for('view_staff', dealership_id=dealership_id))


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0') 