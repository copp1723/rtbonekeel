/**
 * API Ingestion Service
 *
 * This service provides functionality to ingest data via API integrations.
 * Supports Google Ads API and other API-based data sources.
 */
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { debug, info, warn, error } from '../../../shared/logger.js';
import { parseByExtension } from '../../../parsers/index.js';
import { storeResults } from '../../../services/resultsPersistence.js';
import { generateInsights } from '../../../services/insightGenerator.js';
import { sendAdminAlert } from '../../../services/alertMailer.js';
import { isError } from '../../../utils/errorUtils.js';
import { getApiKeyById } from '../../../services/enhancedApiKeyService.js';

// Types
export interface ApiIngestOptions {
  intent?: string;
  downloadDir?: string;
  generateInsights?: boolean;
  storeResults?: boolean;
  startDate?: string;
  endDate?: string;
  reportType?: string;
  format?: 'csv' | 'xlsx' | 'json';
  fields?: string[];
}

export interface ApiIngestResult {
  success: boolean;
  platform: string;
  filePaths: string[];
  parsedData?: any;
  storageResult?: any;
  insights?: any;
  error?: string;
}

/**
 * Custom error for when no report is found via API
 */
export class ReportNotFoundError extends Error {
  constructor(message = 'No data found from API') {
    super(message);
    this.name = 'ReportNotFoundError';
  }
}

/**
 * Ingest data from Google Ads API
 *
 * @param userId User ID for API key lookup
 * @param apiKeyId API key ID to use for authentication
 * @param options Optional configuration
 * @returns Result of the ingestion process
 */
