/**
 * Hook React pour la gestion des appels dispatch avec Realtime
 * Créé par: Snowzy
 * Synchronisation en temps réel avec Supabase
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { dispatchRealtimeService, type DispatchCall } from '@/services/dispatchRealtimeService';

interface UseDispatchCallsOptions {
  autoConnect?: boolean;
  agencyId?: string;
  userId?: string;
}

/**
 * Extrait l'ID de l'agence depuis le pathname
 */
function getAgencyFromPath(pathname: string): string | null {
  const match = pathname.match(/\/dashboard\/([^/]+)/);
  return match ? match[1] : null;
}

export function useDispatchCalls(options: UseDispatchCallsOptions = {}) {
  const { autoConnect = true, agencyId: agencyIdOverride, userId } = options;
  const pathname = usePathname();
  const agencyId = agencyIdOverride || getAgencyFromPath(pathname);

  const [calls, setCalls] = useState<DispatchCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionIdRef = useRef<string>(`dispatch-calls-${Date.now()}`);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Charger les appels depuis Supabase
   */
  const loadCalls = useCallback(async () => {
    if (!agencyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedCalls = await dispatchRealtimeService.getCalls(agencyId);
      setCalls(fetchedCalls);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des appels');
      setError(error);
      console.error('[useDispatchCalls] Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, [agencyId]);

  /**
   * Créer un nouvel appel
   */
  const createCall = useCallback(
    async (callData: Omit<DispatchCall, 'id' | 'created_at' | 'updated_at' | 'agency_id' | 'created_by'>) => {
      if (!agencyId) {
        throw new Error('Aucune agence sélectionnée');
      }

      try {
        const newCall = await dispatchRealtimeService.createCall({
          ...callData,
          id: dispatchRealtimeService.generateCallId(),
          agency_id: agencyId,
          created_by: userId || `anonymous-${Date.now()}`,
        });

        return newCall;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de la création de l\'appel');
        setError(error);
        throw error;
      }
    },
    [agencyId, userId]
  );

  /**
   * Mettre à jour un appel
   */
  const updateCall = useCallback(async (id: string, updates: Partial<DispatchCall>) => {
    try {
      const updatedCall = await dispatchRealtimeService.updateCall(id, updates);
      return updatedCall;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour de l\'appel');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Supprimer un appel
   */
  const deleteCall = useCallback(async (id: string) => {
    try {
      await dispatchRealtimeService.deleteCall(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de l\'appel');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Obtenir les appels actifs (non résolus)
   */
  const getActiveCalls = useCallback(() => {
    return calls.filter(
      (call) => !['resolved', 'cancelled'].includes(call.status)
    );
  }, [calls]);

  /**
   * Obtenir les statistiques
   */
  const getStats = useCallback(() => {
    const total = calls.length;
    const active = calls.filter((c) => ['dispatched', 'en_route', 'on_scene'].includes(c.status)).length;
    const pending = calls.filter((c) => c.status === 'pending').length;
    const byPriority = {
      code1: calls.filter((c) => c.priority === 'code1').length,
      code2: calls.filter((c) => c.priority === 'code2').length,
      code3: calls.filter((c) => c.priority === 'code3').length,
    };
    const byType = calls.reduce((acc, call) => {
      acc[call.call_type] = (acc[call.call_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, pending, byPriority, byType };
  }, [calls]);

  /**
   * Effet pour initialiser la connexion Realtime
   */
  useEffect(() => {
    if (!agencyId || !autoConnect) return;

    const initRealtime = async () => {
      try {
        // Se connecter au canal Realtime
        await dispatchRealtimeService.connect(agencyId);

        // S'abonner aux changements
        const unsubscribe = dispatchRealtimeService.subscribe(subscriptionIdRef.current, {
          onInsert: (newCall) => {
            console.log('[useDispatchCalls] Nouvel appel reçu:', newCall);
            setCalls((prev) => {
              // Éviter les doublons
              if (prev.some((c) => c.id === newCall.id)) {
                return prev;
              }
              return [newCall, ...prev];
            });
          },
          onUpdate: (updatedCall) => {
            console.log('[useDispatchCalls] Appel mis à jour:', updatedCall);
            setCalls((prev) =>
              prev.map((call) => (call.id === updatedCall.id ? updatedCall : call))
            );
          },
          onDelete: (callId) => {
            console.log('[useDispatchCalls] Appel supprimé:', callId);
            setCalls((prev) => prev.filter((call) => call.id !== callId));
          },
          onError: (err) => {
            console.error('[useDispatchCalls] Erreur Realtime:', err);
            setError(err);
            setIsConnected(false);
          },
          onConnected: () => {
            console.log('[useDispatchCalls] ✅ Connexion Realtime établie');
            setIsConnected(true);
          },
        });

        unsubscribeRef.current = unsubscribe;

        // Charger les appels initiaux
        await loadCalls();
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
  }, [agencyId, autoConnect, loadCalls]);

  return {
    // État
    calls,
    isLoading,
    error,
    isConnected,

    // Actions CRUD
    createCall,
    updateCall,
    deleteCall,
    loadCalls,

    // Helpers
    getActiveCalls,
    getStats,
  };
}
