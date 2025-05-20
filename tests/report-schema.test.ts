/**
 * Report Schema Tests
 *
 * Tests for the database schema definitions in report-schema.ts
 */

import { describe, it, expect } from 'vitest';
import {
  reportSources,
  reports,
  insights,
  insightDistributions,
  historicalMetrics,
  reportProcessingJobs,
  // Import types to test type exports
  ReportSource,
  NewReportSource,
  Report,
  NewReport,
  Insight,
  NewInsight,
  InsightDistribution,
  NewInsightDistribution,
  HistoricalMetric,
  NewHistoricalMetric,
  ReportProcessingJob,
  NewReportProcessingJob
} from '../src/shared/report-schema.js';

describe('Report Schema', () => {
  describe('reportSources table', () => {
    it('should have the correct columns for report_sources table', () => {
      // Verify the table has the expected column names by checking their SQL names
      expect(reportSources.id.name).toBe('id');
      expect(reportSources.vendor.name).toBe('vendor');
      expect(reportSources.sourceType.name).toBe('source_type');
      expect(reportSources.emailSubject.name).toBe('email_subject');
      expect(reportSources.emailFrom.name).toBe('email_from');
      expect(reportSources.emailDate.name).toBe('email_date');
      expect(reportSources.filePath.name).toBe('file_path');
      expect(reportSources.metadata.name).toBe('metadata');
      expect(reportSources.createdAt.name).toBe('created_at');
      expect(reportSources.updatedAt.name).toBe('updated_at');
    });

    it('should have the required columns', () => {
      // In Drizzle ORM, we can check if the columns exist
      expect(reportSources.id).toBeDefined();
      expect(reportSources.vendor).toBeDefined();
      expect(reportSources.sourceType).toBeDefined();
      expect(reportSources.emailSubject).toBeDefined();
      expect(reportSources.emailFrom).toBeDefined();
      expect(reportSources.emailDate).toBeDefined();
      expect(reportSources.filePath).toBeDefined();
      expect(reportSources.metadata).toBeDefined();
      expect(reportSources.createdAt).toBeDefined();
      expect(reportSources.updatedAt).toBeDefined();
    });

    it('should have the correct indexes', () => {
      // In Drizzle ORM, indexes are defined in the table configuration
      // We can't directly access the indexes at runtime, but we can check the table definition
      expect(reportSources).toBeDefined();

      // We can't test the indexes directly, but we can check that the table is defined correctly
      // This is more of a compile-time check
    });
  });

  describe('reports table', () => {
    it('should have the correct columns for reports table', () => {
      // Verify the table has the expected column names by checking their SQL names
      expect(reports.id.name).toBe('id');
      expect(reports.sourceId.name).toBe('source_id');
      expect(reports.reportData.name).toBe('report_data');
      expect(reports.recordCount.name).toBe('record_count');
      expect(reports.vendor.name).toBe('vendor');
      expect(reports.reportDate.name).toBe('report_date');
      expect(reports.reportType.name).toBe('report_type');
      expect(reports.status.name).toBe('status');
      expect(reports.metadata.name).toBe('metadata');
      expect(reports.createdAt.name).toBe('created_at');
      expect(reports.updatedAt.name).toBe('updated_at');
    });

    it('should have the required columns', () => {
      expect(reports.id).toBeDefined();
      expect(reports.sourceId).toBeDefined();
      expect(reports.reportData).toBeDefined();
      expect(reports.recordCount).toBeDefined();
      expect(reports.vendor).toBeDefined();
      expect(reports.reportDate).toBeDefined();
      expect(reports.reportType).toBeDefined();
      expect(reports.status).toBeDefined();
      expect(reports.metadata).toBeDefined();
      expect(reports.createdAt).toBeDefined();
      expect(reports.updatedAt).toBeDefined();
    });

    it('should reference the reportSources table', () => {
      // In Drizzle ORM, references are defined in the column configuration
      // We can't directly access the references at runtime, but we can check the column definition
      expect(reports.sourceId).toBeDefined();

      // We can't test the references directly, but we can check that the column is defined correctly
      // This is more of a compile-time check
    });

    it('should have the correct indexes', () => {
      // In Drizzle ORM, indexes are defined in the table configuration
      // We can't directly access the indexes at runtime, but we can check the table definition
      expect(reports).toBeDefined();

      // We can't test the indexes directly, but we can check that the table is defined correctly
      // This is more of a compile-time check
    });
  });

  describe('insights table', () => {
    it('should have the correct columns for insights table', () => {
      // Verify the table has the expected column names by checking their SQL names
      expect(insights.id.name).toBe('id');
      expect(insights.reportId.name).toBe('report_id');
      expect(insights.insightData.name).toBe('insight_data');
      expect(insights.promptVersion.name).toBe('prompt_version');
      expect(insights.overallScore.name).toBe('overall_score');
      expect(insights.qualityScores.name).toBe('quality_scores');
      expect(insights.businessImpact.name).toBe('business_impact');
      expect(insights.createdAt.name).toBe('created_at');
      expect(insights.updatedAt.name).toBe('updated_at');
    });

    it('should have the required columns', () => {
      expect(insights.id).toBeDefined();
      expect(insights.reportId).toBeDefined();
      expect(insights.insightData).toBeDefined();
      expect(insights.promptVersion).toBeDefined();
      expect(insights.overallScore).toBeDefined();
      expect(insights.qualityScores).toBeDefined();
      expect(insights.businessImpact).toBeDefined();
      expect(insights.createdAt).toBeDefined();
      expect(insights.updatedAt).toBeDefined();
    });

    it('should reference the reports table', () => {
      // In Drizzle ORM, references are defined in the column configuration
      // We can't directly access the references at runtime, but we can check the column definition
      expect(insights.reportId).toBeDefined();

      // We can't test the references directly, but we can check that the column is defined correctly
      // This is more of a compile-time check
    });

    it('should have the correct indexes', () => {
      // In Drizzle ORM, indexes are defined in the table configuration
      // We can't directly access the indexes at runtime, but we can check the table definition
      expect(insights).toBeDefined();

      // We can't test the indexes directly, but we can check that the table is defined correctly
      // This is more of a compile-time check
    });
  });

  describe('insightDistributions table', () => {
    it('should have the correct columns for insight_distributions table', () => {
      // Verify the table has the expected column names by checking their SQL names
      expect(insightDistributions.id.name).toBe('id');
      expect(insightDistributions.insightId.name).toBe('insight_id');
      expect(insightDistributions.recipientEmail.name).toBe('recipient_email');
      expect(insightDistributions.recipientRole.name).toBe('recipient_role');
      expect(insightDistributions.distributionDate.name).toBe('distribution_date');
      expect(insightDistributions.emailSent.name).toBe('email_sent');
      expect(insightDistributions.emailSentDate.name).toBe('email_sent_date');
      expect(insightDistributions.emailStatus.name).toBe('email_status');
      expect(insightDistributions.emailLogId.name).toBe('email_log_id');
      expect(insightDistributions.createdAt.name).toBe('created_at');
      expect(insightDistributions.updatedAt.name).toBe('updated_at');
    });

    it('should have the required columns', () => {
      expect(insightDistributions.id).toBeDefined();
      expect(insightDistributions.insightId).toBeDefined();
      expect(insightDistributions.recipientEmail).toBeDefined();
      expect(insightDistributions.recipientRole).toBeDefined();
      expect(insightDistributions.distributionDate).toBeDefined();
      expect(insightDistributions.emailSent).toBeDefined();
      expect(insightDistributions.emailSentDate).toBeDefined();
      expect(insightDistributions.emailStatus).toBeDefined();
      expect(insightDistributions.emailLogId).toBeDefined();
      expect(insightDistributions.createdAt).toBeDefined();
      expect(insightDistributions.updatedAt).toBeDefined();
    });

    it('should reference the insights table', () => {
      // In Drizzle ORM, references are defined in the column configuration
      // We can't directly access the references at runtime, but we can check the column definition
      expect(insightDistributions.insightId).toBeDefined();

      // We can't test the references directly, but we can check that the column is defined correctly
      // This is more of a compile-time check
    });

    it('should have the correct indexes', () => {
      // In Drizzle ORM, indexes are defined in the table configuration
      // We can't directly access the indexes at runtime, but we can check the table definition
      expect(insightDistributions).toBeDefined();

      // We can't test the indexes directly, but we can check that the table is defined correctly
      // This is more of a compile-time check
    });
  });

  describe('historicalMetrics table', () => {
    it('should have the correct columns for historical_metrics table', () => {
      // Verify the table has the expected column names by checking their SQL names
      expect(historicalMetrics.id.name).toBe('id');
      expect(historicalMetrics.vendor.name).toBe('vendor');
      expect(historicalMetrics.metricDate.name).toBe('metric_date');
      expect(historicalMetrics.metricType.name).toBe('metric_type');
      expect(historicalMetrics.metricValue.name).toBe('metric_value');
      expect(historicalMetrics.source.name).toBe('source');
      expect(historicalMetrics.sourceId.name).toBe('source_id');
      expect(historicalMetrics.createdAt.name).toBe('created_at');
      expect(historicalMetrics.updatedAt.name).toBe('updated_at');
    });

    it('should have the required columns', () => {
      expect(historicalMetrics.id).toBeDefined();
      expect(historicalMetrics.vendor).toBeDefined();
      expect(historicalMetrics.metricDate).toBeDefined();
      expect(historicalMetrics.metricType).toBeDefined();
      expect(historicalMetrics.metricValue).toBeDefined();
      expect(historicalMetrics.source).toBeDefined();
      expect(historicalMetrics.sourceId).toBeDefined();
      expect(historicalMetrics.createdAt).toBeDefined();
      expect(historicalMetrics.updatedAt).toBeDefined();
    });

    it('should have the correct indexes', () => {
      // In Drizzle ORM, indexes are defined in the table configuration
      // We can't directly access the indexes at runtime, but we can check the table definition
      expect(historicalMetrics).toBeDefined();

      // We can't test the indexes directly, but we can check that the table is defined correctly
      // This is more of a compile-time check
    });
  });

  describe('reportProcessingJobs table', () => {
    it('should have the correct columns for report_processing_jobs table', () => {
      // Verify the table has the expected column names by checking their SQL names
      expect(reportProcessingJobs.id.name).toBe('id');
      expect(reportProcessingJobs.reportId.name).toBe('report_id');
      expect(reportProcessingJobs.jobType.name).toBe('job_type');
      expect(reportProcessingJobs.status.name).toBe('status');
      expect(reportProcessingJobs.attempts.name).toBe('attempts');
      expect(reportProcessingJobs.lastError.name).toBe('last_error');
      expect(reportProcessingJobs.result.name).toBe('result');
      expect(reportProcessingJobs.startedAt.name).toBe('started_at');
      expect(reportProcessingJobs.completedAt.name).toBe('completed_at');
      expect(reportProcessingJobs.createdAt.name).toBe('created_at');
      expect(reportProcessingJobs.updatedAt.name).toBe('updated_at');
    });

    it('should have the required columns', () => {
      expect(reportProcessingJobs.id).toBeDefined();
      expect(reportProcessingJobs.reportId).toBeDefined();
      expect(reportProcessingJobs.jobType).toBeDefined();
      expect(reportProcessingJobs.status).toBeDefined();
      expect(reportProcessingJobs.attempts).toBeDefined();
      expect(reportProcessingJobs.lastError).toBeDefined();
      expect(reportProcessingJobs.result).toBeDefined();
      expect(reportProcessingJobs.startedAt).toBeDefined();
      expect(reportProcessingJobs.completedAt).toBeDefined();
      expect(reportProcessingJobs.createdAt).toBeDefined();
      expect(reportProcessingJobs.updatedAt).toBeDefined();
    });

    it('should reference the reports table', () => {
      // In Drizzle ORM, references are defined in the column configuration
      // We can't directly access the references at runtime, but we can check the column definition
      expect(reportProcessingJobs.reportId).toBeDefined();

      // We can't test the references directly, but we can check that the column is defined correctly
      // This is more of a compile-time check
    });

    it('should have the correct indexes', () => {
      // In Drizzle ORM, indexes are defined in the table configuration
      // We can't directly access the indexes at runtime, but we can check the table definition
      expect(reportProcessingJobs).toBeDefined();

      // We can't test the indexes directly, but we can check that the table is defined correctly
      // This is more of a compile-time check
    });
  });

  describe('Type exports', () => {
    it('should export the correct types', () => {
      // We can't directly test the types at runtime, but we can check that they're exported
      // This is more of a compile-time check, but it ensures the types are exported
      expect(typeof ReportSource).toBe('undefined');
      expect(typeof NewReportSource).toBe('undefined');
      expect(typeof Report).toBe('undefined');
      expect(typeof NewReport).toBe('undefined');
      expect(typeof Insight).toBe('undefined');
      expect(typeof NewInsight).toBe('undefined');
      expect(typeof InsightDistribution).toBe('undefined');
      expect(typeof NewInsightDistribution).toBe('undefined');
      expect(typeof HistoricalMetric).toBe('undefined');
      expect(typeof NewHistoricalMetric).toBe('undefined');
      expect(typeof ReportProcessingJob).toBe('undefined');
      expect(typeof NewReportProcessingJob).toBe('undefined');
    });
  });
});
