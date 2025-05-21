/**
 * API Routes Index
 * Combines all route modules into a single router
 */
import express from 'express';
import apiKeysRouter from './apiKeys';
import authRouter from './auth';
import credentialsRouter from './credentials';
import emailsRouter from './emails';
import healthRouter from './health';
import jobsRouter from './jobs';
import monitoringRouter from './monitoring';
import schedulesRouter from './schedules.refactored';
import workflowsRouter from './workflows.refactored';

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