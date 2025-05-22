/**
 * Database Health Check Service
 *
 * This service provides health check functionality for the database.
 */
import { debug, info, warn, error } from '../index.js';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { HealthCheckResult } from './healthService.js';
import { db } from '../index.js';

/**
 * Check database health
 * @returns Health check result
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const id = 'database';
  const name = 'Database';
  const startTime = Date.now();
  
  try {
    // Simple query to test database connectivity
    const queryStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const queryLatency = Date.now() - queryStart;
    
    // Check if query latency exceeds threshold
    const maxLatency = parseInt(process.env.DB_MAX_LATENCY || '200', 10);
    const status = queryLatency > maxLatency ? 'warning' : 'ok';
    const message = status === 'warning' 
      ? `Database query latency (${queryLatency}ms) exceeds threshold (${maxLatency}ms)`
      : 'Database is operational';
    
    // Get connection pool status if available
    let poolStatus = {};
    try {
      // This assumes db has a pool property with stats
      // Adjust based on your actual database client
      if ((db as any).pool && typeof (db as any).pool.getStats === 'function') {
        poolStatus = (db as any).pool.getStats();
      }
    } catch (poolErr) {
      // Ignore pool stats errors
    }
    
    return {
      id,
      name,
      status,
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      message,
      details: {
        queryLatency,
        maxLatency,
        connectionString: process.env.DATABASE_URL
          ? process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')
          : 'Using environment variables',
        poolStatus,
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      id,
      name,
      status: 'error',
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      message: `Database error: ${errorMessage}`,
    };
  }
}

export default {
  checkDatabaseHealth,
};