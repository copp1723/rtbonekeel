/**
 * Redis Service
 *
 * This service provides a centralized Redis connection with health checks,
 * reconnection logic, and graceful degradation when Redis is unavailable.
 */
import type { Redis as RedisClient } from 'ioredis';
import { debug, info, warn, error } from '../shared/logger.js';
import { isError } from '../utils/errorUtils.js';
import loadConfig from '../config/index.js'; // Changed import path
import { EventEmitter } from 'events'; // Added import

// Redis connection options
export interface RedisConnectionOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: boolean;
  connectionTimeout?: number;
  maxReconnectAttempts?: number;
  initialReconnectDelay?: number;
  maxReconnectDelay?: number;
  healthCheckInterval?: number;
}

// Redis connection status
export type RedisConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// Redis service events
export interface RedisServiceEvents {
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
  reconnecting: (attempt: number) => void;
  healthCheck: (status: RedisConnectionStatus) => void;
}

// Default connection options
const DEFAULT_OPTIONS: Partial<RedisConnectionOptions> = {
  host: 'localhost',
  port: 6379,
  db: 0,
  tls: false,
  connectionTimeout: 10000, // 10 seconds
  maxReconnectAttempts: 10,
  initialReconnectDelay: 1000, // 1 second
  maxReconnectDelay: 30000, // 30 seconds
  healthCheckInterval: 30000, // 30 seconds
};

/**
 * Redis Service Class
 *
 * Provides a centralized Redis connection with health checks and reconnection logic
 */
export class RedisService extends EventEmitter {
  private client: RedisClient | null = null;
  private options: Required<RedisConnectionOptions>;
  private status: RedisConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private RedisCtor: any;
  private inMemoryMode = false;

  constructor(options: Partial<RedisConnectionOptions> = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<RedisConnectionOptions>;
  }

