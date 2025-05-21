# API Ingestion Guide

This document provides comprehensive information about the API ingestion capabilities of the Row The Boat application.

## Overview

The API ingestion system allows the application to consume data from various external sources through APIs. This includes REST APIs, webhooks, GraphQL endpoints, and other API-based data sources.

## Supported API Types

The system supports the following API types:

1. **REST APIs**: Standard HTTP-based APIs using JSON or XML
2. **Webhooks**: Incoming HTTP requests from external systems
3. **GraphQL**: Queries to GraphQL endpoints
4. **SOAP**: Legacy XML-based web services
5. **gRPC**: High-performance RPC framework

## Architecture

The API ingestion system follows a modular architecture:

```
src/
├── api/
│   ├── ingestion/
│   │   ├── controllers/    # API endpoint controllers
│   │   ├── middleware/     # Request processing middleware
│   │   ├── routes/         # API route definitions
│   │   └── validators/     # Request validation
├── services/
│   ├── ingestion/
│   │   ├── processors/     # Data processing logic
│   │   ├── transformers/   # Data transformation
│   │   └── validators/     # Business rule validation
└── tools/
    ├── api-client.ts       # Base API client
    ├── webhook-processor.ts # Webhook processing
    └── api-poller.ts       # API polling mechanism
```

## Configuration

API ingestion is configured through JSON files in the `configs/` directory:

### Example Configuration

```json
{
  "apiSource": {
    "name": "ExampleCRM",
    "type": "rest",
    "baseUrl": "https://api.example.com/v1",
    "auth": {
      "type": "oauth2",
      "clientId": "${ENV_CLIENT_ID}",
      "clientSecret": "${ENV_CLIENT_SECRET}",
      "tokenUrl": "https://auth.example.com/token"
    },
    "endpoints": [
      {
        "name": "getLeads",
        "path": "/leads",
        "method": "GET",
        "params": {
          "updatedSince": "{{lastSyncDate}}",
          "limit": 100
        },
        "pagination": {
          "type": "offset",
          "limitParam": "limit",
          "offsetParam": "offset",
          "maxItems": 1000
        }
      }
    ],
    "polling": {
      "interval": 300,
      "enabled": true
    }
  }
}
```

## Authentication Methods

The system supports various authentication methods:

1. **API Key**: Simple key-based authentication
2. **OAuth 2.0**: Token-based authentication with refresh capabilities
3. **Basic Auth**: Username/password authentication
4. **JWT**: JSON Web Token authentication
5. **Custom**: Custom authentication schemes

### OAuth 2.0 Implementation

For OAuth 2.0, the system handles:

- Token acquisition
- Token refresh
- Token storage
- Token rotation

## Webhook Integration

To receive webhooks:

1. Configure the webhook endpoint in `src/api/ingestion/routes/webhooks.ts`
2. Implement a processor in `src/services/ingestion/processors/`
3. Add validation in `src/api/ingestion/validators/`

### Webhook Security

Webhooks are secured using:

- Request signature validation
- IP allowlisting
- Rate limiting
- Payload validation

## Data Processing Pipeline

API data goes through the following pipeline:

1. **Fetching**: Data is retrieved from the API
2. **Validation**: Data is validated against schemas
3. **Transformation**: Data is transformed to the canonical format
4. **Enrichment**: Data is enriched with additional information
5. **Storage**: Data is stored in the database
6. **Indexing**: Data is indexed for search
7. **Notification**: Notifications are sent for new data

## Error Handling

The system handles various error scenarios:

1. **Connection errors**: Retry with exponential backoff
2. **Authentication errors**: Refresh tokens and retry
3. **Rate limiting**: Respect rate limits and retry after delay
4. **Data validation errors**: Log errors and continue processing valid records
5. **Server errors**: Retry with backoff and alert if persistent

## Monitoring and Logging

API ingestion is monitored through:

1. **Logs**: Detailed logs of API interactions
2. **Metrics**: Request counts, success rates, latency
3. **Alerts**: Notifications for failures or anomalies
4. **Dashboards**: Visual representation of ingestion performance

## Adding a New API Source

To add a new API source:

1. Create a configuration file in `configs/`
2. Implement any custom authentication in `src/services/auth/`
3. Add data transformers in `src/services/ingestion/transformers/`
4. Add data validators in `src/services/ingestion/validators/`
5. Update the API registry in `src/services/ingestion/registry.ts`

## Best Practices

1. **Rate limiting**: Respect API rate limits
2. **Incremental sync**: Only fetch new or updated data
3. **Idempotency**: Ensure operations can be safely retried
4. **Error handling**: Implement robust error handling
5. **Logging**: Log all API interactions for debugging
6. **Security**: Securely store credentials and tokens
7. **Monitoring**: Monitor API health and performance

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Rate limiting | Implement backoff and retry logic |
| Authentication failures | Check credentials and token expiration |
| Data format changes | Update transformers and validators |
| API downtime | Implement circuit breakers and fallbacks |
| Large data volumes | Use pagination and batch processing |

## API-Specific Integration Notes

### Salesforce

- Uses OAuth 2.0 with JWT bearer flow
- Requires composite requests for related objects
- Has strict API limits per 24-hour period

### HubSpot

- Uses OAuth 2.0 with refresh tokens
- Provides webhooks for real-time updates
- Offers batch APIs for efficient data retrieval

### Zendesk

- Uses OAuth 2.0 or API tokens
- Provides incremental exports
- Has cursor-based pagination

### Custom CRM Systems

- May require custom authentication
- Often lack standardized APIs
- May need polling for updates

## Testing API Integrations

To test API integrations:

1. Use mock servers for unit tests
2. Use recorded API responses for integration tests
3. Use sandbox environments for end-to-end tests

## API Versioning Strategy

To handle API versioning:

1. Track API version in configuration
2. Implement version-specific transformers
3. Monitor for version deprecation notices
4. Test with new API versions before upgrading