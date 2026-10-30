/**
 * Comprehensive Combinatorial Route Analysis & Decision Reasoning Engine (CO1 Focus)
 * 
 * 1. Discovers all feasible simple paths between Source and Destination.
 * 2. Breaks down every road segment in each path (distance, speed, congestion, delay).
 * 3. Identifies the globally optimal best path.
 * 4. Generates precise, granular reasons explaining why every other alternative path was REJECTED.
 */
import { calculateEdgeCost, normalizeTrafficLevel, formatMinutes, formatDistance } from '../utils/trafficCostModel.js';

export function findAllSimpleRoutes(nodes, edges, sourceId, destinationId, maxPaths = 15) {
  if (sourceId === destinationId) {
    return [{
      id: 'route-1',
      path: [sourceId],
      pathString: sourceId,
      pathEdges: [],
      segments: [],
      distance: 0,
      travelTime: 0,
      cost: 0,
      edgeCount: 0,
      isOptimal: true,
      hasBlockedEdge: false,
      selectionStatus: 'SELECTED_OPTIMAL',
      selectionReason: 'Source is Destination. Immediate 0-cost arrival.',
      rejectionReason: null,
      bottlenecks: []
    }];
  }

  // Build full adjacency list (including edges even if high traffic, but noting blocked status)
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });

  edges.forEach(edge => {
    const costInfo = calculateEdgeCost(edge);
    if (!adj[edge.source]) adj[edge.source] = [];
    if (!adj[edge.destination]) adj[edge.destination] = [];

    adj[edge.source].push({
      node: edge.destination,
      edgeId: edge.id,
      distance: edge.distance,
      speed: edge.speed,
      trafficLevel: edge.trafficLevel,
      costInfo,
      rawEdge: edge
    });

    adj[edge.destination].push({
      node: edge.source,
      edgeId: edge.id,
      distance: edge.distance,
      speed: edge.speed,
      trafficLevel: edge.trafficLevel,
      costInfo,
      rawEdge: edge
    });
  });

  const allPaths = [];
  const visited = new Set();

  function dfsFindPaths(current, path) {
    if (allPaths.length >= maxPaths * 2) return;

    visited.add(current);
    path.push(current);

    if (current === destinationId) {
      allPaths.push([...path]);
    } else {
      const neighbors = adj[current] || [];
      for (const neighborObj of neighbors) {
        if (!visited.has(neighborObj.node)) {
          dfsFindPaths(neighborObj.node, path);
        }
      }
    }

    path.pop();
    visited.delete(current);
  }

  dfsFindPaths(sourceId, []);

  // Evaluate every discovered path
  const evaluatedRoutes = allPaths.map((p, idx) => {
    let totalDistance = 0;
    let totalTravelTime = 0;
    let hasBlockedEdge = false;
    const segments = [];
    const pathEdges = [];
    const bottlenecks = [];

    for (let i = 0; i < p.length - 1; i++) {
      const u = p[i];
      const v = p[i + 1];
      const edge = edges.find(
        e => (e.source === u && e.destination === v) || (e.source === v && e.destination === u)
      );

      if (edge) {
        const costInfo = calculateEdgeCost(edge);
        pathEdges.push(edge.id);

        const segmentDelay = costInfo.isBlocked ? Infinity : Math.max(0, costInfo.totalCost - costInfo.baseTime);
        const normLvl = normalizeTrafficLevel(edge.trafficLevel);

        if (costInfo.isBlocked) {
          hasBlockedEdge = true;
        }

        if (normLvl === 'HIGH' || normLvl === 'VERY_HIGH') {
          bottlenecks.push({
            edgeId: edge.id,
            roadName: edge.label || `${u}-${v}`,
            level: normLvl,
            delay: Number(segmentDelay.toFixed(1)),
            multiplier: costInfo.multiplier
          });
        }

        totalDistance += edge.distance;
        totalTravelTime += costInfo.isBlocked ? Infinity : costInfo.totalCost;

        segments.push({
          from: u,
          to: v,
          edgeId: edge.id,
          roadName: edge.label || `${u} ↔ ${v}`,
          distance: edge.distance,
          speed: edge.speed,
          trafficLevel: normLvl,
          multiplier: costInfo.multiplier,
          baseTime: costInfo.baseTime,
          travelTime: costInfo.isBlocked ? Infinity : costInfo.totalCost,
          delayAdded: Number(segmentDelay.toFixed(1)),
          isBlocked: costInfo.isBlocked
        });
      }
    }

    return {
      id: `route-${idx + 1}`,
      path: p,
      pathString: p.join(' → '),
      pathEdges,
      segments,
      distance: Number(totalDistance.toFixed(1)),
      travelTime: hasBlockedEdge ? Infinity : Number(totalTravelTime.toFixed(1)),
      cost: hasBlockedEdge ? Infinity : Number(totalTravelTime.toFixed(1)),
      edgeCount: p.length - 1,
      hasBlockedEdge,
      bottlenecks
    };
  });

  // Sort candidate paths: non-blocked lowest travel time first, then distance
  evaluatedRoutes.sort((a, b) => {
    if (a.hasBlockedEdge && !b.hasBlockedEdge) return 1;
    if (!a.hasBlockedEdge && b.hasBlockedEdge) return -1;
    if (a.travelTime !== b.travelTime) return a.travelTime - b.travelTime;
    return a.distance - b.distance;
  });

  // Limit to maxPaths
  const finalRoutes = evaluatedRoutes.slice(0, maxPaths);

  if (finalRoutes.length === 0) return [];

  const bestRoute = finalRoutes[0];
  const bestIsFeasible = !bestRoute.hasBlockedEdge && bestRoute.travelTime !== Infinity;

  // Annotate Selection and Rejection Reasons for every path
  return finalRoutes.map((route, rankIdx) => {
    const rank = rankIdx + 1;
    const isOptimal = rank === 1 && bestIsFeasible;

    if (isOptimal) {
      const avoidsBottlenecks = route.bottlenecks.length === 0;
      return {
        ...route,
        rank,
        isOptimal: true,
        selectionStatus: 'SELECTED_OPTIMAL',
        selectionReason: `Selected as the Best Route because it achieves the lowest total travel time (${formatMinutes(route.travelTime)}) across ${route.distance} km with ${route.edgeCount} road segments. ${avoidsBottlenecks ? 'Completely bypasses high-congestion bottlenecks.' : 'Minimal congestion penalties compared to alternatives.'}`,
        rejectionReason: null
      };
    }

    // Generate specific Rejection Reason for this non-optimal candidate
    let rejectionReason = '';

    if (route.hasBlockedEdge) {
      const blockedSegs = route.segments.filter(s => s.isBlocked).map(s => `[${s.from}-${s.to}]`).join(', ');
      rejectionReason = `REJECTED (Road Closure): Route cannot be traversed because segment(s) ${blockedSegs} are BLOCKED due to incidents or maintenance.`;
    } else if (!bestIsFeasible) {
      rejectionReason = `REJECTED: No feasible alternative route exists without road blockages.`;
    } else {
      const timeDiff = Number((route.travelTime - bestRoute.travelTime).toFixed(1));
      const timePercent = Math.round(((route.travelTime - bestRoute.travelTime) / bestRoute.travelTime) * 100);
      const distDiff = Number((route.distance - bestRoute.distance).toFixed(1));

      const reasons = [];

      reasons.push(`Adds +${timeDiff} min delay (${timePercent}% slower than optimal ${bestRoute.travelTime} min)`);

      if (route.bottlenecks.length > 0) {
        const bNames = route.bottlenecks.map(b => `[${b.roadName}: ${b.level} traffic (×${b.multiplier})]`).join(', ');
        reasons.push(`Incurs heavy bottlenecks on ${bNames}`);
      }

      if (distDiff > 0) {
        reasons.push(`Physically ${distDiff} km longer (${route.distance} km vs ${bestRoute.distance} km)`);
      } else if (distDiff < 0) {
        reasons.push(`Despite being physically ${Math.abs(distDiff)} km shorter, high traffic congestion causes slower overall travel time`);
      }

      if (route.edgeCount > bestRoute.edgeCount) {
        reasons.push(`Requires ${route.edgeCount - bestRoute.edgeCount} extra junction transitions (${route.edgeCount} vs ${bestRoute.edgeCount} hops)`);
      }

      rejectionReason = `REJECTED (${timePercent}% Slower): ${reasons.join('. ')}.`;
    }

    return {
      ...route,
      rank,
      isOptimal: false,
      selectionStatus: 'REJECTED',
      selectionReason: null,
      rejectionReason
    };
  });
}
