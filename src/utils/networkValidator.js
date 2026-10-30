/**
 * Graph Adjacency & Network Helpers
 */
import { calculateEdgeCost } from './trafficCostModel.js';

export function buildAdjacencyList(nodes, edges) {
  const adj = {};
  nodes.forEach(n => {
    adj[n.id] = [];
  });

  edges.forEach(edge => {
    const costInfo = calculateEdgeCost(edge);
    // If road is blocked, search algorithm must ignore this edge
    if (!costInfo.isBlocked) {
      if (!adj[edge.source]) adj[edge.source] = [];
      if (!adj[edge.destination]) adj[edge.destination] = [];

      adj[edge.source].push({
        node: edge.destination,
        edgeId: edge.id,
        distance: edge.distance,
        speed: edge.speed,
        trafficLevel: edge.trafficLevel,
        cost: costInfo.totalCost,
        baseTime: costInfo.baseTime,
        multiplier: costInfo.multiplier
      });

      // Bidirectional
      adj[edge.destination].push({
        node: edge.source,
        edgeId: edge.id,
        distance: edge.distance,
        speed: edge.speed,
        trafficLevel: edge.trafficLevel,
        cost: costInfo.totalCost,
        baseTime: costInfo.baseTime,
        multiplier: costInfo.multiplier
      });
    }
  });

  return adj;
}

export function getNodeById(nodes, id) {
  return nodes.find(n => n.id === id);
}

export function getEdgeBetween(edges, u, v) {
  return edges.find(
    e => (e.source === u && e.destination === v) || (e.source === v && e.destination === u)
  );
}

/**
 * Reconstructs edges list from an array of node IDs in a path
 */
export function getPathEdges(path, edges) {
  if (!path || path.length < 2) return [];
  const pathEdges = [];
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const edge = getEdgeBetween(edges, u, v);
    if (edge) {
      pathEdges.push(edge.id);
    }
  }
  return pathEdges;
}

/**
 * Compute total metrics for a given path
 */
export function computePathMetrics(path, edges) {
  if (!path || path.length < 2) {
    return { totalDistance: 0, totalTime: 0, totalCost: 0, edgeCount: 0 };
  }

  let totalDistance = 0;
  let totalTime = 0;
  let totalCost = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const edge = getEdgeBetween(edges, path[i], path[i + 1]);
    if (edge) {
      const costInfo = calculateEdgeCost(edge);
      totalDistance += edge.distance;
      totalTime += costInfo.totalCost;
      totalCost += costInfo.totalCost;
    }
  }

  return {
    totalDistance: Number(totalDistance.toFixed(2)),
    totalTime: Number(totalTime.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    edgeCount: path.length - 1
  };
}
