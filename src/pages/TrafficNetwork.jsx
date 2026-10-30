import React, { useState } from 'react';
import { 
  Network, 
  Sliders, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Info, 
  Edit3,
  Search,
  ShieldBan
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext.jsx';
import { TrafficMapSVG } from '../components/map/TrafficMapSVG.jsx';
import { TrafficLegend } from '../components/map/TrafficLegend.jsx';
import { TRAFFIC_SCENARIOS } from '../data/trafficScenarios.js';
import { TRAFFIC_LEVELS, calculateEdgeCost, normalizeTrafficLevel } from '../utils/trafficCostModel.js';

export function TrafficNetwork() {
  const {
    nodes,
    edges,
    currentScenario,
    applyScenario,
    toggleEdgeBlocked,
    setEdgeTrafficLevel,
    resetNetwork
  } = useTraffic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEdgeForEdit, setSelectedEdgeForEdit] = useState(null);

  const filteredEdges = edges.filter(e => 
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.label && e.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container network-page">
      {/* Page Header Bar */}
      <div className="network-control-bar card-panel">
        <div className="control-bar-left">
          <div className="bar-title">
            <Network size={20} className="accent-icon" />
            <div>
              <h3>Road Network Environment Manager</h3>
              <p>Simulate dynamic traffic conditions, toggle accidental closures, and adjust speed limits.</p>
            </div>
          </div>
        </div>

        <div className="control-bar-right">
          <div className="scenario-pill-buttons">
            {Object.values(TRAFFIC_SCENARIOS).map((sc) => (
              <button
                key={sc.id}
                id={`scenario-btn-${sc.id}`}
                className={`scenario-btn ${currentScenario === sc.id ? 'active' : ''}`}
                onClick={() => applyScenario(sc.id)}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Edge Editor Table */}
      <div className="network-main-grid">
        {/* Left: Interactive SVG Canvas */}
        <div className="network-map-wrapper card-panel">
          <div className="panel-header">
            <h4>Metropolitan Topology (15 Junctions, 26 Bidirectional Roads)</h4>
            <span className="click-tip">Tip: Click any road on the map to cycle congestion level</span>
          </div>

          <TrafficMapSVG height="500px" interactive={true} />
          <TrafficLegend showDetailed={true} />
        </div>

        {/* Right: Edge Attributes Table & Editor */}
        <div className="network-editor-panel card-panel">
          <div className="panel-header">
            <div className="header-title-wrap">
              <Layers size={18} className="accent-icon" />
              <h4>Road Segments Inventory ({edges.length})</h4>
            </div>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                type="text"
                placeholder="Filter roads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="table-search-input"
              />
            </div>
          </div>

          <div className="edges-table-container">
            <table className="edges-data-table">
              <thead>
                <tr>
                  <th>Road ID</th>
                  <th>Segment Name</th>
                  <th>Distance</th>
                  <th>Speed</th>
                  <th>Congestion Level</th>
                  <th>Travel Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEdges.map((edge) => {
                  const costInfo = calculateEdgeCost(edge);
                  const normLevel = normalizeTrafficLevel(edge.trafficLevel);
                  const levelInfo = TRAFFIC_LEVELS[normLevel] || TRAFFIC_LEVELS.LOW;

                  return (
                    <tr key={edge.id} className={costInfo.isBlocked ? 'row-blocked' : ''}>
                      <td className="edge-id-cell">
                        <strong>{edge.source} ↔ {edge.destination}</strong>
                      </td>
                      <td className="edge-label-cell">{edge.label || 'Arterial'}</td>
                      <td>{edge.distance} km</td>
                      <td>{edge.speed} km/h</td>
                      <td>
                        <select
                          className="level-select-inline"
                          value={normLevel}
                          onChange={(e) => setEdgeTrafficLevel(edge.id, e.target.value)}
                          style={{
                            borderColor: levelInfo.color,
                            color: levelInfo.color,
                            backgroundColor: 'transparent'
                          }}
                        >
                          {Object.keys(TRAFFIC_LEVELS).map((lvlKey) => (
                            <option key={lvlKey} value={lvlKey}>
                              {TRAFFIC_LEVELS[lvlKey].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="cost-cell">
                        {costInfo.isBlocked ? (
                          <span className="text-danger flex-center">
                            <ShieldBan size={14} /> Closed
                          </span>
                        ) : (
                          <span>{costInfo.totalCost.toFixed(1)} min</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn-toggle-block ${costInfo.isBlocked ? 'is-blocked' : ''}`}
                          onClick={() => toggleEdgeBlocked(edge.id)}
                          title={costInfo.isBlocked ? 'Re-open road' : 'Simulate accident / close road'}
                        >
                          {costInfo.isBlocked ? 'Re-open' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
