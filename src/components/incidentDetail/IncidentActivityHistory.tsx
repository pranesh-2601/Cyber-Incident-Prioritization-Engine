import { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { IncidentAuditEntry, loadIncidentAuditHistory } from '../../services/incidentAudit';

const actionLabel: Record<IncidentAuditEntry['action'], string> = {
  CREATED: 'Incident created',
  UPDATED: 'Incident updated',
  STATUS_CHANGED: 'Status changed',
  DELETED: 'Incident deleted',
};

export const IncidentActivityHistory = ({ incidentId }: { incidentId: string }) => {
  const [entries, setEntries] = useState<IncidentAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const history = await loadIncidentAuditHistory(incidentId);
        if (!cancelled) setEntries(history);
      } catch (error) {
        console.warn('Audit history unavailable.', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setLoading(true);
    void load();
    const interval = window.setInterval(() => void load(), 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [incidentId]);

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">Incident Activity History</h3>
        </div>
        {loading && <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
      </div>

      {entries.length === 0 ? (
        <div className="text-xs text-slate-500 font-mono rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          No recorded activity yet. New database changes will appear here automatically.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-100">{actionLabel[entry.action]}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  {entry.action === 'STATUS_CHANGED' && entry.previous_status && entry.new_status
                    ? `${entry.previous_status} → ${entry.new_status}`
                    : entry.new_status
                      ? `Status: ${entry.new_status}`
                      : 'Database activity recorded'}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                {new Date(entry.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
