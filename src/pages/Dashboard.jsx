import React, { useMemo, useState, useEffect } from 'react';
import { 
  Network, 
  Route, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Layers, 
  ArrowRight, 
  TrendingDown, 
  Navigation, 
  Flame, 
  MapPin, 
  Compass, 
  Gauge,
  Bot
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext.jsx';
import { MetricCard } from '../components/layout/MetricCard.jsx';
import { TrafficMapSVG } from '../components/map/TrafficMapSVG.jsx';
import { RealTimeLeafletMap } from '../components/map/RealTimeLeafletMap.jsx';
import { TrafficLegend } from '../components/map/TrafficLegend.jsx';
import { SimulationControlBar } from '../components/map/SimulationControlBar.jsx';
import { RouteSearchBar } from '../components/common/RouteSearchBar.jsx';
import { TrafficIntelligencePanel } from '../components/ai/TrafficIntelligencePanel.jsx';
import { AIRecommendationPanel } from '../components/ai/AIRecommendationPanel.jsx';
import { AITrafficAssistant } from '../components/ai/AITrafficAssistant.jsx';
import { IncidentAnalysisModal } from '../components/ai/IncidentAnalysisModal.jsx';
import { getAiServiceStatus } from '../services/aiApiService.js';
import { normalizeTrafficLevel, formatMinutes, formatDistance, calculateEdgeCost } from '../utils/trafficCostModel.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Dashboard({ onNavigate }) {
  const {
    nodes,
    edges,
    currentScenario,
    sourceNode,
    destNode,
    selectedAlgorithm,
    searchResult,
    runDemoScenario,
    executeSearch
  } = useTraffic();

  const [mapMode, setMapMode] = useState('LEAFLET');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  // Poll AI service health status once on mount
  useEffect(() => {
    let isMounted = true;
    getAiServiceStatus().then(status => {
      if (isMounted) setAiStatus(status?.data || null);
    });
    return () => { isMounted = false; };
  }, []);

  // Compute live network stats
  const trafficDistribution = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, VERY_HIGH: 0, BLOCKED: 0 };
    edges.forEach(e => {
      const lvl = normalizeTrafficLevel(e.trafficLevel);
      if (counts[lvl] !== undefined) counts[lvl]++;
      else counts.LOW++;
    });

    return [
      { name: 'Low (Free Flow)', count: counts.LOW, color: '#22c55e' },
      { name: 'Medium (Moderate)', count: counts.MEDIUM, color: '#eab308' },
      { name: 'High (Heavy)', count: counts.HIGH, color: '#f97316' },
      { name: 'Very High (Severe)', count: counts.VERY_HIGH, color: '#ef4444' },
      { name: 'Blocked (Closed)', count: counts.BLOCKED, color: '#6b7280' }
    ].filter(d => d.count > 0);
  }, [edges]);

  // Compute active route legs with distances (km), speeds, and travel times
  const routeSegments = useMemo(() => {
    if (!searchResult?.found || !searchResult?.path || searchResult.path.length < 2) return [];
    const segments = [];
    for (let i = 0; i < searchResult.path.length - 1; i++) {
      const u = searchResult.path[i];
      const v = searchResult.path[i + 1];
      const edge = edges.find(
        e => (e.source === u && e.destination === v) || (e.source === v && e.destination === u)
      );
      if (edge) {
        const uNode = nodes.find(n => n.id === u);
        const vNode = nodes.find(n => n.id === v);
        const costInfo = calculateEdgeCost(edge);
        segments.push({
          step: i + 1,
          from: u,
          to: v,
          fromName: uNode?.name || u,
          toName: vNode?.name || v,
          label: edge.label || `${u} ↔ ${v}`,
          distance: edge.distance,
          speed: edge.speed,
          trafficLevel: edge.trafficLevel,
          timeMin: costInfo.totalCost,
          multiplier: costInfo.multiplier
        });
      }
    }
    return segments;
  }, [searchResult, edges, nodes]);

  const blockedCount = edges.filter(e => normalizeTrafficLevel(e.trafficLevel) === 'BLOCKED').length;

  return (
    <div className="page-container dashboard-page">
      {/* Interactive Source & Destination Autocomplete Entry Bar */}
      <RouteSearchBar 
        activeMapMode={mapMode} 
        onToggleMapMode={setMapMode} 
      />

      {/* Traffic Intelligence Panel (KPIs: Highest congestion, density, bottlenecks, bypass, incidents) */}
      <TrafficIntelligencePanel 
        aiStatus={aiStatus}
        onSelectIncidentView={() => setIsIncidentModalOpen(true)}
      />

      {/* Main Content Grid: Interactive Map + Analytics Side Panel */}
      <div className="dashboard-content-grid">
        {/* Left: Road Network Map */}
        <div className="dashboard-map-panel card-panel">
          <div className="panel-header">
            <div className="header-title-wrap">
              <Network size={18} className="accent-icon" />
              <h3>
                {mapMode === 'LEAFLET' && 'Google Maps / Real-Time Traffic Tiles'}
                {mapMode === 'SVG' && 'Metropolitan Traffic Topology (SVG Canvas)'}
              </h3>
            </div>
            <div className="panel-header-actions">
              <span className="live-pulse-dot" />
              <span className="panel-sub">Live Real-Time Map API</span>
            </div>
          </div>

          {mapMode === 'LEAFLET' && (
            <RealTimeLeafletMap height="460px" />
          )}

          {mapMode === 'SVG' && (
            <TrafficMapSVG height="460px" interactive={true} />
          )}

          <TrafficLegend showDetailed={true} />
        </div>

        {/* Right: Traffic Distribution & Route Output */}
        <div className="dashboard-side-panel">
          {/* Active Route Summary Card */}
          <div className="route-summary-card card-panel">
            <div className="panel-header">
              <div className="header-title-wrap">
                <Route size={18} className="accent-icon" />
                <h3>Active Agent Route</h3>
              </div>
              <span className="badge-tag">{selectedAlgorithm}</span>
            </div>

            {searchResult?.found ? (
              <div className="route-summary-body">
                {/* Visual Route Sequence */}
                <div className="route-path-display">
                  {searchResult.path.map((nodeId, idx) => {
                    const isStart = idx === 0;
                    const isGoal = idx === searchResult.path.length - 1;
                    return (
                      <React.Fragment key={nodeId}>
                        <span 
                          className={`route-node-pill ${isStart ? 'is-start' : (isGoal ? 'is-goal' : '')}`}
                          title={`Junction [${nodeId}]`}
                        >
                          {nodeId}
                        </span>
                        {idx < searchResult.path.length - 1 && (
                          <ArrowRight size={13} className="route-arrow" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* 2x2 Metric Stats Grid */}
                <div className="route-stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">
                      <Clock size={12} /> Optimal Travel Time
                    </span>
                    <span className="stat-value text-warning">
                      {formatMinutes(searchResult.cost)}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">
                      <Compass size={12} /> Physical Distance
                    </span>
                    <span className="stat-value text-emerald">
                      {searchResult.distance} km
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">
                      <Network size={12} /> Explored Nodes
                    </span>
                    <span className="stat-value text-info">
                      {searchResult.nodesExploredCount} / {nodes.length}
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">
                      <Zap size={12} /> Execution Time
                    </span>
                    <span className="stat-value mono-font">
                      {searchResult.executionTime} ms
                    </span>
                  </div>
                </div>

                {/* Turn-by-Turn Corridor Kilometer Breakdown */}
                {routeSegments.length > 0 && (
                  <div className="route-legs-section">
                    <div className="route-legs-header">
                      <span>Corridor Kilometer Breakdown</span>
                      <span className="leg-total-tag" style={{ color: '#34d399', fontWeight: 800 }}>
                        Total: {searchResult.distance} km ({routeSegments.length} Legs)
                      </span>
                    </div>

                    <div className="route-legs-list">
                      {routeSegments.map((seg, sIdx) => (
                        <div key={sIdx} className="route-leg-row">
                          <div className="leg-left-info">
                            <span className="leg-step-badge">Leg {seg.step}</span>
                            <span className="leg-corridor-name" title={seg.label}>
                              [{seg.from}] → [{seg.to}] ({seg.label})
                            </span>
                          </div>
                          <div className="leg-right-metrics">
                            <span className="leg-distance-pill" title="Physical Distance">
                              {seg.distance} km
                            </span>
                            <span className="leg-time-pill" title="Travel Time at current speed/congestion">
                              {seg.timeMin.toFixed(1)} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-route-placeholder">
                <p>No route computed yet. Click "Launch Demo" or "Run Search" to trigger agent pathfinding.</p>
              </div>
            )}
          </div>

          {/* Traffic Distribution Pie Chart */}
          <div className="traffic-distribution-card card-panel">
            <div className="panel-header">
              <div className="header-title-wrap">
                <Activity size={18} className="accent-icon" />
                <h3>Traffic Congestion Spread</h3>
              </div>
            </div>

            <div className="distribution-chart-wrapper">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={trafficDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={74}
                    paddingAngle={3}
                  >
                    {trafficDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--card-bg, #1e293b)', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val, name) => [`${val} roads (${((val / edges.length) * 100).toFixed(1)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="distribution-legend">
                {trafficDistribution.map((item, idx) => {
                  const pct = ((item.count / edges.length) * 100).toFixed(0);
                  return (
                    <div key={idx} className="dist-legend-item">
                      <span className="legend-dot" style={{ backgroundColor: item.color }} />
                      <span className="dist-label">{item.name}</span>
                      <strong className="dist-count" style={{ color: item.color, marginLeft: 'auto', fontWeight: 700 }}>
                        {item.count} ({pct}%)
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation & Decision Support Section */}
      <AIRecommendationPanel />

      {/* Interactive AI Traffic Assistant (Powered by NVIDIA Nemotron) */}
      <div className="dashboard-ai-assistant-wrapper">
        <AITrafficAssistant />
      </div>

      {/* Incident Simulation & Analysis Modal */}
      <IncidentAnalysisModal 
        isOpen={isIncidentModalOpen} 
        onClose={() => setIsIncidentModalOpen(false)} 
      />
    </div>
  );
}
