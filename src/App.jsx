import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { TrafficNetwork } from './pages/TrafficNetwork.jsx';
import { RouteOptimizer } from './pages/RouteOptimizer.jsx';
import { AlgorithmComparison } from './pages/AlgorithmComparison.jsx';
import { IntelligentAgent } from './pages/IntelligentAgent.jsx';
import { TrafficAnalysis } from './pages/TrafficAnalysis.jsx';
import { About } from './pages/About.jsx';
import { useTraffic } from './context/TrafficContext.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme } = useTraffic();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'network':
        return <TrafficNetwork />;
      case 'optimizer':
        return <RouteOptimizer />;
      case 'comparison':
        return <AlgorithmComparison />;
      case 'agent':
        return <IntelligentAgent />;
      case 'analysis':
        return <TrafficAnalysis />;
      case 'about':
        return <About />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={`app-root theme-${theme}`}>
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      
      <div className="app-main-layout">
        <Header activeTab={activeTab} />
        <main className="app-main-content">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
