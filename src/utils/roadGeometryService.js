/**
 * Road Geometry Service
 * Provides high-fidelity real-world highway coordinates for road segments and optimal routes.
 * Sourced from real highway networks (NH-48, NH-45, NH-44, NH-544, ECR, NH-83) in Tamil Nadu, India.
 * Also supports dynamic OSRM routing for custom user-added locations.
 */
import { ROAD_GEOMETRIES } from '../data/roadGeometry.js';

// In-memory cache for dynamically fetched routes (e.g., custom user pins)
const dynamicRoadCache = new Map();
const pendingFetches = new Set();
const listeners = new Set();

export function subscribeRoadGeometryUpdates(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifySubscribers(edgeKey) {
  listeners.forEach(cb => {
    try {
      cb(edgeKey);
    } catch (e) {
      console.error('Error in road geometry listener:', e);
    }
  });
}

/**
 * Calculate Haversine distance in km between two lat/lng coordinates
 */
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate initial compass bearing from (lat1, lon1) to (lat2, lon2) in degrees [0, 360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const φ1 = lat1 * toRad;
  const φ2 = lat2 * toRad;
  const Δλ = (lon2 - lon1) * toRad;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (θ * toDeg + 360) % 360;
}

/**
 * Fetch dynamic driving route from OSRM for custom nodes
 */
export async function fetchOSRMRoute(u, v, edgeId) {
  if (!u || !v || !u.lat || !v.lat) return null;
  const cacheKey = `${u.id}-${v.id}`;
  if (dynamicRoadCache.has(cacheKey) || pendingFetches.has(cacheKey)) return;

  pendingFetches.add(cacheKey);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${u.lng},${u.lat};${v.lng},${v.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [
        Number(lat.toFixed(5)),
        Number(lng.toFixed(5))
      ]);
      dynamicRoadCache.set(cacheKey, coords);
      notifySubscribers(edgeId || cacheKey);
      return coords;
    }
  } catch (err) {
    console.warn(`Could not fetch dynamic OSRM route for ${cacheKey}:`, err.message);
  } finally {
    pendingFetches.delete(cacheKey);
  }

  return null;
}

const LEGACY_NODE_ID_MAP = {
  'A': 'CHN', 'B': 'KAN', 'C': 'CGL', 'D': 'VEL', 'E': 'TVM',
  'F': 'VPM', 'G': 'SLM', 'H': 'ERD', 'I': 'CBE', 'J': 'CUD',
  'K': 'TRY', 'L': 'THJ', 'M': 'DGL', 'N': 'MDU', 'O': 'TIR'
};

/**
 * Get road coordinates [ [lat, lng], ... ] for an edge between sourceId and destId.
 * Guarantees that points begin at sourceNode and end at destNode.
 */
export function getEdgeRoadCoordinates(sourceId, destId, sourceNode = null, destNode = null) {
  const normSource = LEGACY_NODE_ID_MAP[sourceId] || sourceId;
  const normDest = LEGACY_NODE_ID_MAP[destId] || destId;

  const directKey = `${normSource}-${normDest}`;
  const reverseKey = `${normDest}-${normSource}`;

  // 1. Check pre-computed high-fidelity road geometries
  if (ROAD_GEOMETRIES[directKey]) {
    return ROAD_GEOMETRIES[directKey];
  }

  if (ROAD_GEOMETRIES[reverseKey]) {
    return [...ROAD_GEOMETRIES[reverseKey]].reverse();
  }

  // 2. Check dynamic cache
  if (dynamicRoadCache.has(directKey)) {
    return dynamicRoadCache.get(directKey);
  }

  if (dynamicRoadCache.has(reverseKey)) {
    return [...dynamicRoadCache.get(reverseKey)].reverse();
  }

  // Fallback checks for unnormalized keys
  const rawDirect = `${sourceId}-${destId}`;
  const rawReverse = `${destId}-${sourceId}`;
  if (ROAD_GEOMETRIES[rawDirect]) return ROAD_GEOMETRIES[rawDirect];
  if (ROAD_GEOMETRIES[rawReverse]) return [...ROAD_GEOMETRIES[rawReverse]].reverse();

  // 3. Trigger background fetch if nodes are provided
  if (sourceNode && destNode && sourceNode.lat && destNode.lat) {
    fetchOSRMRoute(sourceNode, destNode, directKey);
    return [[sourceNode.lat, sourceNode.lng], [destNode.lat, destNode.lng]];
  }

  return [];
}

