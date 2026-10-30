/**
 * Standard Search Result Factory
 * Ensures consistent output format across BFS, DFS, Dijkstra, and A*.
 */
import { computePathMetrics, getPathEdges } from '../utils/networkValidator.js';

export function createSearchResult({
  algorithm,
  source,
  destination,
  path = [],
  nodesExplored = [],
  executionTime = 0,
  found = false,
  steps = [],
  edges = [],
  errorMessage = null,
  metadata = {}
}) {
  const metrics = computePathMetrics(path, edges);
  const pathEdges = getPathEdges(path, edges);

  return {
    algorithm,
    source,
    destination,
    found,
    path,
    pathEdges,
    cost: metrics.totalCost,
    distance: metrics.totalDistance,
    estimatedTime: metrics.totalTime,
    nodesExplored: nodesExplored,
    nodesExploredCount: nodesExplored.length,
    executionTime: Number(executionTime.toFixed(3)),
    steps,
    errorMessage,
    metadata
  };
}
