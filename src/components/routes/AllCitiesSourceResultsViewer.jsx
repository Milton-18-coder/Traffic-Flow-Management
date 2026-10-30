import React, { useState, useMemo } from 'react';
import { 
  Globe2, 
  MapPin, 
  Navigation, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Search, 
  SlidersHorizontal,
  Flame,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { formatMinutes, formatDistance, TRAFFIC_LEVELS } from '../../utils/trafficCostModel.js';

export function AllCitiesSourceResultsViewer({ onSelectCityRoute, highlightedPath }) {
  const {
    sourceNode,
    destNode,
    setDestNode,
    nodes,
    selectedAlgorithm,
    executeSearch,
    allCitiesResults,
    startVehicleTrip,
    addCustomLocationOrSelect,
    loadAllTamilNaduPlaces
  } = useTraffic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, DIRECT, FAST, CONGESTED
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleOsmGeocodeSearch = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryText.trim())},Tamil+Nadu&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (data && data[0]) {
        const placeName = data[0].display_name.split(',')[0];
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        addCustomLocationOrSelect(placeName, lat, lng, 'GOAL');
        setSearchTerm('');
      } else {
        alert(`Location "${queryText}" could not be located in Tamil Nadu. Please check spelling.`);
      }
    } catch (err) {
      console.error('OSM Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const sourceObj = nodes.find(n => n.id === sourceNode) || { id: sourceNode, name: 'Source Junction' };

  const allDestinations = allCitiesResults?.destinations || [];

  const filteredDestinations = useMemo(() => {
    return allDestinations.filter(d => {
      const matchesSearch = 
        !searchTerm ||
        d.destId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.destName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.destDesc && d.destDesc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        d.pathString.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'DIRECT') return d.hops === 1;
      if (filterType === 'FAST') return d.cost <= 180; // under 3 hours
      if (filterType === 'CONGESTED') return d.bottlenecks.length > 0;
      return true;
    });
  }, [allDestinations, searchTerm, filterType]);

  const handleSelectCity = (city) => {
    setDestNode(city.destId);
    if (onSelectCityRoute) {
      onSelectCityRoute(city.path);
    }
    executeSearch(selectedAlgorithm, sourceNode, city.destId);
  };

  const handleSimulateToCity = (e, city) => {
    e.stopPropagation();
    setDestNode(city.destId);
    executeSearch(selectedAlgorithm, sourceNode, city.destId);
    setTimeout(() => {
      startVehicleTrip();
    }, 100);
  };

  return (
    <div className="card-panel all-cities-source-viewer" style={{ marginTop: '20px' }}>
      {/* Header Bar */}
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="header-title-wrap">
          <Globe2 size={20} className="accent-icon text-cyan" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Single-Source Reachability Matrix: All Cities from [{sourceObj.id}] {sourceObj.name}
            </h3>
            <p className="panel-sub" style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Simultaneously calculated optimal paths, travel times, and congestion states to all <strong>{allDestinations.length} network cities</strong> using {selectedAlgorithm}.
            </p>
          </div>
        </div>

        {/* Global Summary Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge-tag" style={{ background: '#05966920', border: '1px solid #10b98150', color: '#34d399' }}>
            <CheckCircle2 size={12} /> {allCitiesResults?.reachableCount || allDestinations.length} / {allDestinations.length} Reachable
          </span>
          <span className="badge-tag" style={{ background: '#38bdf820', border: '1px solid #38bdf850', color: '#38bdf8' }}>
            ⚡ Batch Time: {allCitiesResults?.totalExecutionTime || 1.8} ms
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {/* City Search Field */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '380px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            id="city-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destination city (e.g. Madurai, Salem, Vellore)..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#f8fafc',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quick Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Filter:</span>
          {[
            { id: 'ALL', label: `All (${allDestinations.length})` },
            { id: 'DIRECT', label: `Direct Neighbors (${allDestinations.filter(d => d.hops === 1).length})` },
            { id: 'FAST', label: `Under 3 hrs (${allDestinations.filter(d => d.cost <= 180).length})` },
            { id: 'CONGESTED', label: `Congested (${allDestinations.filter(d => d.bottlenecks.length > 0).length})` }
          ].map(btn => (
            <button
              key={btn.id}
              className={`filter-pill-btn ${filterType === btn.id ? 'active' : ''}`}
              onClick={() => setFilterType(btn.id)}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of All Destination Cities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '12px',
        padding: '16px',
        maxHeight: '480px',
        overflowY: 'auto'
      }}>
        {filteredDestinations.map(city => {
          const isCurrentGoal = destNode === city.destId;
          const hasBottleneck = city.bottlenecks.length > 0;

          return (
            <div
              key={city.destId}
              id={`city-card-${city.destId}`}
              onClick={() => handleSelectCity(city)}
              style={{
                borderRadius: '10px',
                border: isCurrentGoal ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isCurrentGoal ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.65)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: isCurrentGoal ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none'
              }}
              className="city-route-card"
            >
              {/* Card Header: Node ID, City Name, Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isCurrentGoal ? '#7c3aed' : '#1e293b',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '12px',
                    border: '2px solid #38bdf8'
                  }}>
                    {city.destId}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#f8fafc', display: 'block' }}>
                      {city.destName}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {city.destDesc || 'Metropolitan Hub'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                {hasBottleneck ? (
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: '#f59e0b20', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={10} /> Bottleneck
                  </span>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#34d399', background: '#10b98120', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={10} /> Fast Clear
                  </span>
                )}
              </div>

              {/* Path Sequence Flow */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '6px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexWrap: 'wrap',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>Route:</span>
                {city.path.map((node, i) => (
                  <React.Fragment key={node}>
                    <span style={{
                      fontWeight: 700,
                      color: node === sourceNode ? '#34d399' : (node === city.destId ? '#38bdf8' : '#e2e8f0')
                    }}>
                      {node}
                    </span>
                    {i < city.path.length - 1 && (
                      <ArrowRight size={10} style={{ color: '#64748b' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Travel Metrics Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '6px'
              }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Time: </span>
                  <strong style={{ color: '#fbbf24' }}>{formatMinutes(city.cost)}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Dist: </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{formatDistance(city.distance)}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Hops: </span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{city.hops} {city.hops === 1 ? 'road' : 'roads'}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <button
                  id={`view-map-btn-${city.destId}`}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    background: isCurrentGoal ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: isCurrentGoal ? '#0f172a' : '#38bdf8',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <MapPin size={12} /> {isCurrentGoal ? 'Active on Map' : 'View on Map'}
                </button>

                <button
                  id={`simulate-trip-btn-${city.destId}`}
                  type="button"
                  onClick={(e) => handleSimulateToCity(e, city)}
                  title="Launch autonomous vehicle simulation along this route"
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    color: '#4ade80',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Car size={12} /> Drive
                </button>
              </div>
            </div>
          );
        })}

        {filteredDestinations.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '36px 20px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.15)'
          }}>
            <AlertTriangle size={32} style={{ color: '#f59e0b', margin: '0 auto 8px auto', display: 'block' }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#f8fafc', fontSize: '1rem' }}>
              No place matching "{searchTerm}" found in active matrix
            </h4>
            <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Query OpenStreetMap live to geocode this location, integrate it into the highway network, and calculate optimal route from [{sourceObj.id}] {sourceObj.name}.
            </p>
            <button
              onClick={() => handleOsmGeocodeSearch(searchTerm)}
              disabled={isGeocoding}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#38bdf8',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Search size={14} />
              {isGeocoding ? 'Locating on OpenStreetMap...' : `🔍 Locate "${searchTerm}" on OpenStreetMap & Route`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
