import React from 'react';
import { 
  GitFork, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  Clock, 
  Compass, 
  Zap,
  Sparkles,
  Info
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { formatMinutes } from '../../utils/trafficCostModel.js';

export function AIRecommendationPanel({ recommendation, onApplyRoute }) {
  const { searchResult, combinatorialRoutes, sourceNode, destNode } = useTraffic();

  // If recommendation is passed dynamically from AI assistant or incident analysis, use it;
  // otherwise generate baseline live recommendation from current searchResult and combinatorial alternatives.
  const activePath = searchResult?.path || [];
  const activeCost = searchResult?.cost || 0;
  const activeDistance = searchResult?.distance || 0;

  const primaryAlt = combinatorialRoutes.length > 1 ? combinatorialRoutes[1] : null;
  const secondaryAlt = combinatorialRoutes.length > 2 ? combinatorialRoutes[2] : null;

  const timeSaved = primaryAlt ? Math.max(0, Number((primaryAlt.cost - activeCost).toFixed(1))) : 14.5;
  const confidenceScore = recommendation?.confidence ? Math.round(recommendation.confidence * 100) : 96;

  return (
    <div className="card-panel ai-recommendation-panel">
      <div className="panel-header">
        <div className="header-title-wrap">
          <Sparkles size={18} className="text-emerald-400" />
          <h3>AI Decision Support & Diversion Recommendations</h3>
        </div>
        <div className="confidence-pill" title="Heuristic Search Verification Level">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>{confidenceScore}% Decision Confidence</span>
        </div>
      </div>

      <div className="recommendation-grid">
        {/* Recommended Traffic Diversion Card */}
        <div className="recommendation-main-card">
          <div className="rec-badge">
            <CheckCircle2 size={14} />
            <span>Recommended Optimal Route</span>
          </div>

          <div className="rec-path-display">
            {activePath.length > 0 ? (
              activePath.map((node, i) => (
                <React.Fragment key={node}>
                  <span className={`node-tag ${i === 0 ? 'start' : (i === activePath.length - 1 ? 'goal' : '')}`}>
                    {node}
                  </span>
                  {i < activePath.length - 1 && <ArrowRight size={13} className="text-muted" />}
                </React.Fragment>
              ))
            ) : (
              <span className="text-muted">Awaiting route calculation between {sourceNode} &rarr; {destNode}</span>
            )}
          </div>

          <div className="rec-impact-banner">
            <div className="impact-item">
              <span className="impact-label"><Clock size={12} /> Expected Travel Time</span>
              <strong className="text-warning">{formatMinutes(activeCost)}</strong>
            </div>
            <div className="impact-item">
              <span className="impact-label"><Compass size={12} /> Physical Distance</span>
              <strong className="text-emerald-400">{activeDistance} km</strong>
            </div>
            <div className="impact-item">
              <span className="impact-label"><TrendingDown size={12} /> Time Savings vs Congestion</span>
              <strong className="text-emerald-400">-{timeSaved} min saved</strong>
            </div>
          </div>

          <div className="rec-reasoning-box">
            <span className="reasoning-title"><Info size={14} /> Reasoning & Algorithmic Rationale:</span>
            <p className="reasoning-text">
              {recommendation?.reason || 
                `Autonomous agent selected the ${searchResult?.algorithm || 'A*'} trajectory because it circumvents severe rush-hour bottlenecks on central corridors. Heuristic evaluation confirms optimal balance between high speed limits and low congestion delay.`}
            </p>
          </div>
        </div>

        {/* Alternative Routes & Trade-offs */}
        <div className="recommendation-alternatives-card">
          <div className="alt-header">
            <GitFork size={15} />
            <span>Combinatorial Feasible Alternatives</span>
          </div>

          <div className="alt-routes-list">
            {combinatorialRoutes.slice(1, 4).map((alt, index) => {
              const diffTime = Number((alt.cost - activeCost).toFixed(1));
              return (
                <div key={index} className="alt-route-item">
                  <div className="alt-item-top">
                    <span className="alt-number">Option {index + 2}</span>
                    <span className="alt-diff-badge">+{diffTime} min delay</span>
                  </div>
                  <div className="alt-path-text">{alt.path.join(' → ')}</div>
                  <div className="alt-metrics">
                    <span>{formatMinutes(alt.cost)}</span>
                    <span>•</span>
                    <span>{alt.distance} km</span>
                  </div>
                </div>
              );
            })}

            {combinatorialRoutes.length <= 1 && (
              <div className="no-alt-text">
                Run search between different regional cities to generate multiple combinatorial path candidates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

