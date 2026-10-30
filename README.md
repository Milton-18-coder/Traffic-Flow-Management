# TrafficMind AI: Intelligent Traffic Flow Management System
### Powered by NVIDIA Nemotron & Nebius Token Factory
**Submission for Nebius x NVIDIA Global AI Hackathon 2026**

---

## 1. Project Overview

**TrafficMind AI** transforms classical urban traffic management into an explainable, autonomous, and AI-powered transportation decision support system. 

By unifying **classical state-space search algorithms (BFS, DFS, Dijkstra, and A\*)**, an **autonomous Goal-Based Intelligent Traffic Agent (PEAS framework)**, and the **NVIDIA Nemotron LLM via Nebius Token Factory**, TrafficMind AI solves a critical limitation of modern generative AI: **hallucination in spatial routing**.

> [!IMPORTANT]
> **Zero LLM Hallucination Guarantee:** The NVIDIA Nemotron model is **never** permitted to independently invent road paths, fake distances, or fabricate travel times. Pathfinding and network reachability are computed with 100% mathematical precision by classical graph search engines. NVIDIA Nemotron acts as the **Intelligent Reasoning & Explanatory Layer**, interpreting real-time simulation facts, diagnosing multi-corridor congestion dynamics, and delivering tactical diversion recommendations.

---

## 2. System Architecture

