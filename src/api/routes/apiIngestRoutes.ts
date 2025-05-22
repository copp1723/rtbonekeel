/**
 * API Ingestion Routes
 * 
 * This module provides API endpoints for data ingestion.
 */
import express from 'express';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const router = express.Router();

// Mock ingestion data
const ingestions = [];

/**
 * POST /api/ingest/data
 * Ingests data from external sources
 */
router.post('/data', async (req: Request, res: Response) => {
  try {
    const { source, data } = req.body;
    
    if (!source) {
      return res.status(400).json({ error: 'Source is required' });
    }
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }
    
    const ingestionId = randomUUID();
    
    // Mock ingestion process
    const ingestion = {
      id: ingestionId,
      source,
      timestamp: new Date().toISOString(),
      status: 'success',
      recordsProcessed: Array.isArray(data) ? data.length : 1,
      errors: []
    };
    
    ingestions.push(ingestion);
    
    res.status(201).json({
      id: ingestionId,
      message: 'Data ingested successfully',
      status: 'success',
      timestamp: ingestion.timestamp
    });
  } catch (error) {
    console.error('Error ingesting data:', error);
    res.status(500).json({ error: 'Failed to ingest data' });
  }
});

/**
 * GET /api/ingest/status/:id
 * Gets the status of a data ingestion
 */
router.get('/status/:id', async (req: Request, res: Response) => {
  try {
    const ingestion = ingestions.find(i => i.id === req.params.id);
    
    if (!ingestion) {
      return res.status(404).json({ error: 'Ingestion not found' });
    }
    
    res.json(ingestion);
  } catch (error) {
    console.error(`Error retrieving ingestion status ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve ingestion status' });
  }
});

/**
 * GET /api/ingest/history
 * Gets the history of data ingestions
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const source = req.query.source as string;
    
    let filteredIngestions = [...ingestions];
    
    if (source) {
      filteredIngestions = filteredIngestions.filter(i => i.source === source);
    }
    
    res.json(filteredIngestions.slice(0, limit));
  } catch (error) {
    console.error('Error retrieving ingestion history:', error);
    res.status(500).json({ error: 'Failed to retrieve ingestion history' });
  }
});

export default router;