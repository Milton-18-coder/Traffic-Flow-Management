import React from 'react';

export function MetricCard({ 
  id,
  title, 
  value, 
  unit = '', 
  subtitle = '', 
  icon: Icon, 
  variant = 'default',
  trend = null
}) {
  return (
    <div id={id} className={`metric-card metric-card-${variant}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-body">
        <div className="metric-value-row">
          <span className="metric-value">{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>

      {trend && (
        <div className={`metric-trend trend-${trend.direction}`}>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
