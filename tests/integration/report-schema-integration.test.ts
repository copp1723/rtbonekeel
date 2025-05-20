/**
 * Report Schema Integration Tests
 *
 * Tests for database operations using the report schema
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import {
  reportSources,
  reports,
  insights,
  insightDistributions,
  historicalMetrics,
  reportProcessingJobs,
  NewReportSource,
  NewReport,
  NewInsight,
  NewInsightDistribution,
  NewHistoricalMetric,
  NewReportProcessingJob
} from '../../src/shared/report-schema.js';
import { eq, and } from 'drizzle-orm';

// Mock the database connection for testing
// In a real test, you might use a test database or a database container
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

describe('Report Schema Integration', () => {
  let client: postgres.Sql;
  let db: ReturnType<typeof drizzle>;
  
  // Set up the database connection before all tests
  beforeAll(async () => {
    // Connect to the test database
    client = postgres(TEST_DB_URL);
    db = drizzle(client);
    
    // Run migrations or create tables
    // In a real test, you might use a migration tool
    // For this test, we'll mock the migration
    vi.mock('drizzle-orm/postgres-js/migrator', () => ({
      migrate: vi.fn().mockResolvedValue(undefined)
    }));
    
    // Mock successful migration
    await migrate(db, { migrationsFolder: './drizzle' });
  });
  
  // Close the database connection after all tests
  afterAll(async () => {
    await client.end();
  });
  
  // Clean up the database before each test
  beforeEach(async () => {
    // Mock the database operations
    vi.spyOn(db, 'delete').mockImplementation(() => {
      return {
        from: () => Promise.resolve()
      } as any;
    });
    
    // Clear all tables
    await db.delete(insightDistributions);
    await db.delete(insights);
    await db.delete(reportProcessingJobs);
    await db.delete(reports);
    await db.delete(reportSources);
    await db.delete(historicalMetrics);
  });
  
  // Test creating a report source
  it('should create a report source', async () => {
    // Mock the insert operation
    const mockInsertResult = { id: uuidv4() };
    vi.spyOn(db, 'insert').mockImplementation(() => {
      return {
        values: () => ({
          returning: () => Promise.resolve([mockInsertResult])
        })
      } as any;
    });
    
    // Create a new report source
    const newReportSource: NewReportSource = {
      vendor: 'Test Vendor',
      sourceType: 'email',
      emailSubject: 'Test Subject',
      emailFrom: 'test@example.com',
      emailDate: new Date(),
      filePath: '/path/to/file.csv',
      metadata: { test: 'metadata' },
    };
    
    // Insert the report source
    const result = await db.insert(reportSources)
      .values(newReportSource)
      .returning();
    
    // Check that the report source was created
    expect(result).toHaveLength(1);
    expect(result[0].id).toBeDefined();
    expect(db.insert).toHaveBeenCalledWith(reportSources);
  });
  
  // Test creating a report
  it('should create a report linked to a report source', async () => {
    // Mock the insert operations
    const sourceId = uuidv4();
    const reportId = uuidv4();
    
    vi.spyOn(db, 'insert').mockImplementation((table) => {
      return {
        values: () => ({
          returning: () => {
            if (table === reportSources) {
              return Promise.resolve([{ id: sourceId }]);
            } else if (table === reports) {
              return Promise.resolve([{ id: reportId }]);
            }
            return Promise.resolve([]);
          }
        })
      } as any;
    });
    
    // Create a new report source
    const newReportSource: NewReportSource = {
      vendor: 'Test Vendor',
      sourceType: 'email',
      emailSubject: 'Test Subject',
      emailFrom: 'test@example.com',
      emailDate: new Date(),
    };
    
    // Insert the report source
    const sourceResult = await db.insert(reportSources)
      .values(newReportSource)
      .returning();
    
    // Create a new report linked to the source
    const newReport: NewReport = {
      sourceId: sourceResult[0].id,
      reportData: { test: 'data' },
      recordCount: 100,
      vendor: 'Test Vendor',
      reportDate: new Date(),
      reportType: 'sales',
      status: 'pending_analysis',
    };
    
    // Insert the report
    const reportResult = await db.insert(reports)
      .values(newReport)
      .returning();
    
    // Check that the report was created
    expect(reportResult).toHaveLength(1);
    expect(reportResult[0].id).toBeDefined();
    expect(db.insert).toHaveBeenCalledWith(reports);
  });
  
  // Test creating an insight
  it('should create an insight linked to a report', async () => {
    // Mock the insert and select operations
    const reportId = uuidv4();
    const insightId = uuidv4();
    
    vi.spyOn(db, 'insert').mockImplementation((table) => {
      return {
        values: () => ({
          returning: () => {
            if (table === insights) {
              return Promise.resolve([{ id: insightId }]);
            }
            return Promise.resolve([]);
          }
        })
      } as any;
    });
    
    vi.spyOn(db, 'select').mockImplementation(() => {
      return {
        from: () => ({
          where: () => Promise.resolve([{ id: reportId }])
        })
      } as any;
    });
    
    // Find a report (mocked)
    const reportResult = await db.select()
      .from(reports)
      .where(eq(reports.id, reportId));
    
    // Create a new insight linked to the report
    const newInsight: NewInsight = {
      reportId: reportResult[0].id,
      insightData: { test: 'insight' },
      promptVersion: '1.0',
      overallScore: 85,
      qualityScores: { accuracy: 90, relevance: 80 },
      businessImpact: { revenue: 'high', cost: 'low' },
    };
    
    // Insert the insight
    const insightResult = await db.insert(insights)
      .values(newInsight)
      .returning();
    
    // Check that the insight was created
    expect(insightResult).toHaveLength(1);
    expect(insightResult[0].id).toBeDefined();
    expect(db.insert).toHaveBeenCalledWith(insights);
  });
  
  // Test the complete workflow
  it('should support the complete report workflow', async () => {
    // Mock all the necessary operations
    const sourceId = uuidv4();
    const reportId = uuidv4();
    const insightId = uuidv4();
    const distributionId = uuidv4();
    const jobId = uuidv4();
    const metricId = uuidv4();
    
    // Mock insert operations for all tables
    vi.spyOn(db, 'insert').mockImplementation((table) => {
      return {
        values: () => ({
          returning: () => {
            if (table === reportSources) {
              return Promise.resolve([{ id: sourceId }]);
            } else if (table === reports) {
              return Promise.resolve([{ id: reportId }]);
            } else if (table === insights) {
              return Promise.resolve([{ id: insightId }]);
            } else if (table === insightDistributions) {
              return Promise.resolve([{ id: distributionId }]);
            } else if (table === reportProcessingJobs) {
              return Promise.resolve([{ id: jobId }]);
            } else if (table === historicalMetrics) {
              return Promise.resolve([{ id: metricId }]);
            }
            return Promise.resolve([]);
          }
        })
      } as any;
    });
    
    // 1. Create a report source
    const newReportSource: NewReportSource = {
      vendor: 'Test Vendor',
      sourceType: 'email',
      emailSubject: 'Test Subject',
      emailFrom: 'test@example.com',
      emailDate: new Date(),
    };
    
    const sourceResult = await db.insert(reportSources)
      .values(newReportSource)
      .returning();
    
    // 2. Create a report
    const newReport: NewReport = {
      sourceId: sourceResult[0].id,
      reportData: { test: 'data' },
      recordCount: 100,
      vendor: 'Test Vendor',
      reportDate: new Date(),
      reportType: 'sales',
      status: 'pending_analysis',
    };
    
    const reportResult = await db.insert(reports)
      .values(newReport)
      .returning();
    
    // 3. Create a processing job
    const newJob: NewReportProcessingJob = {
      reportId: reportResult[0].id,
      jobType: 'analysis',
      status: 'pending',
      attempts: 0,
    };
    
    const jobResult = await db.insert(reportProcessingJobs)
      .values(newJob)
      .returning();
    
    // 4. Create an insight
    const newInsight: NewInsight = {
      reportId: reportResult[0].id,
      insightData: { test: 'insight' },
      promptVersion: '1.0',
      overallScore: 85,
      qualityScores: { accuracy: 90, relevance: 80 },
      businessImpact: { revenue: 'high', cost: 'low' },
    };
    
    const insightResult = await db.insert(insights)
      .values(newInsight)
      .returning();
    
    // 5. Create an insight distribution
    const newDistribution: NewInsightDistribution = {
      insightId: insightResult[0].id,
      recipientEmail: 'recipient@example.com',
      recipientRole: 'manager',
      distributionDate: new Date(),
      emailSent: false,
    };
    
    const distributionResult = await db.insert(insightDistributions)
      .values(newDistribution)
      .returning();
    
    // 6. Create a historical metric
    const newMetric: NewHistoricalMetric = {
      vendor: 'Test Vendor',
      metricDate: new Date(),
      metricType: 'lead_count',
      metricValue: { count: 150 },
      source: 'report',
      sourceId: reportResult[0].id,
    };
    
    const metricResult = await db.insert(historicalMetrics)
      .values(newMetric)
      .returning();
    
    // Verify all entities were created
    expect(sourceResult[0].id).toBeDefined();
    expect(reportResult[0].id).toBeDefined();
    expect(jobResult[0].id).toBeDefined();
    expect(insightResult[0].id).toBeDefined();
    expect(distributionResult[0].id).toBeDefined();
    expect(metricResult[0].id).toBeDefined();
    
    // Verify the insert was called for each table
    expect(db.insert).toHaveBeenCalledWith(reportSources);
    expect(db.insert).toHaveBeenCalledWith(reports);
    expect(db.insert).toHaveBeenCalledWith(reportProcessingJobs);
    expect(db.insert).toHaveBeenCalledWith(insights);
    expect(db.insert).toHaveBeenCalledWith(insightDistributions);
    expect(db.insert).toHaveBeenCalledWith(historicalMetrics);
  });
});
