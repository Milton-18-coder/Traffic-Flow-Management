import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowRightLeft, 
  Search, 
  Play, 
  CheckCircle2, 
  Compass, 
  SlidersHorizontal,
  X,
  Sparkles,
  Map,
  Activity,
  Plus
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { TAMIL_NADU_ALL_PLACES } from '../../data/tamilNaduPlaces.js';

export function RouteSearchBar({ activeMapMode, onToggleMapMode }) {
  const {
    nodes,
    sourceNode,
    destNode,
    setSourceNode,
    setDestNode,
    selectedAlgorithm,
    setSelectedAlgorithm,
    executeSearch,
    addCustomLocationOrSelect
  } = useTraffic();

  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [isSourceFocused, setIsSourceFocused] = useState(false);
  const [isDestFocused, setIsDestFocused] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const sourceWrapperRef = useRef(null);
  const destWrapperRef = useRef(null);

  const sourceObj = nodes.find(n => n.id === sourceNode);
  const destObj = destNode === 'ALL'
    ? { id: 'ALL', name: 'All Cities (Entire Network)' }
    : nodes.find(n => n.id === destNode);

  const handleLiveOsmGeocode = async (queryText, isSource = false) => {
    const raw = (queryText || '').replace(/^\[[a-z0-9]+\]\s*/i, '').trim();
    if (!raw) return;
    setIsGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(raw)},Tamil+Nadu&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (data && data[0]) {
        const placeName = data[0].display_name.split(',')[0];
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newId = addCustomLocationOrSelect(placeName, lat, lng, isSource ? 'SOURCE' : 'GOAL');
        if (isSource) {
          setSourceQuery(`[${newId}] ${placeName}`);
          setIsSourceFocused(false);
        } else {
          setDestQuery(`[${newId}] ${placeName}`);
          setIsDestFocused(false);
        }
      } else {
        alert(`Location "${raw}" could not be located on OpenStreetMap. Please check spelling.`);
      }
    } catch (err) {
      console.error('OSM Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Sync inputs with state
  useEffect(() => {
    if (sourceObj) setSourceQuery(`[${sourceObj.id}] ${sourceObj.name}`);
  }, [sourceNode, sourceObj]);

  useEffect(() => {
    if (destNode === 'ALL') {
      setDestQuery('🌐 [ALL] All Cities (Entire Network)');
    } else if (destObj) {
      setDestQuery(`[${destObj.id}] ${destObj.name}`);
    }
  }, [destNode, destObj]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (sourceWrapperRef.current && !sourceWrapperRef.current.contains(e.target)) {
        setIsSourceFocused(false);
      }
      if (destWrapperRef.current && !destWrapperRef.current.contains(e.target)) {
        setIsDestFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter existing nodes + all 38 Tamil Nadu districts & towns matching query
  const getFilteredOptions = (query, isSource = true) => {
    const raw = (query || '').trim();
    // If query matches current pill format like "[A] Chennai Central", treat as empty to display ALL cities
    const isCurrentPill = nodes.some(n => `[${n.id}] ${n.name}`.toLowerCase() === raw.toLowerCase()) || raw.toLowerCase().includes('[all]');
    const q = isCurrentPill ? '' : raw.toLowerCase().replace(/^\[[a-z0-9]+\]\s*/i, '').trim();

    // 1. Existing active network nodes (15 cities)
    const activeMatches = nodes.filter(n => {
      if (!q) return true;
      return (
        n.id.toLowerCase().includes(q) ||
        n.name.toLowerCase().includes(q) ||
        (n.desc && n.desc.toLowerCase().includes(q))
      );
    }).map(n => ({ ...n, isExisting: true }));

    // 2. All 38 Tamil Nadu districts & cities
    const additionalPlaces = TAMIL_NADU_ALL_PLACES.filter(p => {
      // Don't duplicate if already in active nodes by name
      const alreadyInActive = nodes.some(n => 
        n.name.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(n.name.toLowerCase())
      );
      if (alreadyInActive) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q))
      );
    }).map(p => ({
      ...p,
      isExisting: false
    }));

    const results = [...activeMatches, ...additionalPlaces];

    // For Destination dropdown, add option to evaluate ALL cities at once
    if (!isSource && (!q || 'all cities entire network destinations matrix'.includes(q))) {
      results.unshift({
        id: 'ALL',
        name: '🌐 ALL CITIES (Single-Source All-Destinations Matrix)',
        district: 'Tamil Nadu Statewide',
        desc: 'Simultaneously calculate optimal routes & travel times to all cities from source',
        isExisting: true,
        isAllCities: true
      });
    }

    return results;
  };

  const filteredSourceOptions = getFilteredOptions(sourceQuery, true);
  const filteredDestOptions = getFilteredOptions(destQuery, false);

  const swapSourceDest = () => {
    if (destNode === 'ALL') return;
    const temp = sourceNode;
    setSourceNode(destNode);
    setDestNode(temp);
    executeSearch(selectedAlgorithm, destNode, temp);
  };

  const handleSelectSourceOption = (item) => {
    if (item.isExisting) {
      setSourceNode(item.id);
      setSourceQuery(`[${item.id}] ${item.name}`);
      setIsSourceFocused(false);
      executeSearch(selectedAlgorithm, item.id, destNode);
    } else {
      // Add custom Tamil Nadu place dynamically
      const newId = addCustomLocationOrSelect(item.name, item.lat, item.lng, 'SOURCE');
      setSourceQuery(`[${newId}] ${item.name}`);
      setIsSourceFocused(false);
    }
  };

  const handleSelectDestOption = (item) => {
    if (item.id === 'ALL') {
      setDestNode('ALL');
      setDestQuery('🌐 [ALL] All Cities (Entire Network)');
      setIsDestFocused(false);
      executeSearch(selectedAlgorithm, sourceNode, 'ALL');
      return;
    }

    if (item.isExisting) {
      setDestNode(item.id);
      setDestQuery(`[${item.id}] ${item.name}`);
      setIsDestFocused(false);
      executeSearch(selectedAlgorithm, sourceNode, item.id);
    } else {
      // Add custom Tamil Nadu place dynamically
      const newId = addCustomLocationOrSelect(item.name, item.lat, item.lng, 'GOAL');
      setDestQuery(`[${newId}] ${item.name}`);
      setIsDestFocused(false);
    }
  };

  const handleRunSearch = () => {
    executeSearch(selectedAlgorithm, sourceNode, destNode);
  };

  return (
    <div className="route-search-bar-card card-panel">
      <div className="search-bar-inner">
        {/* Source Junction Autocomplete Input */}
        <div className="search-input-field-wrap" ref={sourceWrapperRef}>
          <div className="field-icon-box text-success">
            <MapPin size={18} />
          </div>
          <div className="input-text-container">
            <label className="field-micro-label">START / SOURCE JUNCTION</label>
            <input
              type="text"
              id="source-junction-input"
              className="search-junction-input"
              placeholder="Search start city (e.g. Chennai, Salem, Madurai, Kovilpatti)..."
              value={sourceQuery}
              onChange={(e) => setSourceQuery(e.target.value)}
              onFocus={() => {
                setIsSourceFocused(true);
                setSourceQuery('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (filteredSourceOptions.length > 0) {
                    handleSelectSourceOption(filteredSourceOptions[0]);
                  } else if (sourceQuery.trim()) {
                    handleLiveOsmGeocode(sourceQuery, true);
                  }
                }
              }}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSourceFocused && (
            <div className="search-autocomplete-dropdown">
              <div className="dropdown-header">Select Starting City ({filteredSourceOptions.length} Places across Tamil Nadu)</div>
              <div className="dropdown-list">
                {filteredSourceOptions.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`dropdown-item ${item.id === sourceNode ? 'selected' : ''}`}
                    onClick={() => handleSelectSourceOption(item)}
                  >
                    <span className={`dropdown-node-pill ${item.isExisting ? '' : 'custom-pill'}`}>
                      {item.isExisting ? item.id : '📍'}
                    </span>
                    <div className="dropdown-item-info">
                      <strong>{item.name}</strong>
                      <span className="dropdown-item-desc">
                        {item.desc || (item.district ? `${item.district} District` : 'Tamil Nadu Location')}
                      </span>
                    </div>
                    {!item.isExisting && (
                      <span style={{ fontSize: '9px', background: '#38bdf820', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto', fontWeight: 700 }}>
                        + Add to Route
                      </span>
                    )}
                  </div>
                ))}

                {sourceQuery.trim() && (
                  <div
                    className="dropdown-item"
                    style={{ background: 'rgba(56, 189, 248, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                    onClick={() => handleLiveOsmGeocode(sourceQuery, true)}
                  >
                    <span className="dropdown-node-pill custom-pill">🔍</span>
                    <div className="dropdown-item-info">
                      <strong style={{ color: '#38bdf8' }}>{isGeocoding ? 'Searching OpenStreetMap...' : `Locate "${sourceQuery.trim()}" on OpenStreetMap`}</strong>
                      <span className="dropdown-item-desc">Live geocode & connect any town/village in Tamil Nadu</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Swap Source & Destination Button */}
        <button
          id="swap-source-dest-btn"
          className="btn-swap-nodes"
          onClick={swapSourceDest}
          title="Swap Source and Destination"
        >
          <ArrowRightLeft size={16} />
        </button>

        {/* Destination Junction Autocomplete Input */}
        <div className="search-input-field-wrap" ref={destWrapperRef}>
          <div className="field-icon-box text-violet">
            <Navigation size={18} />
          </div>
          <div className="input-text-container">
            <label className="field-micro-label">GOAL / DESTINATION LOCATION</label>
            <input
              type="text"
              id="dest-junction-input"
              className="search-junction-input"
              placeholder="Enter destination (e.g. Kovilpatti, Madurai, Ooty, Rameswaram)..."
              value={destQuery}
              onChange={(e) => setDestQuery(e.target.value)}
              onFocus={() => {
                setIsDestFocused(true);
                setDestQuery('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (filteredDestOptions.length > 0) {
                    handleSelectDestOption(filteredDestOptions[0]);
                  } else if (destQuery.trim()) {
                    handleLiveOsmGeocode(destQuery, false);
                  } else {
                    handleRunSearch();
                  }
                }
              }}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isDestFocused && (
            <div className="search-autocomplete-dropdown">
              <div className="dropdown-header">Select Goal Destination ({filteredDestOptions.length} Tamil Nadu Places)</div>
              <div className="dropdown-list">
                {filteredDestOptions.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`dropdown-item ${item.id === destNode ? 'selected' : ''}`}
                    onClick={() => handleSelectDestOption(item)}
                  >
                    <span className={`dropdown-node-pill goal-pill ${item.isExisting ? '' : 'custom-pill'}`}>
                      {item.isExisting ? item.id : '🎯'}
                    </span>
                    <div className="dropdown-item-info">
                      <strong>{item.name}</strong>
                      <span className="dropdown-item-desc">
                        {item.desc || (item.district ? `${item.district} District` : 'Tamil Nadu Location')}
                      </span>
                    </div>
                    {!item.isExisting && (
                      <span style={{ fontSize: '9px', background: '#a78bfa20', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto', fontWeight: 700 }}>
                        + Add to Route
                      </span>
                    )}
                  </div>
                ))}

                {destQuery.trim() && (
                  <div
                    className="dropdown-item"
                    style={{ background: 'rgba(167, 139, 250, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                    onClick={() => handleLiveOsmGeocode(destQuery, false)}
                  >
                    <span className="dropdown-node-pill goal-pill custom-pill">🔍</span>
                    <div className="dropdown-item-info">
                      <strong style={{ color: '#a78bfa' }}>{isGeocoding ? 'Searching OpenStreetMap...' : `Locate "${destQuery.trim()}" on OpenStreetMap`}</strong>
                      <span className="dropdown-item-desc">Live geocode & connect any town/village in Tamil Nadu</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Algorithm Quick Select */}
        <div className="search-algo-selector">
          <label className="field-micro-label">SEARCH ALGORITHM</label>
          <select
            className="search-algo-dropdown"
            value={selectedAlgorithm}
            onChange={(e) => {
              const newAlgo = e.target.value;
              setSelectedAlgorithm(newAlgo);
              executeSearch(newAlgo, sourceNode, destNode);
            }}
          >
            <option value="A*">A* Search (Heuristic)</option>
            <option value="Dijkstra">Dijkstra's (Min-Cost)</option>
            <option value="BFS">BFS (Fewest Hops)</option>
            <option value="DFS">DFS (Deep Stack)</option>
          </select>
        </div>

        {/* Primary Find Route Button */}
        <button
          id="search-bar-submit-btn"
          className="btn-search-bar-submit"
          onClick={handleRunSearch}
        >
          <Play size={16} />
          <span>Find Best Route</span>
        </button>
      </div>

      {/* Map Mode Toggle Bar (Google Maps vs Topological SVG) */}
      {onToggleMapMode && (
        <div className="map-mode-toggle-row">
          <span className="mode-toggle-label">Real-Time Visualization Mode:</span>
          <div className="mode-btn-group">
            <button
              id="mode-leaflet-btn"
              className={`mode-pill-btn ${activeMapMode === 'LEAFLET' ? 'active' : ''}`}
              onClick={() => onToggleMapMode('LEAFLET')}
            >
              <Map size={14} />
              <span>🗺️ Google Maps (Real-Time Traffic)</span>
            </button>
            <button
              id="mode-svg-btn"
              className={`mode-pill-btn ${activeMapMode === 'SVG' ? 'active' : ''}`}
              onClick={() => onToggleMapMode('SVG')}
            >
              <Activity size={14} />
              <span>🌐 Spatial State-Space Network (SVG Canvas)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