  /**
   * Initialize the Redis service
   * @returns Whether Redis is available
   */
  async initialize(): Promise<boolean> {
    const startTime = Date.now();

    try {
      info('🔄 Initializing Redis service', {
        event: 'redis_service_initializing',
        timestamp: new Date().toISOString(),
      });

      // Load Redis configuration from config
      const config = await loadConfig();
      if (config.redis) {
        this.options = {
          ...this.options,
          host: config.redis.host || 'localhost',
          port: config.redis.port || 6379,
          password: config.redis.password,
          db: config.redis.db || 0,
          tls: config.redis.tls || false,
        };

        info('⚙️ Redis configuration loaded', {
          event: 'redis_config_loaded',
          timestamp: new Date().toISOString(),
          host: this.options.host,
          port: this.options.port,
          db: this.options.db,
          tls: this.options.tls,
        });
      } else {
        info('⚙️ Using default Redis configuration', {
          event: 'redis_using_default_config',
          timestamp: new Date().toISOString(),
          host: this.options.host,
          port: this.options.port,
          db: this.options.db,
          tls: this.options.tls,
        });
      }

      // Try to import ioredis
      try {
        info('📦 Importing ioredis module', {
          event: 'redis_importing_module',
          timestamp: new Date().toISOString(),
        });

        const RedisModule = await import('ioredis');
        this.RedisCtor = RedisModule.default || RedisModule;

        info('✅ ioredis module imported successfully', {
          event: 'redis_module_imported',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        warn('ioredis module not found, falling back to in-memory mode', {
          event: 'redis_module_import_failed',
          timestamp: new Date().toISOString(),
        });
        this.inMemoryMode = true;
      }

      if (!this.inMemoryMode) {
        const connected = await this.connect();
        const durationMs = Date.now() - startTime;

        info(`Redis service initialization ${connected ? 'completed' : 'failed'} in ${durationMs}ms`, {
          event: 'redis_service_init_result',
          timestamp: new Date().toISOString(),
          durationMs,
          connected,
          inMemoryMode: this.inMemoryMode,
        });

        return connected;
      }

      info('Redis service running in in-memory mode', {
        event: 'redis_in_memory_mode',
        timestamp: new Date().toISOString(),
      });

      return false;
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      error('Failed to initialize Redis service', {
        event: 'redis_service_init_error',
        timestamp: new Date().toISOString(),
        durationMs,
        error: isError(err) ? err.message : String(err),
        stack: isError(err) ? err.stack : undefined,
      });
      return false;
    }
  }

  /**
   * Connect to Redis
   * @returns Whether the connection was successful
   */
  private async connect(): Promise<boolean> {
    if (this.inMemoryMode) {
      return false;
    }

    const startTime = Date.now();

    try {
      this.status = 'connecting';

      info('🔌 Connecting to Redis server', {
        event: 'redis_connecting',
        timestamp: new Date().toISOString(),
        host: this.options.host,
        port: this.options.port,
        tls: this.options.tls,
        db: this.options.db,
        connectionTimeout: this.options.connectionTimeout,
      });

      // Create Redis client
      this.client = new this.RedisCtor({
        host: this.options.host,
        port: this.options.port,
        password: this.options.password,
        db: this.options.db,
        tls: this.options.tls ? {} : undefined,
        connectTimeout: this.options.connectionTimeout,
        retryStrategy: () => null, // Disable built-in retry, we'll handle it ourselves
      });

      // Set up event listeners
      if (this.client) { // Added null check
        this.client.on('connect', this.handleConnect.bind(this));
        this.client.on('error', this.handleError.bind(this));
        this.client.on('close', this.handleDisconnect.bind(this));
      } else {
        // This case should ideally not be reached if RedisCtor is valid and new RedisCtor throws on error
        error('Failed to instantiate Redis client, client is null.', {
          event: 'redis_client_instantiation_failed',
          timestamp: new Date().toISOString(),
        });
        this.status = 'error';
        this.emit('error', new Error('Failed to instantiate Redis client'));
        return false; // Propagate failure
      }

      debug('🔄 Redis event handlers registered', {
        event: 'redis_event_handlers_registered',
        timestamp: new Date().toISOString(),
      });

      // Wait for connection or timeout
      info('⏳ Waiting for Redis connection (timeout: ' + this.options.connectionTimeout + 'ms)', {
        event: 'redis_waiting_for_connection',
        timestamp: new Date().toISOString(),
        timeoutMs: this.options.connectionTimeout,
      });

      const connected = await this.waitForConnection();

      const totalDuration = Date.now() - startTime;

      if (connected) {
        info('✅ Connected to Redis in ' + totalDuration + 'ms', {
          event: 'redis_connection_successful',
          timestamp: new Date().toISOString(),
          durationMs: totalDuration,
          host: this.options.host,
          port: this.options.port,
        });
      } else {
        warn('⏱️ Redis connection timed out after ' + totalDuration + 'ms', {
          event: 'redis_connection_timeout',
          timestamp: new Date().toISOString(),
          durationMs: totalDuration,
          host: this.options.host,
          port: this.options.port,
          timeoutMs: this.options.connectionTimeout,
        });
      }

      return connected;
    } catch (err: unknown) {
      const totalDuration = Date.now() - startTime;

      error('❌ Failed to connect to Redis', {
        event: 'redis_connection_error',
        timestamp: new Date().toISOString(),
        durationMs: totalDuration,
        host: this.options.host,
        port: this.options.port,
        error: isError(err) ? err.message : String(err),
        stack: isError(err) ? err.stack : undefined,
      });

      this.status = 'error';
      this.emit('error', isError(err) ? err : new Error(String(err)));
      return false;
    }
  }

  /**
   * Wait for Redis connection
   * @returns Whether the connection was successful
   */
  private waitForConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (this.status !== 'connected') {
          warn('Redis connection timeout');
          this.status = 'error';
          resolve(false);
        }
      }, this.options.connectionTimeout);

      this.once('connected', () => {
        clearTimeout(timeout);
        resolve(true);
      });

      this.once('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * Handle Redis connect event
   */
  private handleConnect(): void {
    this.status = 'connected';
    this.reconnectAttempts = 0;
    info('Connected to Redis');
    this.emit('connected');
    // Start health check only after a successful connection
    this.startHealthCheck();
  }

  /**
   * Handle Redis error event
   * @param err Error object
   */
  private handleError(err: Error): void {
    // Avoid logging redundant errors if status is already 'error' from a timeout or failed connect
    if (this.status !== 'error') {
      error('Redis error', {
        event: 'redis_runtime_error',
        timestamp: new Date().toISOString(),
        host: this.options.host,
        port: this.options.port,
        error: err.message,
        stack: err.stack,
      });
    }
    // Only change status if it wasn't already a terminal error state from connection/initialization
    if (this.status !== 'error' && this.status !== 'disconnected') {
        this.status = 'error';
    }
    this.emit('error', err);
    // If the error occurs while connected, it might lead to a disconnect.
    // The 'close' event handler will manage reconnection if the connection actually drops.
  }

  /**
   * Handle Redis disconnect event
   */
  private handleDisconnect(): void {
    // Only act if we were previously connected or trying to connect
    if (this.status === 'connected' || this.status === 'connecting') {
      const previousStatus = this.status;
      this.status = 'disconnected';
      warn('Disconnected from Redis', {
        event: 'redis_disconnected',
        timestamp: new Date().toISOString(),
        host: this.options.host,
        port: this.options.port,
        previousStatus,
      });
      this.emit('disconnected');
      // Stop health checks when disconnected
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer);
        this.healthCheckTimer = null;
      }
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      error('Max reconnect attempts reached, giving up', {
        event: 'redis_max_reconnect_attempts',
        timestamp: new Date().toISOString(),
        timeoutMs: this.options.maxReconnectDelay,
      });
      this.inMemoryMode = true;
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.initialReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.options.maxReconnectDelay
    );

