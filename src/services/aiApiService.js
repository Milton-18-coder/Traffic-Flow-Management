/**
 * TrafficMind AI Frontend API Service
 * 
 * Safely communicates with the dedicated backend AI service (/api/ai/...)
 * Ensures that API keys are NEVER exposed in client-side code.
 */

const API_BASE = '/api/ai';

/**
 * Get Nebius Token Factory connection and model status
 */
export async function getAiServiceStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach AI backend`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[AI Service] Status query warning:', err.message);
    return {
      success: false,
      error: err.message,
      data: {
        configured: false,
        status: 'disconnected',
        message: 'Could not connect to backend AI service on http://localhost:3001'
      }
    };
  }
}

/**
 * Fetch live traffic intelligence KPIs (highest congestion junction, density, etc.)
 */
export async function getNetworkIntelligence(nodes, edges) {
  try {
    const res = await fetch(`${API_BASE}/intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AI Service] Intelligence query warning:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send natural-language query to AI Traffic Assistant
 */
export async function queryTrafficAssistant({
  message,
  nodes,
  edges,
  activeRoute,
  selectedAlgorithm
}) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        nodes,
        edges,
        activeRoute,
        selectedAlgorithm
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.userMessage || errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[AI Assistant Query Error]:', err);
    return {
      success: false,
      error: err.message,
      text: `⚠️ **AI Service Communication Alert**\n\nCould not communicate with the backend AI service (${err.message}).\n\nPlease ensure the backend server is running via \`npm run server\` or \`npm run dev:all\` and check your \`.env\` configuration.`
    };
  }
}

/**
 * Request incident simulation, road blockage analysis, and diversion recommendation
 */
export async function simulateIncidentAnalysis({
  incidentType,
  targetId,
  nodes,
  edges,
  source,
  destination
}) {
  try {
    const res = await fetch(`${API_BASE}/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentType,
        targetId,
        nodes,
        edges,
        source,
        destination
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.userMessage || errData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[Incident Analysis Error]:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

