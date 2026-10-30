/**
 * Traffic Network Graph Data
 * 15 Junctions (Nodes A through O) with both:
 * 1. 2D canvas coordinates (x, y) for spatial SVG state space explorer
 * 2. Real-world GPS coordinates (lat, lng) for Live OpenStreetMap (Leaflet API) interactive mapping.
 * 
 * 26 Bidirectional road segments (Edges) with physical distance (km), speed limits (km/h),
 * and traffic congestion levels.
 */

// Base reference: Tamil Nadu Metropolitan & State Highway Network (Connecting Major Cities & Corridors across Tamil Nadu, India)
export const INITIAL_NODES = [
  { id: 'CHN', name: 'Chennai Central', x: 120, y: 140, lat: 13.0827, lng: 80.2707, type: 'transit', desc: 'State Capital, Port Gateway & Central Railway Arterial' },
  { id: 'KAN', name: 'Kanchipuram', x: 230, y: 220, lat: 12.8342, lng: 79.7036, type: 'commercial', desc: 'Heritage Silk City & NH-48 Western Expressway Corridor' },
  { id: 'CGL', name: 'Chengalpattu', x: 180, y: 350, lat: 12.6841, lng: 79.9836, type: 'transit', desc: 'Southern Chennai Gateway & GST Road (NH-32) Junction' },
  { id: 'VEL', name: 'Vellore', x: 350, y: 130, lat: 12.9165, lng: 79.1325, type: 'civic', desc: 'Fort City & Golden Quadrilateral Highway Hub' },
  { id: 'TVM', name: 'Tiruvannamalai', x: 370, y: 270, lat: 12.2253, lng: 79.0747, type: 'civic', desc: 'Central Heritage Hub & SH-9 Arterial Crossroads' },
  { id: 'VPM', name: 'Villupuram', x: 310, y: 410, lat: 11.9401, lng: 79.4861, type: 'transit', desc: 'Major Southern Railway & GST NH-45 Highway Interchange' },
  { id: 'SLM', name: 'Salem', x: 520, y: 190, lat: 11.6643, lng: 78.1460, type: 'industrial', desc: 'Steel City, NH-44 & NH-544 Western Hub' },
  { id: 'ERD', name: 'Erode', x: 660, y: 150, lat: 11.3410, lng: 77.7172, type: 'industrial', desc: 'Kaveri Basin Textile Hub & NH-544 Industrial Expressway' },
  { id: 'CBE', name: 'Coimbatore', x: 810, y: 110, lat: 11.0168, lng: 76.9558, type: 'commercial', desc: 'Manchester of South India, Avinashi Rd & Tech Hub' },
  { id: 'CUD', name: 'Cuddalore', x: 270, y: 530, lat: 11.7480, lng: 79.7714, type: 'commercial', desc: 'East Coast Road (ECR) Port & Coastal Artery' },
  { id: 'TRY', name: 'Tiruchirappalli', x: 550, y: 380, lat: 10.7905, lng: 78.7047, type: 'transit', desc: 'Trichy Central Hub, Cauvery Basin & NH-83 Crossroad' },
  { id: 'THJ', name: 'Thanjavur', x: 440, y: 520, lat: 10.7870, lng: 79.1378, type: 'civic', desc: 'Delta Heritage Capital & Grand Anicut Corridor' },
  { id: 'DGL', name: 'Dindigul', x: 720, y: 310, lat: 10.3673, lng: 77.9803, type: 'industrial', desc: 'Lock City & NH-44 / NH-83 Southern Highway Junction' },
  { id: 'MDU', name: 'Madurai', x: 760, y: 460, lat: 9.9252, lng: 78.1198, type: 'commercial', desc: 'Temple City & Southern Cultural Capital Transit Hub' },
  { id: 'TIR', name: 'Tirunelveli', x: 950, y: 530, lat: 8.7139, lng: 77.7567, type: 'transit', desc: 'Southern Highway Terminus & NH-44 Express Gateway' }
];