    this.reconnectAttempts++;
    info(`Scheduling Redis reconnect attempt ${this.reconnectAttempts} in ${delay}ms`, {
      event: 'redis_reconnect_scheduled',
      timestamp: new Date().toISOString(),
      interval: delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.emit('reconnecting', this.reconnectAttempts);
      this.connect().catch((err: unknown) => {
        error('Reconnect attempt failed', {
          event: 'redis_reconnect_failed',
          timestamp: new Date().toISOString(),
          durationMs: delay,
          host: this.options.host,
          port: this.options.port,
          error: isError(err) ? err.message : String(err),
          attempt: this.reconnectAttempts,
        });
      });
    }, delay);
  }

  /**
   * Start health check timer
   */
  private startHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Ensure health checks only run if not in memory mode and client exists
    if (this.inMemoryMode || !this.client) {
      debug('Skipping health check: In-memory mode or no client.');
      return;
    }

    this.healthCheckTimer = setInterval(
      this.checkHealth.bind(this),
      this.options.healthCheckInterval
    );

    debug(`Redis health check started with interval ${this.options.healthCheckInterval}ms`, {
        event: 'redis_health_check_started',
        timestamp: new Date().toISOString(),
        interval: this.options.healthCheckInterval,
    });
  }

  /**
   * Check Redis health
   * @returns Health check result
   */
  async checkHealth(): Promise<{ status: RedisConnectionStatus; latency?: number }> {
    if (this.inMemoryMode) {
      this.emit('healthCheck', 'disconnected');
      return { status: 'disconnected' };
    }

    if (!this.client) {
      this.emit('healthCheck', 'disconnected');
      return { status: 'disconnected' };
    }

    try {
      const startTime = Date.now();
      await this.client.ping();
      const latency = Date.now() - startTime;

      this.status = 'connected'; // Ensure status is updated if ping is successful
      this.emit('healthCheck', this.status);

      debug(`Redis health check: OK (${latency}ms)`, {
        event: 'redis_health_check',
        timestamp: new Date().toISOString(),
        durationMs: latency,
        host: this.options.host,
        port: this.options.port,
      });
      return { status: this.status, latency };
    } catch (err: unknown) {
      error('Redis health check failed', {
        event: 'redis_health_check_failed',
        timestamp: new Date().toISOString(),
        host: this.options.host,
        port: this.options.port,
        error: isError(err) ? err.message : String(err),
        stack: isError(err) ? err.stack : undefined,
      });

      this.status = 'error';
      this.emit('healthCheck', this.status);

      // If health check fails and we thought we were connected, trigger disconnect handling
      // to attempt reconnection.
      if (this.client && this.client.status === 'ready') { // Check if client THINKS it's ready
         // but ping failed
         warn('Redis health check failed despite client status being ready. Forcing disconnect.', {
            event: 'redis_health_check_forced_disconnect',
            timestamp: new Date().toISOString(),
         });
         // Manually close the client to trigger the 'close' event and reconnection logic
         this.client.disconnect();
      } else {
        // If client is not 'ready', scheduleReconnect might already be in progress or needed.
        this.scheduleReconnect();
      }

      return { status: this.status };
    }
  }

  /**
   * Get the Redis client
   * @returns Redis client or null if not connected
   */
  getClient(): RedisClient | null {
    return this.client;
  }

  /**
   * Get the connection status
   * @returns Connection status
   */
  getStatus(): RedisConnectionStatus {
    return this.status;
  }

  /**
   * Check if Redis is available
   * @returns Whether Redis is available
   */
  isAvailable(): boolean {
    return this.status === 'connected' && this.client !== null;
  }

  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      debug('Redis health check stopped.', {
          event: 'redis_health_check_stopped',
          timestamp: new Date().toISOString(),
      });
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      try {
        if (this.client) {
          await this.client.quit();
          info('Redis connection closed');
        }
      } catch (err: unknown) {
        error('Error closing Redis connection', {
          error: isError(err) ? err.message : String(err),
          stack: isError(err) ? err.stack : undefined,
        });
      } finally {
        this.client = null;
        this.status = 'disconnected';
      }
    }
  }
}

// Create and export a singleton instance
export const redisService = new RedisService();
