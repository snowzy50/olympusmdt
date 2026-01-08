/**
 * Hook React pour la gestion du systeme DEFCON avec Realtime
 * Cree par: Snowzy
 * Synchronisation en temps reel avec Supabase
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { defconRealtimeService } from '@/services/defconRealtimeService';
import type { DefconLevel, DefconStatus, DefconConfig } from '@/types/defcon';
import { DEFCON_CONFIGS, getDefconConfig, isDefconCritical } from '@/types/defcon';

interface UseDefconOptions {
  autoConnect?: boolean;
  agencyId?: string;
}

/**
 * Extrait l'ID de l'agence depuis le pathname
 */
function getAgencyFromPath(pathname: string): string | null {
  const match = pathname.match(/\/dashboard\/([^/]+)/);
  return match ? match[1] : null;
}

export function useDefcon(options: UseDefconOptions = {}) {
  const { autoConnect = true, agencyId: agencyIdOverride } = options;
  const pathname = usePathname();
  const agencyId = agencyIdOverride || getAgencyFromPath(pathname);

  const [currentDefcon, setCurrentDefcon] = useState<DefconStatus | null>(null);
  const [history, setHistory] = useState<DefconStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionIdRef = useRef<string>(`defcon-${Date.now()}`);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Obtenir le niveau DEFCON actuel (1-5)
   */
  const currentLevel: DefconLevel = currentDefcon?.level || 5;

  /**
   * Obtenir la configuration du niveau actuel
   */
  const config: DefconConfig = getDefconConfig(currentLevel);

  /**
   * Verifier si le niveau est critique
   */
  const isCritical = isDefconCritical(currentLevel);

  /**
   * Obtenir le multiplicateur d'amende
   */
  const fineMultiplier = config.fineMultiplier;

  /**
   * Charger le niveau DEFCON actuel depuis Supabase
   */
  const loadCurrentDefcon = useCallback(async () => {
    if (!agencyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const defcon = await defconRealtimeService.getCurrentDefcon(agencyId);
      setCurrentDefcon(defcon);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement du DEFCON');
      setError(error);
      console.error('[useDefcon] Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, [agencyId]);

  /**
   * Charger l'historique DEFCON
   */
  const loadHistory = useCallback(async (limit = 10) => {
    if (!agencyId) return;

    try {
      const historyData = await defconRealtimeService.getDefconHistory(agencyId, limit);
      setHistory(historyData);
    } catch (err) {
      console.error('[useDefcon] Erreur chargement historique:', err);
    }
  }, [agencyId]);

  /**
   * Changer le niveau DEFCON
   */
  const setLevel = useCallback(
    async (level: DefconLevel, activatedBy: string, options?: { notes?: string; durationHours?: number }) => {
      if (!agencyId) {
        throw new Error('Aucune agence selectionnee');
      }

      try {
        const newDefcon = await defconRealtimeService.setDefconLevel(level, agencyId, activatedBy, options);
        setCurrentDefcon(newDefcon);
        // Recharger l'historique
        await loadHistory();
        return newDefcon;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors du changement de niveau DEFCON');
        setError(error);
        throw error;
      }
    },
    [agencyId, loadHistory]
  );

  /**
   * Desactiver le niveau DEFCON (retour a 5)
   */
  const deactivate = useCallback(
    async (deactivatedBy: string) => {
      if (!agencyId) {
        throw new Error('Aucune agence selectionnee');
      }

      try {
        await defconRealtimeService.deactivateDefcon(agencyId, deactivatedBy);
        // Recharger
        await loadCurrentDefcon();
        await loadHistory();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de la desactivation du DEFCON');
        setError(error);
        throw error;
      }
    },
    [agencyId, loadCurrentDefcon, loadHistory]
  );

  /**
   * Calculer une amende avec le multiplicateur DEFCON
   */
  const calculateFine = useCallback(
    (baseFine: number): number => {
      return Math.round(baseFine * fineMultiplier);
    },
    [fineMultiplier]
  );

  /**
   * Effet pour initialiser la connexion Realtime
   */
  useEffect(() => {
    if (!agencyId || !autoConnect) return;

    const initRealtime = async () => {
      try {
        // Se connecter au canal Realtime
        await defconRealtimeService.connect(agencyId);

        // S'abonner aux changements
        const unsubscribe = defconRealtimeService.subscribe(subscriptionIdRef.current, {
          onUpdate: (updatedDefcon) => {
            console.log('[useDefcon] DEFCON mis a jour:', updatedDefcon.level);
            if (updatedDefcon.is_active) {
              setCurrentDefcon(updatedDefcon);
            }
          },
          onError: (err) => {
            console.error('[useDefcon] Erreur Realtime:', err);
            setError(err);
            setIsConnected(false);
          },
          onConnected: () => {
            console.log('[useDefcon] Connexion Realtime etablie');
            setIsConnected(true);
          },
        });

        unsubscribeRef.current = unsubscribe;

        // Charger les donnees initiales
        await loadCurrentDefcon();
        await loadHistory();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur de connexion Realtime');
        setError(error);
        setIsConnected(false);
      }
    };

    initRealtime();

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [agencyId, autoConnect, loadCurrentDefcon, loadHistory]);

  return {
    // Etat
    currentDefcon,
    currentLevel,
    config,
    isCritical,
    fineMultiplier,
    history,
    isLoading,
    error,
    isConnected,

    // Actions
    setLevel,
    deactivate,
    calculateFine,
    loadCurrentDefcon,
    loadHistory,

    // Helpers
    getConfig: getDefconConfig,
    allConfigs: DEFCON_CONFIGS,
  };
}
