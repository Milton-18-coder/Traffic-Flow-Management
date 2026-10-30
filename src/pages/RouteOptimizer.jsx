import React, { useState, useEffect } from 'react';
import { 
  Route, 
  Navigation, 
  MapPin, 
  Play, 
  Sparkles, 
  Layers, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertOctagon,
  ArrowRight,
  Calculator,
  Compass,
  Map
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext.jsx';
import { TrafficMapSVG } from '../components/map/TrafficMapSVG.jsx';
import { RealTimeLeafletMap } from '../components/map/RealTimeLeafletMap.jsx';
import { SearchAnimator } from '../components/map/SearchAnimator.jsx';
import { TrafficLegend } from '../components/map/TrafficLegend.jsx';
import { SimulationControlBar } from '../components/map/SimulationControlBar.jsx';
import { RouteSearchBar } from '../components/common/RouteSearchBar.jsx';
import { AllRoutesDetailsViewer } from '../components/routes/AllRoutesDetailsViewer.jsx';
import { AllCitiesSourceResultsViewer } from '../components/routes/AllCitiesSourceResultsViewer.jsx';
import { TRAFFIC_SCENARIOS } from '../data/trafficScenarios.js';
import { formatMinutes, formatDistance } from '../utils/trafficCostModel.js';
import { Globe2 } from 'lucide-react';

export function RouteOptimizer() {
  const {
    nodes,
    edges,
    sourceNode,
    destNode,
    setSourceNode,
    setDestNode,
    selectedAlgorithm,
    setSelectedAlgorithm,
    currentScenario,
    applyScenario,
    searchResult,
    executeSearch,
    allCitiesResults,
    animState
  } = useTraffic();

  const [highlightedPath, setHighlightedPath] = useState(null);
  const [mapMode, setMapMode] = useState('LEAFLET');

  // Run search on initial mount if not yet run
  useEffect(() => {
    if (!searchResult) {
      executeSearch(selectedAlgorithm, sourceNode, destNode);
    }
  }, []);

  return (
    <div className="page-container optimizer-page">
      {/* Real-time Dynamic Simulation & Incident Bar */}
      <SimulationControlBar />

      {/* Interactive Source & Destination Autocomplete Entry Bar */}
      <RouteSearchBar 
        activeMapMode={mapMode} 
        onToggleMapMode={setMapMode} 
      />

      {/* Main Workspace Row: Interactive Map + Search Animator */}
      <div className="optimizer-workspace-grid">
        {/* Left Column: Interactive Map Canvas (Leaflet or SVG) */}
        <div className="optimizer-map-column card-panel">
          <div className="panel-header">
            <div className="header-title-wrap">
              <Map size={18} className="accent-icon" />
              <h4>
                {mapMode === 'LEAFLET' && 'Google Maps (Real-Time Traffic Tiles)'}
                {mapMode === 'SVG' && 'State-Space Topological Canvas (SVG)'}
              </h4>
            </div>
            <div className="panel-header-actions">
              <span className="live-pulse-dot" />
              <span className="panel-sub">Live Real-Time Feedback</span>
            </div>
          </div>

          {mapMode === 'LEAFLET' && (
            <RealTimeLeafletMap customSelectedPath={highlightedPath} height="480px" />
          )}

          {mapMode === 'SVG' && (
            <TrafficMapSVG height="460px" interactive={true} customSelectedPath={highlightedPath} />
          )}

          <TrafficLegend showDetailed={true} />

          {/* Step-by-Step Animation Player Controls */}
          <SearchAnimator />
        </div>

        {/* Right Column: Search Metrics & Mathematical Breakdown */}
        <div className="optimizer-metrics-column">
          {/* Result Card */}
          <div className="card-panel search-output-card">
            <div className="panel-header">
              <h4>Search Algorithm Output</h4>
              <span className="badge-tag">{searchResult?.algorithm || selectedAlgorithm}</span>
            </div>

            {searchResult?.found ? (
              <div className="search-output-body">
                {searchResult.isAllCities ? (
                  <>
                    <div className="output-status-banner status-success">
                      <Globe2 size={20} />
                      <div>
                        <strong>Single-Source All-Destinations Matrix</strong>
                        <p>Evaluated optimal routes from Source [{sourceNode}] to all {allCitiesResults?.totalDestinations || nodes.length - 1} network cities in {searchResult.executionTime} ms.</p>
                      </div>
                    </div>

                    <div className="search-stats-table">
                      <div className="stat-row">
                        <span className="stat-name">Source Junction:</span>
                        <span className="stat-val text-cyan font-bold">[{sourceNode}] {nodes.find(n => n.id === sourceNode)?.name}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Total Reachable Cities:</span>
                        <span className="stat-val text-success font-bold">{allCitiesResults?.reachableCount} / {allCitiesResults?.totalDestinations} (100%)</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Fastest Destination:</span>
                        <span className="stat-val text-warning font-bold">{allCitiesResults?.destinations[0]?.destName} ({formatMinutes(allCitiesResults?.destinations[0]?.cost)})</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Furthest Reachable:</span>
                        <span className="stat-val">{allCitiesResults?.destinations[allCitiesResults.destinations.length - 1]?.destName} ({formatDistance(allCitiesResults?.destinations[allCitiesResults.destinations.length - 1]?.distance)})</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Search Execution Time:</span>
                        <span className="stat-val mono-font">{searchResult.executionTime} ms</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="output-status-banner status-success">
                      <CheckCircle2 size={20} />
                      <div>
                        <strong>Goal State Reached!</strong>
                        <p>Optimal path generated in {searchResult.executionTime} ms.</p>
                      </div>
                    </div>

                    <div className="discovered-path-box">
                      <span className="path-label">Selected Route Sequence:</span>
                      <div className="path-nodes-flow">
                        {searchResult.path.map((node, i) => (
                          <React.Fragment key={node}>
                            <span className="path-node-pill">{node}</span>
                            {i < searchResult.path.length - 1 && (
                              <ArrowRight size={14} className="path-sep-arrow" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="search-stats-table">
                      <div className="stat-row">
                        <span className="stat-name">Estimated Travel Time:</span>
                        <span className="stat-val text-warning font-bold">{formatMinutes(searchResult.cost)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Total Physical Distance:</span>
                        <span className="stat-val">{formatDistance(searchResult.distance)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Nodes Explored in Graph:</span>
                        <span className="stat-val text-info">{searchResult.nodesExploredCount} / {nodes.length} junctions</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-name">Search Execution Time:</span>
                        <span className="stat-val mono-font">{searchResult.executionTime} ms</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Mathematical Equation Breakdown */}
                <div className="math-breakdown-box">
                  <div className="math-header">
                    <Calculator size={14} />
                    <span>Cost Function Formula</span>
                  </div>
                  <p className="math-formula">
                    Travel Time = (Distance / Speed) × Congestion Multiplier
                  </p>
                  {selectedAlgorithm.includes('A*') && (
                    <p className="math-formula text-cyan">
                      f(n) = g(n) + h(n) (where h(n) = StraightLine / 80 km/h)
                    </p>
                  )}
                </div>
              </div>
            ) : searchResult ? (
              <div className="search-output-body">
                <div className="output-status-banner status-error">
                  <AlertOctagon size={20} />
                  <div>
                    <strong>No Path Available</strong>
                    <p>{searchResult.errorMessage || 'All routes are blocked or disconnected.'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-search-placeholder">
                <p>Click "Find Best Route" above to execute search.</p>
              </div>
            )}
          </div>

          {/* Algorithm Info Card */}
          <div className="card-panel algorithm-quick-info">
            <div className="panel-header">
              <h4>Algorithm Properties ({selectedAlgorithm})</h4>
            </div>
            <div className="algo-props-list">
              <div className="prop-item">
                <span className="prop-label">Search Strategy:</span>
                <span className="prop-val">{selectedAlgorithm === 'A*' ? 'Informed (Heuristic)' : (selectedAlgorithm === 'Dijkstra' ? 'Cost-Based (Uniform Cost)' : 'Uninformed (Brute Force)')}</span>
              </div>
              <div className="prop-item">
                <span className="prop-label">Primary Data Structure:</span>
                <span className="prop-val mono-font">
                  {selectedAlgorithm === 'BFS' ? 'FIFO Queue' : (selectedAlgorithm === 'DFS' ? 'LIFO Stack / Recursion' : 'Min-Priority Queue / Binary Heap')}
                </span>
              </div>
              <div className="prop-item">
                <span className="prop-label">Time Complexity:</span>
                <span className="prop-val mono-font">
                  {selectedAlgorithm === 'A*' ? 'O(b^d)' : (selectedAlgorithm === 'Dijkstra' ? 'O((V + E) log V)' : 'O(V + E)')}
                </span>
              </div>
              <div className="prop-item">
                <span className="prop-label">Optimality:</span>
                <span className="prop-val text-success">
                  {selectedAlgorithm === 'DFS' ? 'Non-Optimal' : (selectedAlgorithm === 'BFS' ? 'Optimal for Edge Count' : 'Optimal for Travel Time')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE SINGLE-SOURCE ALL-CITIES REACHABILITY MATRIX */}
      <AllCitiesSourceResultsViewer
        onSelectCityRoute={setHighlightedPath}
        highlightedPath={highlightedPath}
      />

      {/* COMPREHENSIVE ALL ROUTES & REJECTION REASONS VIEWER */}
      <AllRoutesDetailsViewer 
        onHighlightRoute={setHighlightedPath} 
        highlightedPath={highlightedPath} 
      />
    </div>
  );
}
