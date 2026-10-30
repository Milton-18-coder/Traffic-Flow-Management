/**
 * AI Routes for TrafficMind AI
 * 
 * Exposes endpoints for:
 * - Natural-language AI Traffic Assistant (/api/ai/chat)
 * - Incident Simulation and Analysis (/api/ai/incident)
 * - Real-Time Network Intelligence (/api/ai/intelligence)
 * - Nebius Token Factory Status & Health (/api/ai/status)
 */

import express from 'express';
import { 
  handleTrafficQuery, 
  handleIncidentSimulation, 
  analyzeNetworkCongestion 
} from '../services/trafficReasoningEngine.js';
import { checkNebiusStatus } from '../services/nebiusNemotronService.js';
import { INITIAL_NODES, INITIAL_EDGES } from '../../src/data/trafficNetwork.js';

const router = express.Router();

/**
 * GET /api/ai/status
 * Check Nebius Token Factory API key configuration and connection status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await checkNebiusStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to query Nebius Token Factory status',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/intelligence
 * Computes live traffic intelligence KPIs (highest congestion junction, density, bottlenecks)
 */
router.post('/intelligence', (req, res) => {
  try {
    const { nodes = INITIAL_NODES, edges = INITIAL_EDGES } = req.body;
    const stats = analyzeNetworkCongestion(nodes, edges);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to compute network intelligence',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/chat
 * Natural language chat query endpoint for the AI Traffic Assistant
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, nodes, edges, activeRoute, selectedAlgorithm } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query message is required and must be a string.'
      });
    }

    const response = await handleTrafficQuery({
      message,
      nodes: nodes || INITIAL_NODES,
      edges: edges || INITIAL_EDGES,
      activeRoute,
      selectedAlgorithm: selectedAlgorithm || 'A*'
    });

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the traffic query.',
      userMessage: 'The AI assistant encountered a processing error. Please try again with a valid junction or routing question.'
    });
  }
});

/**
 * POST /api/ai/incident
 * Incident simulation, road impact assessment, and diversion generation
 */
router.post('/incident', async (req, res) => {
  try {
    const { 
      incidentType = 'ACCIDENT', 
      targetId = 'CHN-CGL', 
      nodes = INITIAL_NODES, 
      edges = INITIAL_EDGES,
      source = 'CHN',
      destination = 'TIR'
    } = req.body;

    const incidentResult = await handleIncidentSimulation({
      incidentType,
      targetId,
      nodes,
      edges,
      source,
      destination
    });

    res.json({
      success: true,
      ...incidentResult
    });
  } catch (error) {
    console.error('Error in /api/ai/incident:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate incident.',
      userMessage: 'Incident simulation could not be completed. Please check the target corridor or junction ID.'
    });
  }
});

export default router;

