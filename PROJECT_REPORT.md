# AI-Based Traffic Flow Management Using Intelligent Agents and Search Algorithms

**23CS55C - ARTIFICIAL INTELLIGENCE**  
**MICRO PROJECT REPORT**

**Submitted by**  
MUTHU KUMARAN G S - 2312030  
NATARAJ M - 2312031  
KRISHNA PRASAD M - 2312024  

**Course Instructor**

| Innovation and Problem statement (10 Marks) | Implementation & Results (10 Marks) | Presentation and Documentation (10 Marks) | Viva (10 Marks) | Total (40 Marks) |
| :--- | :--- | :--- | :--- | :--- |
| | | | | |

---

## TABLE OF CONTENTS

| CH NO | TITLE | PAGE NO |
| :---: | :--- | :---: |
| 1 | INTRODUCTION | 3 |
| 2 | PROBLEM STATEMENT | 4 |
| 3 | MODULE DESCRIPTION | 5 |
| 4 | ARCHITECTURE DIAGRAM | 7 |
| 5 | CODING & IMPLEMENTATION | 10 |
| 6 | OUTPUT SCREENSHOTS | 20 |
| 7 | CONCLUSION | 22 |

---

## CHAPTER 1

### INTRODUCTION

Urban transportation networks form the critical backbone of modern metropolitan economies, facilitating daily commuting, commercial freight distribution, and emergency service transit. However, escalating vehicular density, unpredictable traffic surges, road blockages, and severe bottlenecks impose massive economic losses, increased environmental emissions, and prolonged travel delays. Traditional static navigation and routing systems rely on fixed topological distances or uniform speed assumptions, failing to dynamically adapt to real-time variations in congestion and incidents. This micro project addresses this critical gap by designing and implementing an **AI-Based Traffic Flow Management System Using Intelligent Agents and Classical Search Algorithms**.

#### The Gap:
Conventional routing tools and basic mapping utilities often lack transparent, deterministic decision-making mechanisms that can be evaluated and validated against formal AI formulations. Many existing tools either depend entirely on computationally heavy external black-box cloud APIs or utilize naive shortest-path heuristics that overlook the complex interplay between physical road distance, dynamic traffic multipliers, speed limits, and sudden environmental disruptions (accidents, weather, construction). Furthermore, transport operators and civic engineers lack accessible, real-time simulation environments to inspect the perception-action cycles of autonomous agents, compare search frontier expansions across state-space algorithms, and evaluate combinatorial route trade-offs under fluctuating traffic states.

#### The Goal:
The primary objective of this project is to build an autonomous, interactive, and mathematically rigorous Traffic Flow Management platform powered by a **Goal-Based Intelligent Agent** (formulated using the formal **PEAS** framework: *Performance measure, Environment, Actuators, Sensors*) and verifiable **Classical State Space Search Algorithms**. Key functionalities include dynamic real-time traffic cost calculation, step-by-step frontier search visualization (BFS, DFS, Dijkstra, and A\* Search with an admissible Euclidean heuristic), dynamic obstacle detection and autonomous re-planning, combinatorial multi-path trade-off analysis, and comprehensive performance benchmarking across runtime, path cost, and state-space exploration efficiency.

---

## CHAPTER 2

### PROBLEM STATEMENT

Metropolitan urban centers worldwide suffer from chronic traffic congestion, which leads to millions of lost commuter hours, elevated fuel consumption, and severe logistical bottlenecks. The core problem lies in the inability of static routing approaches to dynamically perceive changing road conditions, calculate composite edge costs reflecting variable traffic delays, and execute optimal pathfinding strategies that guarantee lowest travel time rather than merely minimal physical distance.

