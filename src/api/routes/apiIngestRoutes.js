// src/api/routes/apiIngestRoutes.js
import express from 'express';

const router = express.Router();

// Mock implementation for API ingestion routes
router.post('/data', (req, res) => {
  res.status(201).json({ message: 'Data received successfully' });
});

router.get('/status', (req, res) => {
  res.status(200).json({ status: 'operational' });
});

export default router;