import React from 'react';
import { CheckCircle2, XCircle, Award, Zap, TrendingUp, Info } from 'lucide-react';
import { formatMinutes, formatDistance } from '../../utils/trafficCostModel.js';

export function ComparisonTable({ results, totalNodesCount = 15 }) {
  if (!results) {
    return (
      <div className="comparison-empty-state">
        <Info size={24} className="text-muted" />
        <p>No benchmark run yet. Click <strong>"Run All Algorithms Comparison"</strong> to benchmark BFS, DFS, Dijkstra, and A*.</p>
      </div>
    );
  }

  const { bfs, dfs, dijkstra, astar } = results;
  const algos = [
    { key: 'bfs', data: bfs, name: 'BFS (Breadth-First)', type: 'Uninformed', struct: 'Queue', opt: 'Min Edge Count' },
    { key: 'dfs', data: dfs, name: 'DFS (Depth-First)', type: 'Uninformed', struct: 'Stack', opt: 'Non-Optimal' },
    { key: 'dijkstra', data: dijkstra, name: "Dijkstra's Algorithm", type: 'Cost-Based', struct: 'Min-Priority Queue', opt: 'Guaranteed Optimal Cost' },
    { key: 'astar', data: astar, name: 'A* Search', type: 'Heuristic', struct: 'Priority Queue (f=g+h)', opt: 'Optimal & Focused' }
  ];

  // Find lowest cost among found
  let lowestCost = Infinity;
  let fewestNodes = Infinity;
  let fastestTime = Infinity;

  algos.forEach(a => {
    if (a.data?.found) {
      if (a.data.cost < lowestCost) lowestCost = a.data.cost;
      if (a.data.nodesExploredCount < fewestNodes) fewestNodes = a.data.nodesExploredCount;
      if (a.data.executionTime < fastestTime) fastestTime = a.data.executionTime;
    }
  });

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Algorithm</th>
            <th>Search Type</th>
            <th>Path Discovered</th>
            <th>Travel Time (Cost)</th>
            <th>Distance</th>
            <th>Nodes Explored</th>
            <th>Execution Time</th>
            <th>Optimality Verdict</th>
          </tr>
        </thead>
        <tbody>
          {algos.map((algo) => {
            const d = algo.data;
            if (!d) return null;

            const isBestCost = d.found && d.cost === lowestCost;
            const isFewestNodes = d.found && d.nodesExploredCount === fewestNodes;

            return (
              <tr key={algo.key} className={isBestCost ? 'row-best-cost' : ''}>
                <td className="algo-name-cell">
                  <div className="algo-name-wrap">
                    <span className="algo-title">{algo.name}</span>
                    <span className="algo-struct-tag">{algo.struct}</span>
                  </div>
                </td>
                <td>
                  <span className={`search-type-badge type-${algo.type.toLowerCase().replace(/[^a-z]/g, '')}`}>
                    {algo.type}
                  </span>
                </td>
                <td className="path-cell">
                  {d.found ? (
                    <span className="path-text">{d.path.join(' → ')}</span>
                  ) : (
                    <span className="text-danger flex-center">
                      <XCircle size={14} /> No Path
                    </span>
                  )}
                </td>
                <td className="metric-cell">
                  {d.found ? (
                    <div className="metric-cell-value">
                      <strong>{formatMinutes(d.cost)}</strong>
                      {isBestCost && (
                        <span className="badge-winner cost-winner" title="Lowest Travel Cost">
                          <Award size={12} /> Lowest Cost
                        </span>
                      )}
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="metric-cell">
                  {d.found ? formatDistance(d.distance) : 'N/A'}
                </td>
                <td className="metric-cell">
                  <div className="metric-cell-value">
                    <span>{d.nodesExploredCount} / {totalNodesCount} nodes</span>
                    {isFewestNodes && (
                      <span className="badge-winner node-winner" title="Fewest Nodes Explored">
                        <Zap size={12} /> Most Efficient
                      </span>
                    )}
                  </div>
                </td>
                <td className="metric-cell mono-font">
                  {d.executionTime.toFixed(3)} ms
                </td>
                <td>
                  <span className="optimality-text">
                    {algo.opt}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
