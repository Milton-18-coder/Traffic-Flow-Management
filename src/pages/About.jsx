import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Search, 
  HelpCircle,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export function About() {
  return (
    <div className="page-container about-page">
      {/* Page Header */}
      <div className="card-panel about-hero-panel">
        <div className="hero-badge">
          <GraduationCap size={16} />
          <span>Academic AI Syllabus Alignment</span>
        </div>
        <h2 className="hero-title">Course Outcome (CO) Mapping & Viva Examination Guide</h2>
        <p className="hero-desc">
          Formal academic documentation for <strong>AI-Based Traffic Flow Management Using Intelligent Agents and Search Algorithms</strong>.
        </p>
      </div>

      {/* Official Viva Explanation Box */}
      <div className="card-panel viva-quote-panel">
        <div className="panel-header">
          <div className="header-title-wrap">
            <Award size={20} className="accent-icon text-warning" />
            <h3>Standard Viva Voice Explanation</h3>
          </div>
          <span className="badge-tag">Examiner Response</span>
        </div>
        <blockquote className="viva-blockquote">
          "This system models traffic routing as a goal-oriented search problem. A goal-based intelligent agent receives a source and destination, perceives traffic conditions, and selects a route that minimizes travel cost. The road network is represented as a graph. BFS and DFS demonstrate uninformed search, while Dijkstra and A* demonstrate cost-based and heuristic search. The system compares these algorithms based on route cost, nodes explored, and execution time."
        </blockquote>
      </div>

      {/* CO1 and CO2 Side-by-Side Detailed Breakdown */}
      <div className="co-breakdown-grid">
        {/* CO1 Card */}
        <div className="card-panel co-card co1-card">
          <div className="co-header">
            <span className="co-tag">CO1</span>
            <h3>Intelligent Agents & Combinatorial Problem Solving</h3>
          </div>

          <div className="co-section">
            <h4>1. Goal-Based Agent Architecture</h4>
            <p>
              The system implements an autonomous Goal-Based Agent modeled through the <strong>PEAS</strong> framework.
              The agent perceives the current traffic environment (graph connectivity, congestion weights, blocked roads),
              formulates a goal state (destination junction), and evaluates available transitions to select optimal actions.
            </p>
          </div>

          <div className="co-section">
            <h4>2. Combinatorial Route Selection</h4>
            <p>
              Urban traffic networks contain multiple alternative simple paths between any source and destination ($K$-paths problem).
              The agent explores this combinatorial state space and evaluates cost trade-offs (distance vs congestion penalty)
              to prove that the physically shortest route is not necessarily the fastest during peak congestion.
            </p>
          </div>

          <div className="co-section">
            <h4>3. Dynamic Re-planning on Incidents</h4>
            <p>
              Upon sensor notification of an unplanned accident or road closure, the agent dynamically re-perceives
              the environment and recalculates a bypass route.
            </p>
          </div>
        </div>

        {/* CO2 Card */}
        <div className="card-panel co-card co2-card">
          <div className="co-header">
            <span className="co-tag">CO2</span>
            <h3>Search Algorithms for Goal-Oriented Problems</h3>
          </div>

          <div className="co-section">
            <h4>1. Uninformed Search (BFS & DFS)</h4>
            <ul className="co-list">
              <li>
                <strong>BFS (Queue):</strong> Explores frontier level-by-level. Optimal strictly in terms of fewest road segments (hop count), but blind to road congestion.
              </li>
              <li>
                <strong>DFS (Stack):</strong> Explores one path deeply before backtracking. Highly sensitive to edge order, non-optimal.
              </li>
            </ul>
          </div>

          <div className="co-section">
            <h4>2. Cost-Based & Heuristic Search (Dijkstra & A*)</h4>
            <ul className="co-list">
              <li>
                <strong>Dijkstra (Priority Queue):</strong> Expands nodes in increasing order of cumulative travel time $g(n)$. Guaranteed optimal minimum cost.
              </li>
              <li>
                <strong>A* Search ($f(n) = g(n) + h(n)$):</strong> Uses an admissible Euclidean straight-line distance divided by maximum network speed ($80\text{ km/h}$) as heuristic $h(n)$. Prunes search space dramatically while guaranteeing the exact same optimal cost.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Viva Cheat Sheet Table */}
      <div className="card-panel viva-table-panel">
        <div className="panel-header">
          <div className="header-title-wrap">
            <BookOpen size={20} className="accent-icon" />
            <h3>Algorithm Viva Quick-Reference Cheat Sheet</h3>
          </div>
          <span className="badge-tag">Examiner Q&A</span>
        </div>

        <div className="table-responsive">
          <table className="viva-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Search Classification</th>
                <th>Core Data Structure</th>
                <th>Time Complexity</th>
                <th>Space Complexity</th>
                <th>Optimality Property</th>
                <th>Heuristic $h(n)$</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>BFS</strong></td>
                <td>Uninformed (Brute Force)</td>
                <td>FIFO Queue</td>
                <td>$O(V + E)$</td>
                <td>$O(V)$</td>
                <td>Optimal for unweighted hop count</td>
                <td>None ($h(n) = 0$)</td>
              </tr>
              <tr>
                <td><strong>DFS</strong></td>
                <td>Uninformed (Brute Force)</td>
                <td>LIFO Stack / Recursion</td>
                <td>$O(V + E)$</td>
                <td>$O(V)$</td>
                <td>Non-optimal</td>
                <td>None ($h(n) = 0$)</td>
              </tr>
              <tr>
                <td><strong>Dijkstra</strong></td>
                <td>Cost-Based / Uniform Cost</td>
                <td>Min-Priority Queue</td>
                <td>$O((V + E) \log V)$</td>
                <td>$O(V)$</td>
                <td>Optimal for non-negative edge costs</td>
                <td>None ($h(n) = 0$)</td>
              </tr>
              <tr>
                <td><strong>A* Search</strong></td>
                <td>Informed / Heuristic</td>
                <td>Priority Queue on $f(n)$</td>
                <td>$O(b^d)$</td>
                <td>$O(b^d)$</td>
                <td>Guaranteed Optimal with Admissible $h(n)$</td>
                <td>
                  h(n) = (Euclidean Distance / Max Speed) &times; 60
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Restrictions & Classical AI Scope Box */}
      <div className="card-panel restrictions-panel">
        <div className="panel-header">
          <div className="header-title-wrap">
            <ShieldCheck size={20} className="accent-icon text-info" />
            <h3>Academic Scope & Deliberate Exclusions</h3>
          </div>
          <span className="badge-tag">Classical AI Compliance</span>
        </div>
        <p>
          As per syllabus constraints for <strong>CO1 and CO2</strong>, this application strictly implements 
          <strong> classical graph-search algorithms and goal-based agent formulation</strong> from scratch without relying on external black-box AI libraries.
        </p>
        <div className="exclusions-grid">
          <div className="exclusion-item">
            <strong>Exclusions:</strong> Deep Learning, Neural Networks, Computer Vision, Reinforcement Learning, LLMs.
          </div>
          <div className="exclusion-item">
            <strong>Reason:</strong> CO1 and CO2 assess foundational understanding of state spaces, agent environments, frontier expansions, and heuristic admissibility.
          </div>
        </div>
      </div>
    </div>
  );
}