```text
+-----------------------------------------------------------------------------------------+
|                                    USER INTERFACE                                       |
|  [AI Traffic Assistant]  [Traffic Intelligence Panel]  [AI Recommendation Panel]        |
|  [Incident Analysis Modal]  [Leaflet / Google Maps View]  [SVG Topology Canvas]         |
+--------------------------------------------+--------------------------------------------+
                                             |  REST / Proxy: /api/ai/*
                                             v
+-----------------------------------------------------------------------------------------+
|                         DEDICATED BACKEND AI SERVICE (Node.js/Express)                  |
|  - Endpoints: /api/ai/chat, /api/ai/incident, /api/ai/intelligence, /api/ai/status      |
|  - Server-Side Credential Guard: NEBIUS_API_KEY strictly insulated from browser         |
|  - Intent Classifier & Entity Resolver (Junctions, Corridors, Algorithm Names)          |
|  - Deterministic Mathematical Reasoning Fallback Engine (Offline Resilience)            |
+----------------------+-------------------------------------+----------------------------+
                       |                                     |
                       v                                     v
+--------------------------------------+  +-----------------------------------------------+
|      5-PHASE INTELLIGENT AGENT       |  |             NVIDIA NEMOTRON SERVICE           |
|  1. PERCEIVE: Sense Road Topology    |  |  - Endpoint: https://api.studio.nebius.ai/v1  |
|  2. ANALYZE: Bottleneck & Delays     |  |  - Model: nvidia/llama-3.1-nemotron-70b-instr |
|  3. DECIDE: BFS, DFS, Dijkstra, A*   |  |  - Grounded Structured Engineering Prompts    |
|  4. ACT: Formulate Dispatch Plans    |  |  - Timeout & Graceful Error Management        |
|  5. EXPLAIN: Synthesize Rationale    |  +-----------------------------------------------+
+----------------------+---------------+
                       |
                       v
+-----------------------------------------------------------------------------------------+
|                             CLASSICAL SEARCH ALGORITHM ENGINES                          |
|  - BFS (Breadth-First Search): Uninformed FIFO Queue exploration                        |
|  - DFS (Depth-First Search): Uninformed LIFO Stack deep branch exploration              |
|  - Dijkstra's Algorithm: Cost-optimal Min-Priority Queue (Total Delay Cost)             |
|  - A* Search: Informed Heuristic Priority Queue: f(n) = g(n) + h(n)                      |
|  - Combinatorial Alternative Routes: K-Shortest Simple Paths Discovery                  |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Core Features

### A. Interactive AI Traffic Assistant
* **Natural-Language Traffic Dialogue:** Responds to free-form queries about congestion, travel times, diversions, and algorithmic comparisons.
* **Suggested Quick Queries:** One-click pills for immediate scenario exploration.
* **Synchronized Live Map Actions:** Direct *"Apply to Live Map"* action button on computed AI routes.
* **Telemetry & Error Handling:** Real-time provider metadata, latency tracking in ms, and graceful fallback notifications.

### B. Traffic Intelligence Panel
* **Highest Congestion Junction:** Aggregates inbound/outbound edge weights to surface the most critical urban bottleneck.
* **Average Traffic Density:** Live network-wide capacity saturation metric.
* **Most Congested Corridor:** Highlights arterial corridors with the highest delay multipliers and minutes lost.
* **Suggested Alternative Route:** Dynamic diversion corridor recommendation.
* **Active Incidents Monitor:** Real-time count of blocked corridors and sudden surges.

### C. AI Recommendation & Decision Support Panel
* **Optimal Diversion Recommendation:** Actionable guidance on bypassing congested corridors.
* **Algorithmic Rationale:** Transparent explanation of speed limits vs congestion tradeoffs.
* **Expected Impact:** Quantified minutes saved and physical distance comparison.
* **Combinatorial Alternatives:** Evaluates secondary and tertiary candidate routes with delay penalties.
* **Decision Confidence Score:** Quantified confidence gauge ($96\%+$) backed by admissible heuristic verification.

### D. Incident Simulation & Impact Analysis
* **Simulate Real-World Incidents:**
  * Road Accidents & High-Speed Highway Collisions
  * Road Blockages (Maintenance, Landslides, Closures)
  * Sudden Traffic Density Surges
  * Complete Junction Unavailability
* **Before & After Comparative Analysis:** Recalculates baseline vs bypass routes in milliseconds.
* **NVIDIA Nemotron Incident Assessment:** Actionable detour directives and variable message sign (VMS) recommendations.

---

## 4. Technologies Used

* **AI & LLM Inference:** NVIDIA Nemotron (`nvidia/llama-3.1-nemotron-70b-instruct`) via **Nebius Token Factory** OpenAI-compatible API.
* **Classical Artificial Intelligence:** BFS, DFS, Dijkstra, A\* Search, Euclidean Heuristic ($h(n) = \text{dist} / v_{\max}$), PEAS Goal-Based Agent.
* **Backend:** Node.js, Express, dotenv, cors.
* **Frontend:** React 18, Vite 6, Tailwind-inspired custom CSS design system.
* **Geospatial & Mapping:** Leaflet, OpenStreetMap, Google Maps JavaScript API, SVG Canvas Renderer.
* **Data Visualization:** Recharts, Canvas Confetti, Lucide React Icons.

---

## 5. NVIDIA Nemotron Integration via Nebius Token Factory

### Environment Variables
Configure your credentials in `.env` (or `.env.local`):

```bash
# Nebius Token Factory API Configuration
NEBIUS_API_KEY=your_actual_nebius_api_key_here
NEBIUS_BASE_URL=https://api.studio.nebius.ai/v1
NEBIUS_MODEL=nvidia/llama-3.1-nemotron-70b-instruct