This deficiency manifests in several critical areas:
- **Static Path Inefficiencies**: Conventional hop-based or static distance routing directs vehicles through heavily congested central corridors, causing severe bottlenecks when alternative bypass routes could yield significantly lower transit times.
- **Absence of Dynamic Re-Planning**: Unexpected road closures, accidents, or peak-hour surges often render predetermined routes invalid or sub-optimal; systems without closed-loop agent perception fail to reroute in real time.
- **Lack of Algorithmic Transparency**: Transport planners and AI researchers require clear comparative metrics demonstrating where uninformed search methods (BFS, DFS) fail and how informed search (A\*) outperforms cost-only search (Dijkstra) in state-space pruning.
- **Combinatorial Space Underutilization**: Commuters and fleet operators are rarely presented with structured, evaluated alternative routes that illustrate the exact trade-offs between physical distance (km) and congestion-induced travel duration (minutes).

The consequences are profound: severe traffic gridlocks, suboptimal urban throughput, heightened vehicle emissions, and an inability of navigation systems to dynamically adapt to sudden incidents. In an era where intelligent automation is paramount for smart cities, transportation systems must leverage formal Artificial Intelligence paradigms to optimize traffic distribution. This project bridges this gap by engineering a Goal-Based Intelligent Agent that continuously senses network topology, models dynamic congestion costs, and executes optimal search algorithms to provide resilient, cost-effective routing.

---

## CHAPTER 3

### MODULE DESCRIPTION

The AI-Based Traffic Flow Management System is structured into six key modules, each handling a specific aspect of the system's functionality. These modules work together to transform raw network topologies and dynamic congestion metrics into optimal, actionable routing decisions.

The **Data & Graph Topology Ingestion Module** serves as the foundation, defining 15 discrete metropolitan junctions (Nodes A through O) with 2D Euclidean coordinates and 26 bidirectional road segments with speed limits (40–80 km/h).

The **Cost & Congestion Modeling Module** dynamically computes edge weights by combining base travel time with real-time traffic multipliers (Low: 1.0x, Medium: 1.25x, High: 1.75x, Very High: 2.5x) and environmental factors (weather and blockages).

The **Classical Search Algorithm Engine Module** houses the core state-space search algorithms implemented from scratch: Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's Algorithm, and A\* Search with an admissible Euclidean straight-line distance heuristic.

The **Goal-Based Agent Orchestration Module** acts as the brain, implementing the formal PEAS architecture to sense the environment, formulate goals, select optimal search strategies, log decision rationales, and trigger dynamic re-planning upon encountering road blockages.

The **Combinatorial Route Exploration Module** performs complete enumeration of alternative simple routes between the source and destination, calculating cost variance and illustrating trade-offs between physical distance and travel delay.

The **Interactive Visual Simulation & Dashboard Module** delivers a responsive web interface featuring an interactive SVG road canvas with animated vehicle particle flows, step-by-step search frontier playback, live agent telemetry, and comparative analytics charts.

Together, these modules create a cohesive pipeline from network perception to vehicle actuation, demonstrating the practical application of classical Artificial Intelligence in urban mobility.

#### Architectural Foundation:
The system is built on a modular, decoupled architecture leveraging modern web technologies (React 18, Vite, JavaScript ES6+, Vanilla CSS, Recharts, and Lucide React) for maximum client-side performance and interactive visualization. At its core is the **TrafficAgent** class which encapsulates the Sense-Plan-Act cycle. The graph data layer maintains node coordinates in a 2D Euclidean coordinate space, allowing accurate geometric distance and admissible heuristic calculations ($h(n) = \frac{\text{Euclidean Distance}}{\text{Max Speed}} \times 60$). The system executes completely in-browser without external cloud dependencies, ensuring deterministic execution, zero latency, and instantaneous step-by-step state visualization.