export const INITIAL_EDGES = [
  // Northern & Chennai Regional Cluster
  { id: 'CHN-KAN', source: 'CHN', destination: 'KAN', distance: 75.0, speed: 70, trafficLevel: 'HIGH', label: 'Chennai-Kanchi NH-48' },
  { id: 'CHN-CGL', source: 'CHN', destination: 'CGL', distance: 56.0, speed: 60, trafficLevel: 'VERY HIGH', label: 'GST Road (NH-32)' },
  { id: 'CHN-VEL', source: 'CHN', destination: 'VEL', distance: 138.0, speed: 80, trafficLevel: 'MEDIUM', label: 'Golden Quad NH-48' },
  
  // Western Gateway & Heritage Links
  { id: 'KAN-CGL', source: 'KAN', destination: 'CGL', distance: 36.0, speed: 50, trafficLevel: 'LOW', label: 'Walajabad Link (SH-58)' },
  { id: 'KAN-VEL', source: 'KAN', destination: 'VEL', distance: 72.0, speed: 75, trafficLevel: 'LOW', label: 'Ranipet Express NH-48' },
  { id: 'KAN-TVM', source: 'KAN', destination: 'TVM', distance: 112.0, speed: 60, trafficLevel: 'MEDIUM', label: 'Cheyyar Highway (SH-5A)' },
  { id: 'CGL-VPM', source: 'CGL', destination: 'VPM', distance: 104.0, speed: 80, trafficLevel: 'HIGH', label: 'GST NH-45 Arterial' },
  { id: 'CGL-CUD', source: 'CGL', destination: 'CUD', distance: 135.0, speed: 65, trafficLevel: 'LOW', label: 'ECR Coastal Corridor' },
  
  // North-Central & Vellore Corridors
  { id: 'VEL-TVM', source: 'VEL', destination: 'TVM', distance: 84.0, speed: 65, trafficLevel: 'LOW', label: 'Polur Highway (NH-234)' },
  { id: 'VEL-SLM', source: 'VEL', destination: 'SLM', distance: 215.0, speed: 90, trafficLevel: 'LOW', label: 'Salem NH-44 Expressway' },
  { id: 'TVM-VPM', source: 'TVM', destination: 'VPM', distance: 62.0, speed: 60, trafficLevel: 'LOW', label: 'Gingee Feeder (NH-234)' },
  { id: 'TVM-SLM', source: 'TVM', destination: 'SLM', distance: 165.0, speed: 70, trafficLevel: 'MEDIUM', label: 'Harur Ghats Highway' },
  
  // Central Delta & Coastal Sector
  { id: 'VPM-CUD', source: 'VPM', destination: 'CUD', distance: 45.0, speed: 60, trafficLevel: 'LOW', label: 'Cuddalore Link (NH-45A)' },
  { id: 'VPM-TRY', source: 'VPM', destination: 'TRY', distance: 160.0, speed: 90, trafficLevel: 'HIGH', label: 'Trichy NH-45 Express' },
  { id: 'SLM-ERD', source: 'SLM', destination: 'ERD', distance: 65.0, speed: 85, trafficLevel: 'MEDIUM', label: 'Erode NH-544 Belt' },
  { id: 'SLM-TRY', source: 'SLM', destination: 'TRY', distance: 142.0, speed: 80, trafficLevel: 'LOW', label: 'Namakkal-Trichy NH-44' },
  
  // Western Industrial Corridor (Coimbatore & Erode)
  { id: 'ERD-CBE', source: 'ERD', destination: 'CBE', distance: 100.0, speed: 90, trafficLevel: 'MEDIUM', label: 'Avinashi NH-544 6-Lane' },
  { id: 'ERD-DGL', source: 'ERD', destination: 'DGL', distance: 135.0, speed: 70, trafficLevel: 'LOW', label: 'Dharapuram Highway' },
  { id: 'CBE-DGL', source: 'CBE', destination: 'DGL', distance: 165.0, speed: 75, trafficLevel: 'LOW', label: 'Palani Highway (NH-83)' },
  
  // Central Delta & Southern Linkages
  { id: 'CUD-THJ', source: 'CUD', destination: 'THJ', distance: 138.0, speed: 65, trafficLevel: 'LOW', label: 'Kumbakonam Delta Way' },
  { id: 'TRY-THJ', source: 'TRY', destination: 'THJ', distance: 55.0, speed: 80, trafficLevel: 'LOW', label: 'Thanjavur NH-83 4-Lane' },
  { id: 'TRY-DGL', source: 'TRY', destination: 'DGL', distance: 102.0, speed: 85, trafficLevel: 'MEDIUM', label: 'Dindigul Express NH-83' },
  { id: 'TRY-MDU', source: 'TRY', destination: 'MDU', distance: 135.0, speed: 90, trafficLevel: 'HIGH', label: 'Madurai NH-38 Express' },
  
  // Southern Plains & Terminus
  { id: 'THJ-MDU', source: 'THJ', destination: 'MDU', distance: 160.0, speed: 75, trafficLevel: 'LOW', label: 'Pudukkottai-Melur Way' },
  { id: 'DGL-MDU', source: 'DGL', destination: 'MDU', distance: 64.0, speed: 90, trafficLevel: 'MEDIUM', label: 'Madurai NH-44 4-Lane' },
  { id: 'MDU-TIR', source: 'MDU', destination: 'TIR', distance: 160.0, speed: 90, trafficLevel: 'LOW', label: 'Tirunelveli NH-44 Freeway' }
];

