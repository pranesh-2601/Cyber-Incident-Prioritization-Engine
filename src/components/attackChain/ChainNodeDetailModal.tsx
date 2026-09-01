import React from 'react';
import { 
  Network, 
  Server, 
  User, 
  Clock, 
  ExternalLink, 
  ShieldAlert, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AttackChainNode, Incident } from '../../types/incident';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { useIncidents } from '../../context/IncidentContext';

export const ChainNodeDetailModal: React.FC<{
  node: AttackChainNode | null;
  onClose: () => void;
  onOpenFullIncident?: (inc: Incident) => void;
}> = ({ node, onClose, onOpenFullIncident }) => {
  const { incidents, updateIncidentStatus } = useIncidents();

  if (!node) return null;

  const incident = incidents.find((i) => i.id === node.incidentId);

  return (
    <Modal
      isOpen={Boolean(node)}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          <span>Attack Chain Stage: {node.stage}</span>
        </div>
      }
      subtitle={`Forensic Artifact Node • Incident ${node.incidentId}`}
    >
      <div className="space-y-5">
        {/* Node header card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-purple-300">
                {node.incidentId}
              </span>
              {incident && <RiskBadge level={incident.riskLevel} size="sm" />}
            </div>
            <h3 className="text-sm font-bold text-white">{node.type}</h3>
            {node.mitreTechnique && (
              <p className="text-xs font-mono text-cyan-400 mt-0.5">
                MITRE ATT&CK: {node.mitreTechnique} ({node.mitreTactic})
              </p>
            )}
          </div>

          <ScoreGauge score={node.priorityScore} size="md" />
        </div>

        {/* Forensic Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase">Source / Attacker IP</span>
            <div className="text-cyan-400 font-bold mt-0.5">{node.sourceIp}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase">Destination IP</span>
            <div className="text-slate-200 font-bold mt-0.5">{node.destinationIp || 'Internal Subnet'}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase">Target Asset</span>
            <div className="text-white font-bold mt-0.5">{node.asset}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase">Compromised User</span>
            <div className="text-amber-300 font-bold mt-0.5">{node.user}</div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Observed Telemetry Time: {new Date(node.timestamp).toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {incident && onOpenFullIncident && (
            <button
              onClick={() => {
                onClose();
                onOpenFullIncident(incident);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-colors"
            >
              <span>View Full Explainable Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono ml-auto transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
