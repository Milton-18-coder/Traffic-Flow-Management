/**
 * Depth-First Search (DFS) Implementation
 * Uninformed search strategy that explores along each branch as deep as possible
 * before backtracking, using a LIFO Stack.
 */
import { buildAdjacencyList } from '../utils/networkValidator.js';
import { createSearchResult } from './searchResult.js';

export function runDFS(nodes, edges, sourceId, destinationId) {
  const startTime = performance.now();

  // Edge Case: Source equals Destination
  if (sourceId === destinationId) {
    const execTime = performance.now() - startTime;
    return createSearchResult({
      algorithm: 'Depth-First Search (DFS)',
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
        stack: [],
        visited: [sourceId],
        action: `Source is Destination (${sourceId}). Search completed immediately.`
      }]
    });
  }

  const adj = buildAdjacencyList(nodes, edges);
  const stack = [sourceId];
  const visited = new Set();
  const parent = {};
  const nodesExplored = [];
  const steps = [];

  let stepCounter = 1;
  let found = false;

  steps.push({
    step: stepCounter++,
    currentNode: sourceId,
    stack: [...stack],
    visited: [],
    action: `Initialize DFS: Push Source junction [${sourceId}] onto Stack`
  });

  while (stack.length > 0) {
    const current = stack.pop();

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    nodesExplored.push(current);

    steps.push({
      step: stepCounter++,
      currentNode: current,
      stack: [...stack],
      visited: Array.from(visited),
      action: `Popped junction [${current}] from Stack. Visiting node.`
    });

    if (current === destinationId) {
      found = true;
      steps.push({
        step: stepCounter++,
        currentNode: current,
        stack: [...stack],
        visited: Array.from(visited),
        action: `Goal [${destinationId}] REACHED! Reconstructing path.`
      });
      break;
    }

    const neighbors = adj[current] || [];
    // Iterate in reverse for intuitive stack order
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i].node;
      if (!visited.has(neighbor)) {
        parent[neighbor] = current;
        stack.push(neighbor);

        steps.push({
          step: stepCounter++,
          currentNode: current,
          targetNode: neighbor,
          stack: [...stack],
          visited: Array.from(visited),
          action: `Pushed unvisited neighbor [${neighbor}] onto Stack from [${current}].`
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
    algorithm: 'Depth-First Search (DFS)',
    source: sourceId,
    destination: destinationId,
    path,
    nodesExplored,
    executionTime,
    found,
    steps,
    edges,
    errorMessage: found ? null : `No valid route found between ${sourceId} and ${destinationId} using DFS (all branches exhausted or blocked).`,
    metadata: {
      type: 'Uninformed Search',
      dataStructure: 'LIFO Stack / Recursion',
      optimality: 'Non-optimal (can find long circuitous paths)',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    }
  });
}
