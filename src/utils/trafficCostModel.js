/**
 * Traffic Cost Model & Mathematical Formulas
 * Implements CO1 & CO2 performance evaluation criteria.
 */

export const TRAFFIC_LEVELS = {
  LOW: {
    label: 'LOW',
    weight: 1,
    multiplier: 1.0,
    color: '#22c55e', // Emerald Green
    bgLight: '#dcfce7',
    textColor: '#15803d',
    description: 'Free flow conditions, near free-flow speed'
  },
  MEDIUM: {
    label: 'MEDIUM',
    weight: 2,
    multiplier: 1.25,
    color: '#eab308', // Amber / Yellow
    bgLight: '#fef9c3',
    textColor: '#a16207',
    description: 'Moderate volume, intermittent deceleration'
  },
  HIGH: {
    label: 'HIGH',
    weight: 3,
    multiplier: 1.75,
    color: '#f97316', // Orange
    bgLight: '#ffedd5',
    textColor: '#c2410c',
    description: 'Heavy congestion, significant delay'
  },
  VERY_HIGH: {
    label: 'VERY HIGH',
    weight: 4,
    multiplier: 2.5,
    color: '#ef4444', // Red
    bgLight: '#fee2e2',
    textColor: '#b91c1c',
    description: 'Severe bottleneck / crawl speed'
  },
  BLOCKED: {
    label: 'BLOCKED',
    weight: Infinity,
    multiplier: Infinity,
    color: '#6b7280', // Slate Gray / Dark Red
    bgLight: '#f3f4f6',
    textColor: '#374151',
    description: 'Road closed due to incident or maintenance'
  }
};

/**
 * Standardize level key
 */
export function normalizeTrafficLevel(level) {
  if (!level) return 'LOW';
  const str = String(level).toUpperCase().replace(/[\s_-]+/g, '_');
  if (str === 'VERY_HIGH' || str === 'VERYHIGH') return 'VERY_HIGH';
  if (str === 'MEDIUM' || str === 'MED') return 'MEDIUM';
  if (str === 'HIGH') return 'HIGH';
  if (str === 'BLOCKED' || str === 'CLOSED') return 'BLOCKED';
  return 'LOW';
}

export const WEATHER_TYPES = {
  CLEAR: { label: 'Clear Sky', multiplier: 1.0, icon: 'Sun' },
  RAIN: { label: 'Heavy Rain', multiplier: 1.3, icon: 'CloudRain' },
  FOG: { label: 'Dense Fog', multiplier: 1.4, icon: 'CloudFog' },
  CONSTRUCTION: { label: 'Road Work', multiplier: 1.6, icon: 'HardHat' }
};

/**
 * Calculate dynamic traffic level according to simulated time of day (0 to 24 hours)
 * Peak hours: 07:30 - 09:30 (Morning rush), 16:30 - 19:30 (Evening rush), 12:00 - 13:30 (Lunch)
 * Late night: 23:00 - 05:00 (Off-peak)
 */
export function getDynamicTrafficLevelForTime(edge, hourDecimal) {
  // If road is manually marked blocked, preserve blocked status
  if (normalizeTrafficLevel(edge.trafficLevel) === 'BLOCKED') {
    return 'BLOCKED';
  }

  const h = hourDecimal % 24;
  const isMorningRush = h >= 7.5 && h <= 9.5;
  const isEveningRush = h >= 16.5 && h <= 19.5;
  const isLunchRush = h >= 12.0 && h <= 13.5;
  const isNight = h >= 22.5 || h <= 5.5;

  // Major arterial roads
  const isDowntownArterial = ['A-D', 'D-E', 'D-G', 'B-E', 'E-H', 'G-H', 'H-L'].includes(edge.id);
  const isHighway = ['E-I', 'I-M', 'H-I'].includes(edge.id);

  if (isMorningRush || isEveningRush) {
    if (isDowntownArterial) return 'VERY_HIGH';
    if (isHighway) return 'HIGH';
    return 'MEDIUM';
  }

  if (isLunchRush) {
    if (isDowntownArterial) return 'HIGH';
    return 'MEDIUM';
  }

  if (isNight) {
    return 'LOW';
  }

  // Normal daytime
  if (isDowntownArterial) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculate the base travel time without traffic in minutes
 * Formula: Base Travel Time = (Distance / Speed) * 60
 */
export function calculateBaseTravelTime(distanceKm, speedKmh) {
  if (!speedKmh || speedKmh <= 0) return 0;
  return (distanceKm / speedKmh) * 60;
}

/**
 * Calculate the total cost / estimated travel time for an edge
 * Formula: Total Road Cost = Base Travel Time * Traffic Multiplier * Weather Multiplier
 */
export function calculateEdgeCost(edge, weatherKey = 'CLEAR') {
  const normLevel = normalizeTrafficLevel(edge.trafficLevel);
  const weather = WEATHER_TYPES[weatherKey] || WEATHER_TYPES.CLEAR;

  if (normLevel === 'BLOCKED') {
    return {
      baseTime: calculateBaseTravelTime(edge.distance, edge.speed),
      multiplier: Infinity,
      weatherMultiplier: weather.multiplier,
      totalCost: Infinity,
      distance: edge.distance,
      isBlocked: true,
      levelKey: 'BLOCKED'
    };
  }

  const levelInfo = TRAFFIC_LEVELS[normLevel] || TRAFFIC_LEVELS.LOW;
  const baseTime = calculateBaseTravelTime(edge.distance, edge.speed);
  const totalCost = baseTime * levelInfo.multiplier * weather.multiplier;

  return {
    baseTime: Number(baseTime.toFixed(2)),
    multiplier: levelInfo.multiplier,
    weatherMultiplier: weather.multiplier,
    totalCost: Number(totalCost.toFixed(2)),
    distance: edge.distance,
    isBlocked: false,
    levelKey: normLevel
  };
}

/**
 * Format minutes into readable mm:ss or decimal min
 */
export function formatMinutes(minutes) {
  if (minutes === Infinity || minutes === undefined || minutes === null) return 'N/A';
  if (minutes === 0) return '0.0 min';
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  if (mins === 0) return `${secs} sec`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s (${minutes.toFixed(1)} min)`;
}

export function formatDistance(distanceKm) {
  if (distanceKm === undefined || distanceKm === null) return '0.0 km';
  return `${Number(distanceKm).toFixed(1)} km`;
}

export function formatTimeOfDay(decimalHour) {
  const totalMinutes = Math.floor(decimalHour * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

