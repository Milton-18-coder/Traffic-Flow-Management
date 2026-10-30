/**
 * Goal-Based Intelligent Agent (CO1 Core Component & 5-Stage Agent Lifecycle)
 * 
 * Implements an autonomous agent with PEAS formulation and 5-stage lifecycle:
 * 1. PERCEIVE: Collect current road network conditions & sensor readings.
 * 2. ANALYZE: Identify congestion hotspots, delay ratios, and active road incidents.
 * 3. DECIDE: Select appropriate search algorithms (BFS, DFS, Dijkstra, A*) and evaluate alternatives.
 * 4. ACT: Recommend route changes, turn-by-turn navigation, and traffic diversions.
 * 5. EXPLAIN: Use NVIDIA Nemotron via Nebius Token Factory to generate natural-language explanations.
 */
import { runBFS } from '../algorithms/bfs.js';
import { runDFS } from '../algorithms/dfs.js';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { runAStar } from '../algorithms/astar.js';
import { findAllSimpleRoutes } from '../algorithms/combinatorialRoutes.js';
import { calculateEdgeCost, normalizeTrafficLevel } from '../utils/trafficCostModel.js';

export class TrafficAgent {
  constructor(networkData) {
    this.agentType = 'Goal-Based Intelligent Agent (TrafficMind AI)';
    this.nodes = networkData?.nodes || [];
    this.edges = networkData?.edges || [];
    this.sourceState = null;
    this.goalState = null;
    this.currentState = null;
    this.selectedAlgorithm = 'A*';
    this.lastResult = null;
    this.perceivedEnvironment = null;
    this.analysisData = null;
    this.actionPlan = null;
    this.explanation = null;
    this.decisionLog = [];
  }

  updateEnvironment(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
  }

  setGoal(source, destination) {
    this.sourceState = source;
    this.goalState = destination;
    this.currentState = source;
    this.log(`Goal set: Navigate from Source [${source}] to Destination [${destination}].`);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    this.decisionLog.push({ timestamp, message, type });
  }

  /**
   * 1. PERCEIVE: Collects current traffic conditions
   */
  perceive() {
    let blockedCount = 0;
    let highCongestionCount = 0;
    const edgeSummary = {};

    this.edges.forEach(edge => {
      const cost = calculateEdgeCost(edge);
      edgeSummary[edge.id] = cost;
      if (cost.isBlocked) blockedCount++;
      if (cost.levelKey === 'HIGH' || cost.levelKey === 'VERY_HIGH') highCongestionCount++;
    });

    this.perceivedEnvironment = {
      totalJunctions: this.nodes.length,
      totalRoads: this.edges.length,
      blockedRoads: blockedCount,
      congestedRoads: highCongestionCount,
      edgeCosts: edgeSummary
    };

    this.log(`[Perceive] Observed ${this.nodes.length} junctions, ${this.edges.length} roads (${blockedCount} blocked, ${highCongestionCount} congested).`, 'perception');
    return this.perceivedEnvironment;
  }

  /**
   * 2. ANALYZE: Identifies bottlenecks, congestion ratios, and incidents
   */
  analyze() {
    if (!this.perceivedEnvironment) {
      this.perceive();
    }

    const bottlenecks = [];
    const activeIncidents = [];

    this.edges.forEach(edge => {
      const costInfo = calculateEdgeCost(edge);
      const normLevel = normalizeTrafficLevel(edge.trafficLevel);

      if (costInfo.isBlocked) {
        activeIncidents.push({
          edgeId: edge.id,
          type: 'BLOCKED_CORRIDOR',
          label: edge.label || `${edge.source} ↔ ${edge.destination}`
        });
      } else if (normLevel === 'VERY_HIGH' || normLevel === 'HIGH') {
        const delayMin = costInfo.totalCost - costInfo.baseTime;
        bottlenecks.push({
          edgeId: edge.id,
          label: edge.label || `${edge.source} ↔ ${edge.destination}`,
          multiplier: costInfo.multiplier,
          delayMinutes: Number(delayMin.toFixed(1))
        });
      }
    });

    bottlenecks.sort((a, b) => b.delayMinutes - a.delayMinutes);

    this.analysisData = {
      topBottlenecks: bottlenecks.slice(0, 5),
      activeIncidents,
      hasBlockagesOnActiveCorridor: this.lastResult?.pathEdges?.some(eId => 
        activeIncidents.some(inc => inc.edgeId === eId)
      ) || false
    };

    this.log(`[Analyze] Detected ${bottlenecks.length} congestion bottlenecks and ${activeIncidents.length} active road closures.`, 'analysis');
    return this.analysisData;
  }