# Dedicated Backend AI Service Port
PORT=3001
```

> [!NOTE]
> **How to Obtain a Nebius API Key:**
> 1. Sign in to [Nebius Token Factory](https://tokenfactory.nebius.ai) or [Nebius AI Studio](https://studio.nebius.ai).
> 2. Navigate to **API Keys** and generate a new secret token.
> 3. Paste the key into your local `.env` file as `NEBIUS_API_KEY`.

### Security Guarantee
* The `NEBIUS_API_KEY` is **strictly kept on the server**.
* The Vite development server and production builds proxy API requests through `/api/ai/*`, completely insulating API credentials from client browsers.
* The frontend contains zero references to secret keys.

---

## 6. Installation & Execution Guide

### Prerequisites
* Node.js v18+ (tested on Node.js v24.22)
* npm v9+

### 1. Installation
Clone the repository and install all dependencies:

```bash
npm install
```

### 2. Configure Environment
Copy the example environment configuration:

```bash
cp .env.example .env
```
Open `.env` and insert your `NEBIUS_API_KEY`. *(Note: If no key is set, the system gracefully falls back to the deterministic local reasoning engine, so all features continue working seamlessly!)*

### 3. Run Application (Frontend + Backend Concurrently)
Start both the backend AI service (port 3001) and Vite frontend (port 3000):

```bash
npm run dev:all
```

Alternatively, run them in separate terminal sessions:
```bash
# Terminal 1: Backend AI Service
npm run server

# Terminal 2: Vite Frontend Dev Server
npm run dev
```

Open your browser at: **`http://localhost:3000`**

### 4. Production Build
```bash
npm run build
npm start
```

---

## 7. Automated Verification & Testing

The project includes two comprehensive automated test suites:

### Suite 1: Classical Search & Network Verification (9 Tests)
```bash
npm test
# or: node testRunner.js
```
* **Test 1:** Normal Traffic Baseline (CHN → TIR)
* **Test 2:** Peak-Hour Congestion Optimization
* **Test 3:** Accident / Blocked Road Incident Bypass
* **Test 4:** Combinatorial Multiple Alternative Routes Discovery
* **Test 5:** Disconnected / Fully Blocked Graph Error Handling
* **Test 6:** Source Equals Destination Edge Case
* **Test 7:** Real-World Road Highway Geometry & Route Snapping
* **Test 8:** Single-Source Optimal Reachability to All Cities
* **Test 9:** Statewide Network (118 Places) & Kovilpatti (KVP) Route Verification

### Suite 2: AI & NVIDIA Nemotron Integration Verification (8 Scenarios)
```bash
npm run test:ai
# or: node testAiRunner.js
```
* **Scenario 1:** Identify Most Congested Junction (Hotspot ranking)
* **Scenario 2:** Request Route Between Two Junctions (J1 to J10)
* **Scenario 3:** Block Road & Request Alternative Route (Bypass CHN-CGL)
* **Scenario 4:** Simulate Accident & Analyze Impact (Quantified delay & detours)
* **Scenario 5:** Compare Two Routing Algorithms (Dijkstra vs A* benchmark)
* **Scenario 6:** Explain Why Route Was Recommended (Mathematical cost model reasoning)
* **Scenario 7:** Invalid / Out-of-Scope Query Handling (Domain safety filtering)
* **Scenario 8:** API Failure & Model Unavailability Graceful Fallback (Zero 500 crashes)

---

## 8. Example AI Queries

Try asking the AI Traffic Assistant in the dashboard:

| Category | Example Prompt |
| :--- | :--- |
| **Congestion Hotspots** | *"Which junction currently has the highest congestion?"* |
| **Optimal Pathfinding** | *"Find the shortest route between Junction 1 and Junction 10."* |
| **Travel Time Estimation** | *"Which route has the lowest estimated travel time from Chennai to Tirunelveli?"* |
| **Node Breakdown Analysis** | *"What happens if Junction 5 becomes unavailable?"* |
| **Corridor Analysis** | *"Why is congestion increasing in a particular area?"* |
| **Dynamic Diversions** | *"Suggest alternative routes for congested roads."* |
| **Traffic Control Directives** | *"Which roads should receive traffic diversion?"* |
| **Algorithm Benchmark** | *"Compare Dijkstra and A\* for CHN to TIR."* |
| **Situational Briefing** | *"Explain the current traffic situation."* |

---

## 9. Hackathon Technology Disclosure

* **Hackathon:** Nebius x NVIDIA Global AI Hackathon 2026.
* **Eligible NVIDIA Model:** `nvidia/llama-3.1-nemotron-70b-instruct` (OpenAI-compatible inference).
* **Cloud Platform:** Nebius Token Factory (`https://api.studio.nebius.ai/v1`).
* **Classical AI Search Integration:** Complete separation of concerns between heuristic pathfinding (BFS, DFS, Dijkstra, A\*) and natural-language LLM reasoning, ensuring zero routing hallucination.

---

## 10. License
MIT License. Built for the Nebius x NVIDIA Global AI Hackathon 2026.
