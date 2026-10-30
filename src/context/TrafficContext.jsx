import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { INITIAL_NODES, INITIAL_EDGES, STATEWIDE_NODES, STATEWIDE_EDGES } from '../data/trafficNetwork.js';
import { TRAFFIC_SCENARIOS } from '../data/trafficScenarios.js';
import { TAMIL_NADU_ALL_PLACES, calculateHaversineKm } from '../data/tamilNaduPlaces.js';
import { TrafficAgent } from '../agent/trafficAgent.js';
import { runBFS } from '../algorithms/bfs.js';
import { runDFS } from '../algorithms/dfs.js';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { runAStar } from '../algorithms/astar.js';
import { findAllSimpleRoutes } from '../algorithms/combinatorialRoutes.js';
import { computeAllCitiesFromSource } from '../algorithms/singleSourceAllPaths.js';
import { 
  normalizeTrafficLevel, 
  calculateEdgeCost, 
  getDynamicTrafficLevelForTime, 
  WEATHER_TYPES 
} from '../utils/trafficCostModel.js';
import confetti from 'canvas-confetti';

const TrafficContext = createContext(null);

export function TrafficProvider({ children }) {
  const [nodes, setNodes] = useState(STATEWIDE_NODES);
  const [edges, setEdges] = useState(STATEWIDE_EDGES);
  const [currentScenario, setCurrentScenario] = useState('NORMAL');
  const [sourceNode, setSourceNode] = useState('CHN');
  const [destNode, setDestNode] = useState('TIR');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('A*');
  
  // Theme state: dark / light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('traffic_theme') || 'dark';
  });

  // Dynamic Simulation Clock & Weather
  const [simHour, setSimHour] = useState(8.0); // 8:00 AM default
  const [isSimPlaying, setIsSimPlaying] = useState(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(1); // 1x, 2x, 5x, 10x
  const [currentWeather, setCurrentWeather] = useState('CLEAR');
  const [dynamicNotification, setDynamicNotification] = useState(null);

  // Live En-Route Vehicle Agent Simulation
  const [liveVehicle, setLiveVehicle] = useState({
    active: false,
    currentNode: 'CHN',
    targetNode: null,
    path: [],
    pathIndex: 0,
    progress: 0, // 0 to 1 between nodes
    x: 120,
    y: 140,
    isRerouting: false
  });

  // Search Results State
  const [searchResult, setSearchResult] = useState(null);
  const [allCitiesResults, setAllCitiesResults] = useState(null);
  const [allComparisonResults, setAllComparisonResults] = useState(null);
  const [combinatorialRoutes, setCombinatorialRoutes] = useState([]);
  
  // Agent Instance
  const agentRef = useRef(new TrafficAgent({ nodes: STATEWIDE_NODES, edges: STATEWIDE_EDGES }));
  const [agentLogs, setAgentLogs] = useState([]);

  // Step-by-Step Search Animation State
  const [animState, setAnimState] = useState({
    isPlaying: false,
    isPaused: false,
    currentStepIndex: 0,
    totalSteps: 0,
    speed: 'medium', // slow: 700ms, medium: 350ms, fast: 120ms
    activeFrame: null
  });

  const animTimerRef = useRef(null);
  const simClockTimerRef = useRef(null);
  const vehicleTimerRef = useRef(null);

  // Sync theme with body class & localStorage
  useEffect(() => {
    localStorage.setItem('traffic_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Show temporary toast notification
  const showToast = (title, message, type = 'info') => {
    setDynamicNotification({ title, message, type });
    setTimeout(() => {
      setDynamicNotification(null);
    }, 4500);
  };

  // Update a node position dynamically (Drag-and-Drop)
  const updateNodePosition = (nodeId, newX, newY) => {
    const updatedNodes = nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, x: Math.round(newX), y: Math.round(newY) };
      }
      return n;
    });

    // Dynamically update connected edge distances based on new spatial coordinates
    const updatedEdges = edges.map(e => {
      if (e.source === nodeId || e.destination === nodeId) {
        const u = updatedNodes.find(n => n.id === e.source);
        const v = updatedNodes.find(n => n.id === e.destination);
        if (u && v) {
          const dx = (u.x - v.x) * 0.05;
          const dy = (u.y - v.y) * 0.05;
          const newDist = Number(Math.max(2.0, Math.sqrt(dx * dx + dy * dy) * 1.8).toFixed(1));
          return { ...e, distance: newDist };
        }
      }
      return e;
    });

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    agentRef.current.updateEnvironment(updatedNodes, updatedEdges);
  };

  // Add or Select any custom location in Tamil Nadu (Click anywhere on map or search any city)
  const addCustomLocationOrSelect = (name, lat, lng, setAsRole = null) => {
    // Check if node already exists near these coordinates
    const existing = nodes.find(n => 
      (Math.abs(n.lat - lat) < 0.08 && Math.abs(n.lng - lng) < 0.08) ||
      n.name.toLowerCase() === name.toLowerCase()
    );

    let targetNodeId;
    let currentNodes = [...nodes];
    let currentEdges = [...edges];

    if (existing) {
      targetNodeId = existing.id;
    } else {
      // Generate short clean ID
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
      let uniqueId = cleanName || `P${nodes.length + 1}`;
      let counter = 1;
      while (currentNodes.some(n => n.id === uniqueId)) {
        uniqueId = `${cleanName || 'P'}${counter++}`;
      }
      targetNodeId = uniqueId;

      // Project (lat, lng) to canvas (x, y)
      const x = Math.round(Math.max(60, Math.min(1080, 60 + ((lng - 76.5) / 4.0) * 980)));
      const y = Math.round(Math.max(60, Math.min(560, 60 + ((13.3 - lat) / 5.3) * 500)));

      const newNode = {
        id: targetNodeId,
        name: name,
        x,
        y,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        type: 'custom_place',
        desc: `Custom Location in Tamil Nadu (${lat.toFixed(2)}° N, ${lng.toFixed(2)}° E)`
      };

      currentNodes.push(newNode);

      // Connect to 2 nearest existing nodes using Haversine distance
      const distances = currentNodes
        .filter(n => n.id !== targetNodeId)
        .map(n => ({
          node: n,
          distKm: calculateHaversineKm(lat, lng, n.lat, n.lng)
        }))
        .sort((a, b) => a.distKm - b.distKm);

      const nearestToConnect = distances.slice(0, 2);
      nearestToConnect.forEach(conn => {
        const roadDist = Number(Math.max(10.0, conn.distKm * 1.22).toFixed(1));
        const edgeId = `${targetNodeId}-${conn.node.id}`;
        currentEdges.push({
          id: edgeId,
          source: targetNodeId,
          destination: conn.node.id,
          distance: roadDist,
          speed: 70,
          trafficLevel: 'LOW',
          label: `${name} ↔ ${conn.node.name} Link`
        });
      });

      setNodes(currentNodes);
      setEdges(currentEdges);
      agentRef.current.updateEnvironment(currentNodes, currentEdges);
    }

    if (setAsRole === 'SOURCE') {
      setSourceNode(targetNodeId);
      showToast('Start Location Set 📍', `Starting location set to [${targetNodeId}] ${name}.`, 'success');
      setTimeout(() => executeSearch(selectedAlgorithm, targetNodeId, destNode, currentEdges, currentNodes), 50);
    } else if (setAsRole === 'GOAL') {
      setDestNode(targetNodeId);
      showToast('Destination Set 🎯', `Goal destination set to [${targetNodeId}] ${name}.`, 'success');
      setTimeout(() => executeSearch(selectedAlgorithm, sourceNode, targetNodeId, currentEdges, currentNodes), 50);
    }

    return targetNodeId;
  };

  // Batch Load All Major Tamil Nadu Cities and Municipalities
  const loadAllTamilNaduPlaces = () => {
    let currentNodes = [...nodes];
    let currentEdges = [...edges];
    let addedCount = 0;

    TAMIL_NADU_ALL_PLACES.forEach(place => {
      const exists = currentNodes.some(n => 
        n.name.toLowerCase() === place.name.toLowerCase() ||
        (Math.abs(n.lat - place.lat) < 0.04 && Math.abs(n.lng - place.lng) < 0.04)
      );
      if (!exists) {
        const cleanId = place.id || place.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
        let uniqueId = cleanId;
        let c = 1;
        while (currentNodes.some(n => n.id === uniqueId)) {
          uniqueId = `${cleanId}${c++}`;
        }
        const x = Math.round(Math.max(60, Math.min(1080, 60 + ((place.lng - 76.5) / 4.0) * 980)));
        const y = Math.round(Math.max(60, Math.min(560, 60 + ((13.3 - place.lat) / 5.3) * 500)));

        const newNode = {
          id: uniqueId,
          name: place.name,
          x,
          y,
          lat: Number(place.lat.toFixed(4)),
          lng: Number(place.lng.toFixed(4)),
          type: place.type || 'commercial',
          desc: place.desc || `${place.district} District`
        };
        currentNodes.push(newNode);

        // Connect to nearest 2 nodes
        const distances = currentNodes
          .filter(n => n.id !== uniqueId)
          .map(n => ({ node: n, distKm: calculateHaversineKm(place.lat, place.lng, n.lat, n.lng) }))
          .sort((a, b) => a.distKm - b.distKm);

        const nearest = distances.slice(0, 2);
        nearest.forEach(conn => {
          const roadDist = Number(Math.max(8.0, conn.distKm * 1.2).toFixed(1));
          currentEdges.push({
            id: `${uniqueId}-${conn.node.id}`,
            source: uniqueId,
            destination: conn.node.id,
            distance: roadDist,
            speed: 70,
            trafficLevel: 'LOW',
            label: `${place.name} ↔ ${conn.node.name} Link`
          });
        });
        addedCount++;
      }
    });

    setNodes(currentNodes);
    setEdges(currentEdges);
    agentRef.current.updateEnvironment(currentNodes, currentEdges);
    showToast('Statewide Network Loaded 🌐', `Integrated ${addedCount} additional Tamil Nadu cities & municipalities into traffic graph.`, 'success');
    executeSearch(selectedAlgorithm, sourceNode, destNode, currentEdges, currentNodes);
  };

  // Apply scenario
  const applyScenario = (scenarioKey) => {
    const scenario = TRAFFIC_SCENARIOS[scenarioKey];
    if (!scenario) return;

    setCurrentScenario(scenarioKey);
    const baseEdges = edges.length >= STATEWIDE_EDGES.length ? edges : STATEWIDE_EDGES;
    const updatedEdges = baseEdges.map(edge => {
      const override = scenario.edgeOverrides[edge.id];
      if (override) {
        return { ...edge, ...override };
      }
      return { ...edge };
    });

    setEdges(updatedEdges);
    agentRef.current.updateEnvironment(nodes, updatedEdges);
    agentRef.current.log(`Applied Traffic Scenario: ${scenario.name}`, 'scenario');
    setAgentLogs([...agentRef.current.decisionLog]);
    executeSearch(selectedAlgorithm, sourceNode, destNode, updatedEdges, nodes);
  };

  // Toggle Road Blocked state & dynamically re-route active search / vehicle
  const toggleEdgeBlocked = (edgeId) => {
    setCurrentScenario('CUSTOM');
    let isNowBlocked = false;

    const updatedEdges = edges.map(edge => {
      if (edge.id === edgeId) {
        const isCurrentlyBlocked = normalizeTrafficLevel(edge.trafficLevel) === 'BLOCKED';
        const newLevel = isCurrentlyBlocked ? 'LOW' : 'BLOCKED';
        isNowBlocked = !isCurrentlyBlocked;
        return { ...edge, trafficLevel: newLevel };
      }
      return edge;
    });

    setEdges(updatedEdges);
    agentRef.current.updateEnvironment(nodes, updatedEdges);
    agentRef.current.log(`Road [${edgeId}] is now ${isNowBlocked ? 'BLOCKED' : 'OPEN'}.`, 'interaction');
    setAgentLogs([...agentRef.current.decisionLog]);

    showToast(
      isNowBlocked ? 'Road Closure Event' : 'Road Re-opened',
      `Corridor [${edgeId}] was ${isNowBlocked ? 'blocked due to an incident' : 'cleared for traffic'}.`,
      isNowBlocked ? 'warning' : 'success'
    );

    // Dynamic Re-routing: If active path uses this edge, immediately re-plan!
    if (searchResult?.pathEdges?.includes(edgeId)) {
      showToast('Dynamic Re-Routing Alert', `Agent detected obstacle on active path [${edgeId}]! Recalculating optimal detour...`, 'warning');
      executeSearch(selectedAlgorithm, sourceNode, destNode, updatedEdges);
    }
  };

  // Cycle traffic level: LOW -> MEDIUM -> HIGH -> VERY_HIGH -> BLOCKED -> LOW
  const cycleEdgeTraffic = (edgeId) => {
    setCurrentScenario('CUSTOM');
    const order = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'BLOCKED'];
    const updatedEdges = edges.map(edge => {
      if (edge.id === edgeId) {
        const currNorm = normalizeTrafficLevel(edge.trafficLevel);
        const idx = order.indexOf(currNorm);
        const nextLevel = order[(idx + 1) % order.length];
        return { ...edge, trafficLevel: nextLevel };
      }
      return edge;
    });

    setEdges(updatedEdges);
    agentRef.current.updateEnvironment(nodes, updatedEdges);
    setAgentLogs([...agentRef.current.decisionLog]);
  };

  // Set explicit traffic level for an edge
  const setEdgeTrafficLevel = (edgeId, level) => {
    setCurrentScenario('CUSTOM');
    const updatedEdges = edges.map(edge => {
      if (edge.id === edgeId) {
        return { ...edge, trafficLevel: level };
      }
      return edge;
    });
    setEdges(updatedEdges);
    agentRef.current.updateEnvironment(nodes, updatedEdges);
    setAgentLogs([...agentRef.current.decisionLog]);
  };

  // Trigger Spontaneous Random Incident
  const triggerRandomIncident = () => {
    const unblockedEdges = edges.filter(e => normalizeTrafficLevel(e.trafficLevel) !== 'BLOCKED');
    if (unblockedEdges.length === 0) return;

    const targetEdge = unblockedEdges[Math.floor(Math.random() * unblockedEdges.length)];
    const incidentTypes = ['ACCIDENT', 'CONGESTION_SPIKE'];
    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];

    if (type === 'ACCIDENT') {
      toggleEdgeBlocked(targetEdge.id);
    } else {
      setEdgeTrafficLevel(targetEdge.id, 'VERY_HIGH');
      showToast('Sudden Traffic Surge', `Heavy bottleneck detected on [${targetEdge.id}] (${targetEdge.label || 'Arterial'}).`, 'warning');
      if (searchResult?.pathEdges?.includes(targetEdge.id)) {
        executeSearch(selectedAlgorithm, sourceNode, destNode);
      }
    }
  };

  // Reset Network to Default
  const resetNetwork = () => {
    setNodes(STATEWIDE_NODES);
    setEdges(STATEWIDE_EDGES);
    agentRef.current.updateEnvironment(STATEWIDE_NODES, STATEWIDE_EDGES);
    setCurrentScenario('NORMAL');
    setSourceNode('A');
    setDestNode('O');
    setSelectedAlgorithm('A*');
    setSearchResult(null);
    setAllComparisonResults(null);
    setCombinatorialRoutes([]);
    setSimHour(8.0);
    setIsSimPlaying(false);
    setCurrentWeather('CLEAR');
    stopVehicleTrip();
    resetAnimation();
    showToast('Network Reset', 'Restored 118-city Tamil Nadu statewide highway network.', 'info');
  };

  // Execute Search Algorithm
  const executeSearch = (algo = selectedAlgorithm, source = sourceNode, dest = destNode, currentEdges = edges, currentNodes = nodes) => {
    if (!source || !dest) return null;

    stopAnimation();

    // 1. Simultaneously compute Single-Source reachability to ALL cities from this source
    const allCities = computeAllCitiesFromSource(currentNodes, currentEdges, source, algo, currentWeather);
    setAllCitiesResults(allCities);

    // 2. If destination is explicitly 'ALL' (Single-Source All-Destinations Matrix Mode)
    if (dest === 'ALL') {
      const topDest = allCities?.destinations?.find(d => d.found) || allCities?.destinations?.[0];
      const summaryResult = {
        algorithm: `${algo} (Single-Source All-Destinations)`,
        source,
        destination: 'ALL',
        found: true,
        isAllCities: true,
        cost: topDest?.cost || 0,
        distance: topDest?.distance || 0,
        path: topDest?.path || [source],
        pathEdges: topDest?.pathEdges || [],
        nodesExploredCount: currentNodes.length,
        executionTime: allCities?.totalExecutionTime || 1.5,
        allDestinations: allCities?.destinations || []
      };
      setSearchResult(summaryResult);
      return summaryResult;
    }

    const agent = agentRef.current;
    agent.updateEnvironment(currentNodes, currentEdges);
    agent.setGoal(source, dest);
    
    const result = agent.decide(algo);
    setSearchResult(result);
    setAgentLogs([...agent.decisionLog]);

    // Also compute combinatorial routes
    const altRoutes = agent.exploreCombinatorialAlternatives(12);
    setCombinatorialRoutes(altRoutes);

    // Setup animation frames
    if (result && result.steps && result.steps.length > 0) {
      setAnimState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentStepIndex: 0,
        totalSteps: result.steps.length,
        activeFrame: result.steps[0]
      }));
    }

    if (result && result.found) {
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.85 },
          colors: ['#22c55e', '#38bdf8', '#fbbf24']
        });
      } catch (e) {}
    }

    return result;
  };

  // Compare All 4 Algorithms
  const runComparison = (source = sourceNode, dest = destNode) => {
    if (!source || !dest) return null;

    const bfsResult = runBFS(nodes, edges, source, dest);
    const dfsResult = runDFS(nodes, edges, source, dest);
    const dijkstraResult = runDijkstra(nodes, edges, source, dest);
    const astarResult = runAStar(nodes, edges, source, dest);

    const comparison = {
      bfs: bfsResult,
      dfs: dfsResult,
      dijkstra: dijkstraResult,
      astar: astarResult,
      timestamp: new Date().toLocaleTimeString(),
      source,
      dest
    };

    setAllComparisonResults(comparison);
    return comparison;
  };

  // Quick Demonstration Scenario
  const runDemoScenario = () => {
    applyScenario('PEAK_HOUR');
    setSourceNode('CHN');
    setDestNode('TIR');
    setSelectedAlgorithm('A*');
    setTimeout(() => {
      executeSearch('A*', 'CHN', 'TIR');
      runComparison('CHN', 'TIR');
    }, 100);
  };

  // Live En-Route Vehicle Trip Simulation
  const startVehicleTrip = () => {
    let res = searchResult;
    if (!res || !res.found) {
      res = executeSearch(selectedAlgorithm, sourceNode, destNode);
    }
    if (!res || !res.found || res.path.length < 2) {
      showToast('Cannot Launch Trip', 'No valid route exists between source and goal.', 'error');
      return;
    }

    const startNode = nodes.find(n => n.id === res.path[0]);
    setLiveVehicle({
      active: true,
      currentNode: res.path[0],
      targetNode: res.path[1],
      path: [...res.path],
      pathIndex: 0,
      progress: 0,
      x: startNode ? startNode.x : 80,
      y: startNode ? startNode.y : 300,
      isRerouting: false
    });

    showToast('Vehicle En-Route', `Simulating autonomous intelligent agent navigating: ${res.path.join(' → ')}`, 'success');
  };

  const stopVehicleTrip = () => {
    setLiveVehicle(prev => ({ ...prev, active: false }));
  };

  // Vehicle En-Route Animation Loop with Dynamic Re-Routing
  useEffect(() => {
    if (!liveVehicle.active) return;

    vehicleTimerRef.current = setInterval(() => {
      setLiveVehicle(prev => {
        if (!prev.active || prev.path.length < 2) return prev;

        const currId = prev.path[prev.pathIndex];
        const nextId = prev.path[prev.pathIndex + 1];

        // Check if road between currId and nextId is blocked ahead
        const activeEdge = edges.find(
          e => (e.source === currId && e.destination === nextId) || (e.source === nextId && e.destination === currId)
        );

        if (activeEdge && normalizeTrafficLevel(activeEdge.trafficLevel) === 'BLOCKED') {
          // DYNAMIC EN-ROUTE RE-PLANNING!
          const detourResult = runAStar(nodes, edges, currId, destNode);
          if (detourResult.found && detourResult.path.length > 1) {
            showToast('🚨 Dynamic Detour Triggered!', `Vehicle at [${currId}] detected blockage on [${currId}-${nextId}]! Rerouted to ${detourResult.path.join(' → ')}`, 'warning');
            return {
              ...prev,
              path: detourResult.path,
              pathIndex: 0,
              currentNode: currId,
              targetNode: detourResult.path[1],
              progress: 0,
              isRerouting: true
            };
          }
        }

        const currNodeObj = nodes.find(n => n.id === currId);
        const nextNodeObj = nodes.find(n => n.id === nextId);

        if (!currNodeObj || !nextNodeObj) return prev;

        const newProgress = prev.progress + 0.025;

        if (newProgress >= 1.0) {
          // Reached next node
          const nextIndex = prev.pathIndex + 1;
          if (nextIndex >= prev.path.length - 1) {
            // Reached Goal!
            showToast('Destination Reached! 🏁', `Autonomous vehicle successfully arrived at Goal Junction [${destNode}]!`, 'success');
            try {
              confetti({ particleCount: 50, spread: 60 });
            } catch (e) {}
            return {
              ...prev,
              active: false,
              progress: 1,
              x: nextNodeObj.x,
              y: nextNodeObj.y,
              currentNode: nextId,
              targetNode: null
            };
          }

          return {
            ...prev,
            pathIndex: nextIndex,
            currentNode: nextId,
            targetNode: prev.path[nextIndex + 1],
            progress: 0,
            x: nextNodeObj.x,
            y: nextNodeObj.y,
            isRerouting: false
          };
        }

        // Interpolate (x, y)
        const currentX = currNodeObj.x + (nextNodeObj.x - currNodeObj.x) * newProgress;
        const currentY = currNodeObj.y + (nextNodeObj.y - currNodeObj.y) * newProgress;

        return {
          ...prev,
          progress: newProgress,
          x: currentX,
          y: currentY
        };
      });
    }, 60);

    return () => {
      if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);
    };
  }, [liveVehicle.active, nodes, edges, destNode]);

  // Live Simulation Clock Ticking Loop
  useEffect(() => {
    if (isSimPlaying) {
      simClockTimerRef.current = setInterval(() => {
        setSimHour(prev => {
          const nextHour = (prev + 0.05 * simSpeedMultiplier) % 24;
          
          // Dynamically adjust traffic levels on roads according to time
          setEdges(currEdges => {
            return currEdges.map(edge => {
              // If not manually customized or blocked, fluctuate with time
              if (currentScenario === 'NORMAL' || currentScenario === 'CUSTOM') {
                const dynamicLevel = getDynamicTrafficLevelForTime(edge, nextHour);
                return { ...edge, trafficLevel: dynamicLevel };
              }
              return edge;
            });
          });

          return nextHour;
        });
      }, 500);
    } else {
      if (simClockTimerRef.current) clearInterval(simClockTimerRef.current);
    }

    return () => {
      if (simClockTimerRef.current) clearInterval(simClockTimerRef.current);
    };
  }, [isSimPlaying, simSpeedMultiplier, currentScenario]);

  // Step-by-Step Search Animation Engine
  const speedIntervals = { slow: 750, medium: 350, fast: 120 };

  const startAnimation = () => {
    if (!searchResult || !searchResult.steps || searchResult.steps.length === 0) {
      executeSearch();
      return;
    }
    setAnimState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
  };

  const pauseAnimation = () => {
    setAnimState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    if (animTimerRef.current) clearInterval(animTimerRef.current);
  };

  const stopAnimation = () => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setAnimState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
  };

  const resetAnimation = () => {
    stopAnimation();
    if (searchResult && searchResult.steps && searchResult.steps.length > 0) {
      setAnimState(prev => ({
        ...prev,
        currentStepIndex: 0,
        activeFrame: searchResult.steps[0]
      }));
    } else {
      setAnimState(prev => ({
        ...prev,
        currentStepIndex: 0,
        activeFrame: null
      }));
    }
  };

  const stepForward = () => {
    if (!searchResult || !searchResult.steps) return;
    setAnimState(prev => {
      const nextIndex = Math.min(prev.currentStepIndex + 1, prev.totalSteps - 1);
      return {
        ...prev,
        currentStepIndex: nextIndex,
        activeFrame: searchResult.steps[nextIndex]
      };
    });
  };

  const stepBackward = () => {
    if (!searchResult || !searchResult.steps) return;
    setAnimState(prev => {
      const prevIndex = Math.max(prev.currentStepIndex - 1, 0);
      return {
        ...prev,
        currentStepIndex: prevIndex,
        activeFrame: searchResult.steps[prevIndex]
      };
    });
  };

  const setAnimationSpeed = (spd) => {
    setAnimState(prev => ({ ...prev, speed: spd }));
  };

  // Animation Loop Effect
  useEffect(() => {
    if (animState.isPlaying && searchResult && searchResult.steps) {
      const interval = speedIntervals[animState.speed] || 350;
      animTimerRef.current = setInterval(() => {
        setAnimState(prev => {
          if (prev.currentStepIndex >= prev.totalSteps - 1) {
            clearInterval(animTimerRef.current);
            return { ...prev, isPlaying: false };
          }
          const nextIdx = prev.currentStepIndex + 1;
          return {
            ...prev,
            currentStepIndex: nextIdx,
            activeFrame: searchResult.steps[nextIdx]
          };
        });
      }, interval);
    } else {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    }

    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [animState.isPlaying, animState.speed, searchResult]);

  // Initial Calculation on mount
  useEffect(() => {
    applyScenario('NORMAL');
    executeSearch(selectedAlgorithm, sourceNode, destNode, STATEWIDE_EDGES, STATEWIDE_NODES);
  }, []);

  const value = {
    nodes,
    edges,
    currentScenario,
    sourceNode,
    destNode,
    selectedAlgorithm,
    theme,
    simHour,
    isSimPlaying,
    simSpeedMultiplier,
    currentWeather,
    liveVehicle,
    dynamicNotification,
    searchResult,
    allCitiesResults,
    allComparisonResults,
    combinatorialRoutes,
    agentLogs,
    animState,
    setTheme,
    setSimHour,
    setIsSimPlaying,
    setSimSpeedMultiplier,
    setCurrentWeather,
    setSourceNode,
    setDestNode,
    setSelectedAlgorithm,
    applyScenario,
    toggleEdgeBlocked,
    cycleEdgeTraffic,
    setEdgeTrafficLevel,
    triggerRandomIncident,
    updateNodePosition,
    startVehicleTrip,
    stopVehicleTrip,
    resetNetwork,
    executeSearch,
    runComparison,
    runDemoScenario,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    stepForward,
    stepBackward,
    setAnimationSpeed,
    showToast,
    addCustomLocationOrSelect,
    loadAllTamilNaduPlaces
  };

  return <TrafficContext.Provider value={value}>{children}</TrafficContext.Provider>;
}

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
}
