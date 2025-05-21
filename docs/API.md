# API Documentation

This document provides an overview of the AgentFlow API endpoints and how to use them.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Task Management](#task-management)
4. [Workflow Management](#workflow-management)
5. [Job Management](#job-management)
6. [Health and Monitoring](#health-and-monitoring)
7. [Using the TypeScript SDK](#using-the-typescript-sdk)

## API Overview

The AgentFlow API provides endpoints for task submission, workflow management, job management, and system monitoring. The API is RESTful and uses JSON for request and response bodies.

### Base URL

- Development: `http://localhost:5000`
- Staging: `https://api-staging.agentflow.example.com`
- Production: `https://api.agentflow.example.com`

### API Versioning

All API endpoints are versioned to ensure backward compatibility:

- V1 endpoints: `/api/v1/...` (stable)
- V2 endpoints: `/api/v2/...` (latest)

When developing integrations, always specify the API version to avoid breaking changes.

### API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. This documentation is generated from OpenAPI specifications located in the `docs/openapi/` directory.

## Authentication

Most API endpoints require authentication. The API uses JWT-based authentication.

### Authentication Endpoints

- `POST /api/auth/login` - Log in with username and password
- `POST /api/auth/refresh` - Refresh an expired token
- `POST /api/auth/logout` - Log out and invalidate the token

### Authentication Headers

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Task Management

Tasks are the core unit of work in AgentFlow. They represent natural language instructions that are parsed and executed by the system.

### Task Endpoints

- `POST /api/tasks` - Submit a new task
- `GET /api/tasks/:taskId` - Get task status and results
- `GET /api/tasks` - List all tasks
- `POST /submit-task` - Execute a task directly (synchronous)

### Submit a New Task

```http
POST /api/tasks
Content-Type: application/json

{
  "task": "Analyze the sales report from last week and summarize the top 5 performing vehicles"
}
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "jobId": "job-123456",
  "message": "Task submitted and enqueued successfully"
}
```

### Get Task Status

```http
GET /api/tasks/123e4567-e89b-12d3-a456-426614174000
```

Response:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-123",
  "taskType": "report_analysis",
  "taskText": "Analyze the sales report from last week and summarize the top 5 performing vehicles",
  "taskData": {
    "reportType": "sales",
    "period": "last_week",
    "count": 5
  },
  "status": "completed",
  "result": {
    "vehicles": [
      {
        "model": "Honda Accord",
        "sales": 42,
        "revenue": 1260000
      }
    ]
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:01:00.000Z"
}
```

### List All Tasks

```http
GET /api/tasks
```

Response:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-123",
    "taskType": "report_analysis",
    "taskText": "Analyze the sales report from last week and summarize the top 5 performing vehicles",
    "status": "completed",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Execute Task Directly

```http
POST /submit-task
Content-Type: application/json

{
  "task": "Analyze the sales report from last week and summarize the top 5 performing vehicles"
}
```

Response:

```json
{
  "result": {
    "vehicles": [
      {
        "model": "Honda Accord",
        "sales": 42,
        "revenue": 1260000
      }
    ]
  },
  "status": "success"
}
```

## Workflow Management

Workflows are sequences of tasks that are executed in order, with the output of one task feeding into the next.

### Workflow Endpoints

- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/:workflowId` - Get workflow status and results
- `GET /api/workflows` - List all workflows
- `PUT /api/workflows/:workflowId` - Update a workflow
- `DELETE /api/workflows/:workflowId` - Delete a workflow

## Job Management

Jobs are the execution units for tasks and workflows. They are managed by the job queue.

### Job Endpoints

- `GET /api/jobs/:jobId` - Get job status and results
- `GET /api/jobs` - List all jobs
- `POST /api/jobs/:jobId/cancel` - Cancel a job
- `POST /api/jobs/:jobId/retry` - Retry a failed job

## Health and Monitoring

Health and monitoring endpoints provide information about the system's health and performance.

### Health and Monitoring Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with component status
- `GET /api/performance` - Performance metrics
- `GET /api/monitoring/health/summary` - Monitoring dashboard summary
- `GET /api/monitoring/dashboard/error-rates` - Error rates dashboard
- `GET /api/monitoring/metrics` - Prometheus-compatible metrics endpoint
- `GET /api/monitoring/logs` - Recent log entries (requires admin privileges)
- `GET /api/monitoring/alerts` - Current system alerts

### Health Check Response Format

The health check endpoints follow a standardized format:

```json
{
  "status": "up", // "up", "degraded", or "down"
  "version": "2.3.1",
  "components": {
    "database": {
      "status": "up",
      "latency": 5,
      "message": "Connected to PostgreSQL"
    },
    "redis": {
      "status": "up",
      "latency": 2,
      "message": "Connected to Redis"
    },
    "openai": {
      "status": "up",
      "latency": 150,
      "message": "OpenAI API responding"
    }
  },
  "message": "All systems operational"
}
```

### Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "up",
  "version": "1.0.0",
  "message": "API server is running"
}
```

### Performance Metrics

```http
GET /api/performance
```

Response:

```json
{
  "performance": {
    "requestCount": 100,
    "averageResponseTime": 50,
    "maxResponseTime": 200,
    "minResponseTime": 10,
    "requestsPerEndpoint": {
      "GET /api/tasks": 50,
      "POST /api/tasks": 30
    }
  },
  "system": {
    "cpuUsage": 10.5,
    "memoryUsage": {
      "total": 8589934592,
      "free": 4294967296,
      "used": 4294967296,
      "percentUsed": 50
    },
    "loadAverage": [1.5, 1.2, 1.0],
    "uptime": 3600
  }
}
```

## Using the TypeScript SDK

The AgentFlow TypeScript SDK provides a convenient way to interact with the API from TypeScript/JavaScript applications.

### Installation

```bash
npm install agentflow-client
```

### Usage

```typescript
import { Configuration, TasksApi, WorkflowsApi } from 'agentflow-client';

// Create a configuration with your API key or other authentication
const config = new Configuration({
  basePath: 'http://localhost:5000',
  accessToken: 'your-jwt-token',
  apiVersion: 'v2' // Specify API version
});

// Create instances of the API clients
const tasksApi = new TasksApi(config);
const workflowsApi = new WorkflowsApi(config);

// Submit a new task
async function submitTask() {
  try {
    const response = await tasksApi.submitTask({
      task: "Analyze the sales report from last week and summarize the top 5 performing vehicles",
      priority: "high",
      notifyOnCompletion: true
    });
    console.log('Task submitted:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error submitting task:', error);
    throw error;
  }
}

// Get task status
async function getTaskStatus(taskId: string) {
  try {
    const response = await tasksApi.getTaskStatus(taskId);
    console.log('Task status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting task status:', error);
    throw error;
  }
}

// Create and execute a workflow
async function createWorkflow() {
  try {
    const response = await workflowsApi.createWorkflow({
      name: "Sales Analysis Workflow",
      description: "Analyze sales data and generate reports",
      steps: [
        {
          name: "data-extraction",
          taskTemplate: "Extract sales data from the last week",
          dependsOn: []
        },
        {
          name: "data-analysis",
          taskTemplate: "Analyze the extracted sales data and identify trends",
          dependsOn: ["data-extraction"]
        },
        {
          name: "report-generation",
          taskTemplate: "Generate a PDF report with the analysis results",
          dependsOn: ["data-analysis"]
        }
      ]
    });
    console.log('Workflow created:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}

// Error handling with the SDK
async function safeApiCall() {
  try {
    const result = await tasksApi.submitTask({
      task: "Process sales data"
    });
    return result.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error('API error:', error.response.status, error.response.data);
      
      if (error.response.status === 429) {
        // Handle rate limiting
        const retryAfter = error.response.headers['retry-after'] || 60;
        console.log(`Rate limited. Retry after ${retryAfter} seconds`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    throw error;
  }
}
```
