/**
 * Jobs API Routes
 * 
 * This module provides API endpoints for job management.
 */
import express from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const router = express.Router();

// Mock job data
const jobs = [
  {
    id: '1',
    type: 'data-processing',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date().toISOString(),
    result: { processed: 150, errors: 0 }
  },
  {
    id: '2',
    type: 'report-generation',
    status: 'in-progress',
    progress: 45,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: null,
    result: null
  }
];

/**
 * GET /api/jobs
 * Returns a list of jobs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const type = req.query.type as string;
    
    let filteredJobs = [...jobs];
    
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    
    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }
    
    res.json(filteredJobs);
  } catch (error) {
    console.error('Error retrieving jobs:', error);
    res.status(500).json({ error: 'Failed to retrieve jobs' });
  }
});

/**
 * GET /api/jobs/:id
 * Returns a specific job
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const job = jobs.find(j => j.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error(`Error retrieving job ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve job' });
  }
});

/**
 * POST /api/jobs
 * Creates a new job
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Job type is required' });
    }
    
    const newJob = {
      id: randomUUID(),
      type,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      result: null,
      data
    };
    
    jobs.push(newJob);
    
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * DELETE /api/jobs/:id
 * Cancels a job
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel a completed or failed job' });
    }
    
    job.status = 'cancelled';
    
    res.json({ message: 'Job cancelled successfully', job });
  } catch (error) {
    console.error(`Error cancelling job ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

export default router;