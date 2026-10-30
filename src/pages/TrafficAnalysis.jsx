import React, { useMemo } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Zap, 
  Layers, 
  ArrowUpRight,
  ShieldBan,
  Gauge
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext.jsx';
import { calculateEdgeCost, normalizeTrafficLevel, TRAFFIC_LEVELS, formatMinutes } from '../utils/trafficCostModel.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

export function TrafficAnalysis() {
  const { edges, currentScenario } = useTraffic();

  // Compute bottlenecks (highest delay multiplier / time per km)
  const rankedBottlenecks = useMemo(() => {
    const list = edges.map(e => {
      const costInfo = calculateEdgeCost(e);
      const delayRatio = costInfo.isBlocked ? 999 : (costInfo.totalCost / (costInfo.baseTime || 1));
      const delayMinutes = costInfo.isBlocked ? 999 : (costInfo.totalCost - costInfo.baseTime);

      return {
        id: e.id,
        label: e.label || `${e.source} ↔ ${e.destination}`,
        source: e.source,
        dest: e.destination,
        distance: e.distance,
        speed: e.speed,
        trafficLevel: normalizeTrafficLevel(e.trafficLevel),
        baseTime: costInfo.baseTime,
        totalCost: costInfo.totalCost,
        delayMinutes: Number(delayMinutes.toFixed(2)),
        delayRatio: Number(delayRatio.toFixed(2)),
        isBlocked: costInfo.isBlocked
      };
    });

    list.sort((a, b) => b.delayMinutes - a.delayMinutes);
    return list;
  }, [edges]);

  const topBottlenecks = rankedBottlenecks.filter(b => !b.isBlocked).slice(0, 8);
  const chartData = topBottlenecks.map(b => ({
    name: `${b.source}-${b.dest}`,
    delay: b.delayMinutes,
    base: b.baseTime,
    level: b.trafficLevel
  }));

  // Average network speed & congestion index
  const activeEdges = edges.filter(e => normalizeTrafficLevel(e.trafficLevel) !== 'BLOCKED');
  const avgSpeed = activeEdges.length > 0 
    ? (activeEdges.reduce((acc, e) => acc + e.speed, 0) / activeEdges.length).toFixed(1) 
    : 0;
  
  const totalCongestionWeight = activeEdges.reduce((acc, e) => {
    const lvl = normalizeTrafficLevel(e.trafficLevel);
    return acc + (TRAFFIC_LEVELS[lvl]?.weight || 1);
  }, 0);
  const congestionIndex = activeEdges.length > 0 
    ? (totalCongestionWeight / (activeEdges.length * 4) * 100).toFixed(1) 
    : 0;

  return (
    <div className="page-container analysis-page">
      {/* Overview Analytics Bar */}
      <div className="card-panel analysis-header-panel">
        <div className="panel-header-clean">
          <div className="header-icon-title">
            <BarChart3 size={20} className="accent-icon" />
            <h3>Metropolitan Network Traffic Flow Analysis</h3>
          </div>
          <span className="badge-tag">{currentScenario.replace('_', ' ')} Profile</span>
        </div>
        <p className="panel-desc">
          Rule-based analysis identifying high-delay bottlenecks, traffic delay ratios, and system congestion indices across all road corridors.
        </p>

        <div className="analysis-kpi-grid">
          <div className="analysis-kpi-box">
            <span className="kpi-label">Network Congestion Index</span>
            <span className="kpi-val text-warning">{congestionIndex}%</span>
            <span className="kpi-sub">Urban load index</span>
          </div>

          <div className="analysis-kpi-box">
            <span className="kpi-label">Average Speed Limit</span>
            <span className="kpi-val text-info">{avgSpeed} km/h</span>
            <span className="kpi-sub">Across {activeEdges.length} active roads</span>
          </div>

          <div className="analysis-kpi-box">
            <span className="kpi-label">Active Bottlenecks</span>
            <span className="kpi-val text-danger">
              {edges.filter(e => {
                const lvl = normalizeTrafficLevel(e.trafficLevel);
                return lvl === 'HIGH' || lvl === 'VERY_HIGH';
              }).length}
            </span>
            <span className="kpi-sub">High/Very-High roads</span>
          </div>

          <div className="analysis-kpi-box">
            <span className="kpi-label">Closed Artery Segments</span>
            <span className="kpi-val text-muted">
              {edges.filter(e => normalizeTrafficLevel(e.trafficLevel) === 'BLOCKED').length}
            </span>
            <span className="kpi-sub">Blocked roads</span>
          </div>
        </div>
      </div>

      {/* Top Bottleneck Delay Bar Chart */}
      <div className="card-panel bottleneck-chart-panel">
        <div className="panel-header">
          <h4>Top Traffic Delay Bottlenecks (Delay Time in Minutes)</h4>
          <span className="badge-tag">Congestion Impact</span>
        </div>

        <div className="chart-wrapper" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #334155)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--text-secondary, #94a3b8)" fontSize={12} />
              <YAxis stroke="var(--text-secondary, #94a3b8)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg, #1e293b)', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="delay" name="Congestion Delay (min)" fill="#ef4444" radius={[6, 6, 0, 0]}>
                <LabelList 
                  dataKey="delay" 
                  position="top" 
                  formatter={(val) => `${Number(val).toFixed(1)}m`} 
                  fill="var(--text-primary, #f8fafc)"
                  fontSize={11}
                  fontWeight={700}
                />
                {chartData.map((entry, index) => {
                  const color = entry.level === 'VERY_HIGH' ? '#ef4444' : (entry.level === 'HIGH' ? '#f97316' : '#eab308');
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Road Delay Ranking Table */}
      <div className="card-panel bottleneck-table-panel">
        <div className="panel-header">
          <h4>Comprehensive Congestion Severity Ranking</h4>
          <span className="badge-tag">Ranked by Delay</span>
        </div>

        <div className="table-responsive">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Corridor</th>
                <th>Distance</th>
                <th>Speed Limit</th>
                <th>Congestion Status</th>
                <th>Free-Flow Time</th>
                <th>Congested Time</th>
                <th>Total Delay Added</th>
              </tr>
            </thead>
            <tbody>
              {rankedBottlenecks.map((road, idx) => {
                const levelInfo = TRAFFIC_LEVELS[road.trafficLevel] || TRAFFIC_LEVELS.LOW;
                return (
                  <tr key={road.id} className={road.isBlocked ? 'row-blocked' : ''}>
                    <td>#{idx + 1}</td>
                    <td>
                      <strong>{road.source} ↔ {road.dest}</strong> ({road.label})
                    </td>
                    <td>{road.distance} km</td>
                    <td>{road.speed} km/h</td>
                    <td>
                      <span 
                        className="traffic-tag"
                        style={{ color: levelInfo.color, borderColor: levelInfo.color }}
                      >
                        {levelInfo.label}
                      </span>
                    </td>
                    <td>{road.baseTime.toFixed(1)} min</td>
                    <td>{road.isBlocked ? '∞' : `${road.totalCost.toFixed(1)} min`}</td>
                    <td>
                      {road.isBlocked ? (
                        <span className="text-danger flex-center">
                          <ShieldBan size={14} /> Infinite (Closed)
                        </span>
                      ) : (
                        <span className="text-warning font-bold">
                          +{road.delayMinutes.toFixed(1)} min ({road.delayRatio}x)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
