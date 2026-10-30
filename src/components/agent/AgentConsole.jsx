import React from 'react';
import { Bot, Terminal, CheckCircle2, AlertTriangle, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { buildAdjacencyList, getNodeById } from '../../utils/networkValidator.js';

export function AgentConsole() {
  const {
    nodes,
    edges,
    sourceNode,
    destNode,
    selectedAlgorithm,
    searchResult,
    agentLogs,
    animState
  } = useTraffic();

  const activeNodeId = animState?.activeFrame ? animState.activeFrame.currentNode : (searchResult?.found ? destNode : sourceNode);
  const activeNodeObj = getNodeById(nodes, activeNodeId);
  const goalNodeObj = getNodeById(nodes, destNode);
  const sourceNodeObj = getNodeById(nodes, sourceNode);

  const adj = buildAdjacencyList(nodes, edges);
  const availableActions = adj[activeNodeId] || [];

  return (
    <div className="agent-console-card">
      <div className="card-header-clean">
        <div className="header-icon-title">
          <Bot size={20} className="accent-icon" />
          <h3 className="section-title">Intelligent Agent State Monitor</h3>
        </div>
        <span className="agent-type-badge">Goal-Based Agent</span>
      </div>

      {/* Primary Agent State Dashboard */}
      <div className="agent-state-grid">
        <div className="agent-state-box">
          <span className="state-box-label">Current State (Sensor)</span>
          <div className="state-box-value">
            <span className="node-pill current-node-pill">{activeNodeId}</span>
            <span className="node-subname">{activeNodeObj?.name || 'Unknown'}</span>
          </div>
        </div>

        <div className="agent-state-box">
          <span className="state-box-label">Goal State (Objective)</span>
          <div className="state-box-value">
            <span className="node-pill goal-node-pill">{destNode}</span>
            <span className="node-subname">{goalNodeObj?.name || 'Unknown'}</span>
          </div>
        </div>

        <div className="agent-state-box">
          <span className="state-box-label">Selected Search Strategy</span>
          <div className="state-box-value strategy-value">
            <Sparkles size={16} className="text-warning" />
            <span>{selectedAlgorithm}</span>
          </div>
        </div>

        <div className="agent-state-box">
          <span className="state-box-label">Agent Status</span>
          <div className="state-box-value status-value">
            {searchResult?.found ? (
              <span className="text-success flex-center">
                <CheckCircle2 size={16} /> Goal Reached
              </span>
            ) : searchResult?.errorMessage ? (
              <span className="text-danger flex-center">
                <AlertTriangle size={16} /> Path Blocked
              </span>
            ) : (
              <span className="text-info flex-center">
                <Eye size={16} /> Observing Environment
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Available Actions from Current Junction */}
      <div className="agent-actions-section">
        <span className="subsection-title">
          Available Transitions from Junction [{activeNodeId}]:
        </span>
        <div className="action-pills-row">
          {availableActions.length > 0 ? (
            availableActions.map((action, idx) => (
              <div key={idx} className="action-pill">
                <ArrowRight size={13} className="action-arrow" />
                <span className="action-dest">To [{action.node}]</span>
                <span className="action-metric">{action.distance} km</span>
                <span className="action-cost">({action.cost.toFixed(1)} min)</span>
              </div>
            ))
          ) : (
            <span className="no-actions-text">No outgoing roads available (Dead-end or Blocked).</span>
          )}
        </div>
      </div>

      {/* Live Agent Terminal / Decision Log */}
      <div className="agent-terminal-box">
        <div className="terminal-header">
          <Terminal size={14} />
          <span>Agent Perception & Reasoning Log</span>
        </div>
        <div className="terminal-log-body">
          {agentLogs.length > 0 ? (
            agentLogs.slice(-8).map((log, idx) => (
              <div key={idx} className={`terminal-log-line log-${log.type}`}>
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-tag">[{log.type.toUpperCase()}]</span>
                <span className="log-msg">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="terminal-empty">Agent initialized. Ready to perceive network state and execute search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
