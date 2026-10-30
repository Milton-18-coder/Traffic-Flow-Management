/**
 * Admissible Straight-Line Distance & Heuristic Functions for A*
 * 
 * An admissible heuristic h(n) NEVER overestimates the true remaining cost to the goal:
 *   h(n) <= h*(n)
 * 
 * Straight-line spatial distance divided by the maximum speed across the entire network (80 km/h)
 * guarantees admissibility (and consistency/monotonicity) for travel time estimation.
 */
import { MAX_NETWORK_SPEED } from '../data/trafficNetwork.js';

export function calculateEuclideanDistance(nodeA, nodeB) {
  if (!nodeA || !nodeB) return 0;
  
  // If real-world GPS coordinates (lat, lng) are present, compute exact Haversine Great-Circle distance in km
  if (typeof nodeA.lat === 'number' && typeof nodeA.lng === 'number' &&
      typeof nodeB.lat === 'number' && typeof nodeB.lng === 'number') {
    const R = 6371; // Earth's mean radius in kilometers
    const dLat = (nodeB.lat - nodeA.lat) * (Math.PI / 180);
    const dLng = (nodeB.lng - nodeA.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(nodeA.lat * (Math.PI / 180)) * Math.cos(nodeB.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  // Fallback spatial Euclidean distance
  const dx = (nodeA.x - nodeB.x) * 0.8;
  const dy = (nodeA.y - nodeB.y) * 0.8;
  return Number(Math.sqrt(dx * dx + dy * dy).toFixed(1));
}

/**
 * Admissible Heuristic for Travel Time (in minutes)
 * h(n) = (Straight-line distance in km / Max Highway Speed in km/h) * 60 min
 */
export function calculateHeuristicTime(currentNode, goalNode, maxSpeed = MAX_NETWORK_SPEED) {
  if (!currentNode || !goalNode) return 0;
  if (currentNode.id === goalNode.id) return 0;

  const straightLineDist = calculateEuclideanDistance(currentNode, goalNode);
  const minPossibleHours = straightLineDist / maxSpeed;
  return Number((minPossibleHours * 60).toFixed(2));
}