#### Functional Modules:
The system comprises several interconnected functional modules:
- **Data & Graph Topology Ingestion Module**: Loads and validates the 15-node, 26-edge road network, generates bidirectional adjacency lists, and provides node coordinate mappings.
- **Cost & Congestion Modeling Module**: Computes base travel time $T_{\text{base}} = \frac{D}{S} \times 60$, applies dynamic congestion multipliers ($1.0\times$ to $2.5\times$), models time-of-day rush patterns, and handles road blockage overrides.
- **Classical Search Algorithm Engine Module**: Executes state-space searches (BFS using FIFO queue, DFS using LIFO stack, Dijkstra using min-cost frontier, A\* using priority queue on $f(n) = g(n) + h(n)$) and logs granular step-by-step frontier transitions.
- **Goal-Based Agent Orchestration Module**: Implements the PEAS agent model, managing environmental perception, goal formulation, search engine dispatching, decision logging, and dynamic bypass re-planning.
- **Combinatorial Route Exploration Module**: Recursively enumerates candidate simple paths, calculates cumulative distance and travel time for each candidate, and ranks routes for trade-off evaluation.
- **Interactive Visual Simulation & Dashboard Module**: Renders animated SVG vehicle particle flows, color-coded congestion strokes, step-by-step search debuggers, and Recharts comparative performance graphs.

#### Operational Flow:
The operational flow begins with network initialization, where junctions and road segments are loaded into memory and baseline costs are evaluated. Upon selecting a source and destination, the Goal-Based Agent perceives the current road states (congestion levels, active blockages, weather conditions) and calculates effective edge weights. The user or agent dispatches a selected search algorithm (or runs all four concurrently for benchmarking). The algorithm explores the state space, recording visited nodes, frontier queues, and path cost progressions at each step. If a road blockage is dynamically toggled during navigation, the agent's sensor detects the incident, initiates a dynamic re-plan, and computes an alternate bypass route. Results, execution telemetry, and visual playback are rendered on the interactive dashboard.

---

## CHAPTER 4

### ARCHITECTURAL DIAGRAM

#### 4.1 Overview:
The architecture of the AI-Based Traffic Flow Management System follows a modular, layered design that cleanly separates user interaction, intelligent agent orchestration, classical algorithmic processing, data modeling, and mathematical infrastructure. This ensures high modularity, verifiable algorithmic correctness, and seamless extensibility.

#### 4.2 Architectural Diagram :

```text
+-----------------------------------------------------------------------------------+
|                                USER INTERFACE LAYER                               |
|  [Dashboard] [Traffic Network] [Route Optimizer] [Comparison] [Agent] [Analysis]  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        APPLICATION LAYER (INTELLIGENT AGENT)                      |
|  - SENSE: Perceives Graph Topology, Congestion Weights, Road Blockages            |
|  - FORMULATE: Identifies Initial State [S] and Destination Goal [G]               |
|  - EXPLORE: Evaluates Combinatorial Alternative Candidate Routes                  |
|  - DECIDE: Dispatches Search Strategy (BFS / DFS / Dijkstra / A*)                 |
|  - RE-PLAN: Dynamic Incident Handler & Bypass Recalculation                       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         PROCESSING LAYER (SEARCH ENGINES)                         |
|   +--------------------+  +--------------------+  +----------------------------+  |
|   | BFS (FIFO Queue)   |  | DFS (LIFO Stack)   |  | Dijkstra (Min-Priority Q)  |  |
|   +--------------------+  +--------------------+  +----------------------------+  |
|   | A* Search (Priority Queue on f(n) = g(n) + h(n) with Admissible Heuristic) |  |
|   +----------------------------------------------------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            DATA LAYER (GRAPH & STATE)                             |
|  - 15 Junctions (Nodes A-O) in 2D Euclidean Space                                 |
|  - 26 Bidirectional Road Segments with Speed Limits (40-80 km/h)                  |
|  - Adjacency List Representation & Active Blockage Status Store                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       INFRASTRUCTURE LAYER (COST & HEURISTICS)                    |
|  - Base Travel Time: T_base = (Distance / Speed) * 60                             |
|  - Congestion Multipliers: Low (1.0x), Med (1.25x), High (1.75x), Very High (2.5x)|
|  - Effective Cost: Total Cost = Base Travel Time * Congestion * Weather           |
|  - Admissible Heuristic: h(n) = (Euclidean Distance / Max Speed [80 km/h]) * 60   |
+-----------------------------------------------------------------------------------+
```

#### 4.3 Layer Descriptions

