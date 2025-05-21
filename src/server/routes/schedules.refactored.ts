/**
 * API Routes for Task Scheduler
 * Handles CRUD operations for schedules and schedule execution
 */
import express, { Request, Response } from 'express';
import { isError } from '../index.js';
import { z } from 'zod';
import { isAuthenticated } from '../index.js';
import {
  createSchedule,
  getSchedule,
  listSchedules,
  updateSchedule,
  deleteSchedule,
  retrySchedule,
  getScheduleLogs,
} from '../index.js';
import { asyncHandler } from '../../utils/routeHandler.js';
import type { sendBadRequest, sendForbidden, sendNotFound } from '../../utils/apiResponse.js';

const router = express.Router();

// Validation schemas
const createScheduleSchema = z.object({
  intent: z.string().min(1).max(100),
  platform: z.string().min(1).max(50),
  cronExpression: z.string().min(1),
  workflowId: z.string().uuid().optional(),
});

const updateScheduleSchema = z.object({
  cronExpression: z.string().min(1).optional(),
  status: z.enum(['active', 'paused', 'failed']).optional(),
  intent: z.string().min(1).max(100).optional(),
  platform: z.string().min(1).max(50).optional(),
});

// Middleware to validate schedule ID
const validateScheduleId = (
  req: Request,
  res: Response,
  next: express.NextFunction
) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return sendBadRequest(res, 'Invalid schedule ID format');
  }
  next();
};

// Create a new schedule
router.post('/', isAuthenticated, asyncHandler(async (req: any, res: Response) => {
  // Validate request body
  const validationResult = createScheduleSchema.safeParse(req.body);
  if (!validationResult.success) {
    sendBadRequest(res, 'Invalid request data', validationResult.error.format());
    return;
  }

  const { intent, platform, cronExpression, workflowId } = validationResult.data;
  
  // Create the schedule
  const schedule = await createSchedule({
    userId: req.user.claims.sub,
    intent,
    platform,
    cronExpression,
    workflowId,
  });
  
  return schedule;
}));

// Get all schedules for the authenticated user
router.get('/', isAuthenticated, asyncHandler(async (req: any) => {
  // Extract query parameters
  const status = req.query.status as string;
  const platform = req.query.platform as string;
  const intent = req.query.intent as string;
  
  // List schedules with filtering
  return await listSchedules({
    userId: req.user.claims.sub,
    status,
    platform,
    intent,
  });
}));

// Get a specific schedule by ID
router.get('/:id', isAuthenticated, validateScheduleId, asyncHandler(async (req: any, res: Response) => {
  const schedule = await getSchedule(req.params.id);
  
  if (!schedule) {
    sendNotFound(res, 'Schedule not found');
    return;
  }
  
  // Check if the schedule belongs to the authenticated user
  if (schedule.userId !== req.user.claims.sub) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  return schedule;
}));

// Update a schedule
router.put('/:id', isAuthenticated, validateScheduleId, asyncHandler(async (req: any, res: Response) => {
  // Get the schedule to check ownership
  const existingSchedule = await getSchedule(req.params.id);
  
  if (!existingSchedule) {
    sendNotFound(res, 'Schedule not found');
    return;
  }
  
  // Check if the schedule belongs to the authenticated user
  if (existingSchedule.userId !== req.user.claims.sub) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  // Validate request body
  const validationResult = updateScheduleSchema.safeParse(req.body);
  if (!validationResult.success) {
    sendBadRequest(res, 'Invalid request data', validationResult.error.format());
    return;
  }
  
  // Update the schedule
  return await updateSchedule(req.params.id, validationResult.data);
}));

// Delete a schedule
router.delete('/:id', isAuthenticated, validateScheduleId, asyncHandler(async (req: any, res: Response) => {
  // Get the schedule to check ownership
  const existingSchedule = await getSchedule(req.params.id);
  
  if (!existingSchedule) {
    sendNotFound(res, 'Schedule not found');
    return;
  }
  
  // Check if the schedule belongs to the authenticated user
  if (existingSchedule.userId !== req.user.claims.sub) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  // Delete the schedule
  const result = await deleteSchedule(req.params.id);
  
  if (result) {
    res.status(204).end();
    return;
  }
  
  throw new Error('Failed to delete schedule');
}));

// Retry a failed schedule
router.post('/:id/retry', isAuthenticated, validateScheduleId, asyncHandler(async (req: any, res: Response) => {
  // Get the schedule to check ownership
  const existingSchedule = await getSchedule(req.params.id);
  
  if (!existingSchedule) {
    sendNotFound(res, 'Schedule not found');
    return;
  }
  
  // Check if the schedule belongs to the authenticated user
  if (existingSchedule.userId !== req.user.claims.sub) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  // Only allow retrying failed schedules
  if (existingSchedule.status !== 'failed') {
    sendBadRequest(res, 'Only failed schedules can be retried');
    return;
  }
  
  // Retry the schedule
  return await retrySchedule(req.params.id);
}));

// Get execution logs for a schedule
router.get('/:id/logs', isAuthenticated, validateScheduleId, asyncHandler(async (req: any, res: Response) => {
  // Get the schedule to check ownership
  const existingSchedule = await getSchedule(req.params.id);
  
  if (!existingSchedule) {
    sendNotFound(res, 'Schedule not found');
    return;
  }
  
  // Check if the schedule belongs to the authenticated user
  if (existingSchedule.userId !== req.user.claims.sub) {
    sendForbidden(res, 'Access denied');
    return;
  }
  
  // Get logs for the schedule
  return await getScheduleLogs(req.params.id);
}));

export default router;