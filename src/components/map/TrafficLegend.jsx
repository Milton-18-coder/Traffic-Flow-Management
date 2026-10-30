import React from 'react';
import { TRAFFIC_LEVELS } from '../../utils/trafficCostModel.js';

export function TrafficLegend({ showDetailed = false }) {
  return (
    <div className="traffic-legend">
      <div className="legend-section">
        <span className="legend-heading">Traffic Congestion Levels:</span>
        <div className="legend-items">
          {Object.entries(TRAFFIC_LEVELS).map(([key, item]) => (
            <div key={key} className="legend-item" title={item.description}>
              <span 
                className="legend-color-dot" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="legend-text">
                <strong>{item.label}</strong>
                {showDetailed && <span className="legend-weight"> (×{item.multiplier === Infinity ? '∞' : item.multiplier})</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="legend-section search-states">
        <span className="legend-heading">Search States:</span>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color-dot source-dot" />
            <span className="legend-text">Source [S]</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot goal-dot" />
            <span className="legend-text">Goal [G]</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot frontier-dot" />
            <span className="legend-text">Frontier Node</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot optimal-path-dot" />
            <span className="legend-text">Optimal Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
