/**
 * Single-Source All-Destinations Path Solver
 * Computes optimal routes, travel times, distances, and bottlenecks from a single Source junction
 * to ALL other cities across the network simultaneously.
 */
import { runAStar } from './astar.js';
import { runDijkstra } from './dijkstra.js';
import { runBFS } from './bfs.js';
import { runDFS } from './dfs.js';
import { calculateEdgeCost } from '../utils/trafficCostModel.js';

export function computeAllCitiesFromSource(nodes, edges, sourceId, algorithm = 'A*', weather = 'CLEAR') {
  const startTime = performance.now();
  const sourceNode = nodes.find(n => n.id === sourceId) || nodes[0];
  if (!sourceNode) return null;

  const results = [];
  const destinationNodes = nodes.filter(n => n.id !== sourceId);

  for (const dest of destinationNodes) {
    let searchRes;
    const algoUpper = (algorithm || 'A*').toUpperCase();

    if (algoUpper.includes('BFS')) {
      searchRes = runBFS(nodes, edges, sourceId, dest.id);
    } else if (algoUpper.includes('DFS')) {
      searchRes = runDFS(nodes, edges, sourceId, dest.id);
    } else if (algoUpper.includes('DIJKSTRA')) {
      searchRes = runDijkstra(nodes, edges, sourceId, dest.id);
    } else {
      searchRes = runAStar(nodes, edges, sourceId, dest.id);
    }

    // Identify any congested or blocked road segments along the path
    const bottlenecks = [];
    if (searchRes.found && searchRes.pathEdges) {
      searchRes.pathEdges.forEach(edgeId => {
        const edge = edges.find(e => e.id === edgeId);
        if (edge) {
          const cost = calculateEdgeCost(edge, weather);
          if (cost.isBlocked) {
            bottlenecks.push({ edgeId, type: 'BLOCKED', label: edge.label });
          } else if (cost.levelKey === 'HIGH' || cost.levelKey === 'VERY_HIGH') {
            bottlenecks.push({ edgeId, type: cost.levelKey, label: edge.label });
          }
        }
      });
    }

    results.push({
      destId: dest.id,
      destName: dest.name,
      destDesc: dest.desc,
      destType: dest.type,
      lat: dest.lat,
      lng: dest.lng,
      path: searchRes.path || [],
      pathString: searchRes.found ? searchRes.path.join(' → ') : 'Unreachable',
      cost: searchRes.cost || Infinity,
      distance: searchRes.distance || 0,
      hops: searchRes.path && searchRes.path.length > 1 ? searchRes.path.length - 1 : 0,
      found: searchRes.found,
      executionTime: searchRes.executionTime,
      bottlenecks,
      pathEdges: searchRes.pathEdges || []
    });
  }

  // Sort by travel time (feasible paths first, then lowest time)
  results.sort((a, b) => {
    if (!a.found && b.found) return 1;
    if (a.found && !b.found) return -1;
    return a.cost - b.cost;
  });

  const totalTime = Number((performance.now() - startTime).toFixed(2));

  return {
    sourceId: sourceNode.id,
    sourceName: sourceNode.name,
    sourceDesc: sourceNode.desc,
    algorithm: algorithm || 'A*',
    totalDestinations: destinationNodes.length,
    reachableCount: results.filter(r => r.found).length,
    totalExecutionTime: totalTime,
    destinations: results
  };
}
