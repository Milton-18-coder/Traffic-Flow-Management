import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  RotateCcw, 
  ArrowRight, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Activity,
  Flame,
  MessageSquare
} from 'lucide-react';
import { useTraffic } from '../../context/TrafficContext.jsx';
import { queryTrafficAssistant } from '../../services/aiApiService.js';

const SUGGESTED_QUERIES = [
  "Which junction currently has the highest congestion?",
  "Find the shortest route between Junction 1 and Junction 10.",
  "Which route has the lowest estimated travel time?",
  "What happens if Junction 5 becomes unavailable?",
  "Why is congestion increasing in a particular area?",
  "Suggest alternative routes for congested roads.",
  "Which roads should receive traffic diversion?",
  "Compare Dijkstra and A* for CHN to TIR.",
  "Explain the current traffic situation."
];

export function AITrafficAssistant({ onApplyRouteToMap }) {
  const { 
    nodes, 
    edges, 
    searchResult, 
    selectedAlgorithm, 
    sourceNode, 
    destNode,
    setSourceNode,
    setDestNode,
    executeSearch,
    showToast
  } = useTraffic();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 Hello! I am **TrafficMind AI**, your transportation engineering co-pilot powered by **NVIDIA Nemotron** via **Nebius Token Factory**.\n\nI combine real-time graph search algorithms (**BFS, DFS, Dijkstra, A***) with deep traffic reasoning. Ask me about network congestion, corridor bypasses, algorithm benchmarks, or route optimization below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'nvidia/llama-3.1-nemotron-70b-instruct'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setErrorBanner(null);
    setInputQuery('');

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await queryTrafficAssistant({
        message: textToSend,
        nodes,
        edges,
        activeRoute: searchResult,
        selectedAlgorithm
      });

      if (res.success) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: res.text,
          structuredData: res.structuredData,
          queryType: res.queryType,
          model: res.model || 'nvidia/llama-3.1-nemotron-70b-instruct',
          provider: res.provider || 'Nebius Token Factory',
          latencyMs: res.latencyMs,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);

        // If structured route was returned, inform user
        if (res.structuredData?.optimalPath && res.structuredData.optimalPath.length > 1) {
          showToast('Optimal Route Identified', `AI calculated: ${res.structuredData.optimalPath.join(' → ')}`, 'info');
        }
      } else {
        setErrorBanner(res.error || 'Failed to receive AI response');
        const fallbackMsg = {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          text: res.text || `⚠️ Could not complete query: ${res.error}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch (e) {
      setErrorBanner(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRoute = (data) => {
    if (!data?.source?.id || !data?.destination?.id) return;
    setSourceNode(data.source.id);
    setDestNode(data.destination.id);
    setTimeout(() => {
      executeSearch('A*', data.source.id, data.destination.id);
      showToast('Map Synchronized', `Route set to [${data.source.id}] → [${data.destination.id}].`, 'success');
      if (onApplyRouteToMap) onApplyRouteToMap();
    }, 50);
  };

  const handleClearChat = () => {
    setMessages([messages[0]]);
    setErrorBanner(null);
  };

  return (
    <div className="card-panel ai-traffic-assistant-card">
      {/* Header */}
      <div className="panel-header assistant-header">
        <div className="header-title-wrap">
          <div className="assistant-avatar-box">
            <Bot size={20} className="text-emerald-400" />
            <span className="live-status-dot" />
          </div>
          <div>
            <h3>AI Traffic Assistant</h3>
            <span className="assistant-subtitle">NVIDIA Nemotron • Classical Search Grounding</span>
          </div>
        </div>

        <div className="assistant-header-actions">
          <button 
            className="btn-clear-chat" 
            onClick={handleClearChat}
            title="Reset conversation"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div className="assistant-error-banner">
          <AlertCircle size={15} />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="assistant-messages-area">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`chat-message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}
          >
            <div className="bubble-header">
              <span className="bubble-sender">
                {msg.role === 'user' ? 'Traffic Operator' : 'TrafficMind AI (Nemotron)'}
              </span>
              <span className="bubble-time">{msg.timestamp}</span>
            </div>

            {/* Markdown Prose */}
            <div className="bubble-content">
              {msg.text.split('\n').map((line, lIdx) => {
                if (line.startsWith('### ')) {
                  return <h4 key={lIdx} className="bubble-heading">{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('* ') || line.startsWith('- ')) {
                  return <div key={lIdx} className="bubble-bullet">• {line.slice(2)}</div>;
                }
                if (line.trim() === '') {
                  return <div key={lIdx} className="bubble-space" />;
                }
                return <p key={lIdx}>{line}</p>;
              })}
            </div>

            {/* Actionable Route Card if structured route data attached */}
            {msg.structuredData?.optimalPath && msg.structuredData.optimalPath.length > 1 && (
              <div className="bubble-route-card">
                <div className="route-card-top">
                  <span className="route-title">Computed Optimal Corridor</span>
                  <button 
                    className="btn-apply-route-action"
                    onClick={() => handleApplyRoute(msg.structuredData)}
                  >
                    Apply to Live Map &rarr;
                  </button>
                </div>
                <div className="route-path-line">
                  {msg.structuredData.optimalPath.join(' → ')}
                </div>
                <div className="route-stat-pills">
                  <span>Time: <strong>{msg.structuredData.optimalCost} min</strong></span>
                  <span>Distance: <strong>{msg.structuredData.optimalDistance} km</strong></span>
                  <span>Explored: <strong>{msg.structuredData.exploredNodes} states</strong></span>
                </div>
              </div>
            )}

            {/* Provider and Latency Badge */}
            {msg.provider && (
              <div className="bubble-footer-meta">
                <span>{msg.provider}</span>
                {msg.latencyMs && <span>• {msg.latencyMs}ms</span>}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="chat-message-bubble ai-bubble loading-bubble">
            <div className="loading-animation-wrapper">
              <Sparkles size={16} className="spin-icon text-emerald-400" />
              <span className="loading-text">
                NVIDIA Nemotron is analyzing network state space and graph paths...
              </span>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="suggested-queries-tray">
        <span className="suggested-label"><HelpCircle size={12} /> Suggested:</span>
        <div className="suggested-pills-scroll">
          {SUGGESTED_QUERIES.map((q, qIdx) => (
            <button
              key={qIdx}
              className="query-pill-btn"
              onClick={() => handleSendQuery(q)}
              disabled={isLoading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* User Input Field */}
      <form 
        className="assistant-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
      >
        <input
          type="text"
          className="assistant-text-input"
          placeholder="Ask TrafficMind AI (e.g. 'Which junction has highest congestion?' or 'Route between CHN and MDU')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="assistant-send-btn"
          disabled={isLoading || !inputQuery.trim()}
          title="Send query"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

