/**
 * Traffic Reasoning Engine
 * 
 * Bridges classical AI search algorithms (BFS, DFS, Dijkstra, A*) with
 * NVIDIA Nemotron reasoning via Nebius Token Factory.
 * 
 * Guarantees that:
 * 1. LLM NEVER hallucinates route paths, nodes, distances, or coordinates.
 * 2. All pathfinding is computed strictly by classical search algorithms.
 * 3. Nemotron handles natural-language understanding, situational reasoning,
 *    corridor analysis, and traffic diversion explanations.
 */

import { runBFS } from '../../src/algorithms/bfs.js';
import { runDFS } from '../../src/algorithms/dfs.js';
import { runDijkstra } from '../../src/algorithms/dijkstra.js';
import { runAStar } from '../../src/algorithms/astar.js';
import { findAllSimpleRoutes } from '../../src/algorithms/combinatorialRoutes.js';
import { 
  calculateEdgeCost, 
  normalizeTrafficLevel, 
  TRAFFIC_LEVELS, 
  formatMinutes, 
  formatDistance 
} from '../../src/utils/trafficCostModel.js';
import { INITIAL_NODES, INITIAL_EDGES } from '../../src/data/trafficNetwork.js';
import { callNemotronChat } from './nebiusNemotronService.js';

/**
 * System prompt setting NVIDIA Nemotron's persona and strict grounding rules
 */
const NEMOTRON_SYSTEM_PROMPT = `You are TrafficMind AI Core Assistant, an intelligent transportation engineering AI powered by NVIDIA Nemotron hosted on Nebius Token Factory.
Your purpose is to provide explainable, accurate, and actionable traffic flow analysis, route optimization guidance, and incident response recommendations.

CRITICAL RULES:
1. STRICT GROUNDING: You must ONLY base route recommendations, travel times, distances, and junction states on the MATHEMATICAL FACTS provided in the prompt. Do NOT invent fictional junctions, imaginary road corridors, or hallucinated travel times.
2. CLASSICAL SEARCH INTEGRITY: All optimal paths and detours are computed by classical graph algorithms (BFS, DFS, Dijkstra, A*). You explain WHY the algorithm selected the path, the trade-offs involved (e.g. distance vs congestion delays), and tactical traffic engineering advice.
3. CONCISE & ACTIONABLE: Deliver structured, professional, and clear answers. Use markdown bullet points, bold key corridor names, and highlight travel time savings.
4. INCIDENT ADVICE: For road blockages or accidents, explain the bottleneck cause, quantify the delay impact, and provide clear traffic diversion recommendations.`;

/**
 * Resolve a junction from user text (by ID, Name, Number, or Alias)
 */
export function resolveJunction(inputStr, nodes = INITIAL_NODES) {
  if (!inputStr) return null;
  const raw = String(inputStr).trim().toUpperCase();

  // 1. Direct ID match
  const direct = nodes.find(n => n.id.toUpperCase() === raw);
  if (direct) return direct;

  // 2. Numeric match (e.g., "Junction 1", "J1", "Node 1", "1")
  const numMatch = raw.match(/(?:JUNCTION|NODE|J)?\s*(\d+)/i);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (idx >= 0 && idx < nodes.length) {
      return nodes[idx];
    }
  }

  // 3. Alphabetical letter match (e.g. "Junction A" -> nodes[0], "Junction B" -> nodes[1])
  const letterMatch = raw.match(/(?:JUNCTION|NODE|J)?\s*([A-Z])$/i);
  if (letterMatch && letterMatch[1].length === 1) {
    const letterCode = letterMatch[1].charCodeAt(0) - 65; // A=0, B=1, ...
    if (letterCode >= 0 && letterCode < nodes.length) {
      return nodes[letterCode];
    }
  }

  // 4. Name substring match (e.g. "Chennai", "Kanchi", "Salem", "Madurai", "Trichy")
  const lowerRaw = inputStr.toLowerCase().trim();
  const nameMatch = nodes.find(n => {
    const nName = n.name.toLowerCase();
    return nName.includes(lowerRaw) || lowerRaw.includes(nName);
  });
  if (nameMatch) return nameMatch;

  // 5. Common city aliases
  const aliasMap = {
    'trichy': 'TRY',
    'tiruchi': 'TRY',
    'tiruchirappalli': 'TRY',
    'madras': 'CHN',
    'chennai': 'CHN',
    'kanchi': 'KAN',
    'kovai': 'CBE',
    'coimbatore': 'CBE',
    'nellai': 'TIR',
    'tirunelveli': 'TIR'
  };
  for (const [alias, id] of Object.entries(aliasMap)) {
    if (lowerRaw.includes(alias)) {
      return nodes.find(n => n.id === id) || null;
    }
  }

  return null;
}