##### 4.3.1 User Interface Layer
- **Component**: React-based interactive web interface and SVG canvas.
- **Functionality**: Provides interactive road network editing, real-time vehicle particle animations, step-by-step search playback controls, algorithm comparison charts, and PEAS agent telemetry display.
- **Technology**: React 18, SVG Canvas, Recharts, Lucide React, Vanilla CSS.
- **Purpose**: Enables users, students, and evaluators to interact with the traffic environment and visually inspect state-space search mechanics.

##### 4.3.2 Application Layer
- **Component**: Goal-Based Intelligent Agent (`TrafficAgent`).
- **Functionality**: Coordinates between environmental sensors, goal formulation, search algorithm dispatchers, decision logging, and dynamic incident re-planning.
- **Technology**: JavaScript ES6+ Object-Oriented Agent Pattern.
- **Purpose**: Acts as the central reasoning entity, orchestrating perception, evaluation, and path execution according to AI agent principles.

##### 4.3.3 Processing Layer
- **Component**: Classical State Space Search Engines.
- **Functionality**:
  - *BFS*: Explores fewest-hop routes using a FIFO Queue.
  - *DFS*: Explores deep pathways using a LIFO Stack.
  - *Dijkstra*: Computes lowest cost paths using priority exploration on $g(n)$.
  - *A\* Search*: Computes optimal paths by minimizing $f(n) = g(n) + h(n)$.
- **Technology**: Custom JavaScript algorithms generating full step-by-step transition logs.
- **Purpose**: Performs deterministic pathfinding and comparative search space exploration.

##### 4.3.4 Data Layer
- **Component**: Graph Topology & State Store.
- **Functionality**: Maintains the 15-node network graph, node coordinates, edge connections, speed limits, and current blockage states.
- **Technology**: In-memory JavaScript Graph Data Structures.
- **Purpose**: Provides structured, high-speed access to road network geometry and live topological state.

##### 4.3.5 Infrastructure Layer
- **Component**: Cost Models & Mathematical Heuristics.
- **Functionality**: Evaluates base travel times, applies traffic multipliers, and computes Euclidean straight-line distance heuristics for A\*.
- **Technology**: Mathematical utility functions (`trafficCostModel.js`, `heuristics.js`).
- **Purpose**: Supplies the underlying physical and mathematical evaluation functions required for cost calculation and heuristic admissibility.

#### 4.4 Data Flow
1. User or scenario selector updates network conditions (traffic levels, road blockages, source, destination).
2. The Goal-Based Agent perceives network state through its sensors and evaluates all edge costs.
3. The Agent selects and executes the state-space search algorithm (A\*, Dijkstra, BFS, or DFS).
4. Search engine expands nodes, computes $g(n)$, $h(n)$, and $f(n)$ scores, records step-by-step transitions, and reconstructs the optimal path.
5. Path metrics, step logs, animated particle flows, and comparative performance graphs are rendered in the user interface.

#### 4.5 Key Design Decisions
- **Strict Classical AI Formulation**: Adheres strictly to verifiable search algorithms and PEAS agent theory rather than opaque neural networks or black-box models.
- **Admissible Heuristic Guarantee**: Uses Euclidean distance divided by maximum network speed (80 km/h) to guarantee that $h(n) \le h^*(n)$, ensuring A\* optimality.
- **Deterministic Step-by-Step Logging**: Records every frontier addition, node selection, and score update for educational animation and debugging.
- **Closed-Loop Dynamic Re-Planning**: Senses newly blocked roads in real time and automatically triggers path re-evaluation.
- **Pure Client-Side Execution**: Operates completely in the browser with zero cloud latency and no external API dependencies.

---

## CHAPTER 5

### CODING AND IMPLEMENTATION

#### 5.1 Introduction
This chapter details the coding and implementation of the AI-Based Traffic Flow Management System. The system is built using modern JavaScript (ES6+) and React with a clean modular architecture separating cost modeling, agent reasoning, search algorithms, and visualization components. All code runs locally in a Node.js / Vite environment and is cross-platform compatible with Windows, Linux, and macOS.

#### 5.2 Coding
The core implementation consists of several modular files. Below are the key code snippets from the main modules.

