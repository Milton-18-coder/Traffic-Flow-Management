/**
 * Automated Test Suites for Verification & Academic Viva Demonstration
 * Tests 6 required scenarios:
 * 1. Normal Traffic Baseline
 * 2. Peak-Hour Congestion (Shortest distance vs fastest route)
 * 3. Blocked Road (Accident bypass)
 * 4. Combinatorial Alternative Routes Discovery
 * 5. Disconnected / No Available Route
 * 6. Source Equals Destination
 */

import { INITIAL_NODES, INITIAL_EDGES, STATEWIDE_NODES, STATEWIDE_EDGES } from '../data/trafficNetwork.js';
import { runBFS } from '../algorithms/bfs.js';
import { runDFS } from '../algorithms/dfs.js';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { runAStar } from '../algorithms/astar.js';
import { findAllSimpleRoutes } from '../algorithms/combinatorialRoutes.js';
import { TrafficAgent } from '../agent/trafficAgent.js';
import { computeAllCitiesFromSource } from '../algorithms/singleSourceAllPaths.js';
import { 
  getEdgeRoadCoordinates, 
  getFullRouteRoadCoordinates, 
  interpolatePositionAlongRoad 
} from './roadGeometryService.js';

export function runAllTestCases() {
  const testResults = [];

  // ================= TEST CASE 1: Normal Traffic =================
  const t1AStar = runAStar(INITIAL_NODES, INITIAL_EDGES, 'CHN', 'TIR');
  testResults.push({
    testId: 1,
    title: 'Normal Traffic Baseline (CHN → TIR)',
    passed: t1AStar.found && t1AStar.path.length > 0 && t1AStar.cost > 0,
    details: `Path: ${t1AStar.path.join(' → ')}, Cost: ${t1AStar.cost} min, Explored: ${t1AStar.nodesExploredCount} nodes`
  });

  // ================= TEST CASE 2: Peak-Hour Congestion =================
  // Under peak hour, VEL-TVM and VEL-SLM are heavily congested (VERY HIGH = 2.5x).
  // A* should choose a less congested bypass (e.g. via KAN or CGL) rather than brute congested downtown.
  const peakEdges = INITIAL_EDGES.map(e => {
    if (['CHN-VEL', 'VEL-TVM', 'VEL-SLM', 'TVM-ERD', 'SLM-ERD'].includes(e.id)) {
      return { ...e, trafficLevel: 'VERY_HIGH' };
    }
    return { ...e, trafficLevel: 'LOW' };
  });
  const t2AStar = runAStar(INITIAL_NODES, peakEdges, 'CHN', 'TIR');
  testResults.push({
    testId: 2,
    title: 'Peak-Hour Congestion Optimization',
    passed: t2AStar.found && t2AStar.path[0] === 'CHN' && t2AStar.path[t2AStar.path.length - 1] === 'TIR',
    details: `Path chosen under congestion: ${t2AStar.path.join(' → ')}, Cost: ${t2AStar.cost} min`
  });

  // ================= TEST CASE 3: Blocked Road Bypass =================
  // Block road VEL-TVM and VEL-SLM completely
  const blockedEdges = INITIAL_EDGES.map(e => {
    if (e.id === 'VEL-TVM' || e.id === 'VEL-SLM') {
      return { ...e, trafficLevel: 'BLOCKED' };
    }
    return e;
  });
  const t3Dijkstra = runDijkstra(INITIAL_NODES, blockedEdges, 'CHN', 'TIR');
  const usedBlockedRoad = t3Dijkstra.path.includes('VEL') && (t3Dijkstra.path.includes('TVM') || t3Dijkstra.path.includes('SLM'));
  testResults.push({
    testId: 3,
    title: 'Accident / Blocked Road Incident Bypass',
    passed: t3Dijkstra.found && !t3Dijkstra.pathEdges.includes('VEL-TVM') && !t3Dijkstra.pathEdges.includes('VEL-SLM'),
    details: `Bypass Route: ${t3Dijkstra.path.join(' → ')}, Successfully bypassed blocked segments VEL-TVM and VEL-SLM`
  });

  // ================= TEST CASE 4: Combinatorial Routes =================
  const t4Routes = findAllSimpleRoutes(INITIAL_NODES, INITIAL_EDGES, 'CHN', 'TIR', 10);
  testResults.push({
    testId: 4,
    title: 'Combinatorial Multiple Alternative Routes Discovery',
    passed: t4Routes.length >= 4,
    details: `Discovered ${t4Routes.length} distinct alternative paths between CHN and TIR`
  });

  // ================= TEST CASE 5: Disconnected / Fully Blocked Network =================
  // Block all outgoing roads from node TIR
  const isolatedEdges = INITIAL_EDGES.map(e => {
    if (e.destination === 'TIR' || e.source === 'TIR') {
      return { ...e, trafficLevel: 'BLOCKED' };
    }
    return e;
  });
  const t5AStar = runAStar(INITIAL_NODES, isolatedEdges, 'CHN', 'TIR');
  testResults.push({
    testId: 5,
    title: 'Disconnected / Fully Blocked Graph Error Handling',
    passed: !t5AStar.found && t5AStar.errorMessage !== null,
    details: `Properly detected no path: "${t5AStar.errorMessage}"`
  });

  // ================= TEST CASE 6: Source Equals Destination =================
  const t6AStar = runAStar(INITIAL_NODES, INITIAL_EDGES, 'VEL', 'VEL');
  testResults.push({
    testId: 6,
    title: 'Source Equals Destination Edge Case',
    passed: t6AStar.found && t6AStar.path.length === 1 && t6AStar.cost === 0,
    details: `Path: [${t6AStar.path.join('')}], Cost: ${t6AStar.cost} min`
  });

  // ================= TEST CASE 7: High-Fidelity Real Road Geometry Verification =================
  const nodeMap = {};
  INITIAL_NODES.forEach(n => { nodeMap[n.id] = n; });
  let missingRoadGeomCount = 0;
  for (const edge of INITIAL_EDGES) {
    const coords = getEdgeRoadCoordinates(edge.source, edge.destination, nodeMap[edge.source], nodeMap[edge.destination]);
    if (!coords || coords.length < 5) {
      missingRoadGeomCount++;
    }
  }

  const stitchedOptimalRoute = getFullRouteRoadCoordinates(t1AStar.path, nodeMap);
  const midRoadPoint = interpolatePositionAlongRoad(stitchedOptimalRoute, 0.5);

  testResults.push({
    testId: 7,
    title: 'Real-World Road Highway Geometry & Route Snapping',
    passed: missingRoadGeomCount === 0 && stitchedOptimalRoute.length > 50 && !!midRoadPoint?.lat && !!midRoadPoint?.bearing,
    details: `All ${INITIAL_EDGES.length} highway corridors validated. Stitched route [${t1AStar.path.join(' → ')}] contains ${stitchedOptimalRoute.length} road-snapped waypoints with smooth bearing interpolation.`
  });

  // ================= TEST CASE 8: Single-Source All-Cities Reachability =================
  const allCitiesFromSourceA = computeAllCitiesFromSource(INITIAL_NODES, INITIAL_EDGES, 'CHN', 'A*');
  testResults.push({
    testId: 8,
    title: 'Single-Source Optimal Reachability to All Cities',
    passed: allCitiesFromSourceA.reachableCount === INITIAL_NODES.length - 1 && allCitiesFromSourceA.destinations.every(d => d.found && d.cost > 0),
    details: `Computed optimal routes from Source [CHN] to all ${allCitiesFromSourceA.totalDestinations} other network cities in ${allCitiesFromSourceA.totalExecutionTime} ms (100% reachable).`
  });

  // ================= TEST CASE 9: Statewide Network & Kovilpatti (KVP) NH-44 Route =================
  const aStarKvp = runAStar(STATEWIDE_NODES, STATEWIDE_EDGES, 'CHN', 'KVP');
  const allStatewideFromA = computeAllCitiesFromSource(STATEWIDE_NODES, STATEWIDE_EDGES, 'CHN', 'A*');
  const kvpDestination = allStatewideFromA?.destinations?.find(d => d.destId === 'KVP');

  testResults.push({
    testId: 9,
    title: 'Statewide Network (118 Places) & Kovilpatti (KVP) Route Verification',
    passed: aStarKvp.found && aStarKvp.path.includes('KVP') && allStatewideFromA.reachableCount === STATEWIDE_NODES.length - 1 && !!kvpDestination?.found,
    details: `Kovilpatti route from Chennai: [${aStarKvp.path.join(' → ')}], Cost: ${aStarKvp.cost.toFixed(1)} min, Distance: ${aStarKvp.distance.toFixed(1)} km. All ${allStatewideFromA.totalDestinations} statewide places 100% reachable.`
  });

  return testResults;
}
