/**
 * Workflow Routes
 * Handles API routes for workflow operations
 */
import express, { Request, Response } from 'express';
import {
  getWorkflow,
  getWorkflows,
  resetWorkflow,
  configureWorkflowNotifications,
} from '../index.js';
import { isAuthenticated } from '../index.js';
import { asyncHandler } from '../../utils/routeHandler.js';
import type { sendBadRequest, sendForbidden, sendNotFound } from '../../utils/apiResponse.js';

const router = express.Router();

/**
 * Get all workflows (or filter by status)
 */
router.get('/', isAuthenticated, asyncHandler(async (req: Request) => {
  const status = req.query.status as string | undefined;
  // Access user ID from the user object (if available)
  const userId = req.user ? (req.user as any).claims?.sub : null;
  
  return await getWorkflows(status, userId);
}));

/**
 * Get a workflow by ID
 */
router.get('/:id', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const workflowId = req.params.id;
  const workflow = await getWorkflow(workflowId);
  
  if (!workflow) {
    sendNotFound(res, 'Workflow not found');
    return;
  }
  
  const userId = req.user ? (req.user as any).claims?.sub : null;
  
  // If userId is provided and doesn't match, deny access
  if (userId && workflow.userId && workflow.userId !== userId) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  return workflow;
}));

/**
 * Reset a workflow to pending status
 */
router.post('/:id/reset', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const workflowId = req.params.id;
  const workflow = await getWorkflow(workflowId);
  
  if (!workflow) {
    sendNotFound(res, 'Workflow not found');
    return;
  }
  
  const userId = req.user ? (req.user as any).claims?.sub : null;
  
  // If userId is provided and doesn't match, deny access
  if (userId && workflow.userId && workflow.userId !== userId) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  return await resetWorkflow(workflowId);
}));

/**
 * Configure email notifications for a workflow
 */
router.post('/:id/notifications', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const { emails } = req.body;
  
  if (!emails) {
    sendBadRequest(res, 'Email addresses are required');
    return;
  }
  
  const workflowId = req.params.id;
  const workflow = await getWorkflow(workflowId);
  
  if (!workflow) {
    sendNotFound(res, 'Workflow not found');
    return;
  }
  
  const userId = req.user ? (req.user as any).claims?.sub : null;
  
  // If userId is provided and doesn't match, deny access
  if (userId && workflow.userId && workflow.userId !== userId) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  // Configure notifications for the workflow
  return await configureWorkflowNotifications(workflowId, emails);
}));

export default router;