##### 5.2.1 Traffic Cost & Congestion Model (`trafficCostModel.js`):
```javascript
export const TRAFFIC_LEVELS = {
  LOW: { label: 'LOW', weight: 1, multiplier: 1.0, color: '#22c55e' },
  MEDIUM: { label: 'MEDIUM', weight: 2, multiplier: 1.25, color: '#eab308' },
  HIGH: { label: 'HIGH', weight: 3, multiplier: 1.75, color: '#f97316' },
  VERY_HIGH: { label: 'VERY HIGH', weight: 4, multiplier: 2.5, color: '#ef4444' },
  BLOCKED: { label: 'BLOCKED', weight: Infinity, multiplier: Infinity, color: '#6b7280' }
};

export function calculateBaseTravelTime(distanceKm, speedKmh) {
  if (!speedKmh || speedKmh <= 0) return 0;
  return (distanceKm / speedKmh) * 60;
}

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
```

##### 5.2.2 Goal-Based Intelligent Agent (`trafficAgent.js`):
```javascript
import { runBFS } from '../algorithms/bfs.js';
import { runDFS } from '../algorithms/dfs.js';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { runAStar } from '../algorithms/astar.js';
import { calculateEdgeCost } from '../utils/trafficCostModel.js';

export class TrafficAgent {
  constructor(networkData) {
    this.agentType = 'Goal-Based Intelligent Agent';
    this.nodes = networkData?.nodes || [];
    this.edges = networkData?.edges || [];
    this.sourceState = null;
    this.goalState = null;
    this.selectedAlgorithm = 'A*';
    this.decisionLog = [];
  }

  setGoal(source, destination) {
    this.sourceState = source;
    this.goalState = destination;
    this.log(`Goal set: Navigate from Source [${source}] to Destination [${destination}].`);
  }

  perceive() {
    let blockedCount = 0, highCongestionCount = 0;
    const edgeSummary = {};
    this.edges.forEach(edge => {
      const cost = calculateEdgeCost(edge);
      edgeSummary[edge.id] = cost;
      if (cost.isBlocked) blockedCount++;
      if (cost.levelKey === 'HIGH' || cost.levelKey === 'VERY_HIGH') highCongestionCount++;
    });
    this.perceivedEnvironment = { totalJunctions: this.nodes.length, totalRoads: this.edges.length, blockedRoads: blockedCount, edgeCosts: edgeSummary };
    return this.perceivedEnvironment;
  }

  decide(algorithm = 'A*') {
    this.selectedAlgorithm = algorithm;
    this.perceive();
    let result;
    switch (algorithm.toUpperCase()) {
      case 'BFS': result = runBFS(this.nodes, this.edges, this.sourceState, this.goalState); break;
      case 'DFS': result = runDFS(this.nodes, this.edges, this.sourceState, this.goalState); break;
      case 'DIJKSTRA': result = runDijkstra(this.nodes, this.edges, this.sourceState, this.goalState); break;
      case 'A*':
      default: result = runAStar(this.nodes, this.edges, this.sourceState, this.goalState); break;
    }
    this.lastResult = result;
    return result;
  }

  rePlanOnDynamicChange(newBlockedEdgeId) {
    this.log(`Dynamic Event Detected: Road [${newBlockedEdgeId}] blocked! Initiating dynamic re-planning...`, 'warning');
    return this.decide(this.selectedAlgorithm);
  }

  getPEAS() {
    return {
      performanceMeasure: 'Minimize travel time (base time * traffic multiplier), avoid blockages, optimize distance.',
      environment: 'Simulated 15-junction urban road network with dynamic traffic conditions (Low, Med, High, Very High, Blocked).',
      actuators: 'Route selection engine, junction navigation recommendations, dynamic rerouting dispatcher.',
      sensors: 'Graph topology observer, edge traffic congestion sensors, road blockage incident detectors.'
    };
  }
}
```

