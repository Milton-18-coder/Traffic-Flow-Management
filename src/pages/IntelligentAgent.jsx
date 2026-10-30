import React, { useState } from 'react';
import { 
  Bot, 
  Layers, 
  GitFork, 
  ShieldAlert, 
  CheckCircle2, 
  Award, 
  Eye, 
  Play, 
  Flame, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Compass
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext.jsx';
import { PEASMatrix } from '../components/agent/PEASMatrix.jsx';
import { AgentConsole } from '../components/agent/AgentConsole.jsx';
import { TrafficMapSVG } from '../components/map/TrafficMapSVG.jsx';
import { AllRoutesDetailsViewer } from '../components/routes/AllRoutesDetailsViewer.jsx';
import { formatMinutes, formatDistance } from '../utils/trafficCostModel.js';

export function IntelligentAgent() {
  const {
    sourceNode,
    destNode,
    combinatorialRoutes,
    searchResult,
    executeSearch,
    toggleEdgeBlocked,
    edges
  } = useTraffic();

  const [highlightedPath, setHighlightedPath] = useState(null);

  // Dynamic incident simulation
  const simulateIncidentAndReroute = () => {
    // Block road D-E or A-D if active in route
    toggleEdgeBlocked('D-E');
    setTimeout(() => {
      executeSearch();
    }, 150);
  };

  const bestCost = combinatorialRoutes.length > 0 ? combinatorialRoutes[0].cost : 0;

  return (
    <div className="page-container agent-page">
      {/* Top Banner explaining CO1 */}
      <div className="card-panel agent-intro-banner">
        <div className="intro-badge">
          <Bot size={16} />
          <span>CO1: Intelligent Agents & Combinatorial Problem Solving</span>
        </div>
        <h2 className="intro-title">Goal-Based Intelligent Agent Architecture</h2>
        <p className="intro-desc">
          An autonomous agent observes the road network environment, evaluates alternative combinatorial routes, 
          and executes search strategies to achieve the goal of minimal travel time.
        </p>
      </div>

      {/* PEAS Formal Matrix */}
      <PEASMatrix />

      {/* Live Agent State Monitor & Console */}
      <AgentConsole />

      {/* Combinatorial Route Space Explorer & Rejection Rationales */}
      <AllRoutesDetailsViewer 
        onHighlightRoute={setHighlightedPath} 
        highlightedPath={highlightedPath} 
      />

      {/* Visual Map preview of highlighted combinatorial route */}
      {highlightedPath && (
        <div className="card-panel highlighted-route-preview">
          <div className="preview-header">
            <span>Active Inspector Route: <strong>{highlightedPath.join(' → ')}</strong></span>
            <button className="btn-clear-preview" onClick={() => setHighlightedPath(null)}>
              Reset Highlight
            </button>
          </div>
          <TrafficMapSVG height="380px" customSelectedPath={highlightedPath} interactive={false} />
        </div>
      )}

      {/* Dynamic Re-planning Section */}
      <div className="card-panel dynamic-replanning-card">
        <div className="panel-header">
          <div className="header-title-wrap">
            <ShieldAlert size={20} className="accent-icon text-warning" />
            <h3>Dynamic Decision-Making & Incident Replanning</h3>
          </div>
          <span className="badge-tag">Dynamic Agent Behavior</span>
        </div>
        <p className="card-desc">
          To demonstrate that the intelligent agent responds dynamically to environment changes, trigger an unplanned accident on key corridor <strong>[D-E]</strong>. The agent perceives the blockage and recalculates the optimal bypass.
        </p>

        <div className="replanning-actions">
          <button
            id="simulate-accident-btn"
            className="btn-trigger-accident"
            onClick={simulateIncidentAndReroute}
          >
            <Flame size={16} />
            <span>Toggle Incident on Road [D-E] & Trigger Agent Replanning</span>
          </button>
        </div>
      </div>
    </div>
  );
}
