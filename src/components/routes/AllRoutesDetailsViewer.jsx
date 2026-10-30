import React, { useState } from 'react';
import { 
  Award, 
  XCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Layers, 
  Clock, 
  ArrowRight, 
  ShieldBan, 
  MapPin, 
  Navigation,
  Eye,
  SlidersHorizontal,
  Flame,
  Info
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { formatMinutes, formatDistance, TRAFFIC_LEVELS } from '../../utils/trafficCostModel.js';

export function AllRoutesDetailsViewer({ onHighlightRoute, highlightedPath }) {
  const {
    sourceNode,
    destNode,
    combinatorialRoutes,
    searchResult
  } = useTraffic();

  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, FEASIBLE, BOTTLENECK

  const toggleExpand = (routeId) => {
    setExpandedRouteId(prev => prev === routeId ? null : routeId);
  };

  const bestRoute = combinatorialRoutes.find(r => r.isOptimal) || combinatorialRoutes[0];

  const filteredRoutes = combinatorialRoutes.filter(route => {
    if (filterMode === 'FEASIBLE') return !route.hasBlockedEdge;
    if (filterMode === 'BOTTLENECK') return route.bottlenecks.length > 0;
    return true;
  });

  return (
    <div className="all-routes-viewer-card card-panel">
      {/* Header Bar */}
      <div className="panel-header">
        <div className="header-title-wrap">
          <Layers size={20} className="accent-icon" />
          <div>
            <h3>All Discovered Candidate Routes & Agent Decision Rationales</h3>
            <p className="panel-sub">
              Granular road-segment breakdown of all candidate paths from <strong>Junction [{sourceNode}]</strong> to <strong>Junction [{destNode}]</strong> with rejection reasons.
            </p>
          </div>
        </div>

        <div className="route-filters-row">
          <span className="filter-label">Filter:</span>
          {['ALL', 'FEASIBLE', 'BOTTLENECK'].map(mode => (
            <button
              key={mode}
              className={`filter-pill-btn ${filterMode === mode ? 'active' : ''}`}
              onClick={() => setFilterMode(mode)}
            >
              {mode} ({mode === 'ALL' ? combinatorialRoutes.length : combinatorialRoutes.filter(r => mode === 'FEASIBLE' ? !r.hasBlockedEdge : r.bottlenecks.length > 0).length})
            </button>
          ))}
        </div>
      </div>

      {/* 1. HIGHLIGHTED BEST PATH (OPTIMAL CHOICE) */}
      {bestRoute && (
        <div className="best-path-hero-box">
          <div className="best-hero-header">
            <div className="best-badge-wrap">
              <Award size={20} className="best-trophy-icon" />
              <div>
                <span className="best-hero-tag">#1 SELECTED OPTIMAL ROUTE</span>
                <h4 className="best-route-title">{bestRoute.pathString}</h4>
              </div>
            </div>

            <div className="best-hero-metrics">
              <div className="hero-metric-item">
                <span className="h-metric-label">Travel Time</span>
                <span className="h-metric-val text-warning font-bold">{formatMinutes(bestRoute.travelTime)}</span>
              </div>
              <div className="hero-metric-item">
                <span className="h-metric-label">Distance</span>
                <span className="h-metric-val">{formatDistance(bestRoute.distance)}</span>
              </div>
              <div className="hero-metric-item">
                <span className="h-metric-label">Hops</span>
                <span className="h-metric-val text-info">{bestRoute.edgeCount} Roads</span>
              </div>
            </div>
          </div>

          {/* Selection Rationale */}
          <div className="selection-rationale-box">
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
            <div className="rationale-text">
              <strong>Why Agent Selected This Route:</strong>
              <p>{bestRoute.selectionReason}</p>
            </div>
          </div>

          {/* Path Segment Flow */}
          <div className="path-segment-flow">
            {bestRoute.segments.map((seg, sIdx) => {
              const lvlInfo = TRAFFIC_LEVELS[seg.trafficLevel] || TRAFFIC_LEVELS.LOW;
              return (
                <div key={sIdx} className="segment-step-pill">
                  <div className="step-nodes">
                    <strong>{seg.from}</strong> → <strong>{seg.to}</strong>
                  </div>
                  <div className="step-meta">
                    <span>{seg.distance}km</span>
                    <span className="step-level-tag" style={{ color: lvlInfo.color }}>
                      {lvlInfo.label} (×{seg.multiplier})
                    </span>
                    <span className="step-time">{seg.travelTime.toFixed(1)}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ALL CANDIDATE ROUTES LIST WITH REJECTION REASONS */}
      <div className="candidate-routes-list-container">
        <h4 className="list-section-heading">
          Alternative Candidate Routes ({filteredRoutes.length} Discovered Paths)
        </h4>

        {filteredRoutes.map((route, idx) => {
          const isOptimal = route.isOptimal;
          const isExpanded = expandedRouteId === route.id;
          const isInspected = highlightedPath && highlightedPath.join(' → ') === route.pathString;

          return (
            <div 
              key={route.id}
              className={`route-candidate-card ${isOptimal ? 'card-optimal' : 'card-alternative'} ${isInspected ? 'card-inspected' : ''}`}
            >
              <div className="candidate-card-header" onClick={() => toggleExpand(route.id)}>
                <div className="candidate-header-left">
                  <span className={`rank-tag ${isOptimal ? 'rank-tag-best' : 'rank-tag-alt'}`}>
                    #{route.rank}
                  </span>
                  <div>
                    <h5 className="candidate-path-seq">{route.pathString}</h5>
                    <div className="candidate-quick-badges">
                      <span className="quick-badge">
                        <Clock size={12} /> {route.hasBlockedEdge ? 'BLOCKED' : formatMinutes(route.travelTime)}
                      </span>
                      <span className="quick-badge">{formatDistance(route.distance)}</span>
                      <span className="quick-badge">{route.edgeCount} hops</span>
                      {route.bottlenecks.length > 0 && (
                        <span className="quick-badge badge-bottleneck">
                          <Flame size={12} /> {route.bottlenecks.length} bottleneck{route.bottlenecks.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {route.hasBlockedEdge && (
                        <span className="quick-badge badge-closed">
                          <ShieldBan size={12} /> Closed Road
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="candidate-header-right">
                  <button
                    className="btn-map-highlight"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onHighlightRoute) onHighlightRoute(route.path);
                    }}
                    title="Highlight path on SVG road network"
                  >
                    <Eye size={13} />
                    <span>{isInspected ? 'Active on Map' : 'View on Map'}</span>
                  </button>

                  <button className="btn-expand-toggle">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* REJECTION REASON BANNER (For non-optimal routes) */}
              {!isOptimal && route.rejectionReason && (
                <div className="rejection-reason-banner">
                  <div className="rejection-icon">
                    <XCircle size={15} />
                  </div>
                  <div className="rejection-body">
                    <strong>Agent Decision: </strong>
                    <span>{route.rejectionReason}</span>
                  </div>
                </div>
              )}

              {/* EXPANDED GRANULAR SEGMENT DETAILS */}
              {isExpanded && (
                <div className="route-expanded-details">
                  <h6 className="segment-table-title">Individual Road Segments Breakdown:</h6>
                  <div className="table-responsive">
                    <table className="segments-detail-table">
                      <thead>
                        <tr>
                          <th>Segment</th>
                          <th>Corridor Name</th>
                          <th>Length</th>
                          <th>Speed Limit</th>
                          <th>Congestion Level</th>
                          <th>Multiplier</th>
                          <th>Free-Flow Time</th>
                          <th>Congested Time</th>
                          <th>Delay Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {route.segments.map((seg, sIdx) => {
                          const lvlInfo = TRAFFIC_LEVELS[seg.trafficLevel] || TRAFFIC_LEVELS.LOW;
                          return (
                            <tr key={sIdx} className={seg.isBlocked ? 'row-seg-blocked' : ''}>
                              <td><strong>{seg.from} ↔ {seg.to}</strong></td>
                              <td>{seg.roadName}</td>
                              <td>{seg.distance} km</td>
                              <td>{seg.speed} km/h</td>
                              <td>
                                <span className="traffic-tag" style={{ color: lvlInfo.color, borderColor: lvlInfo.color }}>
                                  {lvlInfo.label}
                                </span>
                              </td>
                              <td className="mono-font">×{seg.multiplier === Infinity ? '∞' : seg.multiplier}</td>
                              <td>{seg.baseTime.toFixed(1)} min</td>
                              <td>{seg.isBlocked ? '∞' : `${seg.travelTime.toFixed(1)} min`}</td>
                              <td>
                                {seg.isBlocked ? (
                                  <span className="text-danger">Closed</span>
                                ) : seg.delayAdded > 0 ? (
                                  <span className="text-warning font-bold">+{seg.delayAdded} min</span>
                                ) : (
                                  <span className="text-success">0.0 min (No Delay)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
