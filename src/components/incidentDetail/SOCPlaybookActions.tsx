import React, { useState } from 'react';
import {
  ShieldAlert,
  Ban,
  UserX,
  ServerOff,
  KeyRound,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { useIncidents } from '../../context/IncidentContext';
import { recordPlaybookAuditEvent } from '../../services/incidentAudit';

export const SOCPlaybookActions: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { updateIncidentStatus } = useIncidents();
  const [executedActions, setExecutedActions] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const executeAction = async (actionId: string, actionName: string, message: string) => {
    setExecutedActions((prev) => [...prev, actionId]);
    setActionFeedback(message);

    updateIncidentStatus(incident.id, 'INVESTIGATING', `Executed Playbook Action: ${actionName}`);

    try {
      await recordPlaybookAuditEvent(incident.id, actionId, actionName, message);
    } catch (error) {
      console.warn('Could not record playbook action in audit history.', error);
    }

    setTimeout(() => setActionFeedback(null), 4000);
  };

  const playbooks = [
    {
      id: 'block_ip',
      name: `Block Source IP (${incident.sourceIp})`,
      desc: 'Pushes automated perimeter firewall null-route rule to Palo Alto & Cloudflare edge.',
      icon: Ban,
      color: 'hover:border-red-500/50 hover:bg-red-950/40 text-red-400',
      successMsg: `Firewall block rule active: Dropping all traffic from ${incident.sourceIp}.`,
    },
    {
      id: 'isolate_endpoint',
      name: `Isolate Host (${incident.asset})`,
      desc: 'Enforces EDR network containment, severing all network interfaces except SOC telemetry.',
      icon: ServerOff,
      color: 'hover:border-orange-500/50 hover:bg-orange-950/40 text-orange-400',
      successMsg: `Endpoint ${incident.asset} quarantined via CrowdStrike/SentinelOne agent.`,
    },
    {
      id: 'disable_user',
      name: `Disable Compromised Account (${incident.user})`,
      desc: 'Revokes active Kerberos/OAuth tokens, suspends Okta SSO session, and locks Active Directory user.',
      icon: UserX,
      color: 'hover:border-amber-500/50 hover:bg-amber-950/40 text-amber-400',
      successMsg: `Identity ${incident.user} suspended and all active SSO sessions terminated.`,
    },
    {
      id: 'reset_creds',
      name: 'Enforce Global Password Reset & FIDO2 Hardware MFA',
      desc: 'Forces immediate credential rotation upon next authentication attempt.',
      icon: KeyRound,
      color: 'hover:border-cyan-500/50 hover:bg-cyan-950/40 text-cyan-400',
      successMsg: `Temporary password generated and FIDO2 challenge triggered for ${incident.user}.`,
    },
    {
      id: 'escalate_cirt',
      name: 'Escalate to Tier 3 CIRT & Incident Commander',
      desc: 'Opens P1 war room, pages on-call incident commander, and creates Jira/ServiceNow ticket.',
      icon: ArrowUpRight,
      color: 'hover:border-purple-500/50 hover:bg-purple-950/40 text-purple-400',
      successMsg: `SEV-1 War Room created #CIRT-${incident.id}. Commander notified via PagerDuty.`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Automated SOC Mitigation Playbooks
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Zero-Trust Orchestration (SOAR)</span>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {playbooks.map((pb) => {
          const Icon = pb.icon;
          const isDone = executedActions.includes(pb.id);

          return (
            <button
              key={pb.id}
              onClick={() => void executeAction(pb.id, pb.name, pb.successMsg)}
              disabled={isDone}
              className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                isDone
                  ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                  : `bg-slate-900/80 border-slate-800 ${pb.color}`
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
              </div>

              <div>
                <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                  <span>{pb.name}</span>
                  {isDone && <span className="text-[10px] text-emerald-400 font-mono">[EXECUTED]</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-snug">{pb.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
