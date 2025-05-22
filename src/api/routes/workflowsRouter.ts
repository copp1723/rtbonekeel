/**
 * Workflows API Routes
 * 
 * This module provides API endpoints for workflow management.
 */
import express from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const router = express.Router();

// Mock workflow data
const workflows = [
  {
    id: '1',
    name: 'Data Processing Pipeline',
    status: 'active',
    steps: [
      { id: '1-1', name: 'Extract', type: 'data-extraction', status: 'completed' },
      { id: '1-2', name: 'Transform', type: 'data-transformation', status: 'completed' },
      { id: '1-3', name: 'Load', type: 'data-loading', status: 'in-progress' }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastRun: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    name: 'Report Generation',
    status: 'inactive',
    steps: [
      { id: '2-1', name: 'Collect Data', type: 'data-collection', status: 'not-started' },
      { id: '2-2', name: 'Generate Report', type: 'report-generation', status: 'not-started' },
      { id: '2-3', name: 'Send Notifications', type: 'notification', status: 'not-started' }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    lastRun: null
  }
];

/**
 * GET /api/workflows
 * Returns a list of workflows
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    
    let filteredWorkflows = [...workflows];
    
    if (status) {
      filteredWorkflows = filteredWorkflows.filter(workflow => workflow.status === status);
    }
    
    res.json(filteredWorkflows);
  } catch (error) {
    console.error('Error retrieving workflows:', error);
    res.status(500).json({ error: 'Failed to retrieve workflows' });
  }
});

/**
 * GET /api/workflows/:id
 * Returns a specific workflow
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error(`Error retrieving workflow ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve workflow' });
  }
});

/**
 * POST /api/workflows
 * Creates a new workflow
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, steps } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Workflow name is required' });
    }
    
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: 'Workflow steps are required' });
    }
    
    const newWorkflow = {
      id: randomUUID(),
      name,
      status: 'inactive',
      steps: steps.map((step, index) => ({
        id: `${randomUUID()}-${index}`,
        name: step.name,
        type: step.type,
        status: 'not-started'
      })),
      createdAt: new Date().toISOString(),
      lastRun: null
    };
    
    workflows.push(newWorkflow);
    
    res.status(201).json(newWorkflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

/**
 * PUT /api/workflows/:id
 * Updates a workflow
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const workflowIndex = workflows.findIndex(w => w.id === req.params.id);
    
    if (workflowIndex === -1) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const { name, status } = req.body;
    const workflow = workflows[workflowIndex];
    
    if (name) {
      workflow.name = name;
    }
    
    if (status) {
      workflow.status = status;
    }
    
    res.json(workflow);
  } catch (error) {
    console.error(`Error updating workflow ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

/**
 * POST /api/workflows/:id/run
 * Runs a workflow
 */
router.post('/:id/run', async (req: Request, res: Response) => {
  try {
    const workflow = workflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    workflow.status = 'active';
    workflow.lastRun = new Date().toISOString();
    workflow.steps[0].status = 'in-progress';
    
    res.json({ message: 'Workflow started successfully', workflow });
  } catch (error) {
    console.error(`Error running workflow ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to run workflow' });
  }
});

export default router;