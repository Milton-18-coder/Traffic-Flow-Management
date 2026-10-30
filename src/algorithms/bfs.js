/**
 * Breadth-First Search (BFS) Implementation
 * Uninformed search strategy that explores the graph level-by-level using a FIFO Queue.
 * Minimizes the number of edge hops between Source and Destination.
 */
import { buildAdjacencyList } from '../utils/networkValidator.js';
import { createSearchResult } from './searchResult.js';

export function runBFS(nodes, edges, sourceId, destinationId) {
  const startTime = performance.now();
  
  // Edge Case: Source equals Destination
  if (sourceId === destinationId) {
    const execTime = performance.now() - startTime;
    return createSearchResult({
      algorithm: 'Breadth-First Search (BFS)',
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
        queue: [],
        visited: [sourceId],
        action: `Source is Destination (${sourceId}). Search completed immediately.`
      }]
    });
  }

  const adj = buildAdjacencyList(nodes, edges);
  const queue = [sourceId];
  const visited = new Set([sourceId]);
  const parent = {};
  const nodesExplored = [];
  const steps = [];

  let stepCounter = 1;
  let found = false;

  steps.push({
    step: stepCounter++,
    currentNode: sourceId,
    queue: [...queue],
    visited: Array.from(visited),
    action: `Initialize BFS: Enqueue Source junction [${sourceId}]`
  });

  while (queue.length > 0) {
    const current = queue.shift();
    nodesExplored.push(current);

    steps.push({
      step: stepCounter++,
      currentNode: current,
      queue: [...queue],
      visited: Array.from(visited),
      action: `Dequeued junction [${current}]. Checking if it is the Goal [${destinationId}].`
    });

    if (current === destinationId) {
      found = true;
      steps.push({
        step: stepCounter++,
        currentNode: current,
        queue: [...queue],
        visited: Array.from(visited),
        action: `Goal [${destinationId}] REACHED! Reconstructing path.`
      });
      break;
    }

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      const neighbor = edge.node;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = current;
        queue.push(neighbor);

        steps.push({
          step: stepCounter++,
          currentNode: current,
          targetNode: neighbor,
          queue: [...queue],
          visited: Array.from(visited),
          action: `Discovered unvisited neighbor [${neighbor}] from [${current}]. Added to Queue.`
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
      curr = parent[curr];
    }
  }

  const executionTime = performance.now() - startTime;

  return createSearchResult({
    algorithm: 'Breadth-First Search (BFS)',
    source: sourceId,
    destination: destinationId,
    path,
    nodesExplored,
    executionTime,
    found,
    steps,
    edges,
    errorMessage: found ? null : `No valid route found between ${sourceId} and ${destinationId} using BFS (all paths blocked or disconnected).`,
    metadata: {
      type: 'Uninformed Search',
      dataStructure: 'FIFO Queue',
      optimality: 'Optimal for unweighted graphs (fewest road segments)',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    }
  });
}
