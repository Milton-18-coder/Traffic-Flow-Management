import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { calculateEdgeCost, TRAFFIC_LEVELS, normalizeTrafficLevel } from '../../utils/trafficCostModel.js';
import { MapPin, Navigation, AlertOctagon, CheckCircle2, Sliders, Info, Car } from 'lucide-react';

export function TrafficMapSVG({ 
  interactive = true, 
  height = '520px', 
  showControls = true,
  customSelectedPath = null 
}) {
  const {
    nodes,
    edges,
    sourceNode,
    destNode,
    setSourceNode,
    setDestNode,
    selectedAlgorithm,
    executeSearch,
    toggleEdgeBlocked,
    cycleEdgeTraffic,
    searchResult,
    animState,
    updateNodePosition,
    liveVehicle,
    currentWeather
  } = useTraffic();

  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const svgRef = useRef(null);

  // Map active frames / path highlights
  const activeFrame = animState?.activeFrame;
  const isAnimating = animState?.isPlaying || animState?.isPaused;

  const currentActiveNode = isAnimating && activeFrame ? activeFrame.currentNode : null;
  const visitedNodeSet = useMemo(() => {
    if (isAnimating && activeFrame?.visited) {
      return new Set(activeFrame.visited);
    }
    if (searchResult?.nodesExplored) {
      return new Set(searchResult.nodesExplored);
    }
    return new Set();
  }, [isAnimating, activeFrame, searchResult]);

  const optimalPathNodes = useMemo(() => {
    if (customSelectedPath) return new Set(customSelectedPath);
    if (!isAnimating && searchResult?.found && searchResult?.path) {
      return new Set(searchResult.path);
    }
    return new Set();
  }, [customSelectedPath, isAnimating, searchResult]);

  const optimalPathEdges = useMemo(() => {
    if (customSelectedPath && customSelectedPath.length > 1) {
      const edgeIds = new Set();
      for (let i = 0; i < customSelectedPath.length - 1; i++) {
        const u = customSelectedPath[i];
        const v = customSelectedPath[i + 1];
        const edge = edges.find(
          e => (e.source === u && e.destination === v) || (e.source === v && e.destination === u)
        );
        if (edge) edgeIds.add(edge.id);
      }
      return edgeIds;
    }
    if (!isAnimating && searchResult?.found && searchResult?.pathEdges) {
      return new Set(searchResult.pathEdges);
    }
    return new Set();
  }, [customSelectedPath, isAnimating, searchResult, edges]);

  // Lookup node coordinates fast
  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [nodes]);

  // Handle Dragging Nodes on SVG
  const handleMouseDown = (e, nodeId) => {
    if (!interactive) return;
    e.stopPropagation();
    setDraggingNodeId(nodeId);
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = 1160 / svgRect.width;
    const scaleY = 620 / svgRect.height;
    const rawX = (e.clientX - svgRect.left) * scaleX;
    const rawY = (e.clientY - svgRect.top) * scaleY;
    const clampedX = Math.max(40, Math.min(1120, rawX));
    const clampedY = Math.max(40, Math.min(580, rawY));
    updateNodePosition(draggingNodeId, clampedX, clampedY);
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  return (
    <div 
      className="traffic-map-container" 
      style={{ minHeight: height }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        className="traffic-network-svg"
        viewBox="0 0 1160 620"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Neon Glow Filters */}
          <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-pulse" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grid Background Pattern */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
          </pattern>
        </defs>

        {/* Background Tech Grid */}
        <rect width="100%" height="100%" fill="url(#grid-pattern)" className="grid-bg-rect" />

        {/* Weather Overlay Indicator */}
        {currentWeather === 'RAIN' && (
          <g className="rain-effect-layer" opacity="0.3">
            {[...Array(25)].map((_, i) => (
              <line
                key={i}
                x1={(i * 48) % 1160}
                y1="0"
                x2={((i * 48) + 30) % 1160}
                y2="620"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="10 20"
              />
            ))}
          </g>
        )}

        {/* ================= EDGES (ROADS) ================= */}
        <g className="edges-layer">
          {edges.map((edge) => {
            const u = nodeMap[edge.source];
            const v = nodeMap[edge.destination];
            if (!u || !v) return null;

            const costInfo = calculateEdgeCost(edge, currentWeather);
            const normLevel = normalizeTrafficLevel(edge.trafficLevel);
            const levelInfo = TRAFFIC_LEVELS[normLevel] || TRAFFIC_LEVELS.LOW;
            const isPathEdge = optimalPathEdges.has(edge.id);
            const isBlocked = costInfo.isBlocked;
            const isHovered = hoveredEdge === edge.id;

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            let strokeColor = levelInfo.color;
            let strokeWidth = isPathEdge ? 7 : (isHovered ? 6 : 4);
            let strokeDash = isBlocked ? '8,6' : 'none';

            if (isPathEdge) {
              strokeColor = '#38bdf8';
            }

            return (
              <g 
                key={edge.id} 
                className={`edge-group ${isPathEdge ? 'optimal-path-edge' : ''} ${isBlocked ? 'edge-blocked' : ''}`}
                onMouseEnter={() => setHoveredEdge(edge.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => {
                  if (interactive && !draggingNodeId) {
                    cycleEdgeTraffic(edge.id);
                  }
                }}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
              >
                {/* Hit area */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Outer Glow */}
                {isPathEdge && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#38bdf8"
                    strokeWidth="12"
                    strokeOpacity="0.4"
                    filter="url(#glow-gold)"
                  />
                )}

                {/* Base Road Line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                  className="road-line"
                />

                {/* Animated Traffic Particles */}
                {!isBlocked && (
                  <circle r={isPathEdge ? 4 : 2.5} fill={isPathEdge ? '#ffffff' : levelInfo.color} opacity="0.9">
                    <animateMotion
                      path={`M ${u.x} ${u.y} L ${v.x} ${v.y}`}
                      dur={`${Math.max(1.5, costInfo.baseTime * 0.8)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Road Metric Badge (Midpoint) */}
                <g transform={`translate(${midX}, ${midY})`} className="edge-badge-group">
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="22"
                    rx="11"
                    className={`edge-badge-bg ${isPathEdge ? 'badge-path' : ''} ${isBlocked ? 'badge-blocked' : ''}`}
                    fill="var(--card-bg, #1e293b)"
                    stroke={isPathEdge ? '#38bdf8' : strokeColor}
                    strokeWidth={isHovered ? '2' : '1.2'}
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    className="edge-badge-text"
                    fill={strokeColor}
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {isBlocked ? 'BLOCKED' : `${edge.distance}k·${levelInfo.label.slice(0, 3)}`}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* ================= NODES (JUNCTIONS) ================= */}
        <g className="nodes-layer">
          {nodes.map((node) => {
            const isSource = node.id === sourceNode;
            const isGoal = node.id === destNode;
            const isCurrent = node.id === currentActiveNode;
            const isVisited = visitedNodeSet.has(node.id);
            const isPath = optimalPathNodes.has(node.id);
            const isHovered = hoveredNode === node.id;
            const isDragging = draggingNodeId === node.id;

            let nodeFill = 'var(--node-default-fill, #0f172a)';
            let nodeStroke = 'var(--node-default-stroke, #475569)';
            let radius = 22;

            if (isSource) {
              nodeFill = '#059669';
              nodeStroke = '#34d399';
              radius = 25;
            } else if (isGoal) {
              nodeFill = '#7c3aed';
              nodeStroke = '#a78bfa';
              radius = 25;
            } else if (isCurrent) {
              nodeFill = '#d97706';
              nodeStroke = '#fbbf24';
              radius = 26;
            } else if (isPath) {
              nodeFill = '#0284c7';
              nodeStroke = '#38bdf8';
              radius = 23;
            } else if (isVisited) {
              nodeFill = '#1e293b';
              nodeStroke = '#06b6d4';
            }

            return (
              <g
                key={node.id}
                className={`node-group ${isSource ? 'node-source' : ''} ${isGoal ? 'node-goal' : ''} ${isCurrent ? 'node-current' : ''} ${isDragging ? 'node-dragging' : ''}`}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (interactive && !isDragging) {
                    setSelectedElement({ type: 'node', id: node.id });
                  }
                }}
                style={{ cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                {/* Pulsing Ring */}
                {(isCurrent || isSource || isGoal) && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={nodeStroke}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    className="pulse-node-ring"
                  />
                )}

                {/* Node Outer Drop Glow */}
                {(isPath || isSource || isGoal) && (
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke={nodeStroke}
                    strokeWidth="3"
                    strokeOpacity="0.6"
                    filter="url(#glow-cyan)"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={isHovered || isPath || isSource || isGoal ? '3' : '2'}
                  className="node-circle"
                />

                {/* Node ID Letter */}
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="15"
                  fontWeight="700"
                  fontFamily="Outfit, sans-serif"
                  pointerEvents="none"
                >
                  {node.id}
                </text>

                {/* Role Pill Label on top of node */}
                {isSource && (
                  <g transform="translate(0, -32)">
                    <rect x="-24" y="-8" width="48" height="16" rx="8" fill="#059669" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
                      START
                    </text>
                  </g>
                )}
                {isGoal && (
                  <g transform="translate(0, -32)">
                    <rect x="-22" y="-8" width="44" height="16" rx="8" fill="#7c3aed" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
                      GOAL
                    </text>
                  </g>
                )}

                {/* Junction Name Subtitle */}
                <text
                  x="0"
                  y={radius + 15}
                  textAnchor="middle"
                  className="node-label-sub"
                  fill="var(--text-secondary, #94a3b8)"
                  fontSize="10.5"
                  fontWeight="500"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* ================= LIVE EN-ROUTE VEHICLE AGENT ================= */}
        {liveVehicle?.active && (
          <g transform={`translate(${liveVehicle.x}, ${liveVehicle.y})`} className="live-vehicle-marker">
            {/* Pulsing Radar Ring */}
            <circle r="22" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" className="pulse-node-ring" />
            <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" filter="url(#glow-gold)" />
            {/* Mini Car Icon representation */}
            <circle r="6" fill="#fbbf24" />
            <g transform="translate(0, -20)">
              <rect x="-30" y="-7" width="60" height="14" rx="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="700">
                AGENT CAR
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Node Action Floating Quick-Menu */}
      {selectedElement && selectedElement.type === 'node' && (
        <div className="node-quick-popover">
          <div className="popover-header">
            <strong>Junction {selectedElement.id}</strong>: {nodeMap[selectedElement.id]?.name}
            <button className="popover-close" onClick={() => setSelectedElement(null)}>✕</button>
          </div>
          <p className="popover-desc">{nodeMap[selectedElement.id]?.desc}</p>
          <div className="popover-actions">
            <button
              className="popover-btn set-source"
              onClick={() => {
                setSourceNode(selectedElement.id);
                setSelectedElement(null);
                executeSearch(selectedAlgorithm, selectedElement.id, destNode);
              }}
            >
              <MapPin size={13} /> Set as Source [S]
            </button>
            <button
              className="popover-btn set-dest"
              onClick={() => {
                setDestNode(selectedElement.id);
                setSelectedElement(null);
                executeSearch(selectedAlgorithm, sourceNode, selectedElement.id);
              }}
            >
              <Navigation size={13} /> Set as Goal [G]
            </button>
          </div>
        </div>
      )}

      {/* Interactive Helper Overlay hint */}
      {interactive && showControls && (
        <div className="map-interaction-hint">
          <Info size={13} />
          <span><strong>Drag & Drop</strong> any Junction circle to dynamically modify layout. Click roads to cycle congestion or block.</span>
        </div>
      )}
    </div>
  );
}
