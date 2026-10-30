import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { calculateEdgeCost, TRAFFIC_LEVELS, normalizeTrafficLevel } from '../../utils/trafficCostModel.js';
import { MapPin, Navigation, ArrowRight, Layers, Radio, PlusCircle, Sparkles } from 'lucide-react';
import {
  getEdgeRoadCoordinates,
  getFullRouteRoadCoordinates,
  interpolatePositionAlongRoad,
  subscribeRoadGeometryUpdates
} from '../../utils/roadGeometryService.js';

// Real-Time Map Tile Providers (Google Maps with Live Traffic, Satellite Hybrid, Streets, Terrain, Dark, OSM)
export const MAP_LAYERS = {
  google_hybrid_traffic: {
    id: 'google_hybrid_traffic',
    name: 'Google Hybrid (Live Traffic)',
    shortName: 'Satellite + Traffic',
    icon: '🛰️',
    url: 'https://mt{s}.google.com/vt/lyrs=y,traffic&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    hasTraffic: true,
    attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> Live Traffic'
  },
  google_roads_traffic: {
    id: 'google_roads_traffic',
    name: 'Google Roads (Live Traffic)',
    shortName: 'Roads + Traffic',
    icon: '🚦',
    url: 'https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    hasTraffic: true,
    attribution: '&copy; <a href="https://maps.google.com">Google Maps</a> Live Traffic'
  },
  google_roadmap: {
    id: 'google_roadmap',
    name: 'Google Standard Roadmap',
    shortName: 'Google Streets',
    icon: '🗺️',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    hasTraffic: false,
    attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
  },
  google_terrain: {
    id: 'google_terrain',
    name: 'Google Terrain (Traffic)',
    shortName: 'Terrain',
    icon: '🏞️',
    url: 'https://mt{s}.google.com/vt/lyrs=p,traffic&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    hasTraffic: true,
    attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
  },
  dark_canvas: {
    id: 'dark_canvas',
    name: 'Carto / Dark Mode Canvas',
    shortName: 'Dark Canvas',
    icon: '🌙',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server', 'services'],
    maxZoom: 19,
    hasTraffic: false,
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Standard',
    shortName: 'OSM',
    icon: '🌍',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    hasTraffic: false,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

// Custom Map Click Handler Component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Custom Marker Icons for Leaflet
function createCustomMarkerIcon(nodeId, isSource, isGoal, isPath, isVisited) {
  let bgColor = '#0f172a';
  let borderColor = '#475569';
  let badgeText = '';

  if (isSource) {
    bgColor = '#059669';
    borderColor = '#34d399';
    badgeText = '<span style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:#059669;color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:6px;">START</span>';
  } else if (isGoal) {
    bgColor = '#7c3aed';
    borderColor = '#a78bfa';
    badgeText = '<span style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:6px;">GOAL</span>';
  } else if (isPath) {
    bgColor = '#0284c7';
    borderColor = '#38bdf8';
  } else if (isVisited) {
    bgColor = '#1e293b';
    borderColor = '#06b6d4';
  }

  const html = `
    <div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
      ${badgeText}
      <div style="
        width:28px;
        height:28px;
        background:${bgColor};
        border:3px solid ${borderColor};
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#fff;
        font-weight:800;
        font-size:12px;
        font-family:'Outfit',sans-serif;
        box-shadow:0 0 12px ${borderColor}80;
      ">
        ${nodeId}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-node-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
}

// Vehicle Marker Icon with Directional Bearing Pointer
function createVehicleIcon(bearing = 0) {
  return L.divIcon({
    html: `
      <div style="
        width:34px;
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        transform: rotate(${Math.round(bearing)}deg);
        transition: transform 0.15s ease-out;
      ">
        <div style="
          width:28px;
          height:28px;
          background:#0284c7;
          border:2px solid #ffffff;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 0 16px #38bdf8, 0 3px 6px rgba(0,0,0,0.5);
          position:relative;
        ">
          <div style="
            position:absolute;
            top:-4px;
            width:0;
            height:0;
            border-left:4px solid transparent;
            border-right:4px solid transparent;
            border-bottom:6px solid #fbbf24;
          "></div>
          <span style="font-size:13px;line-height:1;">🚗</span>
        </div>
      </div>
    `,
    className: 'custom-leaflet-vehicle-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

// Map View Recenter Controller
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Map Size & Resize Auto-Invalidator (Eliminates empty card space and forces 100% tile rendering)
function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);
    const t4 = setTimeout(() => map.invalidateSize(), 1000);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);
  return null;
}

export function RealTimeLeafletMap({ customSelectedPath = null, height = '500px' }) {
  const {
    nodes,
    edges,
    sourceNode,
    destNode,
    setSourceNode,
    setDestNode,
    selectedAlgorithm,
    executeSearch,
    cycleEdgeTraffic,
    searchResult,
    theme,
    currentWeather,
    liveVehicle,
    addCustomLocationOrSelect
  } = useTraffic();

  const centerCoords = useMemo(() => [11.1271, 78.6569], []); // Tamil Nadu, India Geographic Center

  const [clickedPoint, setClickedPoint] = useState(null);
  const [customPointName, setCustomPointName] = useState('');

  const nodeMap = useMemo(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [nodes]);

  const optimalPathNodes = useMemo(() => {
    if (customSelectedPath) return new Set(customSelectedPath);
    if (searchResult?.found && searchResult?.path) return new Set(searchResult.path);
    return new Set();
  }, [customSelectedPath, searchResult]);

  const optimalPathEdges = useMemo(() => {
    const targetPath = customSelectedPath || (searchResult?.found ? searchResult.path : []);
    if (targetPath.length < 2) return new Set();
    const edgeIds = new Set();
    for (let i = 0; i < targetPath.length - 1; i++) {
      const u = targetPath[i];
      const v = targetPath[i + 1];
      const edge = edges.find(
        e => (e.source === u && e.destination === v) || (e.source === v && e.destination === u)
      );
      if (edge) edgeIds.add(edge.id);
    }
    return edgeIds;
  }, [customSelectedPath, searchResult, edges]);

  // Road Snapping Toggle & Dynamic Geometry Revision Listener
  const [snapToRoads, setSnapToRoads] = useState(true);
  const [geometryRevision, setGeometryRevision] = useState(0);

  useEffect(() => {
    return subscribeRoadGeometryUpdates(() => {
      setGeometryRevision(r => r + 1);
    });
  }, []);

  // Compute active multi-hop route nodes
  const activeRouteNodes = useMemo(() => {
    if (customSelectedPath && customSelectedPath.length > 0) return customSelectedPath;
    if (searchResult?.found && searchResult?.path) return searchResult.path;
    return [];
  }, [customSelectedPath, searchResult]);

  // Compute continuous highway coordinates respecting real roads
  const optimalRouteCoordinates = useMemo(() => {
    if (activeRouteNodes.length < 2) return [];
    if (!snapToRoads) {
      return activeRouteNodes
        .map(id => nodeMap[id])
        .filter(n => n && n.lat && n.lng)
        .map(n => [n.lat, n.lng]);
    }
    return getFullRouteRoadCoordinates(activeRouteNodes, nodeMap);
  }, [snapToRoads, activeRouteNodes, nodeMap, geometryRevision]);

  // Interpolate vehicle GPS position & heading along real road geometry
  const vehicleState = useMemo(() => {
    if (!liveVehicle?.active || liveVehicle.path.length < 2) return null;
    const currId = liveVehicle.path[liveVehicle.pathIndex];
    const nextId = liveVehicle.path[liveVehicle.pathIndex + 1];
    const curr = nodeMap[currId];
    const next = nodeMap[nextId];
    if (!curr || !next) return null;

    if (snapToRoads) {
      const segmentCoords = getEdgeRoadCoordinates(currId, nextId, curr, next);
      const interpolated = interpolatePositionAlongRoad(segmentCoords, liveVehicle.progress);
      if (interpolated) {
        return {
          position: [interpolated.lat, interpolated.lng],
          bearing: interpolated.bearing
        };
      }
    }

    const lat = curr.lat + (next.lat - curr.lat) * liveVehicle.progress;
    const lng = curr.lng + (next.lng - curr.lng) * liveVehicle.progress;
    return {
      position: [lat, lng],
      bearing: 0
    };
  }, [liveVehicle, nodeMap, snapToRoads, geometryRevision]);

  // Active Tile Layer State (Default: Google Maps Hybrid with Live Traffic)
  const [activeLayerId, setActiveLayerId] = useState(() => {
    return localStorage.getItem('app_selected_map_layer') || 'google_hybrid_traffic';
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const handleSelectLayer = (layerId) => {
    setActiveLayerId(layerId);
    localStorage.setItem('app_selected_map_layer', layerId);
  };

  const currentLayer = MAP_LAYERS[activeLayerId] || MAP_LAYERS.google_hybrid_traffic;

  const handleMapClick = (latlng) => {
    setClickedPoint(latlng);
    setCustomPointName(`Custom Location (${latlng.lat.toFixed(2)}°N, ${latlng.lng.toFixed(2)}°E)`);
  };

  return (
    <div className="leaflet-map-wrapper relative-map-container" style={{ height }}>
      {/* Floating Layer & Google Traffic Switcher Overlay */}
      <div className="map-floating-overlay-bar">
        <div className="map-layer-badge-group">
          {currentLayer.hasTraffic && (
            <span className="live-traffic-tag">
              <span className="traffic-pulse-dot" />
              Google Live Traffic Active
            </span>
          )}

          {/* Real Highway Road Snapping Toggle */}
          <button
            id="toggle-road-snap-btn"
            type="button"
            className={`road-snap-toggle-btn ${snapToRoads ? 'active' : ''}`}
            onClick={() => setSnapToRoads(!snapToRoads)}
            title={snapToRoads ? 'Road Snapping: Following real-world highway curves (NH-48, NH-45, NH-44, NH-544, ECR)' : 'Road Snapping OFF: Direct straight lines'}
          >
            <span>🛣️ Real Roads: {snapToRoads ? 'ON' : 'OFF'}</span>
          </button>
          
          {/* Layer Switcher Dropdown / Pill Group */}
          <div className="layer-selector-wrap">
            <button
              id="map-layer-selector-btn"
              type="button"
              className="map-layer-pill-btn"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              title="Change Map Tiles & Layer View"
            >
              <Layers size={14} />
              <span>{currentLayer.icon} {currentLayer.shortName}</span>
            </button>

            {showLayerMenu && (
              <div className="map-layer-dropdown-menu">
                <div className="dropdown-menu-header">
                  <span>🗺️ Google Maps & Tile Providers</span>
                </div>
                {Object.values(MAP_LAYERS).map((layer) => (
                  <button
                    key={layer.id}
                    id={`layer-option-${layer.id}`}
                    className={`layer-option-btn ${activeLayerId === layer.id ? 'active' : ''}`}
                    onClick={() => {
                      handleSelectLayer(layer.id);
                      setShowLayerMenu(false);
                    }}
                  >
                    <span className="layer-opt-icon">{layer.icon}</span>
                    <div className="layer-opt-text">
                      <span className="layer-opt-title">{layer.name}</span>
                      {layer.hasTraffic && <span className="layer-opt-badge">Real-time Traffic</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <MapContainer
        center={centerCoords}
        zoom={7}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: height || '480px', borderRadius: '12px' }}
      >
        <ChangeView center={centerCoords} zoom={7} />
        <MapInvalidator />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Dynamic Real-Time Google Maps / OSM Tile Layer */}
        <TileLayer
          key={currentLayer.id}
          attribution={currentLayer.attribution}
          url={currentLayer.url}
          subdomains={currentLayer.subdomains || ['0', '1', '2', '3']}
          maxZoom={currentLayer.maxZoom || 20}
        />

        {/* ================= INTERACTIVE CLICKED CUSTOM LOCATION POPUP ================= */}
        {clickedPoint && (
          <Popup
            position={[clickedPoint.lat, clickedPoint.lng]}
            onClose={() => setClickedPoint(null)}
          >
            <div style={{ fontFamily: 'sans-serif', padding: '6px', minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>📍</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tamil Nadu Location</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Coordinates: <b>{clickedPoint.lat.toFixed(4)}° N, {clickedPoint.lng.toFixed(4)}° E</b>
              </div>
              <input
                type="text"
                value={customPointName}
                onChange={(e) => setCustomPointName(e.target.value)}
                placeholder="Name this location..."
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  marginBottom: '8px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  id="set-custom-start-btn"
                  onClick={() => {
                    addCustomLocationOrSelect(customPointName || 'Custom Start', clickedPoint.lat, clickedPoint.lng, 'SOURCE');
                    setClickedPoint(null);
                  }}
                  style={{
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <MapPin size={12} /> Set as Start Point [📍 S]
                </button>
                <button
                  id="set-custom-goal-btn"
                  onClick={() => {
                    addCustomLocationOrSelect(customPointName || 'Custom Goal', clickedPoint.lat, clickedPoint.lng, 'GOAL');
                    setClickedPoint(null);
                  }}
                  style={{
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#7c3aed',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Navigation size={12} /> Set as Goal Destination [🎯 G]
                </button>
              </div>
            </div>
          </Popup>
        )}

        {/* ================= REAL-TIME ROAD POLYLINES ================= */}
        {edges.map((edge) => {
          const u = nodeMap[edge.source];
          const v = nodeMap[edge.destination];
          if (!u || !v || !u.lat || !v.lat) return null;

          const costInfo = calculateEdgeCost(edge, currentWeather);
          const normLevel = normalizeTrafficLevel(edge.trafficLevel);
          const levelInfo = TRAFFIC_LEVELS[normLevel] || TRAFFIC_LEVELS.LOW;
          const isPathEdge = optimalPathEdges.has(edge.id);
          const isBlocked = costInfo.isBlocked;

          let color = levelInfo.color;
          let weight = isPathEdge ? 7 : 4;
          let opacity = isPathEdge ? 1 : 0.75;
          let dashArray = isBlocked ? '8, 8' : undefined;

          if (isPathEdge) {
            color = '#38bdf8';
          }

          const positions = snapToRoads
            ? getEdgeRoadCoordinates(edge.source, edge.destination, u, v)
            : [[u.lat, u.lng], [v.lat, v.lng]];

          return (
            <React.Fragment key={edge.id}>
              {/* Outer Glow Polyline for Selected Path */}
              {isPathEdge && (
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 12,
                    opacity: 0.35,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )}

              {/* Base Road Polyline */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight,
                  opacity,
                  dashArray,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                eventHandlers={{
                  click: () => cycleEdgeTraffic(edge.id)
                }}
              >
                <Tooltip sticky>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>
                    <strong>{edge.source} ↔ {edge.destination}</strong>: {edge.label || 'Road Segment'}<br />
                    Distance: {edge.distance} km | Speed: {edge.speed} km/h<br />
                    Traffic: <span style={{ color: levelInfo.color }}>{levelInfo.label}</span> (×{costInfo.multiplier})<br />
                    Time: {isBlocked ? 'BLOCKED' : `${costInfo.totalCost.toFixed(1)} min`}<br />
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Click road to cycle traffic level</span>
                  </div>
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* ================= DEDICATED CONTINUOUS OPTIMAL ROUTE HIGHWAY RIBBON ================= */}
        {optimalRouteCoordinates.length >= 2 && (
          <>
            {/* Outer Glowing Neon Halo */}
            <Polyline
              positions={optimalRouteCoordinates}
              pathOptions={{
                color: '#0284c7',
                weight: 14,
                opacity: 0.45,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Core Highway Route Ribbon */}
            <Polyline
              positions={optimalRouteCoordinates}
              pathOptions={{
                color: '#38bdf8',
                weight: 6,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* White Road Center Guidance Dash */}
            <Polyline
              positions={optimalRouteCoordinates}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                opacity: 0.9,
                dashArray: '10, 10',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* ================= REAL-TIME JUNCTION MARKERS ================= */}
        {nodes.map((node) => {
          if (!node.lat || !node.lng) return null;

          const isSource = node.id === sourceNode;
          const isGoal = node.id === destNode;
          const isPath = optimalPathNodes.has(node.id);
          const isVisited = searchResult?.nodesExplored?.includes(node.id);

          const icon = createCustomMarkerIcon(node.id, isSource, isGoal, isPath, isVisited);

          return (
            <Marker
              key={node.id}
              position={[node.lat, node.lng]}
              icon={icon}
            >
              <Popup>
                <div className="leaflet-popup-content-box">
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700 }}>
                    Junction [{node.id}]: {node.name}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                    {node.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="popover-btn set-source"
                      onClick={() => {
                        setSourceNode(node.id);
                        executeSearch(selectedAlgorithm, node.id, destNode);
                      }}
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', border: 'none', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <MapPin size={12} /> Set as Source [S]
                    </button>
                    <button
                      className="popover-btn set-dest"
                      onClick={() => {
                        setDestNode(node.id);
                        executeSearch(selectedAlgorithm, sourceNode, node.id);
                      }}
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', border: 'none', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Navigation size={12} /> Set as Goal [G]
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ================= LIVE EN-ROUTE VEHICLE ================= */}
        {liveVehicle?.active && vehicleState && (
          <Marker position={vehicleState.position} icon={createVehicleIcon(vehicleState.bearing)}>
            <Tooltip permanent direction="top" offset={[0, -18]}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>
                🚗 Autonomous Agent En-Route ({Math.round(vehicleState.bearing)}°)
              </span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