##### 5.2.3 Informed Search Engine - A\* Algorithm (`astar.js`):
```javascript
import { buildAdjacencyList, getNodeById } from '../utils/networkValidator.js';
import { calculateHeuristicTime } from './heuristics.js';
import { createSearchResult } from './searchResult.js';

export function runAStar(nodes, edges, sourceId, destinationId) {
  const startTime = performance.now();
  const goalNode = getNodeById(nodes, destinationId);
  const adj = buildAdjacencyList(nodes, edges);
  
  const openSet = new Set([sourceId]);
  const closedSet = new Set();
  const cameFrom = {};
  const gScore = {}, fScore = {}, hScore = {};
  const nodesExplored = [], steps = [];

  nodes.forEach(n => {
    gScore[n.id] = Infinity;
    fScore[n.id] = Infinity;
    hScore[n.id] = calculateHeuristicTime(n, goalNode);
  });

  gScore[sourceId] = 0;
  fScore[sourceId] = hScore[sourceId];
  let found = false;

  while (openSet.size > 0) {
    let current = null, lowestF = Infinity;
    for (const nodeId of openSet) {
      if (fScore[nodeId] < lowestF) {
        lowestF = fScore[nodeId];
        current = nodeId;
      }
    }

    if (!current) break;
    openSet.delete(current);
    closedSet.add(current);
    nodesExplored.push(current);

    if (current === destinationId) {
      found = true;
      break;
    }

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      const neighbor = edge.node;
      if (closedSet.has(neighbor)) continue;

      const tentativeG = gScore[current] + edge.cost;
      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = Number(tentativeG.toFixed(3));
        fScore[neighbor] = Number((tentativeG + hScore[neighbor]).toFixed(3));
        openSet.add(neighbor);
      }
    }
  }

  let path = [];
  if (found) {
    let curr = destinationId;
    while (curr) {
      path.unshift(curr);
      curr = cameFrom[curr];
    }
  }
  const executionTime = performance.now() - startTime;
  return createSearchResult({ algorithm: 'A* Search', source: sourceId, destination: destinationId, path, nodesExplored, executionTime, found, edges });
}
```

##### 5.2.4 Combinatorial Route Explorer (`combinatorialRoutes.js`):
```javascript
export function findAllSimpleRoutes(nodes, edges, sourceId, destinationId, maxPaths = 10) {
  const adj = buildAdjacencyList(nodes, edges);
  const allPaths = [];

  function dfsFind(current, target, visited, currentPath) {
    if (allPaths.length >= maxPaths) return;
    visited.add(current);
    currentPath.push(current);

    if (current === target) {
      allPaths.push([...currentPath]);
    } else {
      const neighbors = adj[current] || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.node)) {
          dfsFind(edge.node, target, visited, currentPath);
        }
      }
    }
    visited.delete(current);
    currentPath.pop();
  }

  dfsFind(sourceId, destinationId, new Set(), []);

  return allPaths.map((pathNodes, index) => {
    let totalDist = 0, totalCost = 0;
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const u = pathNodes[i], v = pathNodes[i + 1];
      const edge = edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
      if (edge) {
        const cost = calculateEdgeCost(edge);
        totalDist += edge.distance;
        totalCost += cost.totalCost;
      }
    }
    return { rank: index + 1, path: pathNodes, distance: totalDist, cost: totalCost };
  }).sort((a, b) => a.cost - b.cost);
}
```

