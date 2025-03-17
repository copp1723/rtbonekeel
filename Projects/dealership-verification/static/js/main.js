// Main JavaScript for Dealership Contact Finder

document.addEventListener('DOMContentLoaded', function() {
    // File input enhancement
    const fileInput = document.querySelector('input[type="file"]');
    const fileLabel = document.querySelector('.file-name');
    const fileInputUI = document.querySelector('.file-input-ui');
    
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileLabel.textContent = this.files[0].name;
                fileInputUI.classList.add('has-file');
            } else {
                fileLabel.textContent = 'No file chosen';
                fileInputUI.classList.remove('has-file');
            }
        });
    }
    
    // Form submission with loading state
    const uploadForm = document.querySelector('form[action="/upload"]');
    const singleUrlForm = document.querySelector('form[action="/single_url"]');
    
    function handleFormSubmit(form, btnSelector) {
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector(btnSelector);
            
            // Validate form
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Add validation styles
                this.classList.add('was-validated');
                return;
            }
            
            // Show loading state
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="spinner"></span>
                    Processing...
                `;
                
                // Reset button after 30 seconds in case of failure
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 30000);
            }
        });
    }
    
    handleFormSubmit(uploadForm, 'button[type="submit"]');
    handleFormSubmit(singleUrlForm, 'button[type="submit"]');
    
    // Job status polling with improved error handling and state management
    function pollJobStatus() {
        const activeJobs = document.querySelectorAll('[id^="job-"]');
        
        if (activeJobs.length > 0) {
            const pollInterval = setInterval(function() {
                let allCompleted = true;
                let completedCount = 0;
                
                activeJobs.forEach(function(jobElement) {
                    const jobId = jobElement.id.replace('job-', '');
                    
                    fetch(`/job_status/${jobId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.status === 'running') {
                                allCompleted = false;
                                
                                // Update progress bar
                                const progressBar = jobElement.querySelector('.progress-bar');
                                const progressText = jobElement.querySelector('.progress-text');
                                
                                if (progressBar) {
                                    progressBar.style.width = `${data.progress}%`;
                                    progressBar.setAttribute('aria-valuenow', data.progress);
                                }
                                if (progressText) {
                                    progressText.textContent = `${data.progress}% complete`;
                                }
                            } else {
                                completedCount++;
                                
                                // Update job status
                                const statusBadge = jobElement.querySelector('.badge');
                                if (statusBadge) {
                                    statusBadge.textContent = data.status;
                                    statusBadge.classList.remove('bg-warning');
                                    statusBadge.classList.add(
                                        data.status === 'completed' ? 'bg-success' : 'bg-danger'
                                    );
                                }
                            }
                            
                            // Check if all jobs are complete
                            if (completedCount === activeJobs.length) {
                                clearInterval(pollInterval);
                                window.location.reload();
                            }
                        })
                        .catch(error => {
                            console.error(`Error polling job status for ${jobId}:`, error);
                            // Don't stop polling on temporary errors
                        });
                });
            }, 3000); // Poll every 3 seconds
            
            // Stop polling after 20 minutes maximum
            setTimeout(() => {
                clearInterval(pollInterval);
            }, 20 * 60 * 1000);
        }
    }
    
    pollJobStatus();
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize DataTables if present
    const dataTable = document.getElementById('dataTable');
    if (dataTable && typeof $.fn.DataTable !== 'undefined') {
        $(dataTable).DataTable({
            pageLength: 25,
            scrollX: true,
            responsive: true,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search records...",
                lengthMenu: "Show _MENU_ records",
                info: "Showing _START_ to _END_ of _TOTAL_ records",
                infoEmpty: "Showing 0 to 0 of 0 records",
                infoFiltered: "(filtered from _MAX_ total records)"
            },
            dom: '<"datatable-header"fl>t<"datatable-footer"ip>',
            initComplete: function() {
                // Add custom styling to the search box
                $('.dataTables_filter input').addClass('form-control form-control-sm');
                $('.dataTables_length select').addClass('form-select form-select-sm');
            }
        });
    }
    
    // Animate count-up statistics
    function animateCountUp() {
        const countElements = document.querySelectorAll('.count-up');
        
        countElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-target'), 10);
            const duration = 1500;
            const step = (target / duration) * 15;
            
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.ceil(current).toLocaleString();
                }
            }, 15);
        });
    }
    
    animateCountUp();
    
    // Enhanced form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
    
    // URL validation for single URL form
    const urlInput = document.querySelector('input[type="url"]');
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            const value = this.value.trim();
            
            // Basic URL validation
            if (value && !value.match(/^https?:\/\/.+\..+/)) {
                this.setCustomValidity('Please enter a valid URL starting with http:// or https://');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Auto-dismiss flash messages
    const flashMessages = document.querySelectorAll('.alert-dismissible');
    flashMessages.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000); // Auto-dismiss after 5 seconds
    });

    // Auto-dismiss flash messages after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);

    // File upload preview
    $('.custom-file-input').on('change', function() {
        var fileName = $(this).val().split('\\').pop();
        $(this).next('.custom-file-label').html(fileName);
    });

    // Initialize DataTables with dark theme
    if ($('#resultsTable').length) {
        $('#resultsTable').DataTable({
            "pageLength": 25,
            "order": [[0, "asc"]],
            "dom": '<"top"fl>rt<"bottom"ip><"clear">',
            "language": {
                "search": "Filter records:",
                "lengthMenu": "Show _MENU_ entries per page",
                "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                "infoEmpty": "Showing 0 to 0 of 0 entries",
                "infoFiltered": "(filtered from _MAX_ total entries)"
            },
            "drawCallback": function(settings) {
                // Re-initialize tooltips after table updates
                $('[data-bs-toggle="tooltip"]').tooltip();
            }
        });
    }

    // Animated statistics
    $('.stats-number').each(function() {
        var $this = $(this);
        var countTo = parseInt($this.text());
        
        $({ countNum: 0 }).animate({
            countNum: countTo
        }, {
            duration: 2000,
            easing: 'swing',
            step: function() {
                $this.text(Math.floor(this.countNum));
            },
            complete: function() {
                $this.text(this.countNum);
            }
        });
    });

    // Job status polling
    function pollJobStatus(jobId) {
        $.ajax({
            url: '/job_status/' + jobId,
            method: 'GET',
            success: function(response) {
                $('#progress-' + jobId).css('width', response.progress + '%');
                $('#progress-text-' + jobId).text(response.status);
                
                if (response.status === 'Completed' || response.status === 'Failed') {
                    if (response.status === 'Completed') {
                        $('#job-card-' + jobId).addClass('border-success');
                        $('#view-results-' + jobId).removeClass('d-none');
                    } else {
                        $('#job-card-' + jobId).addClass('border-danger');
                    }
                } else {
                    setTimeout(function() {
                        pollJobStatus(jobId);
                    }, 2000);
                }
            },
            error: function() {
                $('#progress-text-' + jobId).text('Error checking status');
                $('#job-card-' + jobId).addClass('border-danger');
            }
        });
    }

    // Start polling for active jobs
    $('.job-status').each(function() {
        var jobId = $(this).data('job-id');
        if ($(this).data('status') !== 'Completed' && $(this).data('status') !== 'Failed') {
            pollJobStatus(jobId);
        }
    });

    // Form validation
    function validateForm() {
        var isValid = true;
        $('.needs-validation').each(function() {
            if (!this.checkValidity()) {
                isValid = false;
                $(this).addClass('was-validated');
            }
        });
        return isValid;
    }

    // Submit handlers
    $('#upload-form').on('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    $('#single-url-form').on('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}); 