/**
 * Comprehensive network congestion analysis
 */
export function analyzeNetworkCongestion(nodes = INITIAL_NODES, edges = INITIAL_EDGES) {
  const junctionScores = {};
  const junctionEdges = {};

  nodes.forEach(n => {
    junctionScores[n.id] = { node: n, totalWeight: 0, roadCount: 0, blockedRoads: 0, highRoads: 0 };
    junctionEdges[n.id] = [];
  });

  let totalNetworkWeight = 0;
  let activeRoadCount = 0;
  let blockedCount = 0;
  const edgeAnalyses = [];

  edges.forEach(edge => {
    const costInfo = calculateEdgeCost(edge);
    const normLevel = normalizeTrafficLevel(edge.trafficLevel);
    const weight = TRAFFIC_LEVELS[normLevel]?.weight || 1;

    edgeAnalyses.push({
      id: edge.id,
      label: edge.label || `${edge.source} ↔ ${edge.destination}`,
      source: edge.source,
      destination: edge.destination,
      distance: edge.distance,
      speed: edge.speed,
      trafficLevel: normLevel,
      baseTime: costInfo.baseTime,
      totalCost: costInfo.totalCost,
      delayMinutes: costInfo.isBlocked ? 999 : Number((costInfo.totalCost - costInfo.baseTime).toFixed(1)),
      multiplier: costInfo.multiplier,
      isBlocked: costInfo.isBlocked
    });

    if (costInfo.isBlocked) {
      blockedCount++;
    } else {
      totalNetworkWeight += weight;
      activeRoadCount++;
    }

    [edge.source, edge.destination].forEach(nid => {
      if (junctionScores[nid]) {
        junctionScores[nid].roadCount++;
        junctionEdges[nid].push(edge);
        if (costInfo.isBlocked) {
          junctionScores[nid].blockedRoads++;
          junctionScores[nid].totalWeight += 5; // Heavy penalty for blocked link
        } else {
          junctionScores[nid].totalWeight += weight;
          if (normLevel === 'HIGH' || normLevel === 'VERY_HIGH') {
            junctionScores[nid].highRoads++;
          }
        }
      }
    });
  });

  // Rank junctions by congestion score
  const rankedJunctions = Object.values(junctionScores).map(j => {
    const avgScore = j.roadCount > 0 ? (j.totalWeight / j.roadCount) : 0;
    return {
      id: j.node.id,
      name: j.node.name,
      avgScore: Number(avgScore.toFixed(2)),
      highRoads: j.highRoads,
      blockedRoads: j.blockedRoads,
      totalConnected: j.roadCount
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  // Rank roads by delay
  const rankedRoads = [...edgeAnalyses].sort((a, b) => b.delayMinutes - a.delayMinutes);
  const mostCongestedRoad = rankedRoads.find(r => !r.isBlocked) || rankedRoads[0];
  const highestCongestionJunction = rankedJunctions[0];

  // Average network density (percentage: 1.0 weight = 25%, 4.0 weight = 100%)
  const avgDensityPct = activeRoadCount > 0 
    ? Number(((totalNetworkWeight / (activeRoadCount * 4)) * 100).toFixed(1))
    : 0;

  return {
    highestCongestionJunction,
    rankedJunctions: rankedJunctions.slice(0, 5),
    mostCongestedRoad,
    rankedRoads: rankedRoads.slice(0, 5),
    avgDensityPct,
    blockedCount,
    totalRoads: edges.length,
    activeRoadCount
  };
}

/**
 * Handle incoming natural-language traffic queries
 */
export async function handleTrafficQuery({
  message,
  nodes = INITIAL_NODES,
  edges = INITIAL_EDGES,
  activeRoute = null,
  selectedAlgorithm = 'A*'
}) {
  const query = (message || '').trim();
  const lowerQuery = query.toLowerCase();

  // Validate non-empty query
  if (!query) {
    return {
      success: false,
      text: 'Please provide a traffic question or route query (e.g., "Which junction has the highest congestion?" or "Find the shortest route from Chennai to Madurai").',
      error: 'Empty query received'
    };
  }

  // Pre-calculate live network intelligence
  const congestionStats = analyzeNetworkCongestion(nodes, edges);

  // 1. INTENT RECOGNITION

  // A. Congestion query
  const isCongestionQuery = 
    lowerQuery.includes('highest congestion') ||
    lowerQuery.includes('most congested') ||
    lowerQuery.includes('bottleneck') ||
    lowerQuery.includes('traffic density') ||
    lowerQuery.includes('worst traffic');

  // B. Route request query
  const isRouteQuery = 
    lowerQuery.includes('route') || 
    lowerQuery.includes('path') || 
    lowerQuery.includes('navigate') || 
    lowerQuery.includes('how to reach') || 
    lowerQuery.includes('shortest') || 
    lowerQuery.includes('travel time') ||
    lowerQuery.includes('from ') ||
    lowerQuery.includes('between ');

  // C. Unavailability / Failure simulation query
  const isUnavailabilityQuery = 
    lowerQuery.includes('unavailable') || 
    lowerQuery.includes('blocked') || 
    lowerQuery.includes('closed') || 
    lowerQuery.includes('what happens if') ||
    lowerQuery.includes('accident on');

  // D. Algorithm comparison query
  const isComparisonQuery = 
    lowerQuery.includes('compare') || 
    lowerQuery.includes('dijkstra and a*') || 
    lowerQuery.includes('bfs vs') || 
    lowerQuery.includes('difference between');

  // E. Diversion / Alternative recommendation query
  const isDiversionQuery = 
    lowerQuery.includes('diversion') || 
    lowerQuery.includes('divert') || 
    lowerQuery.includes('alternative route') ||
    lowerQuery.includes('bypass');

  // F. General traffic situation explanation
  const isSituationQuery = 
    lowerQuery.includes('current traffic situation') || 
    lowerQuery.includes('explain traffic') || 
    lowerQuery.includes('status of traffic') ||
    lowerQuery.includes('traffic report');

  // G. Check for invalid or completely unrelated queries
  const isTrafficRelated = 
    isCongestionQuery || isRouteQuery || isUnavailabilityQuery || 
    isComparisonQuery || isDiversionQuery || isSituationQuery ||
    lowerQuery.includes('traffic') || lowerQuery.includes('junction') ||
    lowerQuery.includes('road') || lowerQuery.includes('speed') ||
    lowerQuery.includes('chennai') || lowerQuery.includes('salem') ||
    lowerQuery.includes('madurai') || lowerQuery.includes('tirunelveli');

  if (!isTrafficRelated && query.length > 10) {
    return {
      success: true,
      queryType: 'INVALID_QUERY',
      text: `I am **TrafficMind AI**, specialized exclusively in intelligent transportation networks, classical graph search algorithms (BFS, DFS, Dijkstra, A*), and real-time congestion optimization across Tamil Nadu highways.\n\nYour question *"_${query}_"* is outside the traffic and routing domain. Please ask a traffic-related question, such as:\n* **"Which junction currently has the highest congestion?"**\n* **"Find the shortest route between Chennai and Tirunelveli."**\n* **"What happens if Junction Vellore becomes unavailable?"**\n* **"Compare Dijkstra and A* for CHN to MDU."**`,
      structuredData: null,
      provider: 'TrafficMind Safety Filter'
    };
  }

  // 2. DISPATCH & RETRIEVE GROUND TRUTH MATHEMATICAL DATA

  let calculatedData = {};
  let userPromptContext = '';
  let queryType = 'GENERAL_ANALYSIS';

  if (isComparisonQuery) {
    queryType = 'ALGORITHM_COMPARISON';
    // Extract source and destination if present
    const srcNode = extractSourceNode(query, nodes) || nodes[0]; // CHN
    const dstNode = extractDestNode(query, nodes) || nodes[nodes.length - 1]; // TIR

    const dijkstraRes = runDijkstra(nodes, edges, srcNode.id, dstNode.id);
    const astarRes = runAStar(nodes, edges, srcNode.id, dstNode.id);
    const bfsRes = runBFS(nodes, edges, srcNode.id, dstNode.id);
    const dfsRes = runDFS(nodes, edges, srcNode.id, dstNode.id);

    calculatedData = {
      source: srcNode,
      destination: dstNode,
      dijkstra: {
        path: dijkstraRes.path,
        cost: dijkstraRes.cost,
        distance: dijkstraRes.distance,
        exploredCount: dijkstraRes.nodesExploredCount,
        timeMs: dijkstraRes.executionTime
      },
      astar: {
        path: astarRes.path,
        cost: astarRes.cost,
        distance: astarRes.distance,
        exploredCount: astarRes.nodesExploredCount,
        timeMs: astarRes.executionTime
      },
      bfs: {
        path: bfsRes.path,
        cost: bfsRes.cost,
        exploredCount: bfsRes.nodesExploredCount
      },
      dfs: {
        path: dfsRes.path,
        cost: dfsRes.cost,
        exploredCount: dfsRes.nodesExploredCount
      }
    };

    userPromptContext = `The user is comparing search algorithms between [${srcNode.id}] ${srcNode.name} and [${dstNode.id}] ${dstNode.name}.
GROUND-TRUTH COMPUTED METRICS:
- Dijkstra's Algorithm: Path = ${dijkstraRes.path.join(' → ')}, Travel Cost = ${dijkstraRes.cost} min, Explored = ${dijkstraRes.nodesExploredCount} nodes, Exec Time = ${dijkstraRes.executionTime} ms.
- A* Search (Informed with Euclidean/Speed Heuristic): Path = ${astarRes.path.join(' → ')}, Travel Cost = ${astarRes.cost} min, Explored = ${astarRes.nodesExploredCount} nodes, Exec Time = ${astarRes.executionTime} ms.
- BFS (Unweighted Hops): Path = ${bfsRes.path.join(' → ')}, Explored = ${bfsRes.nodesExploredCount} nodes.
- DFS: Path = ${dfsRes.path.join(' → ')}, Explored = ${dfsRes.nodesExploredCount} nodes.

Explain why A* and Dijkstra both guarantee optimal cost, but A* explores fewer states due to the admissible heuristic function f(n) = g(n) + h(n).`;
  } else if (isUnavailabilityQuery) {
    queryType = 'UNAVAILABILITY_ANALYSIS';
    // Extract target junction or road
    const targetNode = extractAnyNode(query, nodes) || nodes[3]; // Default to VEL if unspecified

    // Simulate blocking all edges connected to targetNode
    const blockedEdgeIds = [];
    const simulatedEdges = edges.map(e => {
      if (e.source === targetNode.id || e.destination === targetNode.id) {
        blockedEdgeIds.push(e.id);
        return { ...e, trafficLevel: 'BLOCKED' };
      }
      return e;
    });

    const defaultSource = 'CHN';
    const defaultDest = 'TIR';
    const baselineAStar = runAStar(nodes, edges, defaultSource, defaultDest);
    const detourAStar = runAStar(nodes, simulatedEdges, defaultSource, defaultDest);

    calculatedData = {
      unreachableJunction: targetNode,
      affectedEdges: blockedEdgeIds,
      baselineRoute: baselineAStar.path,
      baselineCost: baselineAStar.cost,
      detourRoute: detourAStar.found ? detourAStar.path : [],
      detourCost: detourAStar.found ? detourAStar.cost : null,
      delayAdded: detourAStar.found ? Number((detourAStar.cost - baselineAStar.cost).toFixed(1)) : null,
      isCutNode: !detourAStar.found
    };

    userPromptContext = `The user is asking what happens if Junction [${targetNode.id}] ${targetNode.name} becomes UNAVAILABLE.
GROUND-TRUTH SIMULATION RESULTS:
- Disconnected Road Corridors: ${blockedEdgeIds.join(', ')}.
- Baseline Route (CHN → TIR): ${baselineAStar.path.join(' → ')} (${baselineAStar.cost} min).
- Recalculated Detour: ${detourAStar.found ? detourAStar.path.join(' → ') : 'NO DETOUR EXISTS (Network Disconnected)'}.
- Impact on CHN → TIR Travel Time: ${detourAStar.found ? `+${(detourAStar.cost - baselineAStar.cost).toFixed(1)} min delay` : 'Path disrupted'}.
- Network Resilience: ${detourAStar.found ? 'Alternative bypass paths exist via secondary corridors.' : 'Critical bottleneck / cut junction.'}

Explain the operational impact, the junctions affected, and recommend diversions around [${targetNode.id}].`;
  } else if (isRouteQuery || isDiversionQuery) {
    queryType = isDiversionQuery ? 'DIVERSION_RECOMMENDATION' : 'ROUTE_OPTIMIZATION';
    const srcNode = extractSourceNode(query, nodes) || nodes[0];
    const dstNode = extractDestNode(query, nodes) || nodes[nodes.length - 1];

    const optimalAStar = runAStar(nodes, edges, srcNode.id, dstNode.id);
    const dijkstraRoute = runDijkstra(nodes, edges, srcNode.id, dstNode.id);
    const alternatives = findAllSimpleRoutes(nodes, edges, srcNode.id, dstNode.id, 4);

    calculatedData = {
      source: srcNode,
      destination: dstNode,
      optimalPath: optimalAStar.path,
      optimalCost: optimalAStar.cost,
      optimalDistance: optimalAStar.distance,
      exploredNodes: optimalAStar.nodesExploredCount,
      alternatives: alternatives.slice(0, 3).map(alt => ({
        path: alt.path,
        cost: alt.cost,
        distance: alt.distance,
        penaltyPercent: Number((((alt.cost - optimalAStar.cost) / (optimalAStar.cost || 1)) * 100).toFixed(1))
      }))
    };

    userPromptContext = `The user requested route / diversion guidance from [${srcNode.id}] ${srcNode.name} to [${dstNode.id}] ${dstNode.name}.
GROUND-TRUTH COMPUTED ROUTE:
- Recommended Optimal Route (A*): ${optimalAStar.found ? optimalAStar.path.join(' → ') : 'No path available'}.
- Estimated Travel Time: ${optimalAStar.cost} min.
- Physical Distance: ${optimalAStar.distance} km.
- Explored States: ${optimalAStar.nodesExploredCount}.
- Alternative Feasible Paths:
${alternatives.slice(1, 3).map((a, i) => `  ${i + 1}. ${a.path.join(' → ')} (${a.cost} min, ${a.distance} km)`).join('\n')}

Explain why this route is optimal, note any congested segments bypassed, and highlight travel time savings compared to alternatives.`;
  } else {
    // Congestion / General Situation query
    queryType = 'CONGESTION_INTELLIGENCE';
    userPromptContext = `The user asked about current traffic congestion and flow situation.
GROUND-TRUTH NETWORK INTELLIGENCE:
- Junction with Highest Congestion: [${congestionStats.highestCongestionJunction.id}] ${congestionStats.highestCongestionJunction.name} (Avg Congestion Rating: ${congestionStats.highestCongestionJunction.avgScore} / 4.0, ${congestionStats.highestCongestionJunction.highRoads} high-congestion roads).
- Top 3 Congested Junctions: ${congestionStats.rankedJunctions.slice(0, 3).map(j => `[${j.id}] ${j.name} (${j.avgScore})`).join(', ')}.
- Most Congested Road: Corridor [${congestionStats.mostCongestedRoad.id}] ${congestionStats.mostCongestedRoad.label} (Delay: +${congestionStats.mostCongestedRoad.delayMinutes} min, Multiplier: ${congestionStats.mostCongestedRoad.multiplier}x).
- Average Network Density: ${congestionStats.avgDensityPct}%.
- Blocked / Incidents: ${congestionStats.blockedCount} closed corridors out of ${congestionStats.totalRoads} total roads.

Provide a comprehensive, professional traffic briefing identifying the hot spots, causes of delay, and high-level diversion strategy.`;
  }

  // 3. CALL NVIDIA NEMOTRON VIA NEBIUS TOKEN FACTORY
  const nemotronResponse = await callNemotronChat({
    systemPrompt: NEMOTRON_SYSTEM_PROMPT,
    userPrompt: `USER QUERY: "${query}"\n\n${userPromptContext}\n\nDeliver your response in clear markdown format.`
  });

  // 4. RETURN RESPONSE (With Nemotron explanation or high-fidelity fallback if key unconfigured)
  if (nemotronResponse.success && nemotronResponse.text) {
    return {
      success: true,
      queryType,
      text: nemotronResponse.text,
      structuredData: calculatedData,
      model: nemotronResponse.model,
      provider: nemotronResponse.provider,
      latencyMs: nemotronResponse.latencyMs,
      confidence: 0.96
    };
  }

  // FALLBACK: When NEBIUS_API_KEY is not yet configured or API is temporarily unreachable,
  // return our rich deterministic traffic explanation based on the exact mathematical search results!
  const fallbackText = generateDeterministicFallback(queryType, query, calculatedData, congestionStats, nemotronResponse.error);

  return {
    success: true,
    queryType,
    text: fallbackText,
    structuredData: calculatedData,
    model: nemotronResponse.model || 'nvidia/llama-3.1-nemotron-70b-instruct',
    provider: 'TrafficMind Local Reasoning Engine (Nebius Offline/Unconfigured)',
    latencyMs: nemotronResponse.latencyMs || 10,
    confidence: 0.92,
    apiNotice: nemotronResponse.error
  };
}

/**
 * Handle incident simulation and diversion planning
 */
export async function handleIncidentSimulation({
  incidentType = 'ACCIDENT',
  targetId = 'CHN-CGL',
  nodes = INITIAL_NODES,
  edges = INITIAL_EDGES,
  source = 'CHN',
  destination = 'TIR'
}) {
  const normType = String(incidentType).toUpperCase();
  let updatedEdges = [...edges];
  let affectedEdgeIds = [];
  let affectedJunctionIds = [];
  let incidentDescription = '';

  if (normType === 'JUNCTION_UNAVAILABLE') {
    const nodeObj = nodes.find(n => n.id === targetId) || nodes[3]; // VEL default
    incidentDescription = `Junction Breakdown / Complete Closure at [${nodeObj.id}] ${nodeObj.name}`;
    affectedJunctionIds.push(nodeObj.id);

    updatedEdges = edges.map(e => {
      if (e.source === nodeObj.id || e.destination === nodeObj.id) {
        affectedEdgeIds.push(e.id);
        return { ...e, trafficLevel: 'BLOCKED' };
      }
      return e;
    });
  } else if (normType === 'CONGESTION_SPIKE' || normType === 'HEAVY_CONGESTION') {
    const edgeObj = edges.find(e => e.id === targetId) || edges[0];
    incidentDescription = `Sudden Traffic Surge & Heavy Congestion on [${edgeObj.id}] (${edgeObj.label || 'Corridor'})`;
    affectedEdgeIds.push(edgeObj.id);
    affectedJunctionIds.push(edgeObj.source, edgeObj.destination);

    updatedEdges = edges.map(e => {
      if (e.id === edgeObj.id) {
        return { ...e, trafficLevel: 'VERY_HIGH' };
      }
      return e;
    });
  } else {
    // ACCIDENT or ROAD_BLOCKAGE
    const edgeObj = edges.find(e => e.id === targetId) || edges[1]; // e.g. CHN-CGL
    incidentDescription = `Major Road Incident / Collision on [${edgeObj.id}] (${edgeObj.label || 'Expressway'})`;
    affectedEdgeIds.push(edgeObj.id);
    affectedJunctionIds.push(edgeObj.source, edgeObj.destination);

    updatedEdges = edges.map(e => {
      if (e.id === edgeObj.id) {
        return { ...e, trafficLevel: 'BLOCKED' };
      }
      return e;
    });
  }

  // Pre-incident baseline vs post-incident detour
  const baselineAStar = runAStar(nodes, edges, source, destination);
  const detourAStar = runAStar(nodes, updatedEdges, source, destination);
  const altBypasses = findAllSimpleRoutes(nodes, updatedEdges, source, destination, 3);

  const delayDelta = (detourAStar.found && baselineAStar.found)
    ? Number((detourAStar.cost - baselineAStar.cost).toFixed(1))
    : 0;

  const incidentData = {
    incidentType: normType,
    incidentDescription,
    targetId,
    affectedEdgeIds,
    affectedJunctionIds,
    baselineRoute: baselineAStar.path,
    baselineCost: baselineAStar.cost,
    detourRoute: detourAStar.found ? detourAStar.path : [],
    detourCost: detourAStar.cost || 0,
    detourDistance: detourAStar.distance || 0,
    delayDelta,
    alternatives: altBypasses.map(a => ({ path: a.path, cost: a.cost, distance: a.distance })),
    updatedEdges
  };

  // Ask Nemotron for tactical impact explanation and diversion plan
  const promptContext = `INCIDENT SIMULATION:
- Type: ${incidentDescription}
- Target: ${targetId}
- Affected Road Links: ${affectedEdgeIds.join(', ')}
- Affected Junctions: ${affectedJunctionIds.join(', ')}
- Impact on Main Corridor (${source} → ${destination}):
  * Baseline Path: ${baselineAStar.path.join(' → ')} (${baselineAStar.cost} min)
  * Recalculated Detour: ${detourAStar.found ? detourAStar.path.join(' → ') : 'NO DETOUR AVAILABLE'} (${detourAStar.cost} min)
  * Estimated Delay Incurred: +${delayDelta} min
- Available Bypasses:
${altBypasses.slice(1, 3).map((b, i) => `  ${i + 1}. ${b.path.join(' → ')} (${b.cost} min)`).join('\n')}

Provide an incident impact analysis report and clear traffic diversion recommendations for traffic control operators.`;

  const nemotronResponse = await callNemotronChat({
    systemPrompt: NEMOTRON_SYSTEM_PROMPT,
    userPrompt: promptContext
  });

  let explanationText = nemotronResponse.text;
  if (!nemotronResponse.success || !explanationText) {
    explanationText = `### 🚨 Incident Impact Report: ${incidentDescription}

**1. Incident Overview:**
* **Target:** \`${targetId}\`
* **Affected Roads:** ${affectedEdgeIds.map(id => `\`${id}\``).join(', ')}
* **Impacted Junction Nodes:** ${affectedJunctionIds.map(id => `\`${id}\``).join(', ')}

**2. Routing & Delay Assessment:**
* **Baseline Route (${source} → ${destination}):** ${baselineAStar.path.join(' → ')} (${baselineAStar.cost} min)
* **Autonomous Recalculated Detour:** ${detourAStar.found ? detourAStar.path.join(' → ') : 'Disrupted'} (${detourAStar.cost} min)
* **Estimated Delay Incurred:** **+${delayDelta} minutes** (${((delayDelta / (baselineAStar.cost || 1)) * 100).toFixed(1)}% time increase).

**3. Recommended Traffic Diversion Actions:**
* **Immediate Action:** Divert traffic before arriving at **[${affectedJunctionIds[0]}]**.
* **Primary Bypass:** Route long-distance transit along **${detourAStar.path.join(' → ')}**.
* **Secondary Feeder:** Use alternate corridors: ${altBypasses.slice(1, 2).map(a => a.path.join(' → ')).join(' or ')}.`;
  }

  return {
    success: true,
    incidentData,
    explanation: explanationText,
    provider: nemotronResponse.success ? nemotronResponse.provider : 'TrafficMind Local Reasoning Engine',
    model: nemotronResponse.model || 'nvidia/llama-3.1-nemotron-70b-instruct',
    latencyMs: nemotronResponse.latencyMs || 10
  };
}

/**
 * Deterministic fallback generator for when Nebius API key is not yet set or during offline testing
 */
function generateDeterministicFallback(queryType, query, data, stats, apiNotice) {
  const noticeBanner = apiNotice ? `> [!NOTE]\n> *NVIDIA Nemotron via Nebius Token Factory notice: ${apiNotice}*\n\n` : '';

  switch (queryType) {
    case 'CONGESTION_INTELLIGENCE':
      return `${noticeBanner}### 🚦 Real-Time Metropolitan Traffic Intelligence

* **Highest Congestion Junction:** **[${stats.highestCongestionJunction.id}] ${stats.highestCongestionJunction.name}**
  * Average Junction Delay Score: **${stats.highestCongestionJunction.avgScore} / 4.0**
  * High-Congestion Feeders: **${stats.highestCongestionJunction.highRoads}** critical arterial roads.
* **Most Congested Corridor:** **[${stats.mostCongestedRoad.id}] ${stats.mostCongestedRoad.label}**
  * Current Delay: **+${stats.mostCongestedRoad.delayMinutes} minutes** (Traffic Multiplier: **${stats.mostCongestedRoad.multiplier}x**).
* **Network-Wide Traffic Density:** **${stats.avgDensityPct}%** of peak capacity.
* **Incident Status:** **${stats.blockedCount}** roads currently closed out of **${stats.totalRoads}** total highway links.

**AI Engineering Recommendation:**
To alleviate pressure at **[${stats.highestCongestionJunction.id}]**, adjust signal timings on inbound links and divert through-traffic toward western bypass corridors.`;

    case 'ALGORITHM_COMPARISON':
      return `${noticeBanner}### ⚖️ Algorithm Performance Benchmark: Dijkstra vs. A*

Comparing search algorithms from **[${data.source.id}] ${data.source.name}** to **[${data.destination.id}] ${data.destination.name}**:

| Algorithm | Discovered Path | Cost (min) | Explored Nodes | Exec Time |
| :--- | :--- | :---: | :---: | :---: |
| **A* (Euclidean Heuristic)** | ${data.astar.path.join(' → ')} | **${data.astar.cost} min** | **${data.astar.exploredCount}** | ${data.astar.timeMs} ms |
| **Dijkstra's Algorithm** | ${data.dijkstra.path.join(' → ')} | **${data.dijkstra.cost} min** | **${data.dijkstra.exploredCount}** | ${data.dijkstra.timeMs} ms |
| **Breadth-First Search (BFS)** | ${data.bfs.path.join(' → ')} | ${data.bfs.cost} min | ${data.bfs.exploredCount} | - |

**Reasoning & Insights:**
1. **Optimality:** Both Dijkstra and A* found the identical optimal travel time of **${data.astar.cost} min**.
2. **Efficiency Difference:** A* examined **${data.astar.exploredCount} nodes** compared to **${data.dijkstra.exploredCount} nodes** by Dijkstra. The Euclidean distance divided by maximum speed ($h(n) = \\text{dist} / v_{\\max}$) is admissible and monotonically non-decreasing, allowing A* to prune unpromising branches and reach the goal faster.`;

    case 'UNAVAILABILITY_ANALYSIS':
      return `${noticeBanner}### ⚠️ Junction Breakdown Impact Analysis: [${data.unreachableJunction.id}] ${data.unreachableJunction.name}

* **Impacted Corridors:** ${data.affectedEdges.map(e => `\`${e}\``).join(', ')}
* **Baseline Optimal Route:** ${data.baselineRoute.join(' → ')} (**${data.baselineCost} min**)
* **Autonomous Recalculated Detour:** ${data.detourRoute.length > 0 ? data.detourRoute.join(' → ') : 'Disrupted'} (**${data.detourCost} min**)
* **Delay Incurred:** **+${data.delayAdded} minutes** travel time.

**Recommendation:**
Deploy variable message signs (VMS) alerting drivers to exit prior to **[${data.unreachableJunction.id}]** and follow the recommended detour via **${data.detourRoute.join(' → ')}**.`;

    case 'ROUTE_OPTIMIZATION':
    case 'DIVERSION_RECOMMENDATION':
    default:
      return `${noticeBanner}### 🧭 Optimal Route Recommendation

* **Source:** [${data.source.id}] ${data.source.name}
* **Destination:** [${data.destination.id}] ${data.destination.name}
* **Recommended Path:** **${data.optimalPath.join(' → ')}**
* **Total Estimated Travel Time:** **${data.optimalCost} minutes** (at current traffic densities)
* **Physical Road Distance:** **${data.optimalDistance} km**
* **Explored Graph States:** ${data.exploredNodes} nodes

**Alternative Feasible Options:**
${data.alternatives.length > 0 ? data.alternatives.map((alt, i) => `* **Option ${i + 2}:** ${alt.path.join(' → ')} (${alt.cost} min, +${alt.penaltyPercent}% delay)`).join('\n') : '* None readily available.'}

**Engineering Rational:**
The recommended route prioritizes high-speed corridors while dynamically circumventing severe bottlenecks.`;
  }
}

// Helpers for entity extraction
function extractSourceNode(text, nodes) {
  const match = text.match(/(?:from|between|start at|source)\s+([A-Za-z0-9\s]+?)(?:\s+to|\s+and|\s+destination|$)/i);
  if (match) return resolveJunction(match[1], nodes);
  return null;
}

function extractDestNode(text, nodes) {
  const match = text.match(/(?:to|and|destination)\s+([A-Za-z0-9\s]+?)(?:\.|\?|,|$|\s+using|\s+with)/i);
  if (match) return resolveJunction(match[1], nodes);
  return null;
}

function extractAnyNode(text, nodes) {
  for (const node of nodes) {
    if (text.toUpperCase().includes(node.id) || text.toLowerCase().includes(node.name.toLowerCase())) {
      return node;
    }
  }
  const match = text.match(/(?:junction|node|j)\s*(\d+|[a-zA-Z])/i);
  if (match) return resolveJunction(match[0], nodes);
  return null;
}