export const MAX_NETWORK_SPEED = 100; // km/h (Admissible maximum highway speed for A* heuristic)

import { TAMIL_NADU_ALL_PLACES, calculateHaversineKm } from './tamilNaduPlaces.js';

/**
 * Builds the comprehensive 118-city Tamil Nadu statewide highway network.
 * Uses standard 3-letter city initials (CHN, VEL, MDU, TIR, etc.),
 * while integrating Kovilpatti (KVP) and all 38 districts with realistic highway connectivity.
 */
export function buildStatewideTamilNaduNetwork() {
  const nodes = [...INITIAL_NODES];
  const edges = [...INITIAL_EDGES];

  const initialNames = new Map();
  INITIAL_NODES.forEach(n => {
    initialNames.set(n.name.toLowerCase().trim(), n.id);
  });

  const idAliases = {
    'A': 'CHN', 'B': 'KAN', 'C': 'CGL', 'D': 'VEL', 'E': 'TVM', 'F': 'VPM',
    'G': 'SLM', 'H': 'ERD', 'I': 'CBE', 'J': 'CUD', 'K': 'TRY', 'L': 'THJ',
    'M': 'DGL', 'N': 'MDU', 'O': 'TIR'
  };

  // 1. Add all places not already in INITIAL_NODES
  TAMIL_NADU_ALL_PLACES.forEach(place => {
    if (nodes.some(n => n.id === place.id)) return;
    if (idAliases[place.id]) return;
    if (initialNames.has(place.name.toLowerCase().trim())) return;

    const x = Math.round(Math.max(60, Math.min(1080, 60 + ((place.lng - 76.5) / 4.0) * 980)));
    const y = Math.round(Math.max(60, Math.min(560, 60 + ((13.3 - place.lat) / 5.3) * 500)));

    nodes.push({
      id: place.id,
      name: place.name,
      district: place.district,
      lat: place.lat,
      lng: place.lng,
      x,
      y,
      type: place.type || 'commercial',
      desc: place.desc || (place.district ? `${place.district} District` : 'Tamil Nadu City')
    });
  });

  const edgeSet = new Set();
  edges.forEach(e => {
    edgeSet.add(`${e.source}-${e.destination}`);
    edgeSet.add(`${e.destination}-${e.source}`);
  });

  function addEdge(sourceId, destId, distance, speed = 75, label = '') {
    const u = idAliases[sourceId] || sourceId;
    const v = idAliases[destId] || destId;
    if (u === v) return;
    const key1 = `${u}-${v}`;
    const key2 = `${v}-${u}`;
    if (edgeSet.has(key1) || edgeSet.has(key2)) return;

    const nodeU = nodes.find(n => n.id === u);
    const nodeV = nodes.find(n => n.id === v);
    if (!nodeU || !nodeV) return;

    const d = distance || Number(Math.max(8.0, calculateHaversineKm(nodeU.lat, nodeU.lng, nodeV.lat, nodeV.lng) * 1.18).toFixed(1));
    edges.push({
      id: key1,
      source: u,
      destination: v,
      distance: d,
      speed: speed,
      trafficLevel: 'LOW',
      label: label || `${nodeU.name} ↔ ${nodeV.name} Corridor`
    });
    edgeSet.add(key1);
    edgeSet.add(key2);
  }

  // 2. Add Key Arterial Expressways (NH-44, NH-45, NH-83, NH-48, NH-66, ECR, etc.)
  // Southern NH-44 Express Corridor (Madurai -> Virudhunagar -> Sattur -> Kovilpatti -> Tirunelveli -> Kanyakumari)
  addEdge('MDU', 'VRD', 46.0, 85, 'Madurai-Virudhunagar NH-44 4-Lane');
  addEdge('VRD', 'STR', 24.0, 85, 'Virudhunagar-Sattur NH-44 4-Lane');
  addEdge('STR', 'KVP', 23.0, 85, 'Sattur-Kovilpatti NH-44 4-Lane');
  addEdge('KVP', 'TIR', 55.0, 85, 'Kovilpatti-Tirunelveli NH-44 4-Lane');
  addEdge('TIR', 'NGN', 28.0, 85, 'Tirunelveli-Nanguneri NH-44');
  addEdge('NGN', 'VLR', 15.0, 85, 'Nanguneri-Valliyur NH-44');
  addEdge('VLR', 'NAG', 30.0, 80, 'Valliyur-Nagercoil NH-44');
  addEdge('NAG', 'KYK', 19.0, 75, 'Nagercoil-Kanyakumari Express Link');
  addEdge('VLR', 'KYK', 35.0, 85, 'Valliyur-Kanyakumari NH-44 Direct');

  // Southern Cross Arterials from Kovilpatti & Thoothukudi
  addEdge('KVP', 'TUT', 54.0, 80, 'Kovilpatti-Thoothukudi SH-73 Expressway');
  addEdge('KVP', 'SKV', 38.0, 70, 'Kovilpatti-Sankarankovil SH-41');
  addEdge('STR', 'SVK', 22.0, 70, 'Sattur-Sivakasi SH-187');
  addEdge('VRD', 'SVK', 26.0, 75, 'Virudhunagar-Sivakasi SH-42');
  addEdge('VRD', 'APK', 20.0, 70, 'Virudhunagar-Aruppukkottai SH-42');
  addEdge('SVK', 'RJP', 28.0, 70, 'Sivakasi-Rajapalayam Link');
  addEdge('RJP', 'SVP', 12.0, 70, 'Rajapalayam-Srivilliputhur NH-744');
  addEdge('SVP', 'MDU', 78.0, 75, 'Srivilliputhur-Madurai NH-744');
  addEdge('SKV', 'TEN', 42.0, 70, 'Sankarankovil-Tenkasi SH-41');
  addEdge('TEN', 'CTM', 6.0, 60, 'Tenkasi-Courtallam Tourist Way');
  addEdge('TEN', 'SGT', 9.0, 65, 'Tenkasi-Sengottai Kerala Pass');
  addEdge('TEN', 'TIR', 53.0, 75, 'Tenkasi-Tirunelveli SH-39');
  addEdge('ABS', 'TIR', 38.0, 70, 'Ambasamudram-Tirunelveli River Road');
  addEdge('ABS', 'TEN', 40.0, 65, 'Ambasamudram-Tenkasi Link');
  addEdge('TUT', 'TIR', 48.0, 80, 'Thoothukudi-Tirunelveli 4-Lane NH-138');
  addEdge('TUT', 'TCD', 38.0, 75, 'Thoothukudi-Tiruchendur Coastal SH-176');
  addEdge('TIR', 'TCD', 55.0, 75, 'Tirunelveli-Tiruchendur SH-40');
  addEdge('TCD', 'KYP', 10.0, 60, 'Tiruchendur-Kayalpattinam Coastal Link');
  addEdge('NAG', 'MTD', 26.0, 70, 'Nagercoil-Marthandam NH-66');

  // Western Hill & Industrial Links (Coimbatore, Nilgiris, Erode, Salem)
  addEdge('CBE', 'PLC', 40.0, 75, 'Coimbatore-Pollachi NH-83 4-Lane');
  addEdge('CBE', 'MTP', 36.0, 70, 'Coimbatore-Mettupalayam NH-181');
  addEdge('MTP', 'CNR', 35.0, 50, 'Mettupalayam-Coonoor Mountain Ghat Road');
  addEdge('CNR', 'OOT', 19.0, 50, 'Coonoor-Ooty Scenic Highway');
  addEdge('MTP', 'OOT', 52.0, 50, 'Mettupalayam-Ooty NH-181 Ghats');
  addEdge('PLC', 'VLP', 64.0, 45, 'Pollachi-Valparai Anamalai Ghats');
  addEdge('PLC', 'PLN', 66.0, 75, 'Pollachi-Palani NH-83');
  addEdge('PLN', 'DGL', 58.0, 75, 'Palani-Dindigul NH-83');
  addEdge('PLN', 'KOD', 65.0, 50, 'Palani-Kodaikanal Ghat Pass');
  addEdge('DGL', 'KOD', 95.0, 55, 'Dindigul-Kodaikanal Ghat Road');
  addEdge('DGL', 'THN', 74.0, 75, 'Dindigul-Theni Highway');
  addEdge('MDU', 'THN', 75.0, 75, 'Madurai-Theni NH-85');
  addEdge('THN', 'BDN', 15.0, 65, 'Theni-Bodinayakanur Cardamom Way');
  addEdge('THN', 'CUM', 42.0, 70, 'Theni-Cumbum Grape Valley NH-183');
  addEdge('ERD', 'AVN', 52.0, 85, 'Erode-Avinashi NH-544');
  addEdge('AVN', 'CBE', 42.0, 85, 'Avinashi-Coimbatore NH-544 6-Lane');
  addEdge('ERD', 'BHV', 14.0, 70, 'Erode-Bhavani Kaveri Bridge');
  addEdge('BHV', 'GBC', 26.0, 70, 'Bhavani-Gobichettipalayam Road');
  addEdge('GBC', 'STM', 28.0, 65, 'Gobichettipalayam-Sathyamangalam Link');
  addEdge('STM', 'ERD', 62.0, 70, 'Sathyamangalam-Erode Highway');
  addEdge('ERD', 'KNG', 46.0, 75, 'Erode-Kangeyam Road');
  addEdge('KNG', 'DHP', 32.0, 70, 'Kangeyam-Dharapuram Link');
  addEdge('DHP', 'PLN', 36.0, 75, 'Dharapuram-Palani Road');
  addEdge('SLM', 'NMK', 54.0, 85, 'Salem-Namakkal NH-44 4-Lane');
  addEdge('NMK', 'KAR', 44.0, 80, 'Namakkal-Karur NH-44');
  addEdge('KAR', 'DGL', 74.0, 80, 'Karur-Dindigul NH-44');
  addEdge('KAR', 'TRY', 80.0, 75, 'Karur-Trichy NH-81');
  addEdge('KAR', 'KLT', 38.0, 75, 'Karur-Kulithalai Cauvery Road');
  addEdge('KLT', 'TRY', 40.0, 75, 'Kulithalai-Trichy NH-81');
  addEdge('NMK', 'TCG', 32.0, 70, 'Namakkal-Tiruchengode Link');
  addEdge('TCG', 'ERD', 22.0, 70, 'Tiruchengode-Erode Link');
  addEdge('NMK', 'RSP', 26.0, 70, 'Namakkal-Rasipuram Highway');
  addEdge('RSP', 'SLM', 28.0, 75, 'Rasipuram-Salem NH-44');
  addEdge('SLM', 'MTR', 52.0, 70, 'Salem-Mettur Dam Highway');
  addEdge('SLM', 'YRC', 30.0, 50, 'Salem-Yercaud Shevaroy Ghats');
  addEdge('SLM', 'ATR', 52.0, 80, 'Salem-Attur NH-79 Expressway');
  addEdge('ATR', 'KLK', 48.0, 80, 'Attur-Kallakurichi NH-79');
  addEdge('KLK', 'ULD', 36.0, 80, 'Kallakurichi-Ulundurpet NH-79');
  addEdge('ULD', 'VPM', 38.0, 85, 'Ulundurpet-Villupuram NH-45');
  addEdge('ULD', 'PER', 45.0, 85, 'Ulundurpet-Perambalur NH-45');
  addEdge('PER', 'TRY', 58.0, 85, 'Perambalur-Trichy NH-45');
  addEdge('PER', 'ARI', 32.0, 70, 'Perambalur-Ariyalur Road');
  addEdge('ARI', 'JKD', 26.0, 70, 'Ariyalur-Jayankondam Heritage Link');
  addEdge('JKD', 'KMB', 34.0, 70, 'Jayankondam-Kumbakonam Bridge');

  // Northern Corridors (Salem -> Dharmapuri -> Krishnagiri -> Hosur -> Bangalore)
  addEdge('SLM', 'DHA', 65.0, 85, 'Salem-Dharmapuri NH-44 4-Lane');
  addEdge('DHA', 'KRI', 48.0, 85, 'Dharmapuri-Krishnagiri NH-44');
  addEdge('KRI', 'HSR', 52.0, 85, 'Krishnagiri-Hosur NH-44 Expressway');
  addEdge('DHA', 'HAR', 38.0, 70, 'Dharmapuri-Harur SH-60');
  addEdge('HAR', 'TVM', 75.0, 70, 'Harur-Tiruvannamalai Highway');
  addEdge('KRI', 'TPT', 48.0, 75, 'Krishnagiri-Tirupattur Link');
  addEdge('TPT', 'VNB', 22.0, 80, 'Tirupattur-Vaniyambadi NH-48');
  addEdge('VNB', 'AMB', 18.0, 85, 'Vaniyambadi-Ambur NH-48 6-Lane');
  addEdge('AMB', 'VEL', 52.0, 85, 'Ambur-Vellore NH-48 6-Lane');
  addEdge('VEL', 'KTP', 8.0, 60, 'Vellore-Katpadi Bridge');
  addEdge('VEL', 'GDM', 32.0, 70, 'Vellore-Gudiyatham Link');
  addEdge('VEL', 'RPT', 24.0, 80, 'Vellore-Ranipet NH-48');
  addEdge('RPT', 'WLP', 6.0, 70, 'Ranipet-Walajapet Link');
  addEdge('WLP', 'KAN', 42.0, 80, 'Walajapet-Kanchipuram NH-48');
  addEdge('RPT', 'AKM', 32.0, 70, 'Ranipet-Arakkonam Highway');
  addEdge('AKM', 'SHL', 26.0, 65, 'Arakkonam-Sholinghur Link');
  addEdge('VEL', 'ARN', 38.0, 70, 'Vellore-Arani Highway');
  addEdge('ARN', 'TVM', 58.0, 70, 'Arani-Tiruvannamalai Highway');
  addEdge('TVM', 'PLR', 35.0, 70, 'Tiruvannamalai-Polur NH-234');
  addEdge('PLR', 'VEL', 49.0, 70, 'Polur-Vellore NH-234');
  addEdge('ARN', 'CYR', 32.0, 70, 'Arani-Cheyyar Highway');
  addEdge('CYR', 'KAN', 30.0, 70, 'Cheyyar-Kanchipuram SH-5A');
  addEdge('CYR', 'VDV', 28.0, 70, 'Cheyyar-Vandavasi Link');
  addEdge('VDV', 'TDV', 38.0, 70, 'Vandavasi-Tindivanam Highway');
  addEdge('VPM', 'TDV', 38.0, 85, 'Villupuram-Tindivanam NH-45');
  addEdge('TDV', 'GNG', 28.0, 70, 'Tindivanam-Gingee NH-234');
  addEdge('TDV', 'CGL', 68.0, 85, 'Tindivanam-Chengalpattu NH-45');

  // Chennai Metropolitan Corridors
  addEdge('CHN', 'TBM', 28.0, 65, 'Chennai-Tambaram GST Road');
  addEdge('TBM', 'CGL', 30.0, 75, 'Tambaram-Chengalpattu GST Expressway');
  addEdge('CHN', 'PNM', 20.0, 60, 'Chennai-Poonamallee High Road');
  addEdge('PNM', 'SPB', 18.0, 75, 'Poonamallee-Sriperumbudur NH-48');
  addEdge('SPB', 'KAN', 32.0, 80, 'Sriperumbudur-Kanchipuram NH-48');
  addEdge('CHN', 'AVD', 22.0, 60, 'Chennai-Avadi CTH Road');
  addEdge('AVD', 'TVL', 24.0, 70, 'Avadi-Tiruvallur Highway');
  addEdge('TVL', 'TTN', 38.0, 70, 'Tiruvallur-Tiruttani NH-716');
  addEdge('TTN', 'AKM', 18.0, 70, 'Tiruttani-Arakkonam Link');
  addEdge('CHN', 'PNR', 34.0, 65, 'Chennai-Ponneri Highway');
  addEdge('PNR', 'GMD', 22.0, 70, 'Ponneri-Gummidipoondi Link');
  addEdge('CHN', 'GMD', 48.0, 75, 'Chennai-Gummidipoondi NH-16');
  addEdge('CGL', 'MAM', 28.0, 70, 'Chengalpattu-Mahabalipuram Link');
  addEdge('CHN', 'MAM', 52.0, 75, 'Chennai-Mahabalipuram ECR Expressway');
  addEdge('MAM', 'KPK', 16.0, 70, 'Mahabalipuram-Kalpakkam ECR');
  addEdge('KPK', 'PDY', 84.0, 75, 'Kalpakkam-Puducherry ECR');
  addEdge('CGL', 'MDT', 24.0, 80, 'Chengalpattu-Madurantakam NH-45');
  addEdge('MDT', 'MMR', 12.0, 80, 'Madurantakam-Melmaruvathur NH-45');
  addEdge('MMR', 'TDV', 32.0, 85, 'Melmaruvathur-Tindivanam NH-45');

  // Coastal & Delta Corridors (Pondicherry, Cuddalore, Chidambaram, Kumbakonam, Thanjavur, Rameswaram)
  addEdge('TDV', 'PDY', 38.0, 75, 'Tindivanam-Puducherry NH-332');
  addEdge('PDY', 'AVR', 12.0, 60, 'Puducherry-Auroville Link');
  addEdge('PDY', 'CUD', 24.0, 75, 'Puducherry-Cuddalore ECR NH-32');
  addEdge('CUD', 'CDM', 44.0, 75, 'Cuddalore-Chidambaram ECR NH-32');
  addEdge('CUD', 'NVL', 38.0, 70, 'Cuddalore-Neyveli Highway');
  addEdge('NVL', 'VPM', 46.0, 75, 'Neyveli-Villupuram Link');
  addEdge('CDM', 'SKZ', 20.0, 75, 'Chidambaram-Sirkazhi ECR NH-32');
  addEdge('SKZ', 'MYL', 20.0, 75, 'Sirkazhi-Mayiladuthurai NH-32');
  addEdge('MYL', 'KMB', 34.0, 70, 'Mayiladuthurai-Kumbakonam Delta Highway');
  addEdge('KMB', 'THJ', 38.0, 75, 'Kumbakonam-Thanjavur NH-36');
  addEdge('MYL', 'KKL', 38.0, 70, 'Mayiladuthurai-Karaikal Link');
  addEdge('KKL', 'NGP', 18.0, 70, 'Karaikal-Nagapattinam ECR');
  addEdge('NGP', 'VLK', 14.0, 70, 'Nagapattinam-Velankanni Coastal Road');
  addEdge('VLK', 'VDN', 42.0, 65, 'Velankanni-Vedaranyam ECR');
  addEdge('NGP', 'TVR', 26.0, 70, 'Nagapattinam-Tiruvarur NH-83');
  addEdge('TVR', 'THJ', 58.0, 75, 'Tiruvarur-Thanjavur NH-83');
  addEdge('TVR', 'MNG', 28.0, 70, 'Tiruvarur-Mannargudi Delta Link');
  addEdge('MNG', 'THJ', 38.0, 70, 'Mannargudi-Thanjavur Link');
  addEdge('MNG', 'TTP', 22.0, 65, 'Mannargudi-Thiruthuraipoondi Road');
  addEdge('TTP', 'VDN', 36.0, 65, 'Thiruthuraipoondi-Vedaranyam Link');
  addEdge('THJ', 'PKT', 48.0, 70, 'Thanjavur-Pattukkottai SH-29');
  addEdge('PKT', 'ATG', 36.0, 70, 'Pattukkottai-Aranthangi Link');
  addEdge('THJ', 'PUD', 56.0, 75, 'Thanjavur-Pudukkottai Highway');
  addEdge('TRY', 'PUD', 52.0, 80, 'Trichy-Pudukkottai NH-336');
  addEdge('PUD', 'KKD', 42.0, 75, 'Pudukkottai-Karaikudi NH-336');
  addEdge('PUD', 'ATG', 34.0, 70, 'Pudukkottai-Aranthangi SH-26');
  addEdge('KKD', 'SVG', 46.0, 75, 'Karaikudi-Sivaganga NH-36');
  addEdge('SVG', 'MDU', 48.0, 75, 'Sivaganga-Madurai NH-85');
  addEdge('KKD', 'RMD', 78.0, 75, 'Karaikudi-Ramanathapuram NH-36');
  addEdge('MDU', 'PMK', 72.0, 80, 'Madurai-Paramakudi NH-87 4-Lane');
  addEdge('PMK', 'RMD', 34.0, 85, 'Paramakudi-Ramanathapuram NH-87');
  addEdge('RMD', 'RAM', 55.0, 80, 'Ramanathapuram-Rameswaram Pamban NH-87');
  addEdge('RMD', 'TUT', 115.0, 75, 'Ramanathapuram-Thoothukudi ECR Coastal');

  // 3. Guarantee complete graph connectivity for any outlying municipality
  nodes.forEach(node => {
    const isConnected = edges.some(e => e.source === node.id || e.destination === node.id);
    if (!isConnected) {
      const closest = nodes
        .filter(other => other.id !== node.id)
        .map(other => ({ other, dist: calculateHaversineKm(node.lat, node.lng, other.lat, other.lng) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);

      closest.forEach(({ other, dist }) => {
        addEdge(node.id, other.id, Number(Math.max(8.0, dist * 1.18).toFixed(1)));
      });
    }
  });

  return { nodes, edges };
}

// Pre-evaluated Statewide Network Nodes & Edges
const statewide = buildStatewideTamilNaduNetwork();
export const STATEWIDE_NODES = statewide.nodes;
export const STATEWIDE_EDGES = statewide.edges;
