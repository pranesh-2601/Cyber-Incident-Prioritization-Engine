import { useEffect, useRef } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { loadWeightsFromSupabase, saveWeightsToSupabase } from '../../services/supabaseIncidents';

const WEIGHT_REFRESH_MS = 2000;

export const SharedWeightsSync = () => {
  const { weights, updateWeights } = useIncidents();
  const hydrated = useRef(false);
  const latestLocalSignature = useRef(JSON.stringify(weights));
  const lastRemoteSignature = useRef<string | null>(null);

  latestLocalSignature.current = JSON.stringify(weights);

  useEffect(() => {
    let cancelled = false;

    const pullWeights = async () => {
      try {
        const remote = await loadWeightsFromSupabase();
        if (cancelled || !remote) return;

        const remoteSignature = JSON.stringify(remote);
        lastRemoteSignature.current = remoteSignature;

        if (remoteSignature !== latestLocalSignature.current) {
          updateWeights(remote);
        }

        hydrated.current = true;
      } catch (error) {
        console.warn('Shared scoring settings sync unavailable; keeping local weights.', error);
        hydrated.current = true;
      }
    };

    void pullWeights();
    const interval = window.setInterval(() => void pullWeights(), WEIGHT_REFRESH_MS);
    const onFocus = () => void pullWeights();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [updateWeights]);

  useEffect(() => {
    if (!hydrated.current) return;

    const signature = JSON.stringify(weights);
    if (signature === lastRemoteSignature.current) return;

    const timeout = window.setTimeout(() => {
      void saveWeightsToSupabase(weights)
        .then(() => {
          lastRemoteSignature.current = signature;
        })
        .catch((error) => {
          console.warn('Could not save shared scoring weights; local settings remain active.', error);
        });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [weights]);

  return null;
};