  /**
   * 3. DECIDE: Evaluates candidates and chooses the route according to the strategy
   */
  decide(algorithm = 'A*') {
    this.selectedAlgorithm = algorithm;
    this.perceive();
    this.analyze();

    if (!this.sourceState || !this.goalState) {
      this.log('Error: Source or Destination not specified before decision phase.', 'error');
      return null;
    }

    this.log(`[Decide] Selecting search strategy: [${algorithm}] from ${this.sourceState} to ${this.goalState}.`, 'decision');

    let result;
    switch (algorithm.toUpperCase()) {
      case 'BFS':
      case 'BREADTH-FIRST SEARCH':
        result = runBFS(this.nodes, this.edges, this.sourceState, this.goalState);
        break;
      case 'DFS':
      case 'DEPTH-FIRST SEARCH':
        result = runDFS(this.nodes, this.edges, this.sourceState, this.goalState);
        break;
      case 'DIJKSTRA':
      case "DIJKSTRA'S ALGORITHM":
        result = runDijkstra(this.nodes, this.edges, this.sourceState, this.goalState);
        break;
      case 'A*':
      case 'ASTAR':
      case 'A* SEARCH':
      default:
        result = runAStar(this.nodes, this.edges, this.sourceState, this.goalState);
        break;
    }

    this.lastResult = result;

    if (result.found) {
      this.log(
        `[Decide] Route discovered: ${result.path.join(' → ')} | Cost: ${result.cost} min | Distance: ${result.distance} km | Explored ${result.nodesExploredCount} nodes.`,
        'success'
      );
    } else {
      this.log(`[Decide] Warning: No route found between ${this.sourceState} and ${this.goalState}. ${result.errorMessage || ''}`, 'warning');
    }

    // Automatically formulate the action plan
    this.act();

    return result;
  }

  /**
   * 4. ACT: Formulates actionable traffic control commands and route guidance
   */
  act() {
    if (!this.lastResult || !this.lastResult.found) {
      this.actionPlan = {
        status: 'NO_ACTION',
        command: 'HALT_NAVIGATION',
        guidance: 'No reachable corridor under current network blockages.'
      };
      return this.actionPlan;
    }

    const path = this.lastResult.path;
    const pathEdges = this.lastResult.pathEdges;

    this.actionPlan = {
      status: 'DISPATCH_ROUTE',
      primaryRoute: path,
      corridorEdges: pathEdges,
      nextImmediateJunction: path.length > 1 ? path[1] : path[0],
      estimatedArrivalTimeMinutes: this.lastResult.cost,
      recommendedDiversion: this.analysisData?.hasBlockagesOnActiveCorridor ? 'EXECUTE_BYPASS' : 'MAINTAIN_TRAJECTORY'
    };

    this.log(`[Act] Dispatched route instructions. Immediate waypoint: [${this.actionPlan.nextImmediateJunction}].`, 'action');
    return this.actionPlan;
  }

  /**
   * 5. EXPLAIN: Integrates NVIDIA Nemotron reasoning to explain decisions & trade-offs
   */
  explain(nemotronText = null) {
    if (nemotronText) {
      this.explanation = nemotronText;
      this.log(`[Explain] NVIDIA Nemotron reasoning synthesized.`, 'explanation');
      return this.explanation;
    }

    if (!this.lastResult || !this.lastResult.found) {
      this.explanation = 'No viable path exists due to complete arterial disruption or unreachable destination node.';
      return this.explanation;
    }

    this.explanation = `TrafficMind Agent selected ${this.selectedAlgorithm} path: ${this.lastResult.path.join(' → ')} (${this.lastResult.cost} min, ${this.lastResult.distance} km). Explored ${this.lastResult.nodesExploredCount} states to guarantee minimal congestion delay.`;
    return this.explanation;
  }

  /**
   * EXPLORE COMBINATORIAL SPACE: Returns all feasible alternative paths
   */
  exploreCombinatorialAlternatives(maxPaths = 10) {
    if (!this.sourceState || !this.goalState) return [];
    return findAllSimpleRoutes(this.nodes, this.edges, this.sourceState, this.goalState, maxPaths);
  }

  /**
   * DYNAMIC RE-PLAN: Recalculates route if conditions or blockages change
   */
  rePlanOnDynamicChange(newBlockedEdgeId) {
    this.log(`Dynamic Event Detected: Edge [${newBlockedEdgeId}] blocked! Initiating dynamic re-planning...`, 'warning');
    return this.decide(this.selectedAlgorithm);
  }

  getPEAS() {
    return {
      performanceMeasure: 'Minimize total travel time (base time × congestion multiplier), travel distance, and bypass blocked roads.',
      environment: 'Simulated urban and statewide highway network with dynamic traffic conditions (Low, Medium, High, Very High, Blocked).',
      actuators: 'Route selection engine, junction navigation recommendations, dynamic rerouting dispatcher.',
      sensors: 'Graph topology observer, edge traffic congestion sensors, road blockage/incident detectors.'
    };
  }
}