/**
 * Get continuous road coordinates for an entire multi-hop route path.
 * e.g., path: ['CHN', 'VEL', 'SLM', 'DGL', 'MDU', 'TIR']
 * Stitches together the exact highway geometry of each corridor without duplicate vertices.
 */
export function getFullRouteRoadCoordinates(pathNodeIds, nodeMap = {}) {
  if (!pathNodeIds || pathNodeIds.length < 2) {
    if (pathNodeIds && pathNodeIds.length === 1 && nodeMap[pathNodeIds[0]]) {
      const node = nodeMap[pathNodeIds[0]];
      return [[node.lat, node.lng]];
    }
    return [];
  }

  const stitchedPoints = [];

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const uId = pathNodeIds[i];
    const vId = pathNodeIds[i + 1];
    const u = nodeMap[uId];
    const v = nodeMap[vId];

    const segmentCoords = getEdgeRoadCoordinates(uId, vId, u, v);

    if (segmentCoords.length > 0) {
      // If not the first segment, skip the first point to prevent duplicates
      const startIndex = stitchedPoints.length > 0 ? 1 : 0;
      for (let j = startIndex; j < segmentCoords.length; j++) {
        stitchedPoints.push(segmentCoords[j]);
      }
    } else if (u && v) {
      if (stitchedPoints.length === 0) {
        stitchedPoints.push([u.lat, u.lng]);
      }
      stitchedPoints.push([v.lat, v.lng]);
    }
  }

  return stitchedPoints;
}

/**
 * Interpolate a position along a road polyline given progress from 0.0 to 1.0.
 * Returns { lat, lng, bearing } matching physical distance along the road geometry.
 */
export function interpolatePositionAlongRoad(roadCoordinates, progress) {
  if (!roadCoordinates || roadCoordinates.length === 0) return null;
  if (roadCoordinates.length === 1) {
    return {
      lat: roadCoordinates[0][0],
      lng: roadCoordinates[0][1],
      bearing: 0
    };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));

  if (clampedProgress <= 0) {
    const p0 = roadCoordinates[0];
    const p1 = roadCoordinates[1];
    return {
      lat: p0[0],
      lng: p0[1],
      bearing: calculateBearing(p0[0], p0[1], p1[0], p1[1])
    };
  }

  if (clampedProgress >= 1) {
    const pLast = roadCoordinates[roadCoordinates.length - 1];
    const pPrev = roadCoordinates[roadCoordinates.length - 2];
    return {
      lat: pLast[0],
      lng: pLast[1],
      bearing: calculateBearing(pPrev[0], pPrev[1], pLast[0], pLast[1])
    };
  }

  // Pre-calculate segment lengths
  const segmentLengths = [];
  let totalLength = 0;

  for (let i = 0; i < roadCoordinates.length - 1; i++) {
    const p1 = roadCoordinates[i];
    const p2 = roadCoordinates[i + 1];
    const dist = calculateHaversineKm(p1[0], p1[1], p2[0], p2[1]);
    segmentLengths.push(dist);
    totalLength += dist;
  }

  if (totalLength === 0) {
    return {
      lat: roadCoordinates[0][0],
      lng: roadCoordinates[0][1],
      bearing: 0
    };
  }

  const targetDist = totalLength * clampedProgress;
  let accumulatedDist = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulatedDist + segLen >= targetDist || i === segmentLengths.length - 1) {
      const segFraction = segLen > 0 ? (targetDist - accumulatedDist) / segLen : 0;
      const clampedFraction = Math.max(0, Math.min(1, segFraction));

      const p1 = roadCoordinates[i];
      const p2 = roadCoordinates[i + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * clampedFraction;
      const lng = p1[1] + (p2[1] - p1[1]) * clampedFraction;
      const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

      return { lat, lng, bearing };
    }
    accumulatedDist += segLen;
  }

  const lastPoint = roadCoordinates[roadCoordinates.length - 1];
  return { lat: lastPoint[0], lng: lastPoint[1], bearing: 0 };
}
