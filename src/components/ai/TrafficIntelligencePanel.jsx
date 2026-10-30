import React, { useMemo } from 'react';
import { 
  Flame, 
  Gauge, 
  AlertTriangle, 
  Route, 
  ShieldAlert, 
  Cpu, 
  Sparkles,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { normalizeTrafficLevel, calculateEdgeCost, TRAFFIC_LEVELS } from '../../utils/trafficCostModel.js';

export function TrafficIntelligencePanel({ aiStatus, onSelectIncidentView }) {
  const { nodes, edges, currentScenario } = useTraffic();

  // Compute live congestion metrics
  const intelligence = useMemo(() => {
    const junctionScores = {};
    nodes.forEach(n => {
      junctionScores[n.id] = { node: n, totalWeight: 0, roadCount: 0, blockedCount: 0 };
    });

    let totalWeight = 0;
    let activeRoads = 0;
    let blockedRoads = 0;
    const roadDelays = [];

    edges.forEach(edge => {
      const costInfo = calculateEdgeCost(edge);
      const normLevel = normalizeTrafficLevel(edge.trafficLevel);
      const weight = TRAFFIC_LEVELS[normLevel]?.weight || 1;

      if (costInfo.isBlocked) {
        blockedRoads++;
      } else {
        totalWeight += weight;
        activeRoads++;
        const delayMin = costInfo.totalCost - costInfo.baseTime;
        roadDelays.push({
          id: edge.id,
          label: edge.label || `${edge.source} ↔ ${edge.destination}`,
          delayMin: Number(delayMin.toFixed(1)),
          multiplier: costInfo.multiplier,
          trafficLevel: normLevel
        });
      }

      [edge.source, edge.destination].forEach(nid => {
        if (junctionScores[nid]) {
          junctionScores[nid].roadCount++;
          if (costInfo.isBlocked) {
            junctionScores[nid].blockedCount++;
            junctionScores[nid].totalWeight += 5;
          } else {
            junctionScores[nid].totalWeight += weight;
          }
        }
      });
    });

    const rankedJunctions = Object.values(junctionScores).map(j => {
      const avg = j.roadCount > 0 ? j.totalWeight / j.roadCount : 0;
      return {
        id: j.node.id,
        name: j.node.name,
        avgScore: Number(avg.toFixed(2)),
        blockedCount: j.blockedCount
      };
    }).sort((a, b) => b.avgScore - a.avgScore);

    roadDelays.sort((a, b) => b.delayMin - a.delayMin);

    const highestJunction = rankedJunctions[0] || { id: 'CHN', name: 'Chennai Central', avgScore: 1.0 };
    const mostCongestedRoad = roadDelays[0] || { id: 'CHN-CGL', label: 'GST Road', delayMin: 0, multiplier: 1.0 };
    const avgDensity = activeRoads > 0 ? Number(((totalWeight / (activeRoads * 4)) * 100).toFixed(1)) : 0;

    // Suggest bypass based on bottlenecks
    let suggestedBypass = 'Standard Corridors (Flow Normal)';
    if (mostCongestedRoad.delayMin > 10 || blockedRoads > 0) {
      suggestedBypass = 'Divert via Western NH-48 / Ranipet Expressway';
    } else if (highestJunction.id === 'VPM' || highestJunction.id === 'CGL') {
      suggestedBypass = 'Bypass GST Road via ECR / Cuddalore Corridor';
    }

    return {
      highestJunction,
      mostCongestedRoad,
      avgDensity,
      blockedRoads,
      suggestedBypass
    };
  }, [nodes, edges]);

  const isNebiusActive = aiStatus?.status === 'active' || aiStatus?.configured;

  return (
    <div className="traffic-intelligence-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <Sparkles size={18} className="text-emerald-400" />
          <h3 className="section-title">Traffic Intelligence & Decision Engine</h3>
          <span className="badge-scenario">{currentScenario.replace('_', ' ')}</span>
        </div>

        {/* Nebius x NVIDIA Nemotron Badge */}
        <div className="nebius-nvidia-badge">
          <span className="pulse-dot-green" />
          <span className="badge-brand">NVIDIA Nemotron</span>
          <span className="badge-divider">•</span>
          <span className="badge-platform">Nebius Token Factory</span>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="intelligence-kpi-grid">
        {/* 1. Highest Congestion Junction */}
        <div className="intel-card warning-accent">
          <div className="intel-card-header">
            <span className="intel-card-label">Highest Congestion Junction</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <div className="intel-card-value">
            [{intelligence.highestJunction.id}] {intelligence.highestJunction.name}
          </div>
          <div className="intel-card-sub">
            Delay Score: <strong className="text-orange-400">{intelligence.highestJunction.avgScore} / 4.0</strong>
          </div>
        </div>

        {/* 2. Average Traffic Density */}
        <div className="intel-card info-accent">
          <div className="intel-card-header">
            <span className="intel-card-label">Average Traffic Density</span>
            <Gauge size={16} className="text-sky-400" />
          </div>
          <div className="intel-card-value text-sky-400">
            {intelligence.avgDensity}%
          </div>
          <div className="intel-card-sub">
            Network capacity utilization
          </div>
        </div>

        {/* 3. Most Congested Road */}
        <div className="intel-card danger-accent">
          <div className="intel-card-header">
            <span className="intel-card-label">Most Congested Corridor</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div className="intel-card-value">
            {intelligence.mostCongestedRoad.label}
          </div>
          <div className="intel-card-sub text-rose-400">
            +{intelligence.mostCongestedRoad.delayMin} min delay ({intelligence.mostCongestedRoad.multiplier}x speed penalty)
          </div>
        </div>

        {/* 4. Suggested Alternative Route */}
        <div className="intel-card success-accent">
          <div className="intel-card-header">
            <span className="intel-card-label">Suggested Alternative Route</span>
            <Route size={16} className="text-emerald-400" />
          </div>
          <div className="intel-card-value text-emerald-400">
            {intelligence.suggestedBypass}
          </div>
          <div className="intel-card-sub">
            Real-time congestion-aware diversion
          </div>
        </div>

        {/* 5. Active Incidents */}
        <div 
          className="intel-card purple-accent clickable-card"
          onClick={onSelectIncidentView}
          title="Click to view & simulate incident analysis"
        >
          <div className="intel-card-header">
            <span className="intel-card-label">Active Incidents</span>
            <ShieldAlert size={16} className="text-violet-400" />
          </div>
          <div className="intel-card-value text-violet-400">
            {intelligence.blockedRoads > 0 ? `${intelligence.blockedRoads} Road Closure(s)` : '0 Blockages Active'}
          </div>
          <div className="intel-card-sub flex-action">
            <span>Simulate / Analyze Incidents &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