#### 5.3 Code Structure:
```text
c:\Projects\AI
│   .env.example
│   .env.local
│   .gitignore
│   index.html
│   package.json
│   package-lock.json
│   PROJECT_REPORT.md
│   README.md
│   testRunner.js
│   vite.config.js
│
├───dist
│       assets
│       index.html
│
└───src
    │   App.jsx
    │   index.css
    │   main.jsx
    │
    ├───agent
    │       trafficAgent.js
    │
    ├───algorithms
    │       astar.js
    │       bfs.js
    │       combinatorialRoutes.js
    │       dfs.js
    │       dijkstra.js
    │       heuristics.js
    │       searchResult.js
    │
    ├───components
    │       AlgorithmInfoModal.jsx
    │       AlgorithmSelector.jsx
    │       CombinatorialPathsCard.jsx
    │       CostBreakdownModal.jsx
    │       Legend.jsx
    │       MetricsPanel.jsx
    │       Navbar.jsx
    │       NetworkCanvas.jsx
    │       NotificationBanner.jsx
    │       PathDisplayCard.jsx
    │       PEASModal.jsx
    │       PresetSelector.jsx
    │       RouteSelector.jsx
    │       SearchStepAnimator.jsx
    │       StepExplanationPanel.jsx
    │       SummaryCard.jsx
    │       TimeOfDaySlider.jsx
    │
    ├───context
    │       TrafficContext.jsx
    │
    ├───data
    │       networkGraph.js
    │       presets.js
    │
    ├───pages
    │       AlgorithmComparison.jsx
    │       CombinatorialAnalysis.jsx
    │       Dashboard.jsx
    │       IntelligentAgent.jsx
    │       RouteOptimizer.jsx
    │       TrafficNetwork.jsx
    │
    └───utils
            exportUtils.js
            networkValidator.js
            trafficCostModel.js
```

#### 5.4 VS Code Screenshots:
- **i) trafficCostModel.js**: Module defining traffic multipliers, dynamic time-of-day traffic assignment, and composite travel time formulas.
- **ii) trafficAgent.js**: Formal PEAS Goal-Based Agent orchestrating sensing, decision-making, logging, and dynamic re-planning.
- **iii) astar.js**: Informed state-space search engine implementing $f(n) = g(n) + h(n)$ with admissible straight-line heuristics and step recording.
- **iv) combinatorialRoutes.js**: Multi-path combinatorial route generator and comparative trade-off analyzer.

#### 5.5 Implementation Details :
- **Environment Setup**: Install prerequisites using Node.js (v18+) and npm. Run `npm install` to install React 18, Vite, Recharts, and Lucide React.
- **Data & Graph Preparation**: Node coordinates and 26 road segments are configured in `src/data/networkGraph.js` with physical lengths (km) and speed limits (km/h).
- **Running the Agent & Web Application**: Execute `npm run dev` to launch the interactive local server at `http://localhost:3000`.
- **Testing & Verification**: Execute `node testRunner.js` to run automated verification tests on search algorithms, cost models, and heuristic admissibility.

---

## CHAPTER 6

### OUTPUT SCREENSHOTS

#### Screen 1: Metropolitan Traffic Network & Dynamic State Visualizer
The interactive SVG network renders 15 metropolitan junctions (Nodes A through O) with animated vehicle particle flows and color-coded road segments (Green: Low, Yellow: Medium, Orange: High, Red: Very High, Gray/Dashed: Blocked). Users can click junctions or roads to inspect live attributes, modify congestion, or toggle incidents.

#### Screen 2: Algorithm Comparison & Search Frontier Benchmarking
The comparison view runs BFS, DFS, Dijkstra, and A\* simultaneously on identical graph states. Bar charts and summary tables compare Total Travel Time (min), Total Distance (km), Nodes Explored (State-Space Efficiency), and Execution Time (ms), visually demonstrating A\*'s superior heuristic pruning.

#### Screen 3: Goal-Based Intelligent Agent Telemetry & Decision Log
The Intelligent Agent interface displays live PEAS telemetry (Performance Measure, Environment, Actuators, Sensors), real-time perception state, chronological decision logs, and autonomous dynamic re-planning events triggered upon road blockage detection.

#### Screen 4: Combinatorial Route Explorer & Dynamic Re-planning
The combinatorial analysis module displays ranked alternative paths between source and destination, detailing the trade-off between physical distance (km) and estimated travel duration (minutes), with dynamic bypass rerouting when primary corridors are blocked.

---

## CHAPTER 7

### CONCLUSION

#### 7.1 Summary of the Project:
The AI-Based Traffic Flow Management System Using Intelligent Agents and Search Algorithms has been successfully designed, implemented, and validated as an interactive, mathematically rigorous decision-support platform for urban mobility. The project leverages classical Artificial Intelligence principles, including the PEAS agent model, dynamic traffic cost modeling, and state-space search algorithms (BFS, DFS, Dijkstra, A\*), to provide an educational and deployable traffic management solution.

