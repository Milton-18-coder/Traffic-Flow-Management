import fs from 'fs';

async function fetchOsrm(lat1, lon1, lat2, lon2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code === 'Ok' && data.routes && data.routes[0]) {
    const raw = data.routes[0].geometry.coordinates.map(([lng, lat]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
    const step = Math.max(1, Math.floor(raw.length / 40));
    const simplified = [];
    for (let i = 0; i < raw.length; i += step) {
      simplified.push(raw[i]);
    }
    if (simplified[simplified.length - 1] !== raw[raw.length - 1]) {
      simplified.push(raw[raw.length - 1]);
    }
    return simplified;
  }
  return null;
}

async function run() {
  const [nvrd, vrdstr, strkvp, kvpo, kvptut] = await Promise.all([
    fetchOsrm(9.9252, 78.1198, 9.5680, 77.9624),
    fetchOsrm(9.5680, 77.9624, 9.3639, 77.9272),
    fetchOsrm(9.3639, 77.9272, 9.1727, 77.8682),
    fetchOsrm(9.1727, 77.8682, 8.7139, 77.7567),
    fetchOsrm(9.1727, 77.8682, 8.7642, 78.1348)
  ]);

  const filePath = './src/data/roadGeometry.js';
  let content = fs.readFileSync(filePath, 'utf8');

  const insertJson = `,\n  "N-VRD": ${JSON.stringify(nvrd)},\n  "VRD-STR": ${JSON.stringify(vrdstr)},\n  "STR-KVP": ${JSON.stringify(strkvp)},\n  "KVP-O": ${JSON.stringify(kvpo)},\n  "KVP-TUT": ${JSON.stringify(kvptut)}\n};\n`;

  content = content.replace(/\s*\};\s*$/, insertJson);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added Kovilpatti NH-44 geometries to roadGeometry.js!');
}

run().catch(console.error);