export async function ingestFromGoogleAdsApi(
  userId: string,
  apiKeyId: string,
  options: ApiIngestOptions = {}
): Promise<ApiIngestResult> {
  const startTime = Date.now();
  const platform = 'GoogleAds';
  info(`Starting Google Ads API ingestion for user ${userId}`);

  // Set default options
  const intent = options.intent || 'ads_report';
  const generateInsightsFlag = options.generateInsights !== false;
  const storeResultsFlag = options.storeResults !== false;
  const reportType = options.reportType || 'CAMPAIGN_PERFORMANCE_REPORT';
  const format = options.format || 'csv';
  
  try {
    // Get API key details
    info(`Retrieving API key ${apiKeyId} for Google Ads integration`);
    const apiKey = await getApiKeyById(apiKeyId, userId);
    
    if (!apiKey || !apiKey.additionalData) {
      throw new Error('API key not found or missing required data');
    }

    const { clientId, clientSecret, refreshToken, developerToken, customerId } = apiKey.additionalData;
    
    if (!clientId || !clientSecret || !refreshToken || !developerToken || !customerId) {
      throw new Error('API key is missing required Google Ads credentials');
    }

    // Get access token using refresh token
    info('Obtaining access token from Google OAuth');
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }
    );

    const accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Prepare date range for the report
    const today = new Date();
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 30); // Default to last 30 days
    
    const startDate = options.startDate || defaultStartDate.toISOString().split('T')[0];
    const endDate = options.endDate || today.toISOString().split('T')[0];
    
    // Prepare fields for the report
    const defaultFields = [
      'campaign.id',
      'campaign.name',
      'campaign.status',
      'metrics.impressions',
      'metrics.clicks',
      'metrics.cost_micros',
      'metrics.conversions',
      'metrics.conversions_value'
    ];
    
    const fields = options.fields || defaultFields;
    
    // Build Google Ads API query
    const query = `
      SELECT ${fields.join(', ')}
      FROM ${reportType}
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;
    
    info(`Executing Google Ads API query for customer ID ${customerId}`);
    
    // Make API request to Google Ads API
    const response = await axios.post(
      `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:search`,
      { query },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'login-customer-id': customerId,
        }
      }
    );
    
    if (!response.data || !response.data.results) {
      throw new ReportNotFoundError('No data returned from Google Ads API');
    }
    
    info(`Received ${response.data.results.length} records from Google Ads API`);
    
    // Convert API response to the required format
    const tempFilePath = `/tmp/google_ads_report_${uuidv4()}.${format}`;
    const formattedData = formatGoogleAdsResponse(response.data.results, format, tempFilePath);
    
    // Parse the formatted data
    info(`Parsing Google Ads data in ${format} format`);
    const parsedData = await parseByExtension(tempFilePath, {
      vendor: platform,
      reportType: intent,
    });
    
    info(`Successfully parsed ${parsedData.recordCount} records from Google Ads API`);
    
    // Store results if requested
    let storageResult;
    if (storeResultsFlag) {
      info(`Storing results for ${platform}`);
      storageResult = await storeResults(platform, parsedData, {
        sourceType: 'api',
        apiSource: 'google_ads',
        apiKeyId: apiKeyId,
        metadata: {
          reportType,
          startDate,
          endDate,
          parseTime: Date.now() - startTime,
        },
      });
      info(`Results stored with ID: ${storageResult.id}`);
    }
    
    // Generate insights if requested
    let insights;
    if (generateInsightsFlag && storageResult) {
      info(`Generating insights for ${platform}`);
      insights = await generateInsights(storageResult.id, {
        platform,
        reportType: intent,
      });
      info(`Generated ${insights.length} insights`);
    }
    
    return {
      success: true,
      platform,
      filePaths: [tempFilePath],
      parsedData,
      storageResult,
      insights,
    };
    
  } catch (err) {
    error(`Google Ads API ingestion failed:`, isError(err) ? err : String(err));
    
    // Only send alert if it's not a "no reports found" error
    if (!(err instanceof ReportNotFoundError)) {
      await sendAdminAlert(
        'Google Ads API Ingestion Failed',
        `Failed to ingest reports from Google Ads API`,
        {
          severity: 'error',
          component: 'API Ingestion',
          details: {
            platform,
            userId,
            apiKeyId,
            error: isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err),
            elapsed: `${(Date.now() - startTime) / 1000} seconds`,
          },
        }
      );
    }
    
    return {
      success: false,
      platform,
      filePaths: [],
      error: isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err),
    };
  }
}

/**
 * Generic function to ingest data from any API using stored API keys
 * 
 * @param userId User ID for API key lookup
 * @param apiKeyId API key ID to use for authentication
 * @param platform Platform/service name
 * @param options Optional configuration
 * @returns Result of the ingestion process
 */
export async function ingestFromApi(
  userId: string,
  apiKeyId: string,
  platform: string,
  options: ApiIngestOptions & { 
    endpoint?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: any;
    responseMapping?: Record<string, string>;
  } = {}
): Promise<ApiIngestResult> {
  const startTime = Date.now();
  info(`Starting API ingestion for ${platform}`);
  
  // Set default options
  const intent = options.intent || 'api_report';
  const generateInsightsFlag = options.generateInsights !== false;
  const storeResultsFlag = options.storeResults !== false;
  const method = options.method || 'GET';
  
  try {
    // Get API key details
    info(`Retrieving API key ${apiKeyId}`);
    const apiKey = await getApiKeyById(apiKeyId, userId);
    
    if (!apiKey) {
      throw new Error('API key not found');
    }
    
    // Check if endpoint is provided
    if (!options.endpoint) {
      throw new Error('API endpoint is required');
    }
    
    // Prepare headers with authentication
    const headers = {
      'Authorization': `Bearer ${apiKey.keyValue}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Make API request
    info(`Making ${method} request to ${options.endpoint}`);
    const response = method === 'GET' 
      ? await axios.get(options.endpoint, { headers })
      : await axios.post(options.endpoint, options.body, { headers });
    
    if (!response.data) {
      throw new ReportNotFoundError('No data returned from API');
    }
    
    info(`Received data from ${platform} API`);
    
    // Map response data if mapping is provided
    let processedData = response.data;
    if (options.responseMapping) {
      processedData = mapResponseData(response.data, options.responseMapping);
    }
    
    // Convert API response to the required format
    const format = options.format || 'json';
    const tempFilePath = `/tmp/${platform.toLowerCase()}_report_${uuidv4()}.${format}`;
    const formattedData = formatApiResponse(processedData, format, tempFilePath);
    
    // Parse the formatted data
    info(`Parsing ${platform} data in ${format} format`);
    const parsedData = await parseByExtension(tempFilePath, {
      vendor: platform,
      reportType: intent,
    });
    
    info(`Successfully parsed ${parsedData.recordCount} records from ${platform} API`);
    
    // Store results if requested
    let storageResult;
    if (storeResultsFlag) {
      info(`Storing results for ${platform}`);
      storageResult = await storeResults(platform, parsedData, {
        sourceType: 'api',
        apiSource: platform.toLowerCase(),
        apiKeyId: apiKeyId,
        metadata: {
          endpoint: options.endpoint,
          parseTime: Date.now() - startTime,
        },
      });
      info(`Results stored with ID: ${storageResult.id}`);
    }
    
    // Generate insights if requested
    let insights;
    if (generateInsightsFlag && storageResult) {
      info(`Generating insights for ${platform}`);
      insights = await generateInsights(storageResult.id, {
        platform,
        reportType: intent,
      });
      info(`Generated ${insights.length} insights`);
    }
    
    return {
      success: true,
      platform,
      filePaths: [tempFilePath],
      parsedData,
      storageResult,
      insights,
    };
    
  } catch (err) {
    error(`${platform} API ingestion failed:`, isError(err) ? err : String(err));
    
    // Send alert for API ingestion failure
    await sendAdminAlert(
      `${platform} API Ingestion Failed`,
      `Failed to ingest reports from ${platform} API`,
      {
        severity: 'error',
        component: 'API Ingestion',
        details: {
          platform,
          userId,
          apiKeyId,
          error: isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err),
          elapsed: `${(Date.now() - startTime) / 1000} seconds`,
        },
      }
    );
    
    return {
      success: false,
      platform,
      filePaths: [],
      error: isError(err) ? (err instanceof Error ? err.message : String(err)) : String(err),
    };
  }
}

