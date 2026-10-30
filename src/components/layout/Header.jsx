import React from 'react';
import { 
  Sun, 
  Moon, 
  RotateCcw, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Activity,
  AlertTriangle,
  Play
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { TRAFFIC_SCENARIOS } from '../../data/trafficScenarios.js';

export function Header({ activeTab }) {
  const { 
    currentScenario, 
    applyScenario, 
    resetNetwork, 
    theme, 
    setTheme, 
    executeSearch,
    selectedAlgorithm,
    sourceNode,
    destNode
  } = useTraffic();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'TrafficMind AI Dashboard', subtitle: 'NVIDIA Nemotron Intelligent Agent & Classical Search Optimization' };
      case 'network': return { title: 'Interactive Road Network', subtitle: 'Dynamic 15-junction topology with editable congestion and incidents' };
      case 'optimizer': return { title: 'Goal-Oriented Route Optimizer', subtitle: 'Step-by-step state space search exploration & path animation' };
      case 'comparison': return { title: 'Algorithm Performance Benchmark', subtitle: 'Side-by-side empirical comparison of BFS, DFS, Dijkstra, and A*' };
      case 'agent': return { title: 'Intelligent Agent & Combinatorics', subtitle: 'Goal-Based Agent PEAS architecture & alternative route space' };
      case 'analysis': return { title: 'Traffic Bottleneck & Flow Analysis', subtitle: 'Congestion heat metrics and network delay profiling' };
      case 'about': return { title: 'Course Outcomes & Academic Mapping', subtitle: 'Formal CO1/CO2 syllabus mapping, viva cheat sheet, and formulas' };
      default: return { title: 'TrafficMind AI', subtitle: 'NVIDIA Nemotron & Classical Search Algorithms' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="app-header">
      <div className="header-titles">
        <h1 className="header-page-title">{title}</h1>
        <p className="header-page-subtitle">{subtitle}</p>
      </div>

      <div className="header-controls">
        {/* Scenario Quick Selector */}
        <div className="scenario-selector-group">
          <label htmlFor="scenario-select" className="control-label">
            <SlidersHorizontal size={14} />
            <span>Scenario:</span>
          </label>
          <select
            id="scenario-select"
            className="scenario-dropdown"
            value={currentScenario}
            onChange={(e) => applyScenario(e.target.value)}
          >
            {Object.values(TRAFFIC_SCENARIOS).map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
            {currentScenario === 'CUSTOM' && (
              <option value="CUSTOM">Custom Modified</option>
            )}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="header-btn-group">
          <button
            id="header-run-search-btn"
            className="header-action-btn primary"
            onClick={() => executeSearch(selectedAlgorithm, sourceNode, destNode)}
            title="Run active search algorithm"
          >
            <Play size={15} />
            <span>Run {selectedAlgorithm}</span>
          </button>

          <button
            id="header-reset-btn"
            className="header-action-btn secondary"
            onClick={resetNetwork}
            title="Reset road conditions & selections to default"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
