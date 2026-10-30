import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Route, 
  GitCompare, 
  Bot, 
  BarChart3, 
  Sparkles, 
  Zap, 
  Activity
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
  { id: 'network', label: 'Traffic Network', icon: Network, badge: 'Interactive Map' },
  { id: 'optimizer', label: 'Route Optimizer', icon: Route, badge: 'Search & Animate' },
  { id: 'comparison', label: 'Algorithm Comparison', icon: GitCompare, badge: 'BFS vs DFS vs Dijkstra vs A*' },
  { id: 'agent', label: 'Intelligent Agent', icon: Bot, badge: 'CO1 Goal Agent' },
  { id: 'analysis', label: 'Traffic Analysis', icon: BarChart3, badge: 'Bottlenecks' }
];

export function Sidebar({ activeTab, onSelectTab }) {
  const { currentScenario, runDemoScenario } = useTraffic();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Activity className="brand-icon" />
          <div className="pulse-ring"></div>
        </div>
        <div className="brand-text">
          <span className="brand-title">TrafficMind AI</span>
          <span className="brand-subtitle">NVIDIA Nemotron & Search</span>
        </div>
      </div>

      {/* Quick Status Tag */}
      <div className="scenario-badge-container">
        <div className="scenario-status-pill">
          <span className="status-dot"></span>
          <span className="scenario-name">
            {currentScenario.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">NAVIGATION</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <div className="nav-icon-box">
                <Icon size={18} />
              </div>
              <div className="nav-item-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-badge">{item.badge}</span>
              </div>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Hackathon Alignment Info Box */}
      <div className="sidebar-footer">
        <div className="academic-badge-box">
          <div className="academic-title">
            <Zap size={14} className="accent-icon" />
            <span>Nebius x NVIDIA 2026</span>
          </div>
          <p className="academic-desc">Nemotron LLM + Classical Search (A*, Dijkstra, BFS)</p>
          <button 
            id="quick-demo-btn"
            className="demo-trigger-btn"
            onClick={runDemoScenario}
          >
            <Sparkles size={14} />
            <span>Instant Demo (CHN → TIR)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
