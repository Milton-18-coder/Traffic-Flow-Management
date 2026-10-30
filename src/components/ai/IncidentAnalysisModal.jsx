import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { simulateIncidentAnalysis } from '../../services/aiApiService.js';
import { formatMinutes } from '../../utils/trafficCostModel.js';

export function IncidentAnalysisModal({ isOpen, onClose }) {
  const { 
    nodes, 
    edges, 
    sourceNode, 
    destNode, 
    executeSearch, 
    showToast,
    toggleEdgeBlocked 
  } = useTraffic();

  const [incidentType, setIncidentType] = useState('ACCIDENT');
  const [targetId, setTargetId] = useState('CHN-CGL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  if (!isOpen) return null;

  // Handle simulation trigger
  const handleRunIncidentSimulation = async () => {
    setIsSimulating(true);
    setAnalysisResult(null);

    try {
      const res = await simulateIncidentAnalysis({
        incidentType,
        targetId,
        nodes,
        edges,
        source: sourceNode,
        destination: destNode
      });

      if (res.success) {
        setAnalysisResult(res);
      } else {
        showToast('Simulation Error', res.error || 'Failed to complete incident analysis', 'error');
      }
    } catch (e) {
      showToast('Error', e.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Apply incident to live map
  const applyIncidentToLiveMap = () => {
    if (!analysisResult?.incidentData) return;
    const { affectedEdgeIds } = analysisResult.incidentData;

    affectedEdgeIds.forEach(id => {
      toggleEdgeBlocked(id);
    });

    executeSearch();
    showToast('Incident Injected', 'Incident applied to live simulation. Agent rerouted optimal path.', 'warning');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="incident-modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <ShieldAlert size={20} className="text-rose-400" />
            <div>
              <h3>AI-Based Traffic Incident & Impact Analysis</h3>
              <p className="modal-subtitle">NVIDIA Nemotron Reasoning via Nebius Token Factory</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Controls Bar */}
          <div className="incident-controls-bar">
            <div className="control-field">
              <label>Incident Scenario:</label>
              <select 
                value={incidentType} 
                onChange={(e) => setIncidentType(e.target.value)}
                className="incident-select"
              >
                <option value="ACCIDENT">Road Accident / Highway Collision</option>
                <option value="ROAD_BLOCKAGE">Road Blockage / Landslide / Repair</option>
                <option value="HEAVY_CONGESTION">Sudden Traffic Density Surge</option>
                <option value="JUNCTION_UNAVAILABLE">Junction Complete Breakdown</option>
              </select>
            </div>

            <div className="control-field">
              <label>Target Location / Corridor:</label>
              <select 
                value={targetId} 
                onChange={(e) => setTargetId(e.target.value)}
                className="incident-select"
              >
                {incidentType === 'JUNCTION_UNAVAILABLE' ? (
                  nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.id}] {n.name}
                    </option>
                  ))
                ) : (
                  edges.map(e => (
                    <option key={e.id} value={e.id}>
                      [{e.id}] {e.label || `${e.source} ↔ ${e.destination}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button 
              className="btn-simulate-incident"
              onClick={handleRunIncidentSimulation}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <Activity size={15} className="spin-icon" />
                  <span>Analyzing with Nemotron...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Simulate & Recalculate</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {analysisResult && (
            <div className="incident-results-wrapper">
              {/* Metrics Row */}
              <div className="incident-metrics-row">
                <div className="inc-metric-card danger">
                  <span className="inc-label">Incident Disruption</span>
                  <strong className="inc-val">{analysisResult.incidentData.incidentDescription}</strong>
                  <span className="inc-sub">Target: {analysisResult.incidentData.targetId}</span>
                </div>

                <div className="inc-metric-card warning">
                  <span className="inc-label">Delay Incurred</span>
                  <strong className="inc-val">+{analysisResult.incidentData.delayDelta} min</strong>
                  <span className="inc-sub">vs baseline optimal</span>
                </div>

                <div className="inc-metric-card success">
                  <span className="inc-label">Detour Travel Time</span>
                  <strong className="inc-val">{formatMinutes(analysisResult.incidentData.detourCost)}</strong>
                  <span className="inc-sub">{analysisResult.incidentData.detourDistance} km distance</span>
                </div>
              </div>

              {/* Path Comparison */}
              <div className="incident-routes-compare">
                <div className="route-compare-item">
                  <span className="route-role-badge baseline">Baseline Route (Pre-Incident):</span>
                  <div className="path-pill-list">
                    {analysisResult.incidentData.baselineRoute.map((node, i) => (
                      <span key={i} className="path-step-pill">{node}</span>
                    ))}
                  </div>
                </div>

                <div className="route-compare-item">
                  <span className="route-role-badge detour">Recalculated Detour Bypass:</span>
                  <div className="path-pill-list">
                    {analysisResult.incidentData.detourRoute.map((node, i) => (
                      <span key={i} className="path-step-pill detour">{node}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI-Generated Explanation from NVIDIA Nemotron */}
              <div className="ai-explanation-box">
                <div className="ai-box-header">
                  <Sparkles size={16} className="text-emerald-400" />
                  <h4>NVIDIA Nemotron Tactical Incident Assessment</h4>
                  <span className="provider-tag">{analysisResult.provider || 'Nebius Token Factory'}</span>
                </div>
                <div className="ai-markdown-content">
                  <pre>{analysisResult.explanation}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
          {analysisResult && (
            <button className="btn-apply-incident" onClick={applyIncidentToLiveMap}>
              <AlertTriangle size={15} />
              <span>Apply Blockage to Live Simulation Map</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

