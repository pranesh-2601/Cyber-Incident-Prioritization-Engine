import React, { useState } from 'react';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import { LandingPage } from './components/landing/LandingPage';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ThreatTicker } from './components/layout/ThreatTicker';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { ThreatRadar } from './components/dashboard/ThreatRadar';
import { IncidentQueueTable } from './components/queue/IncidentQueueTable';
import { AttackChainVisualizer } from './components/attackChain/AttackChainVisualizer';
import { AddIncidentForm } from './components/ingestion/AddIncidentForm';
import { IncidentDetailPage } from './components/incidentDetail/IncidentDetailPage';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SimulationController } from './components/simulation/SimulationController';
import { WeightCustomizer } from './components/settings/WeightCustomizer';
import { ExplainableRankingModal } from './components/explainability/ExplainableRankingModal';
import { HeadToHeadComparison } from './components/explainability/HeadToHeadComparison';
import { Incident } from './types/incident';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userPersona, setUserPersona] = useState<string>('Lead Incident Commander');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Full view states
  const [viewingDetailIncident, setViewingDetailIncident] = useState<Incident | null>(null);
  
  // Modals
  const { 
    selectedIncident, 
    setSelectedIncident, 
    comparingIncident, 
    setComparingIncident,
    incidents 
  } = useIncidents();
  const [secondaryCompareIncident, setSecondaryCompareIncident] = useState<Incident | null>(null);

  const handleLogin = (persona?: string) => {
    if (persona) setUserPersona(persona);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleOpenExplainModal = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleTriggerCompare = (incidentA: Incident, incidentB: Incident) => {
    setComparingIncident(incidentA);
    setSecondaryCompareIncident(incidentB);
  };

  const handleCompareWithNextFromModal = (current: Incident) => {
    const next = incidents.find((i) => i.rank === (current.rank || 1) + 1);
    if (next) {
      setSelectedIncident(null);
      handleTriggerCompare(current, next);
    }
  };

  if (!isAuthenticated) {
    return <LandingPage onEnterApp={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewingDetailIncident(null);
        }}
        userPersona={userPersona}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Real-time Threat Ticker Alert */}
        <ThreatTicker />

        {/* Dynamic View Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {viewingDetailIncident ? (
            <IncidentDetailPage
              incident={viewingDetailIncident}
              onBack={() => setViewingDetailIncident(null)}
              onSelectCorrelated={(corr) => setViewingDetailIncident(corr)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Top KPI Cards */}
                  <SummaryCards
                    onNavigateToQueue={() => setActiveTab('queue')}
                    onNavigateToChains={() => setActiveTab('chains')}
                  />

                  {/* Threat Focus Radar & Active Attack Chains */}
                  <ThreatRadar
                    onSelectIncident={handleOpenExplainModal}
                    onSelectChain={() => setActiveTab('chains')}
                    onNavigateToQueue={() => setActiveTab('queue')}
                    onNavigateToChains={() => setActiveTab('chains')}
                  />

                  {/* Central Prioritized Incident Queue Preview */}
                  <IncidentQueueTable
                    onSelectIncident={handleOpenExplainModal}
                    onCompareIncidents={handleTriggerCompare}
                  />
                </div>
              )}

              {activeTab === 'queue' && (
                <IncidentQueueTable
                  onSelectIncident={handleOpenExplainModal}
                  onCompareIncidents={handleTriggerCompare}
                />
              )}

              {activeTab === 'chains' && (
                <AttackChainVisualizer
                  onSelectIncident={handleOpenExplainModal}
                />
              )}

              {activeTab === 'analytics' && <AnalyticsDashboard />}

              {activeTab === 'add' && (
                <AddIncidentForm
                  onSuccessNavigateToQueue={() => setActiveTab('queue')}
                />
              )}

              {activeTab === 'simulation' && (
                <SimulationController
                  onNavigateToQueue={() => setActiveTab('queue')}
                />
              )}

              {activeTab === 'settings' && (
                <WeightCustomizer
                  onNavigateToQueue={() => setActiveTab('queue')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Explainable Ranking Modal ("Why this incident ranks here") */}
      <ExplainableRankingModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onCompareWithNext={handleCompareWithNextFromModal}
      />

      {/* Head-to-Head Comparison Modal ("Why Incident #1 outranks Incident #2") */}
      <HeadToHeadComparison
        incidentA={comparingIncident}
        incidentB={secondaryCompareIncident}
        onClose={() => {
          setComparingIncident(null);
          setSecondaryCompareIncident(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <IncidentProvider>
      <AppContent />
    </IncidentProvider>
  );
}