Key achievements include:
- Successful formulation and implementation of a Goal-Based Intelligent Agent with full PEAS architecture and dynamic incident re-planning.
- Verifiable implementation of BFS, DFS, Dijkstra, and A\* Search with an admissible Euclidean straight-line distance heuristic ($h(n) \le h^*(n)$).
- Creation of an interactive SVG simulation canvas featuring animated vehicle particles, clickable incident toggles, time-of-day traffic sliders, and step-by-step search debuggers.
- Comprehensive multi-algorithm benchmarking and combinatorial multi-path trade-off analysis demonstrating cost versus distance variances.
- Establishment of a clean, modular, zero-cloud-dependency software architecture running entirely client-side.

#### 7.2 Contributions to the Field
This project contributes significantly to the study and practical application of classical Artificial Intelligence in intelligent transportation systems by:
- Providing an accessible, transparent simulation platform that demystifies state-space search and heuristic pruning for students and engineers.
- Demonstrating how goal-based agents can dynamically sense and adapt to environmental disruptions through autonomous re-planning.
- Bridging the gap between abstract algorithmic theory (queue/stack mechanics, heuristic consistency) and real-world urban routing challenges.
- Supplying an extensible, open-source architectural foundation for simulated intelligent agent networks.

#### 7.3 Limitations and Future Work
While the current implementation provides a robust foundation, several areas offer opportunities for future enhancement:
- **Live GPS & GIS Integration**: Incorporate OpenStreetMap GIS feeds and live GPS telemetry for real-world metropolitan networks.
- **Multi-Agent Traffic Coordination**: Expand from a single navigation agent to multi-agent cooperative systems (vehicle-to-infrastructure and distributed traffic signal agents).
- **Stochastic Incident Modeling**: Introduce probabilistic weather and stochastic traffic wave models to simulate non-deterministic conditions.
- **Hierarchical Road Networks**: Implement Hierarchical Pathfinding (HPA\*) for scaling to regional networks with thousands of nodes.

#### 7.4 Impact on Urban Mobility & Intelligent Transportation
The project has the potential to transform urban traffic management by:
- Mitigating severe urban congestion through intelligent, cost-optimized traffic redistribution away from bottlenecks.
- Enabling resilient emergency dispatching and rapid incident bypass rerouting.
- Delivering high educational value through hands-on, visual exposure to core Artificial Intelligence search algorithms.
- Providing a verifiable, transparent alternative to opaque black-box navigation systems.

#### 7.5 Final Remarks
The successful implementation of this AI-Based Traffic Flow Management System validates the power and relevance of foundational Artificial Intelligence paradigms in solving complex urban infrastructure challenges. By unifying PEAS agent architecture, dynamic cost modeling, and heuristic state-space search within an interactive web platform, the project provides a comprehensive, transparent, and resilient solution for modern traffic routing. As smart city initiatives expand globally, systems founded on these classical AI principles will play an indispensable role in enabling efficient, sustainable, and intelligent urban mobility.

---

## RUBRICS :

| Aim & Algorithm (10 Marks) | Coding & Implementation (20 Marks) | Optimization (10 Marks) | Output (5 Marks) | Time Management (5 Marks) | Viva (10 Marks) | Total (60 Marks) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| | | | | | | |

---

## RESULT:

The AI-Based Traffic Flow Management System Using Intelligent Agents and Search Algorithms has been successfully implemented, tested, and validated, demonstrating robust state-space search execution (BFS, DFS, Dijkstra, A\*), accurate dynamic congestion modeling, autonomous PEAS agent re-planning, and an intuitive interactive visual simulation interface. All core functionalities—dynamic cost calculation, step-by-step search animation, combinatorial route trade-off analysis, and multi-algorithm benchmarking—are fully operational with high performance and zero latency. The system stands ready as a comprehensive demonstration of classical Artificial Intelligence applied to intelligent transportation systems.
