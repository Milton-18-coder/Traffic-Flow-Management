import React, { useEffect } from 'react';
import { 
  GitCompare, 
  Play, 
  MapPin, 
  Navigation, 
  Activity, 
  Award, 
  Zap, 
  ShieldCheck, 
  HelpCircle,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext.jsx';
import { ComparisonTable } from '../components/comparison/ComparisonTable.jsx';
import { PerformanceCharts } from '../components/comparison/PerformanceCharts.jsx';
import { TRAFFIC_SCENARIOS } from '../data/trafficScenarios.js';

export function AlgorithmComparison() {
  const {
    nodes,
    edges,
    sourceNode,
    destNode,
    setSourceNode,
    setDestNode,
    currentScenario,
    applyScenario,
    allComparisonResults,
    runComparison
  } = useTraffic();

  useEffect(() => {
    if (!allComparisonResults) {
      runComparison(sourceNode, destNode);
    }
  }, []);

  return (
    <div className="page-container comparison-page">
      {/* Benchmark Control Header */}
      <div className="card-panel comparison-header-panel">
        <div className="panel-header-clean">
          <div className="header-icon-title">
            <GitCompare size={20} className="accent-icon" />
            <h3>Multi-Algorithm Empirical Benchmark</h3>
          </div>
          <span className="badge-tag">CO2 Performance Evaluation</span>
        </div>

        <p className="panel-desc">
          Executes BFS, DFS, Dijkstra, and A* under exact identical road topology, speed limits, and traffic multipliers.
        </p>

        <div className="benchmark-form-row">
          <div className="form-group-inline">
            <label htmlFor="comp-source">Source [S]:</label>
            <select
              id="comp-source"
              className="form-select-sm"
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>Junction {n.id} ({n.name})</option>
              ))}
            </select>
          </div>

          <div className="form-group-inline">
            <label htmlFor="comp-dest">Goal [G]:</label>
            <select
              id="comp-dest"
              className="form-select-sm"
              value={destNode}
              onChange={(e) => setDestNode(e.target.value)}
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>Junction {n.id} ({n.name})</option>
              ))}
            </select>
          </div>

          <div className="form-group-inline">
            <label htmlFor="comp-scenario">Scenario:</label>
            <select
              id="comp-scenario"
              className="form-select-sm"
              value={currentScenario}
              onChange={(e) => applyScenario(e.target.value)}
            >
              {Object.values(TRAFFIC_SCENARIOS).map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>

          <button
            id="run-comparison-btn"
            className="btn-run-benchmark"
            onClick={() => runComparison(sourceNode, destNode)}
          >
            <Play size={15} />
            <span>Run Benchmark</span>
          </button>
        </div>
      </div>

      {/* Comparison Results Table */}
      <div className="card-panel comparison-table-panel">
        <div className="panel-header">
          <h4>Comparative Metrics Matrix</h4>
          <span className="badge-tag">Empirical Output</span>
        </div>
        <ComparisonTable results={allComparisonResults} totalNodesCount={nodes.length} />
      </div>

      {/* Visual Charts Row */}
      <div className="comparison-charts-container">
        <PerformanceCharts results={allComparisonResults} />
      </div>

      {/* Academic Explanatory Cards */}
      <div className="algorithm-verdict-grid">
        <div className="verdict-card card-panel">
          <div className="verdict-header">
            <span className="algo-badge bfs-badge">BFS</span>
            <h4>Breadth-First Search (Queue)</h4>
          </div>
          <p className="verdict-text">
            <strong>Behavior:</strong> Explores uniformly outward level by level.
          </p>
          <p className="verdict-text">
            <strong>Viva Analysis:</strong> BFS guarantees the path with the minimum number of road segments (hops). However, because it is an <em>uninformed search</em> that does not consider traffic congestion multipliers or physical distances, it frequently chooses congested urban roads with higher travel time.
          </p>
        </div>

        <div className="verdict-card card-panel">
          <div className="verdict-header">
            <span className="algo-badge dfs-badge">DFS</span>
            <h4>Depth-First Search (Stack)</h4>
          </div>
          <p className="verdict-text">
            <strong>Behavior:</strong> Explores each branch to maximum depth before backtracking.
          </p>
          <p className="verdict-text">
            <strong>Viva Analysis:</strong> DFS is non-optimal in route planning. It may find highly circuitous routes because it greedily explores adjacent edges without comparing alternative paths until forced to backtrack.
          </p>
        </div>

        <div className="verdict-card card-panel">
          <div className="verdict-header">
            <span className="algo-badge dijkstra-badge">Dijkstra</span>
            <h4>Dijkstra's Algorithm (Cost-Based)</h4>
          </div>
          <p className="verdict-text">
            <strong>Behavior:</strong> Expands nodes in order of cumulative cost $g(n)$.
          </p>
          <p className="verdict-text">
            <strong>Viva Analysis:</strong> Guaranteed to discover the globally optimal path with minimum travel time. However, it explores nodes equally in all directions (circular contour wavefront), expanding more nodes than necessary when goal direction is known.
          </p>
        </div>

        <div className="verdict-card card-panel">
          <div className="verdict-header">
            <span className="algo-badge astar-badge">A*</span>
            <h4>A* Search (Heuristic $f = g + h$)</h4>
          </div>
          <p className="verdict-text">
            <strong>Behavior:</strong> Directed search guided by actual cost + Euclidean straight-line heuristic.
          </p>
          <p className="verdict-text">
            <strong>Viva Analysis:</strong> A* achieves the exact same optimal travel time as Dijkstra, but explores <em>substantially fewer nodes</em> because $h(n)$ focuses the search frontier toward the destination coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}
