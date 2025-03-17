# Dealership Verification Project Architecture

This diagram illustrates the architecture and relationships between the main components of the dealership verification system.

```mermaid
graph TD
    %% Main Application Components
    App[app.py - Flask Web Application]
    Config[config.py - Configuration Settings]
    
    %% Database Components
    DB[database.py - Database Connection]
    Models[models.py - Database Models]
    Repos[repositories.py - Data Access Layer]
    
    %% Verification Components
    Verifier[verify_all_dealerships.py - Verification Orchestrator]
    
    %% Extractor Components
    ExtractorFactory[extractor_factory.py - Creates Extractors]
    SuperHybrid[super_hybrid_extractor.py - Combined Extraction]
    Contact[improved_contact_extractor.py - Contact Extraction]
    Staff[staff_extractor.py - Staff Extraction]
    Firecrawl[firecrawl_extractor.py - API-based Extraction]
    
    %% Utility Components
    LogManager[log_manager.py - Logging System]
    ErrorHandler[error_handler.py - Error Management]
    
    %% Database Models
    Dealership[Dealership Model]
    Contact[Contact Model]
    Staff[StaffMember Model]
    Job[VerificationJob Model]
    ErrorLog[ErrorLog Model]
    
    %% Relationships - Application Flow
    App --> Config
    App --> DB
    App --> Repos
    App --> Verifier
    
    %% Database Relationships
    DB --> Models
    Models --> Dealership
    Models --> Contact
    Models --> Staff
    Models --> Job
    Models --> ErrorLog
    
    %% Repository Relationships
    Repos --> DB
    Repos --> Models
    
    %% Verification Flow
    Verifier --> ExtractorFactory
    ExtractorFactory --> SuperHybrid
    SuperHybrid --> Contact
    SuperHybrid --> Staff
    SuperHybrid --> Firecrawl
    
    %% Utility Relationships
    App --> LogManager
    App --> ErrorHandler
    Verifier --> LogManager
    Verifier --> ErrorHandler
    
    %% Data Flow
    Verifier -- "Processes" --> Dealership
    SuperHybrid -- "Extracts" --> Contact
    SuperHybrid -- "Extracts" --> Staff
    
    %% Repository Operations
    class DealershipRepo[DealershipRepository]
    class JobRepo[JobRepository]
    class ErrorRepo[ErrorRepository]
    class StaffRepo[StaffRepository]
    
    Repos --> DealershipRepo
    Repos --> JobRepo
    Repos --> ErrorRepo
    Repos --> StaffRepo
    
    DealershipRepo -- "CRUD" --> Dealership
    DealershipRepo -- "CRUD" --> Contact
    JobRepo -- "CRUD" --> Job
    ErrorRepo -- "CRUD" --> ErrorLog
    StaffRepo -- "CRUD" --> Staff
    
    %% Web Routes
    WebRoutes[Web Routes]
    App --> WebRoutes
    WebRoutes -- "View Jobs" --> Job
    WebRoutes -- "View Dealerships" --> Dealership
    WebRoutes -- "View Staff" --> Staff
    WebRoutes -- "View Contacts" --> Contact
    
    %% Styling
    classDef app fill:#f9d5e5,stroke:#333,stroke-width:1px;
    classDef db fill:#eeeeee,stroke:#333,stroke-width:1px;
    classDef model fill:#d0f0c0,stroke:#333,stroke-width:1px;
    classDef extractor fill:#b5dcff,stroke:#333,stroke-width:1px;
    classDef util fill:#ffe6cc,stroke:#333,stroke-width:1px;
    classDef repo fill:#e1d5e7,stroke:#333,stroke-width:1px;
    
    class App,Config,WebRoutes app;
    class DB,Models db;
    class Dealership,Contact,Staff,Job,ErrorLog model;
    class SuperHybrid,Contact,Staff,Firecrawl,ExtractorFactory,Verifier extractor;
    class LogManager,ErrorHandler util;
    class Repos,DealershipRepo,JobRepo,ErrorRepo,StaffRepo repo;
```

## Component Descriptions

### Main Application
- **app.py**: Flask web application that provides the user interface and API endpoints
- **config.py**: Configuration settings for different environments (development, production, testing)

### Database
- **database.py**: Database connection management using SQLAlchemy
- **models.py**: SQLAlchemy ORM models defining the database schema
- **repositories.py**: Data access layer providing CRUD operations for models

### Verification System
- **verify_all_dealerships.py**: Orchestrates the verification process for multiple dealerships
- **extractor_factory.py**: Factory pattern to create appropriate extractors based on configuration

### Extractors
- **super_hybrid_extractor.py**: Combined extraction approach using multiple methods
- **improved_contact_extractor.py**: Extracts contact information using Selenium
- **staff_extractor.py**: Extracts staff information from dealership websites
- **firecrawl_extractor.py**: Uses the Firecrawl API for extraction when other methods fail

### Utilities
- **log_manager.py**: Centralized logging system
- **error_handler.py**: Error management and reporting

### Database Models
- **Dealership**: Represents a car dealership with its basic information
- **Contact**: Represents contact information (email, phone, address) for a dealership
- **StaffMember**: Represents staff members at a dealership
- **VerificationJob**: Represents a job for verifying multiple dealerships
- **ErrorLog**: Represents errors that occurred during verification

## Data Flow

1. User uploads a CSV file with dealership information through the web interface
2. The system creates a verification job and processes dealerships in batches
3. For each dealership, the system:
   - Verifies the website is active
   - Extracts contact information using the appropriate extractor
   - Extracts staff information when possible
   - Stores results in the database
4. The user can view results, download reports, and manage dealership data through the web interface
