import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Incident, 
  AttackChain, 
  FactorWeights, 
  IncidentStatus, 
  SOCMetrics,
  QueueFilters 
} from '../types/incident';
import { DEFAULT_WEIGHTS, rankIncidents } from '../utils/scoringEngine';
import { correlateAllIncidents } from '../utils/correlationEngine';
import { INITIAL_MOCK_INCIDENTS, generateBatchAlerts, generateLiveIncomingAlert } from '../utils/mockData';

interface IncidentContextType {
  incidents: Incident[];
  attackChains: AttackChain[];
  weights: FactorWeights;
  metrics: SOCMetrics;
  filters: QueueFilters;
  setFilters: React.Dispatch<React.SetStateAction<QueueFilters>>;
  
  // Selected state for modals/pages
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  comparingIncident: Incident | null;
  setComparingIncident: (incident: Incident | null) => void;
  activeChainDetail: AttackChain | null;
  setActiveChainDetail: (chain: AttackChain | null) => void;
  
  // Live Mode & Alerts
  isLiveMode: boolean;
  setIsLiveMode: (active: boolean) => void;
  criticalAlertBanner: string | null;
  dismissCriticalBanner: () => void;
  
  // Actions
  addIncident: (newIncidentData: Omit<Incident, 'id' | 'weightedScore' | 'priorityScore' | 'riskLevel' | 'rank' | 'correlatedIncidentIds'>) => void;
  simulateBatchAlerts: () => void;
  updateIncidentStatus: (id: string, status: IncidentStatus, notes?: string) => void;
  batchUpdateStatus: (ids: string[], status: IncidentStatus) => void;
  deleteIncident: (id: string) => void;
  updateWeights: (newWeights: Partial<FactorWeights>) => void;
  resetWeights: () => void;
  resetAllData: () => void;
  exportDataJSON: () => void;
}

const STORAGE_KEY_INCIDENTS = 'cyber_soc_incidents_v2';
const STORAGE_KEY_WEIGHTS = 'cyber_soc_weights_v2';

