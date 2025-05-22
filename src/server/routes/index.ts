/**
 * API Routes Index
 * Combines all route modules into a single router
 */
import express from 'express';
import apiKeysRouter from './apiKeys.js.js';
import authRouter from './auth.js.js';
import credentialsRouter from './credentials.js.js';
import emailsRouter from './emails.js.js';
import healthRouter from './health.js.js';
import jobsRouter from './jobs.js.js';
import monitoringRouter from './monitoring.js.js';
import schedulesRouter from './schedules.refactored.js.js';
import workflowsRouter from './workflows.refactored.js.js';

const router = express.Router();

// Mount all route modules
router.use('/auth', authRouter);
router.use('/api-keys', apiKeysRouter);
router.use('/credentials', credentialsRouter);
router.use('/emails', emailsRouter);
router.use('/health', healthRouter);
router.use('/jobs', jobsRouter);
router.use('/monitoring', monitoringRouter);
router.use('/schedules', schedulesRouter);
router.use('/workflows', workflowsRouter);

export default router;