import React, { Suspense, lazy, useState } from 'react';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import { LandingPage } from './components/landing/LandingPage';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ThreatTicker } from './components/layout/ThreatTicker';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { MissionControlDeck } from './components/dashboard/MissionControlDeck';
import { IncidentQueueTable } from './components/queue/IncidentQueueTable';
import { AttackChainVisualizer } from './components/attackChain/AttackChainVisualizer';
import { AddIncidentForm } from './components/ingestion/AddIncidentForm';
import { IncidentDetailPage } from './components/incidentDetail/IncidentDetailPage';
import { SimulationController } from './components/simulation/SimulationController';
import { WeightCustomizer } from './components/settings/WeightCustomizer';
import { ExplainableRankingModal } from './components/explainability/ExplainableRankingModal';
import { HeadToHeadComparison } from './components/explainability/HeadToHeadComparison';
import { Incident } from './types/incident';

const AnalyticsDashboard = lazy(() =>
  import('./components/analytics/AnalyticsDashboard').then((module) => ({ default: module.AnalyticsDashboard }))
);

const SectionFallback = () => (
  <div className="glass-panel rounded-xl border border-slate-800 p-8 text-center text-xs font-mono text-slate-400">
    Loading SOC analytics…
  </div>
);

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPersona, setUserPersona] = useState('Lead Incident Commander');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [viewingDetailIncident, setViewingDetailIncident] = useState<Incident | null>(null);
  const { selectedIncident, setSelectedIncident, comparingIncident, setComparingIncident, incidents } = useIncidents();
  const [secondaryCompareIncident, setSecondaryCompareIncident] = useState<Incident | null>(null);

  const handleLogin = (persona?: string) => {
    if (persona) setUserPersona(persona);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewingDetailIncident(null);
    setSelectedIncident(null);
    setComparingIncident(null);
    setSecondaryCompareIncident(null);
  };

  const handleTriggerCompare = (incidentA: Incident, incidentB: Incident) => {
    setComparingIncident(incidentA);
    setSecondaryCompareIncident(incidentB);
  };

  const handleCompareWithNextFromModal = (current: Incident) => {
    const next = incidents.find((incident) => incident.rank === (current.rank || 1) + 1);
    if (next) {
      setSelectedIncident(null);
      handleTriggerCompare(current, next);
    }
  };

  if (!isAuthenticated) return <LandingPage onEnterApp={handleLogin} />;

  return (
    <div className="mission-shell flex min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewingDetailIncident(null);
        }}
        userPersona={userPersona}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <ThreatTicker />

        <main className="flex-1 p-4 lg:p-5 max-w-[1680px] w-full mx-auto space-y-5">
          {viewingDetailIncident ? (
            <IncidentDetailPage
              incident={viewingDetailIncident}
              onBack={() => setViewingDetailIncident(null)}
              onSelectCorrelated={(corr) => setViewingDetailIncident(corr)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-5">
                  <div className="mission-command-bar">
                    <div>
                      <div className="mission-eyebrow">THREATOPS // AUTONOMOUS SOC COMMAND</div>
                      <h1 className="mission-title">Mission Control</h1>
                    </div>
                    <div className="mission-status-cluster">
                      <span><i className="bg-emerald-400" />SCORING ENGINE ONLINE</span>
                      <span><i className="bg-cyan-400" />CORRELATION ACTIVE</span>
                      <span><i className="bg-violet-400" />AI EXPLAINABILITY READY</span>
                    </div>
                  </div>

                  <SummaryCards
                    onNavigateToQueue={() => setActiveTab('queue')}
                    onNavigateToChains={() => setActiveTab('chains')}
                  />

                  <MissionControlDeck
                    onSelectIncident={setSelectedIncident}
                    onSelectChain={() => setActiveTab('chains')}
                    onNavigateToQueue={() => setActiveTab('queue')}
                    onNavigateToChains={() => setActiveTab('chains')}
                  />

                  <div className="mission-queue-wrap">
                    <div className="mission-section-kicker">TACTICAL QUEUE // RANKED INCIDENTS</div>
                    <IncidentQueueTable
                      onSelectIncident={setSelectedIncident}
                      onCompareIncidents={handleTriggerCompare}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'queue' && (
                <IncidentQueueTable onSelectIncident={setSelectedIncident} onCompareIncidents={handleTriggerCompare} />
              )}
              {activeTab === 'chains' && <AttackChainVisualizer onSelectIncident={setSelectedIncident} />}
              {activeTab === 'analytics' && <Suspense fallback={<SectionFallback />}><AnalyticsDashboard /></Suspense>}
              {activeTab === 'add' && <AddIncidentForm onSuccessNavigateToQueue={() => setActiveTab('queue')} />}
              {activeTab === 'simulation' && <SimulationController onNavigateToQueue={() => setActiveTab('queue')} />}
              {activeTab === 'settings' && <WeightCustomizer onNavigateToQueue={() => setActiveTab('queue')} />}
            </>
          )}
        </main>
      </div>

      <ExplainableRankingModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} onCompareWithNext={handleCompareWithNextFromModal} />
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
  return <IncidentProvider><AppContent /></IncidentProvider>;
}
