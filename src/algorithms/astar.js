/**
 * A* (A-Star) Search Algorithm Implementation
 * Informed/Heuristic search algorithm that utilizes evaluation function:
 *   f(n) = g(n) + h(n)
 * 
 * g(n) = Actual cost from Source to node n (Base Time * Traffic Multiplier)
 * h(n) = Admissible heuristic estimate from node n to Goal (Straight-line / Max Speed)
 * f(n) = Estimated total cost of path through node n
 */
import { buildAdjacencyList, getNodeById } from '../utils/networkValidator.js';
import { calculateHeuristicTime } from './heuristics.js';
import { createSearchResult } from './searchResult.js';

export function runAStar(nodes, edges, sourceId, destinationId) {
  const startTime = performance.now();

  const sourceNode = getNodeById(nodes, sourceId);
  const goalNode = getNodeById(nodes, destinationId);

  // Edge Case: Source equals Destination
  if (sourceId === destinationId) {
    const execTime = performance.now() - startTime;
    return createSearchResult({
      algorithm: 'A* Search',
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
        gScore: { [sourceId]: 0 },
        fScore: { [sourceId]: 0 },
        hScore: { [sourceId]: 0 },
        visited: [sourceId],
        action: `Source is Goal (${sourceId}). f(n) = 0.0 min. Search completed immediately.`
      }]
    });
  }

  const adj = buildAdjacencyList(nodes, edges);
  const openSet = new Set([sourceId]);
  const closedSet = new Set();
  const cameFrom = {};

  const gScore = {};
  const fScore = {};
  const hScore = {};
  const nodesExplored = [];
  const steps = [];

  nodes.forEach(n => {
    gScore[n.id] = Infinity;
    fScore[n.id] = Infinity;
    hScore[n.id] = calculateHeuristicTime(n, goalNode);
  });

  gScore[sourceId] = 0;
  fScore[sourceId] = hScore[sourceId];

  let stepCounter = 1;
  let found = false;

  steps.push({
    step: stepCounter++,
    currentNode: sourceId,
    openSet: Array.from(openSet),
    closedSet: [],
    gScore: { ...gScore },
    hScore: { ...hScore },
    fScore: { ...fScore },
    action: `Initialize A*: g(${sourceId})=0.0, h(${sourceId})=${hScore[sourceId].toFixed(2)} min, f(${sourceId})=${fScore[sourceId].toFixed(2)} min.`
  });

  while (openSet.size > 0) {
    // Select node in openSet with lowest fScore
    let current = null;
    let lowestF = Infinity;

    for (const nodeId of openSet) {
      if (fScore[nodeId] < lowestF) {
        lowestF = fScore[nodeId];
        current = nodeId;
      }
    }

    if (!current) break;

    openSet.delete(current);
    closedSet.add(current);
    nodesExplored.push(current);

    steps.push({
      step: stepCounter++,
      currentNode: current,
      g: Number(gScore[current].toFixed(2)),
      h: Number(hScore[current].toFixed(2)),
      f: Number(fScore[current].toFixed(2)),
      openSet: Array.from(openSet),
      closedSet: Array.from(closedSet),
      gScore: { ...gScore },
      fScore: { ...fScore },
      action: `Selected node [${current}] with lowest f(n) = g(${gScore[current].toFixed(2)}) + h(${hScore[current].toFixed(2)}) = ${fScore[current].toFixed(2)} min.`
    });

    if (current === destinationId) {
      found = true;
      steps.push({
        step: stepCounter++,
        currentNode: current,
        openSet: Array.from(openSet),
        closedSet: Array.from(closedSet),
        action: `Goal [${destinationId}] REACHED with optimal estimated cost f = ${fScore[destinationId].toFixed(2)} min!`
      });
      break;
    }

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      const neighbor = edge.node;
      if (closedSet.has(neighbor)) continue;

      const tentativeG = gScore[current] + edge.cost;

      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = Number(tentativeG.toFixed(3));
        fScore[neighbor] = Number((tentativeG + hScore[neighbor]).toFixed(3));

        const wasInOpen = openSet.has(neighbor);
        openSet.add(neighbor);

        steps.push({
          step: stepCounter++,
          currentNode: current,
          targetNode: neighbor,
          edgeCost: Number(edge.cost.toFixed(2)),
          g: Number(gScore[neighbor].toFixed(2)),
          h: Number(hScore[neighbor].toFixed(2)),
          f: Number(fScore[neighbor].toFixed(2)),
          openSet: Array.from(openSet),
          closedSet: Array.from(closedSet),
          gScore: { ...gScore },
          fScore: { ...fScore },
          action: `${wasInOpen ? 'Updated' : 'Added'} neighbor [${neighbor}]: g = ${gScore[neighbor].toFixed(2)}, h = ${hScore[neighbor].toFixed(2)} => f = ${fScore[neighbor].toFixed(2)} min.`
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
      curr = cameFrom[curr];
    }
  }

  const executionTime = performance.now() - startTime;

  return createSearchResult({
    algorithm: 'A* Search',
    source: sourceId,
    destination: destinationId,
    path,
    nodesExplored,
    executionTime,
    found,
    steps,
    edges,
    errorMessage: found ? null : `No path exists to reach ${destinationId} from ${sourceId} using A* under current conditions.`,
    metadata: {
      type: 'Informed / Heuristic Search',
      dataStructure: 'Min-Priority Queue / Binary Heap',
      heuristicFormula: 'f(n) = g(n) + h(n)',
      heuristicProperty: 'Admissible & Consistent (Euclidean / Max Speed)',
      optimality: 'Guaranteed Optimal with Admissible Heuristic',
      timeComplexity: 'O(b^d)',
      spaceComplexity: 'O(b^d)'
    }
  });
}
