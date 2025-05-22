/**
 * Redis Health Check Service
 *
 * This service provides health check functionality for Redis.
 */
import { debug, info, warn, error } from '../index.js';
import { v4 as uuidv4 } from 'uuid';
import { HealthCheckResult } from './healthService.js';

// Import Redis client - assuming it's exported from redisService.js
import { getClient } from './redisService.js';

/**
 * Check Redis health
 * @returns Health check result
 */
export async function checkRedisHealth(): Promise<HealthCheckResult> {
  const id = 'redis';
  const name = 'Redis';
  const startTime = Date.now();
  
  try {
    const redisClient = getClient();
    
    if (!redisClient) {
      return {
        id,
        name,
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        message: 'Redis client not initialized',
      };
    }
    
    // Check if Redis is connected
    if (!redisClient.isOpen) {
      return {
        id,
        name,
        status: 'error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        message: 'Redis client not connected',
      };
    }
    
    // Measure ping latency
    const pingStart = Date.now();
    await redisClient.ping();
    const pingLatency = Date.now() - pingStart;
    
    // Check if ping latency exceeds threshold
    const maxLatency = parseInt(process.env.REDIS_MAX_LATENCY || '100', 10);
    const status = pingLatency > maxLatency ? 'warning' : 'ok';
    const message = status === 'warning' 
      ? `Redis ping latency (${pingLatency}ms) exceeds threshold (${maxLatency}ms)`
      : 'Redis is operational';
    
    // Get Redis info for details
    const info = await redisClient.info();
    const memoryMatch = info.match(/used_memory_human:(.+?)\r\n/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown';
    
    const connectedClientsMatch = info.match(/connected_clients:(.+?)\r\n/);
    const connectedClients = connectedClientsMatch ? parseInt(connectedClientsMatch[1].trim(), 10) : 0;
    
    return {
      id,
      name,
      status,
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      message,
      details: {
        pingLatency,
        memoryUsage,
        connectedClients,
        maxLatency,
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
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
      message: `Redis error: ${errorMessage}`,
    };
  }
}

export default {
  checkRedisHealth,
};