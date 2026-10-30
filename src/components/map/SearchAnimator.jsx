import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Gauge, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';

export function SearchAnimator() {
  const {
    searchResult,
    animState,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    stepForward,
    stepBackward,
    setAnimationSpeed,
    executeSearch,
    selectedAlgorithm
  } = useTraffic();

  const { isPlaying, isPaused, currentStepIndex, totalSteps, speed, activeFrame } = animState;
  const isReady = searchResult && searchResult.steps && searchResult.steps.length > 0;
  const progressPercent = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="search-animator-card">
      <div className="animator-header">
        <div className="animator-title-wrap">
          <Sparkles size={16} className="sparkle-icon" />
          <h3 className="animator-title">Search State Exploration Player</h3>
        </div>

        <div className="animator-step-badge">
          Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
        </div>
      </div>

      {/* Progress Track */}
      <div className="animator-progress-container">
        <div 
          className="animator-progress-bar" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* Action Reasoning Banner */}
      <div className="animator-action-ticker">
        {activeFrame ? (
          <div className="ticker-content">
            <span className="ticker-step-pill">#{activeFrame.step}</span>
            <span className="ticker-text">{activeFrame.action}</span>
          </div>
        ) : searchResult ? (
          <div className="ticker-content">
            {searchResult.found ? (
              <>
                <CheckCircle2 size={16} className="text-success" />
                <span className="ticker-text">
                  Route Found: <strong>{searchResult.path.join(' → ')}</strong> ({searchResult.cost} min, {searchResult.distance} km)
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-danger" />
                <span className="ticker-text">{searchResult.errorMessage || 'No route exists.'}</span>
              </>
            )}
          </div>
        ) : (
          <div className="ticker-content text-muted">
            Click <strong>"Run Search"</strong> or <strong>"Play"</strong> to step through {selectedAlgorithm} search exploration.
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="animator-controls-row">
        {/* Playback Button Group */}
        <div className="animator-btn-group">
          <button
            id="anim-step-back-btn"
            className="anim-ctrl-btn"
            onClick={stepBackward}
            disabled={!isReady || currentStepIndex === 0}
            title="Step backward"
          >
            <SkipBack size={16} />
          </button>

          {isPlaying ? (
            <button
              id="anim-pause-btn"
              className="anim-ctrl-btn primary-play"
              onClick={pauseAnimation}
              title="Pause search animation"
            >
              <Pause size={18} />
              <span>Pause</span>
            </button>
          ) : (
            <button
              id="anim-play-btn"
              className="anim-ctrl-btn primary-play"
              onClick={startAnimation}
              title="Start search animation"
            >
              <Play size={18} />
              <span>{isPaused ? 'Resume' : 'Play'}</span>
            </button>
          )}

          <button
            id="anim-step-fwd-btn"
            className="anim-ctrl-btn"
            onClick={stepForward}
            disabled={!isReady || currentStepIndex >= totalSteps - 1}
            title="Step forward"
          >
            <SkipForward size={16} />
          </button>

          <button
            id="anim-reset-btn"
            className="anim-ctrl-btn"
            onClick={resetAnimation}
            disabled={!isReady}
            title="Reset to step 1"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="animator-speed-selector">
          <Gauge size={14} className="speed-icon" />
          <span className="speed-label">Speed:</span>
          {['slow', 'medium', 'fast'].map((spd) => (
            <button
              key={spd}
              id={`speed-${spd}-btn`}
              className={`speed-pill-btn ${speed === spd ? 'active' : ''}`}
              onClick={() => setAnimationSpeed(spd)}
            >
              {spd.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
