import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { calculateEdgeCost, TRAFFIC_LEVELS, normalizeTrafficLevel } from '../../utils/trafficCostModel.js';
import { MapPin, Navigation, Key, Sparkles, AlertTriangle, Layers, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getEdgeRoadCoordinates, interpolatePositionAlongRoad } from '../../utils/roadGeometryService.js';

// Google Maps Night / Dark Mode Style Definition
const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#132e27' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#293548' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#081e36' }] }
];

export function GoogleMapsView({ customSelectedPath = null, height = '500px', onSwitchToOpenStreetMap }) {
  const {
    nodes,
    edges,
    sourceNode,
    destNode,
    setSourceNode,
    setDestNode,
    cycleEdgeTraffic,
    searchResult,
    theme,
    currentWeather,
    liveVehicle,
    showToast
  } = useTraffic();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef([]);
  const vehicleMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const trafficLayerRef = useRef(null);

  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('user_google_maps_api_key') || '';
  });
  const [manualKeyInput, setManualKeyInput] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);

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

  // Save manual API key
  const handleSaveApiKey = () => {
    if (!manualKeyInput.trim()) return;
    const cleanKey = manualKeyInput.trim();
    localStorage.setItem('user_google_maps_api_key', cleanKey);
    setApiKey(cleanKey);
    setLoadError(null);
    showToast('API Key Saved', 'Loading Google Maps Platform with your API key...', 'info');
  };

  // Initialize Google Maps API
  useEffect(() => {
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_google_maps_api_key_here') {
      setIsLoaded(false);
      return;
    }

    let isMounted = true;
    const loader = new Loader({
      apiKey: apiKey.trim(),
      version: 'weekly',
      libraries: ['places']
    });

    loader
      .load()
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        const mapOptions = {
          center: { lat: 11.1271, lng: 78.6569 }, // Tamil Nadu, India
          zoom: 7,
          mapTypeId: 'roadmap',
          styles: theme === 'dark' ? GOOGLE_MAPS_DARK_STYLE : [],
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true
        };

        const map = new google.maps.Map(mapContainerRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Initialize Google Live Traffic Layer
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
        trafficLayerRef.current = trafficLayer;

        infoWindowRef.current = new google.maps.InfoWindow();

        setIsLoaded(true);
        setLoadError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Google Maps Load Error:', err);
        setLoadError(err.message || 'Failed to authenticate Google Maps API key. Check billing and key restrictions.');
        setIsLoaded(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, theme]);

  // Toggle Live Google Traffic Layer
  const toggleTrafficLayer = () => {
    if (!trafficLayerRef.current || !mapInstanceRef.current) return;
    if (showTrafficLayer) {
      trafficLayerRef.current.setMap(null);
      setShowTrafficLayer(false);
    } else {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
      setShowTrafficLayer(true);
    }
  };

  // Render Markers and Polylines on Google Map
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !window.google) return;
    const google = window.google;
    const map = mapInstanceRef.current;

    // 1. Clear existing polylines
    polylinesRef.current.forEach(poly => poly.setMap(null));
    polylinesRef.current = [];

    // Lookup node coords
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // 2. Draw Network Edges with Traffic Colors
    edges.forEach(edge => {
      const u = nodeMap[edge.source];
      const v = nodeMap[edge.destination];
      if (!u || !v || !u.lat || !v.lat) return;

      const costInfo = calculateEdgeCost(edge, currentWeather);
      const normLevel = normalizeTrafficLevel(edge.trafficLevel);
      const levelInfo = TRAFFIC_LEVELS[normLevel] || TRAFFIC_LEVELS.LOW;
      const isPathEdge = optimalPathEdges.has(edge.id);
      const isBlocked = costInfo.isBlocked;

      let strokeColor = levelInfo.color;
      let strokeWeight = isPathEdge ? 7 : 4;
      let strokeOpacity = isPathEdge ? 1.0 : 0.85;

      const roadCoords = getEdgeRoadCoordinates(edge.source, edge.destination, u, v);
      const roadPath = roadCoords.length > 0
        ? roadCoords.map(([lat, lng]) => ({ lat, lng }))
        : [{ lat: u.lat, lng: u.lng }, { lat: v.lat, lng: v.lng }];

      if (isPathEdge) {
        strokeColor = '#38bdf8'; // Electric Cyan for optimal path
        
        // Outer glow polyline for optimal route
        const glowPoly = new google.maps.Polyline({
          path: roadPath,
          geodesic: true,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.35,
          strokeWeight: 14,
          map
        });
        polylinesRef.current.push(glowPoly);
      }

      const polyline = new google.maps.Polyline({
        path: roadPath,
        geodesic: true,
        strokeColor,
        strokeOpacity,
        strokeWeight,
        icons: isBlocked ? [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
          offset: '0',
          repeat: '15px'
        }] : undefined,
        map
      });

      // Hover / Click to cycle traffic
      polyline.addListener('click', (e) => {
        cycleEdgeTraffic(edge.id);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family:sans-serif;padding:6px;color:#0f172a;">
              <strong style="font-size:13px;">${edge.source} ↔ ${edge.destination}</strong>: ${edge.label || 'Road Segment'}<br/>
              Distance: <b>${edge.distance} km</b> | Speed: <b>${edge.speed} km/h</b><br/>
              Traffic Status: <b style="color:${levelInfo.color}">${levelInfo.label}</b> (×${costInfo.multiplier})<br/>
              Travel Time: <b>${isBlocked ? 'BLOCKED (Closed)' : `${costInfo.totalCost.toFixed(1)} min`}</b><br/>
              <span style="font-size:11px;color:#64748b;">(Click road to cycle traffic level)</span>
            </div>
          `);
          infoWindowRef.current.setPosition(e.latLng);
          infoWindowRef.current.open(map);
        }
      });

      polylinesRef.current.push(polyline);
    });

    // 3. Draw / Update Markers for 15 Junctions
    nodes.forEach(node => {
      if (!node.lat || !node.lng) return;

      const isSource = node.id === sourceNode;
      const isGoal = node.id === destNode;
      const isPath = optimalPathNodes.has(node.id);

      let pinColor = '#0f172a';
      let strokeColor = '#475569';
      let scale = 16;

      if (isSource) {
        pinColor = '#059669';
        strokeColor = '#34d399';
        scale = 19;
      } else if (isGoal) {
        pinColor = '#7c3aed';
        strokeColor = '#a78bfa';
        scale = 19;
      } else if (isPath) {
        pinColor = '#0284c7';
        strokeColor = '#38bdf8';
        scale = 17;
      }

      const svgMarker = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: pinColor,
        fillOpacity: 1,
        strokeColor,
        strokeWeight: isSource || isGoal || isPath ? 3 : 2,
        scale
      };

      if (!markersRef.current[node.id]) {
        const marker = new google.maps.Marker({
          position: { lat: node.lat, lng: node.lng },
          map,
          title: `Junction ${node.id}: ${node.name}`,
          icon: svgMarker,
          label: {
            text: node.id,
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '11px',
            fontFamily: 'Outfit, sans-serif'
          }
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="font-family:sans-serif;padding:8px;color:#0f172a;max-width:240px;">
                <h4 style="margin:0 0 4px 0;font-size:14px;font-weight:700;">Junction [${node.id}]: ${node.name}</h4>
                <p style="margin:0 0 8px 0;font-size:12px;color:#64748b;">${node.desc}</p>
                <div style="display:flex;gap:6px;">
                  <button id="gmap-set-source-${node.id}" style="padding:5px 9px;font-size:11px;font-weight:700;border-radius:4px;border:none;background:#059669;color:#fff;cursor:pointer;">
                    Set Source [S]
                  </button>
                  <button id="gmap-set-dest-${node.id}" style="padding:5px 9px;font-size:11px;font-weight:700;border-radius:4px;border:none;background:#7c3aed;color:#fff;cursor:pointer;">
                    Set Goal [G]
                  </button>
                </div>
              </div>
            `);
            infoWindowRef.current.open(map, marker);

            setTimeout(() => {
              const srcBtn = document.getElementById(`gmap-set-source-${node.id}`);
              const dstBtn = document.getElementById(`gmap-set-dest-${node.id}`);
              if (srcBtn) srcBtn.onclick = () => { setSourceNode(node.id); infoWindowRef.current.close(); };
              if (dstBtn) dstBtn.onclick = () => { setDestNode(node.id); infoWindowRef.current.close(); };
            }, 100);
          }
        });

        markersRef.current[node.id] = marker;
      } else {
        markersRef.current[node.id].setIcon(svgMarker);
      }
    });

    // 4. Update Live En-Route Vehicle on Google Maps
    if (liveVehicle?.active && liveVehicle.path.length >= 2) {
      const curr = nodeMap[liveVehicle.path[liveVehicle.pathIndex]];
      const next = nodeMap[liveVehicle.path[liveVehicle.pathIndex + 1]];
      if (curr && next) {
        const roadCoords = getEdgeRoadCoordinates(curr.id, next.id, curr, next);
        const interpolated = interpolatePositionAlongRoad(roadCoords, liveVehicle.progress);
        const vLat = interpolated ? interpolated.lat : curr.lat + (next.lat - curr.lat) * liveVehicle.progress;
        const vLng = interpolated ? interpolated.lng : curr.lng + (next.lng - curr.lng) * liveVehicle.progress;

        const vehicleSvg = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#0284c7',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10
        };

        if (!vehicleMarkerRef.current) {
          vehicleMarkerRef.current = new google.maps.Marker({
            position: { lat: vLat, lng: vLng },
            map,
            title: 'Autonomous Agent Vehicle',
            icon: vehicleSvg
          });
        } else {
          vehicleMarkerRef.current.setPosition({ lat: vLat, lng: vLng });
          vehicleMarkerRef.current.setMap(map);
        }
      }
    } else {
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setMap(null);
      }
    }
  }, [isLoaded, nodes, edges, sourceNode, destNode, optimalPathNodes, optimalPathEdges, liveVehicle, currentWeather]);

  // If no API key or Error loading Google Maps Platform
  if (!apiKey || apiKey === 'your_google_maps_api_key_here' || loadError) {
    return (
      <div className="google-maps-setup-card card-panel" style={{ minHeight: height }}>
        <div className="gmaps-setup-header">
          <div className="gmaps-logo-badge">
            <MapPin size={22} className="text-warning" />
            <div>
              <h3>Google Maps Platform Real-Time Map Integration</h3>
              <p className="panel-sub">
                Integrated with environment variable <code>VITE_GOOGLE_MAPS_API_KEY</code>.
              </p>
            </div>
          </div>
          <span className="badge-tag">Google Cloud API</span>
        </div>

        {loadError && (
          <div className="gmaps-alert error">
            <AlertTriangle size={18} />
            <div>
              <strong>Google Maps API Error:</strong> {loadError}
            </div>
          </div>
        )}

        <div className="gmaps-instructions-box">
          <h4>How to activate Live Google Maps Platform:</h4>
          <ol className="gmaps-steps-list">
            <li>
              Add your API key to <code>c:/Projects/AI/.env.local</code>:
              <pre className="env-code-snippet">VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourActualKeyHere...</pre>
            </li>
            <li>
              Ensure <strong>Maps JavaScript API</strong> and <strong>Places API</strong> are enabled in your Google Cloud Console.
            </li>
            <li>
              <em>Or enter your API key directly below for this session:</em>
            </li>
          </ol>

          <div className="api-key-input-row">
            <div className="key-input-wrap">
              <Key size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Enter Google Maps API Key (AIzaSy...)"
                value={manualKeyInput}
                onChange={(e) => setManualKeyInput(e.target.value)}
                className="gmaps-key-input"
              />
            </div>
            <button
              id="save-gmaps-key-btn"
              className="btn-activate-gmaps"
              onClick={handleSaveApiKey}
            >
              <CheckCircle2 size={16} />
              <span>Activate Google Maps</span>
            </button>
          </div>
        </div>

        <div className="fallback-navigation-banner">
          <Info size={16} className="text-info" />
          <span>
            While configuring your Google Maps API key, you can switch seamlessly to 
            <strong> Live OpenStreetMap</strong> or <strong>Spatial SVG State Space Canvas</strong>.
          </span>
          {onSwitchToOpenStreetMap && (
            <button
              className="btn-switch-osm"
              onClick={onSwitchToOpenStreetMap}
            >
              Switch to OpenStreetMap
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="google-maps-container" style={{ position: 'relative', width: '100%', height }}>
      {/* Real Google Maps Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }} 
      />

      {/* Google Live Traffic Layer Toggle Badge */}
      <div className="google-traffic-layer-pill">
        <button
          className={`btn-traffic-layer-toggle ${showTrafficLayer ? 'active' : ''}`}
          onClick={toggleTrafficLayer}
          title="Toggle Google Maps real-time traffic overlay"
        >
          <Layers size={14} />
          <span>{showTrafficLayer ? '🚦 Live Google Traffic: ON' : '🚦 Live Google Traffic: OFF'}</span>
        </button>
      </div>
    </div>
  );
}
