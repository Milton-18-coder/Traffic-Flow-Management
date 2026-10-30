/**
 * Preset Traffic Scenarios for Dynamic Simulation
 */

export const TRAFFIC_SCENARIOS = {
  NORMAL: {
    id: 'NORMAL',
    name: 'Normal Traffic',
    icon: 'Activity',
    description: 'Standard midday highway flow across Tamil Nadu. Moderate load on Chennai GST arterial and industrial corridors.',
    edgeOverrides: {
      'CHN-CGL': { trafficLevel: 'VERY HIGH' },
      'CHN-KAN': { trafficLevel: 'HIGH' },
      'CGL-VPM': { trafficLevel: 'HIGH' },
      'VPM-TRY': { trafficLevel: 'HIGH' },
      'TRY-MDU': { trafficLevel: 'HIGH' },
      'CHN-VEL': { trafficLevel: 'LOW' },
      'VEL-TVM': { trafficLevel: 'LOW' },
      'VEL-SLM': { trafficLevel: 'LOW' },
      'SLM-ERD': { trafficLevel: 'MEDIUM' },
      'ERD-CBE': { trafficLevel: 'LOW' },
      'SLM-TRY': { trafficLevel: 'LOW' },
      'TRY-DGL': { trafficLevel: 'LOW' },
      'DGL-MDU': { trafficLevel: 'LOW' },
      'MDU-TIR': { trafficLevel: 'LOW' }
    }
  },
  PEAK_HOUR: {
    id: 'PEAK_HOUR',
    name: 'Peak Hour Rush',
    icon: 'Flame',
    description: 'Heavy commuter rush across Chennai GST Road, Villupuram NH-45, and Madurai arterial corridors.',
    edgeOverrides: {
      'CHN-CGL': { trafficLevel: 'VERY HIGH' },
      'CHN-KAN': { trafficLevel: 'VERY HIGH' },
      'CGL-VPM': { trafficLevel: 'VERY HIGH' },
      'VPM-TRY': { trafficLevel: 'VERY HIGH' },
      'TRY-MDU': { trafficLevel: 'VERY HIGH' },
      'TRY-THJ': { trafficLevel: 'HIGH' },
      'THJ-MDU': { trafficLevel: 'HIGH' },
      'SLM-ERD': { trafficLevel: 'HIGH' },
      'ERD-CBE': { trafficLevel: 'HIGH' },
      // Open bypass routes (Western & Central NH-44 Corridors):
      'CHN-VEL': { trafficLevel: 'MEDIUM' },
      'VEL-SLM': { trafficLevel: 'LOW' },
      'SLM-TRY': { trafficLevel: 'LOW' },
      'TRY-DGL': { trafficLevel: 'LOW' },
      'DGL-MDU': { trafficLevel: 'MEDIUM' },
      'MDU-TIR': { trafficLevel: 'LOW' },
      'CGL-CUD': { trafficLevel: 'LOW' },
      'CUD-THJ': { trafficLevel: 'LOW' }
    }
  },
  ACCIDENT: {
    id: 'ACCIDENT',
    name: 'Accident / GST Road Blockage',
    icon: 'AlertTriangle',
    description: 'Major collision and highway blockage on GST Road (CHN-CGL & CGL-VPM blocked). Agent autonomously recalculates western detour.',
    edgeOverrides: {
      'CHN-CGL': { trafficLevel: 'BLOCKED' },
      'CGL-VPM': { trafficLevel: 'BLOCKED' },
      'CHN-KAN': { trafficLevel: 'HIGH' },
      'CHN-VEL': { trafficLevel: 'LOW' },
      'KAN-VEL': { trafficLevel: 'LOW' },
      'VEL-SLM': { trafficLevel: 'LOW' },
      'SLM-TRY': { trafficLevel: 'LOW' },
      'TRY-MDU': { trafficLevel: 'LOW' },
      'MDU-TIR': { trafficLevel: 'LOW' }
    }
  },
  OFF_PEAK: {
    id: 'OFF_PEAK',
    name: 'Off-Peak / Night Flow',
    icon: 'Moon',
    description: 'Minimal traffic across all Tamil Nadu National & State Highways. Physical distance dominates travel time.',
    edgeOverrides: {
      'CHN-KAN': { trafficLevel: 'LOW' },
      'CHN-CGL': { trafficLevel: 'LOW' },
      'CHN-VEL': { trafficLevel: 'LOW' },
      'KAN-CGL': { trafficLevel: 'LOW' },
      'KAN-VEL': { trafficLevel: 'LOW' },
      'KAN-TVM': { trafficLevel: 'LOW' },
      'CGL-VPM': { trafficLevel: 'LOW' },
      'CGL-CUD': { trafficLevel: 'LOW' },
      'VEL-TVM': { trafficLevel: 'LOW' },
      'VEL-SLM': { trafficLevel: 'LOW' },
      'TVM-VPM': { trafficLevel: 'LOW' },
      'TVM-SLM': { trafficLevel: 'LOW' },
      'VPM-CUD': { trafficLevel: 'LOW' },
      'VPM-TRY': { trafficLevel: 'LOW' },
      'SLM-ERD': { trafficLevel: 'LOW' },
      'SLM-TRY': { trafficLevel: 'LOW' },
      'ERD-CBE': { trafficLevel: 'LOW' },
      'ERD-DGL': { trafficLevel: 'LOW' },
      'CBE-DGL': { trafficLevel: 'LOW' },
      'CUD-THJ': { trafficLevel: 'LOW' },
      'TRY-THJ': { trafficLevel: 'LOW' },
      'TRY-DGL': { trafficLevel: 'LOW' },
      'TRY-MDU': { trafficLevel: 'LOW' },
      'THJ-MDU': { trafficLevel: 'LOW' },
      'DGL-MDU': { trafficLevel: 'LOW' },
      'MDU-TIR': { trafficLevel: 'LOW' }
    }
  }
};
