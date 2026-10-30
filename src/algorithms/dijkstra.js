/**
 * Dijkstra's Algorithm Implementation
 * Cost-based search algorithm that finds the globally minimum-cost route
 * in a non-negatively weighted traffic network.
 * 
 * Road Cost = Base Travel Time * Traffic Congestion Multiplier
 */
import { buildAdjacencyList } from '../utils/networkValidator.js';
import { createSearchResult } from './searchResult.js';

export function runDijkstra(nodes, edges, sourceId, destinationId) {
  const startTime = performance.now();

  // Edge Case: Source equals Destination
  if (sourceId === destinationId) {
    const execTime = performance.now() - startTime;
    return createSearchResult({
      algorithm: "Dijkstra's Algorithm",
      source: sourceId,
      destination: destinationId,
      path: [sourceId],
      nodesExplored: [sourceId],
      executionTime: execTime,
      found: true,
      edges,
      steps: [{
        step: 1,
        currentNode: sourceId,
        distances: { [sourceId]: 0 },
        visited: [sourceId],
        action: `Source is Destination (${sourceId}). Cost is 0.0 min.`
      }]
    });
  }

  const adj = buildAdjacencyList(nodes, edges);
  const distances = {};
  const previous = {};
  const visited = new Set();
  const nodesExplored = [];
  const steps = [];

  // Priority Queue representation: array of { node, cost }
  let pq = [];

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });

  distances[sourceId] = 0;
  pq.push({ node: sourceId, cost: 0 });

  let stepCounter = 1;
  let found = false;

  steps.push({
    step: stepCounter++,
    currentNode: sourceId,
    pq: [...pq],
    distances: { ...distances },
    visited: [],
    action: `Initialize Dijkstra: Set dist[${sourceId}] = 0.0 min, all other nodes = Infinity.`
  });

  while (pq.length > 0) {
    // Extract node with minimum distance (Priority Queue pop)
    pq.sort((a, b) => a.cost - b.cost);
    const { node: current, cost: currentCost } = pq.shift();

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    nodesExplored.push(current);

    steps.push({
      step: stepCounter++,
      currentNode: current,
      currentCost: Number(currentCost.toFixed(2)),
      pq: [...pq],
      distances: { ...distances },
      visited: Array.from(visited),
      action: `Expanded node [${current}] with minimum cumulative cost g = ${currentCost.toFixed(2)} min.`
    });

    if (current === destinationId) {
      found = true;
      steps.push({
        step: stepCounter++,
        currentNode: current,
        distances: { ...distances },
        visited: Array.from(visited),
        action: `Goal [${destinationId}] REACHED with minimum cost ${distances[destinationId].toFixed(2)} min!`
      });
      break;
    }

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      const neighbor = edge.node;
      if (visited.has(neighbor)) continue;

      const edgeCost = edge.cost; // Base time * traffic multiplier
      const newDist = distances[current] + edgeCost;

      if (newDist < distances[neighbor]) {
        const oldDist = distances[neighbor];
        distances[neighbor] = Number(newDist.toFixed(3));
        previous[neighbor] = current;
        pq.push({ node: neighbor, cost: newDist });

        steps.push({
          step: stepCounter++,
          currentNode: current,
          targetNode: neighbor,
          edgeCost: Number(edgeCost.toFixed(2)),
          oldDist: oldDist === Infinity ? 'Infinity' : oldDist.toFixed(2),
          newDist: newDist.toFixed(2),
          distances: { ...distances },
          visited: Array.from(visited),
          action: `Relaxed edge [${current} -> ${neighbor}]: updated dist[${neighbor}] from ${oldDist === Infinity ? '∞' : oldDist.toFixed(2)} to ${newDist.toFixed(2)} min.`
        });
      }
    }
  }

  // Reconstruct path
  let path = [];
  if (found) {
    let curr = destinationId;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  const executionTime = performance.now() - startTime;

  return createSearchResult({
    algorithm: "Dijkstra's Algorithm",
    source: sourceId,
    destination: destinationId,
    path,
    nodesExplored,
    executionTime,
    found,
    steps,
    edges,
    errorMessage: found ? null : `No path exists to reach ${destinationId} from ${sourceId} under current road conditions.`,
    metadata: {
      type: 'Cost-Based Uniform Cost Search',
      dataStructure: 'Min-Priority Queue / Binary Heap',
      optimality: 'Guaranteed Optimal for non-negative road weights',
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)'
    }
  });
}
