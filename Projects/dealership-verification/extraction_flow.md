# Dealership Information Extraction Flow

This diagram illustrates the extraction process flow for gathering dealership information, showing how the different extractors work together.

```mermaid
flowchart TD
    %% Starting point
    Start([Start Verification]) --> InputCSV[Read Dealership CSV]
    InputCSV --> CreateJob[Create Verification Job]
    CreateJob --> ProcessBatch[Process Batch of Dealerships]
    
    %% Verification process
    ProcessBatch --> VerifyURL{Is Website\nActive?}
    VerifyURL -- No --> LogError[Log Error]
    VerifyURL -- Yes --> ExtractorFactory[Extractor Factory]
    
    %% Extractor selection
    ExtractorFactory --> SelectExtractor{Select\nExtractor}
    SelectExtractor -- "Config: hybrid" --> SuperHybrid[Super Hybrid Extractor]
    SelectExtractor -- "Config: selenium" --> ImprovedContact[Improved Contact Extractor]
    SelectExtractor -- "Config: firecrawl" --> Firecrawl[Firecrawl API Extractor]
    
    %% Super Hybrid flow
    SuperHybrid --> TrySelenium[Try Selenium First]
    TrySelenium --> SeleniumSuccess{Selenium\nSuccessful?}
    
    SeleniumSuccess -- Yes --> CheckComplete{Complete\nData?}
    CheckComplete -- Yes --> SaveResults[Save Results]
    
    CheckComplete -- No --> HybridMode{Hybrid\nMode?}
    HybridMode -- "auto" --> TryFirecrawl[Try Firecrawl API]
    HybridMode -- "combine" --> TryFirecrawl
    
    SeleniumSuccess -- No --> HybridMode2{Hybrid\nMode?}
    HybridMode2 -- "fallback" --> TryFirecrawl
    HybridMode2 -- "auto" --> TryFirecrawl
    HybridMode2 -- "combine" --> TryFirecrawl
    
    TryFirecrawl --> FirecrawlSuccess{Firecrawl\nSuccessful?}
    FirecrawlSuccess -- Yes --> CombineResults[Combine Results]
    FirecrawlSuccess -- No --> UseSeleniumResults[Use Selenium Results]
    
    CombineResults --> SaveResults
    UseSeleniumResults --> SaveResults
    
    %% Direct extractors
    ImprovedContact --> ExtractContacts[Extract Contacts]
    ImprovedContact --> ExtractStaff[Extract Staff]
    ImprovedContact --> SaveResults
    
    Firecrawl --> CallAPI[Call Firecrawl API]
    CallAPI --> ParseResponse[Parse API Response]
    ParseResponse --> SaveResults
    
    %% Save and continue
    SaveResults --> StoreDB[Store in Database]
    LogError --> StoreDB
    
    StoreDB --> MoreDealerships{More\nDealerships?}
    MoreDealerships -- Yes --> ProcessBatch
    MoreDealerships -- No --> CompleteJob[Complete Job]
    CompleteJob --> GenerateStats[Generate Statistics]
    GenerateStats --> End([End Verification])
    
    %% Subprocesses
    subgraph "Contact Extraction Process"
        ExtractContacts --> FindEmails[Find Emails]
        ExtractContacts --> FindPhones[Find Phone Numbers]
        ExtractContacts --> FindAddress[Find Address]
        
        FindEmails --> EmailPatterns[Match Email Patterns]
        FindEmails --> CheckContactPage[Check Contact Page]
        FindEmails --> CheckFooter[Check Footer]
        
        FindPhones --> PhonePatterns[Match Phone Patterns]
        FindPhones --> CheckContactPage
        FindPhones --> CheckFooter
        
        FindAddress --> AddressPatterns[Match Address Patterns]
        FindAddress --> CheckContactPage
        FindAddress --> CheckFooter
    end
    
    subgraph "Staff Extraction Process"
        ExtractStaff --> FindStaffPage[Find Staff/Team Page]
        FindStaffPage --> ScanStaffCards[Scan Staff Cards]
        ScanStaffCards --> ExtractStaffInfo[Extract Name/Title/Contact]
        ExtractStaffInfo --> CategorizeStaff[Categorize Staff Roles]
        CategorizeStaff --> AssignConfidence[Assign Confidence Scores]
    end
    
    %% Styling
    classDef process fill:#d0f0c0,stroke:#333,stroke-width:1px;
    classDef decision fill:#ffe6cc,stroke:#333,stroke-width:1px;
    classDef extractor fill:#b5dcff,stroke:#333,stroke-width:1px;
    classDef storage fill:#e1d5e7,stroke:#333,stroke-width:1px;
    classDef endpoint fill:#f9d5e5,stroke:#333,stroke-width:1px;
    
    class Start,End endpoint;
    class VerifyURL,SeleniumSuccess,CheckComplete,HybridMode,HybridMode2,FirecrawlSuccess,MoreDealerships decision;
    class SuperHybrid,ImprovedContact,Firecrawl,ExtractorFactory extractor;
    class StoreDB,InputCSV storage;
    class ProcessBatch,TrySelenium,TryFirecrawl,CombineResults,SaveResults,ExtractContacts,ExtractStaff,CallAPI,ParseResponse,CreateJob,CompleteJob,GenerateStats,LogError process;
```

## Extraction Process Overview

### 1. Job Initialization
- The system reads a CSV file containing dealership information
- A verification job is created to track progress
- Dealerships are processed in batches for efficiency

### 2. Website Verification
- For each dealership, the system first verifies if the website is active
- If the website is not active, an error is logged
- If active, the system proceeds to extract information

### 3. Extractor Selection
- The system uses a factory pattern to select the appropriate extractor based on configuration:
  - **Super Hybrid Extractor**: Combines multiple extraction methods
  - **Improved Contact Extractor**: Uses Selenium for extraction
  - **Firecrawl Extractor**: Uses the Firecrawl API

### 4. Super Hybrid Extraction Process
- **First Attempt**: Try Selenium-based extraction (faster, free, local)
  - Extract contact information (emails, phones, address)
  - Extract staff information when possible
  
- **Decision Point**: Based on results and configured mode:
  - **Auto Mode**: Use Firecrawl if Selenium missed important data
  - **Fallback Mode**: Only use Firecrawl if Selenium completely failed
  - **Combine Mode**: Always use both methods and combine results
  
- **Firecrawl API**: Used as a fallback or supplement
  - More reliable for difficult websites
  - Higher success rate but requires API calls
  
- **Results Combination**: Merge results from both methods when appropriate
  - Remove duplicates
  - Prioritize more complete information

### 5. Contact Extraction Process
- Find emails using pattern matching and targeted page scanning
- Find phone numbers using pattern matching and targeted page scanning
- Find address information from contact pages and footers

### 6. Staff Extraction Process
- Locate staff/team pages on the dealership website
- Scan staff cards or listings for information
- Extract name, title, and contact information
- Categorize staff by role (management, sales, service)
- Assign confidence scores to extracted information

### 7. Data Storage
- Store extracted information in the database
- Update job progress and statistics
- Generate reports for completed jobs

## Extraction Modes

The system supports three extraction modes:

1. **Auto Mode**: Intelligently decides when to use Firecrawl based on Selenium results
2. **Fallback Mode**: Only uses Firecrawl when Selenium completely fails
3. **Combine Mode**: Always uses both methods for maximum data coverage

This flexible approach balances:
- Speed (Selenium is typically faster when it works)
- Quality (improved extraction techniques)
- Reliability (Firecrawl has higher success rates)
- Cost-effectiveness (only use API calls when needed)
