import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList
} from 'recharts';

export function PerformanceCharts({ results }) {
  if (!results) return null;

  const { bfs, dfs, dijkstra, astar } = results;

  const costData = [
    { name: 'BFS', cost: bfs?.found ? bfs.cost : 0, distance: bfs?.found ? bfs.distance : 0, fill: '#3b82f6' },
    { name: 'DFS', cost: dfs?.found ? dfs.cost : 0, distance: dfs?.found ? dfs.distance : 0, fill: '#ec4899' },
    { name: 'Dijkstra', cost: dijkstra?.found ? dijkstra.cost : 0, distance: dijkstra?.found ? dijkstra.distance : 0, fill: '#10b981' },
    { name: 'A* Search', cost: astar?.found ? astar.cost : 0, distance: astar?.found ? astar.distance : 0, fill: '#8b5cf6' }
  ];

  const explorationData = [
    { name: 'BFS', explored: bfs?.nodesExploredCount || 0, fill: '#3b82f6' },
    { name: 'DFS', explored: dfs?.nodesExploredCount || 0, fill: '#ec4899' },
    { name: 'Dijkstra', explored: dijkstra?.nodesExploredCount || 0, fill: '#10b981' },
    { name: 'A* Search', explored: astar?.nodesExploredCount || 0, fill: '#8b5cf6' }
  ];

  const CustomTooltip = ({ active, payload, label, unit = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-title">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || entry.fill }}>
              {entry.name}: <strong>{entry.value} {unit}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-charts-grid">
      {/* Chart 1: Search Space Exploration (Nodes Visited) */}
      <div className="chart-card">
        <h4 className="chart-title">Search Space Efficiency (Nodes Explored)</h4>
        <p className="chart-subtitle">Fewer nodes explored indicates higher heuristic pruning and search focus.</p>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={explorationData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #334155)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--text-secondary, #94a3b8)" fontSize={12} />
              <YAxis stroke="var(--text-secondary, #94a3b8)" fontSize={12} allowDecimals={false} />
              <Tooltip content={<CustomTooltip unit="nodes" />} />
              <Bar dataKey="explored" name="Nodes Explored" radius={[6, 6, 0, 0]}>
                <LabelList 
                  dataKey="explored" 
                  position="top" 
                  fill="var(--text-primary, #f8fafc)"
                  fontSize={12}
                  fontWeight={700}
                  formatter={(val) => `${val} nodes`}
                />
                {explorationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Route Quality (Travel Time & Distance) */}
      <div className="chart-card">
        <h4 className="chart-title">Route Quality (Travel Time vs Distance)</h4>
        <p className="chart-subtitle">Demonstrates how Dijkstra & A* minimize congestion delay compared to hop-count BFS.</p>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #334155)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--text-secondary, #94a3b8)" fontSize={12} />
              <YAxis stroke="var(--text-secondary, #94a3b8)" fontSize={12} />
              <Tooltip content={<CustomTooltip unit="min / km" />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="cost" name="Travel Time (min)" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                <LabelList 
                  dataKey="cost" 
                  position="top" 
                  fill="#f59e0b"
                  fontSize={11}
                  fontWeight={600}
                  formatter={(val) => val > 0 ? `${Number(val).toFixed(1)}m` : ''}
                />
              </Bar>
              <Bar dataKey="distance" name="Physical Dist (km)" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                <LabelList 
                  dataKey="distance" 
                  position="top" 
                  fill="#06b6d4"
                  fontSize={11}
                  fontWeight={600}
                  formatter={(val) => val > 0 ? `${Number(val).toFixed(1)}km` : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