const DEFAULT_FILTERS: QueueFilters = {
  searchQuery: '',
  riskLevels: [],
  statuses: [],
  types: [],
  onlyCorrelated: false,
  sortBy: 'rank',
  sortOrder: 'asc',
};

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load weights
  const [weights, setWeights] = useState<FactorWeights>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WEIGHTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading weights from localStorage:', e);
      }
    }
    return DEFAULT_WEIGHTS;
  });

  // Load raw incidents
  const [rawIncidents, setRawIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INCIDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading incidents from localStorage:', e);
      }
    }
    return INITIAL_MOCK_INCIDENTS;
  });

  // Modals / Panels
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [comparingIncident, setComparingIncident] = useState<Incident | null>(null);
  const [activeChainDetail, setActiveChainDetail] = useState<AttackChain | null>(null);

  // Filters
  const [filters, setFilters] = useState<QueueFilters>(DEFAULT_FILTERS);

  // Live Mode Simulation
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [criticalAlertBanner, setCriticalAlertBanner] = useState<string | null>(null);

  // Process correlation and ranking dynamically whenever raw incidents or weights change
  const { incidents, attackChains } = useMemo(() => {
    const { correlatedIncidents, attackChains: chains } = correlateAllIncidents(rawIncidents);
    const ranked = rankIncidents(correlatedIncidents, weights);
    return {
      incidents: ranked,
      attackChains: chains,
    };
  }, [rawIncidents, weights]);

  // Keep selected incident up to date with latest ranked data
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find((i) => i.id === selectedIncident.id);
      if (updated) setSelectedIncident(updated);
    }
  }, [incidents]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(rawIncidents));
  }, [rawIncidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WEIGHTS, JSON.stringify(weights));
  }, [weights]);

  // Compute SOC Metrics
  const metrics: SOCMetrics = useMemo(() => {
    const total = incidents.length;
    const criticalCount = incidents.filter((i) => i.riskLevel === 'CRITICAL' && i.status !== 'MITIGATED').length;
    const highCount = incidents.filter((i) => i.riskLevel === 'HIGH' && i.status !== 'MITIGATED').length;
    const mediumCount = incidents.filter((i) => i.riskLevel === 'MEDIUM' && i.status !== 'MITIGATED').length;
    const lowCount = incidents.filter((i) => i.riskLevel === 'LOW' && i.status !== 'MITIGATED').length;
    const activeAttackChains = attackChains.filter((c) => c.status === 'ACTIVE').length;
    
    const uniqueAssets = new Set(incidents.map((i) => i.asset));
    const avgScore = total > 0 
      ? Math.round((incidents.reduce((sum, i) => sum + i.priorityScore, 0) / total) * 10) / 10 
      : 0;
    const mitigated = incidents.filter((i) => i.status === 'MITIGATED').length;

    return {
      totalIncidents: total,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      activeAttackChains,
      affectedAssetsCount: uniqueAssets.size,
      avgPriorityScore: avgScore,
      eventsPerSecond: isLiveMode ? 4.2 : 0.8,
      mitigatedCount: mitigated,
    };
  }, [incidents, attackChains, isLiveMode]);

  // Live Mode Ticker
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setRawIncidents((prev) => {
        const newAlert = generateLiveIncomingAlert(prev);
        // Trigger banner
        setCriticalAlertBanner(
          `CRITICAL ATTACK CHAIN DETECTED: ${newAlert.title} (Target: ${newAlert.asset} | IP: ${newAlert.sourceIp})`
        );
        return [newAlert, ...prev];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const dismissCriticalBanner = useCallback(() => {
    setCriticalAlertBanner(null);
  }, []);

  const addIncident = useCallback(
    (newIncidentData: Omit<Incident, 'id' | 'weightedScore' | 'priorityScore' | 'riskLevel' | 'rank' | 'correlatedIncidentIds'>) => {
      const id = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInc: Incident = {
        ...newIncidentData,
        id,
        weightedScore: 0,
        priorityScore: 0,
        riskLevel: 'HIGH',
        correlatedIncidentIds: [],
        timestamp: newIncidentData.timestamp || new Date().toISOString(),
        isNewAlert: true,
      };

      setRawIncidents((prev) => [newInc, ...prev]);
    },
    []
  );

  const simulateBatchAlerts = useCallback(() => {
    const generated = generateBatchAlerts();
    setRawIncidents(generated);
    setCriticalAlertBanner('SIMULATION TRIGGERED: 25+ correlated security alerts ingested & ranked across enterprise assets.');
  }, []);

  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus, notes?: string) => {
    setRawIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const currentNotes = inc.notes || [];
        return {
          ...inc,
          status,
          mitigatedAt: status === 'MITIGATED' ? new Date().toISOString() : inc.mitigatedAt,
          notes: notes ? [...currentNotes, notes] : currentNotes,
        };
      })
    );
  }, []);

  const batchUpdateStatus = useCallback((ids: string[], status: IncidentStatus) => {
    setRawIncidents((prev) =>
      prev.map((inc) => (ids.includes(inc.id) ? { ...inc, status } : inc))
    );
  }, []);

  const deleteIncident = useCallback((id: string) => {
    setRawIncidents((prev) => prev.filter((i) => i.id !== id));
    if (selectedIncident?.id === id) setSelectedIncident(null);
    if (comparingIncident?.id === id) setComparingIncident(null);
  }, [selectedIncident, comparingIncident]);

  const updateWeights = useCallback((newWeights: Partial<FactorWeights>) => {
    setWeights((prev) => ({ ...prev, ...newWeights }));
  }, []);

  const resetWeights = useCallback(() => {
    setWeights(DEFAULT_WEIGHTS);
  }, []);

  const resetAllData = useCallback(() => {
    setRawIncidents(INITIAL_MOCK_INCIDENTS);
    setWeights(DEFAULT_WEIGHTS);
    setSelectedIncident(null);
    setComparingIncident(null);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const exportDataJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incidents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cyber-soc-prioritized-incidents-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [incidents]);

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        attackChains,
        weights,
        metrics,
        filters,
        setFilters,
        selectedIncident,
        setSelectedIncident,
        comparingIncident,
        setComparingIncident,
        activeChainDetail,
        setActiveChainDetail,
        isLiveMode,
        setIsLiveMode,
        criticalAlertBanner,
        dismissCriticalBanner,
        addIncident,
        simulateBatchAlerts,
        updateIncidentStatus,
        batchUpdateStatus,
        deleteIncident,
        updateWeights,
        resetWeights,
        resetAllData,
        exportDataJSON,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
