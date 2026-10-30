/**
 * TrafficMind AI - Dedicated Backend AI Service
 * Nebius x NVIDIA Global AI Hackathon 2026
 * 
 * Securely communicates with NVIDIA Nemotron via Nebius Token Factory
 * while keeping all credentials safely on the server side.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables from .env / .env.local
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logger for AI service monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[TrafficMind AI Service] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TrafficMind AI Backend',
    nebiusModel: process.env.NEBIUS_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
    hasApiKey: !!(process.env.NEBIUS_API_KEY && process.env.NEBIUS_API_KEY !== 'your_nebius_api_key_here')
  });
});

// Optional: Serve frontend static build in production if available
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) next();
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 TrafficMind AI Backend Service listening on http://localhost:${PORT}`);
  console.log(`📡 Nebius Token Factory Base URL: ${process.env.NEBIUS_BASE_URL || 'https://api.studio.nebius.ai/v1'}`);
  console.log(`🧠 NVIDIA Nemotron Model: ${process.env.NEBIUS_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct'}`);
  console.log(`🔑 NEBIUS_API_KEY Configured: ${Boolean(process.env.NEBIUS_API_KEY && process.env.NEBIUS_API_KEY !== 'your_nebius_api_key_here')}`);
  console.log('================================================================');
});

export default app;