/**
 * Format Google Ads API response into the specified format
 * 
 * @param results Google Ads API results
 * @param format Output format (csv, xlsx, json)
 * @param filePath Path to save the formatted data
 * @returns Path to the formatted file
 */
function formatGoogleAdsResponse(results: any[], format: string, filePath: string): string {
  const fs = require('fs');
  
  if (format === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    return filePath;
  }
  
  if (format === 'csv') {
    // Convert to CSV format
    const { parse } = require('json2csv');
    
    // Flatten the nested structure of Google Ads API response
    const flattenedResults = results.map(result => {
      const flattened: Record<string, any> = {};
      
      // Process each property in the result
      Object.entries(result).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // For nested objects like campaign, metrics, etc.
          Object.entries(value as Record<string, any>).forEach(([subKey, subValue]) => {
            flattened[`${key}.${subKey}`] = subValue;
          });
        } else {
          flattened[key] = value;
        }
      });
      
      return flattened;
    });
    
    const csv = parse(flattenedResults);
    fs.writeFileSync(filePath, csv);
    return filePath;
  }
  
  if (format === 'xlsx') {
    // Convert to XLSX format
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Google Ads Report');
    
    // Flatten the nested structure and determine columns
    const flattenedResults = results.map(result => {
      const flattened: Record<string, any> = {};
      
      Object.entries(result).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value as Record<string, any>).forEach(([subKey, subValue]) => {
            flattened[`${key}.${subKey}`] = subValue;
          });
        } else {
          flattened[key] = value;
        }
      });
      
      return flattened;
    });
    
    // Add headers
    if (flattenedResults.length > 0) {
      const headers = Object.keys(flattenedResults[0]);
      worksheet.addRow(headers);
      
      // Add data rows
      flattenedResults.forEach(row => {
        worksheet.addRow(Object.values(row));
      });
    }
    
    // Save workbook
    workbook.xlsx.writeFile(filePath);
    return filePath;
  }
  
  throw new Error(`Unsupported format: ${format}`);
}

/**
 * Format generic API response into the specified format
 * 
 * @param data API response data
 * @param format Output format (csv, xlsx, json)
 * @param filePath Path to save the formatted data
 * @returns Path to the formatted file
 */
function formatApiResponse(data: any, format: string, filePath: string): string {
  const fs = require('fs');
  
  // Ensure data is an array
  const dataArray = Array.isArray(data) ? data : [data];
  
  if (format === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(dataArray, null, 2));
    return filePath;
  }
  
  if (format === 'csv') {
    // Convert to CSV format
    const { parse } = require('json2csv');
    const csv = parse(dataArray);
    fs.writeFileSync(filePath, csv);
    return filePath;
  }
  
  if (format === 'xlsx') {
    // Convert to XLSX format
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('API Report');
    
    // Add headers
    if (dataArray.length > 0) {
      const headers = Object.keys(dataArray[0]);
      worksheet.addRow(headers);
      
      // Add data rows
      dataArray.forEach(row => {
        worksheet.addRow(Object.values(row));
      });
    }
    
    // Save workbook
    workbook.xlsx.writeFile(filePath);
    return filePath;
  }
  
  throw new Error(`Unsupported format: ${format}`);
}

/**
 * Map API response data using provided mapping
 * 
 * @param data Original API response data
 * @param mapping Field mapping configuration
 * @returns Mapped data
 */
function mapResponseData(data: any, mapping: Record<string, string>): any[] {
  // Handle array responses
  if (Array.isArray(data)) {
    return data.map(item => mapSingleObject(item, mapping));
  }
  
  // Handle responses with data in a specific property
  if (data.data && Array.isArray(data.data)) {
    return data.data.map(item => mapSingleObject(item, mapping));
  }
  
  // Handle responses with results in a specific property
  if (data.results && Array.isArray(data.results)) {
    return data.results.map(item => mapSingleObject(item, mapping));
  }
  
  // Handle single object response
  return [mapSingleObject(data, mapping)];
}

/**
 * Map a single object using provided mapping
 * 
 * @param obj Original object
 * @param mapping Field mapping configuration
 * @returns Mapped object
 */
function mapSingleObject(obj: any, mapping: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(mapping).forEach(([targetField, sourcePath]) => {
    // Handle nested paths like 'data.metrics.clicks'
    const parts = sourcePath.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }
    
    result[targetField] = value;
  });
  
  return result;
}

export default {
  ingestFromGoogleAdsApi,
  ingestFromApi,
};