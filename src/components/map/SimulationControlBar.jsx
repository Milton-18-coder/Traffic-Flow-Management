import React from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Sun, 
  CloudRain, 
  CloudFog, 
  HardHat, 
  Zap, 
  Flame, 
  Car, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Activity
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { formatTimeOfDay, WEATHER_TYPES } from '../../utils/trafficCostModel.js';

export function SimulationControlBar() {
  const {
    simHour,
    setSimHour,
    isSimPlaying,
    setIsSimPlaying,
    simSpeedMultiplier,
    setSimSpeedMultiplier,
    currentWeather,
    setCurrentWeather,
    triggerRandomIncident,
    startVehicleTrip,
    stopVehicleTrip,
    liveVehicle,
    dynamicNotification
  } = useTraffic();

  return (
    <div className="sim-control-bar card-panel">
      {/* Toast Banner Alert (if active) */}
      {dynamicNotification && (
        <div className={`dynamic-toast toast-${dynamicNotification.type}`}>
          <div className="toast-icon">
            {dynamicNotification.type === 'warning' ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
          </div>
          <div className="toast-body">
            <strong>{dynamicNotification.title}: </strong>
            <span>{dynamicNotification.message}</span>
          </div>
        </div>
      )}

      <div className="sim-bar-grid">
        {/* Live Clock & Playback */}
        <div className="sim-clock-group">
          <div className="clock-header">
            <Clock size={16} className="text-warning" />
            <span className="clock-display font-bold mono-font">
              {formatTimeOfDay(simHour)}
            </span>
            <span className="clock-sublabel">
              {simHour >= 7.5 && simHour <= 9.5 ? '🔥 Morning Rush' : (simHour >= 16.5 && simHour <= 19.5 ? '🔥 Evening Rush' : 'Midday Traffic')}
            </span>
          </div>

          <div className="sim-clock-controls">
            <button
              id="sim-toggle-play-btn"
              className={`sim-btn-pill ${isSimPlaying ? 'active-playing' : ''}`}
              onClick={() => setIsSimPlaying(!isSimPlaying)}
              title={isSimPlaying ? 'Pause dynamic time simulation' : 'Start live dynamic time ticking'}
            >
              {isSimPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimPlaying ? 'Pause Clock' : 'Live Clock'}</span>
            </button>

            {/* Speed Multiplier */}
            <div className="speed-pills">
              {[1, 2, 5, 10].map(multiplier => (
                <button
                  key={multiplier}
                  className={`speed-pill ${simSpeedMultiplier === multiplier ? 'active' : ''}`}
                  onClick={() => setSimSpeedMultiplier(multiplier)}
                >
                  {multiplier}x
                </button>
              ))}
            </div>
          </div>

          {/* Time Slider */}
          <input
            type="range"
            min="0"
            max="23.9"
            step="0.25"
            value={simHour}
            onChange={(e) => setSimHour(parseFloat(e.target.value))}
            className="sim-time-slider"
            title="Drag to simulate time of day (00:00 to 23:59)"
          />
        </div>

        {/* Dynamic Weather Conditions */}
        <div className="sim-weather-group">
          <span className="group-label">Weather & Atmospheric Conditions:</span>
          <div className="weather-buttons-row">
            {Object.keys(WEATHER_TYPES).map(wKey => {
              const w = WEATHER_TYPES[wKey];
              const isSelected = currentWeather === wKey;
              return (
                <button
                  key={wKey}
                  id={`weather-btn-${wKey}`}
                  className={`weather-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setCurrentWeather(wKey)}
                  title={`${w.label} (Delay factor ×${w.multiplier})`}
                >
                  {wKey === 'CLEAR' && <Sun size={14} className="text-warning" />}
                  {wKey === 'RAIN' && <CloudRain size={14} className="text-info" />}
                  {wKey === 'FOG' && <CloudFog size={14} className="text-muted" />}
                  {wKey === 'CONSTRUCTION' && <HardHat size={14} className="text-warning" />}
                  <span>{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-Time Agent & Incident Actions */}
        <div className="sim-actions-group">
          <span className="group-label">Dynamic Agent & Real-Time Incident Simulation:</span>
          <div className="action-buttons-row">
            <button
              id="trigger-random-incident-btn"
              className="btn-sim-action incident"
              onClick={triggerRandomIncident}
              title="Cause a spontaneous accident or traffic spike on a random road"
            >
              <Flame size={15} />
              <span>Trigger Incident</span>
            </button>

            {liveVehicle.active ? (
              <button
                id="stop-vehicle-trip-btn"
                className="btn-sim-action vehicle running"
                onClick={stopVehicleTrip}
              >
                <Car size={15} className="pulse-car" />
                <span>Stop Vehicle Trip</span>
              </button>
            ) : (
              <button
                id="start-vehicle-trip-btn"
                className="btn-sim-action vehicle"
                onClick={startVehicleTrip}
                title="Launch an autonomous car that actively re-routes if roadblocks appear en-route"
              >
                <Car size={15} />
                <span>Simulate Vehicle Trip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
