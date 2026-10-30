import React from 'react';
import { Target, Globe2, Cpu, Eye, ShieldCheck, Compass, GitBranch, ArrowRight } from 'lucide-react';

export function PEASMatrix() {
  const peasItems = [
    {
      title: 'Performance Measure (P)',
      icon: Target,
      color: '#10b981',
      points: [
        'Minimize total travel time: T_base * Traffic_Multiplier',
        'Minimize total physical distance traversed (km)',
        'Bypass blocked roads (Infinite penalty)',
        'Maximize search efficiency (minimize expanded state space)'
      ]
    },
    {
      title: 'Environment (E)',
      icon: Globe2,
      color: '#06b6d4',
      points: [
        'Statewide road network graph with major city hubs (CHN, VEL, MDU, TIR, etc.)',
        '25+ bidirectional edges with variable speed limits (40-80 km/h)',
        'Dynamic traffic states: Low (1.0x), Med (1.25x), High (1.75x), Very High (2.5x), Blocked (∞)',
        'Discrete, Static during single search step, Fully Observable'
      ]
    },
    {
      title: 'Actuators (A)',
      icon: Cpu,
      color: '#8b5cf6',
      points: [
        'Route selection engine & next-hop movement dispatcher',
        'Dynamic rerouting triggers upon detecting incidents',
        'Search strategy selector (BFS / DFS / Dijkstra / A*)',
        'Turn-by-turn routing output recommendation'
      ]
    },
    {
      title: 'Sensors (S)',
      icon: Eye,
      color: '#f59e0b',
      points: [
        'Graph topology reader (reads adjacency lists & edge costs)',
        'Live road congestion monitor & multiplier observer',
        'Incident / blockage detection feed',
        'Current vehicle spatial location tracker'
      ]
    }
  ];

  return (
    <div className="peas-matrix-card">
      <div className="card-header-clean">
        <div className="header-icon-title">
          <ShieldCheck size={20} className="accent-icon" />
          <h3 className="section-title">PEAS Formal Agent Specification</h3>
        </div>
        <span className="badge-tag">CO1 Core Architecture</span>
      </div>

      <div className="peas-grid">
        {peasItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="peas-box" style={{ borderTopColor: item.color }}>
              <div className="peas-box-header">
                <div className="peas-icon-wrap" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                  <Icon size={18} />
                </div>
                <h4 className="peas-box-title">{item.title}</h4>
              </div>
              <ul className="peas-points-list">
                {item.points.map((pt, pIdx) => (
                  <li key={pIdx}>
                    <ArrowRight size={13} className="point-arrow" style={{ color: item.color }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
