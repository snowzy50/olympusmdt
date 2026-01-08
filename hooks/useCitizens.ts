/**
 * Hook React pour la gestion des citoyens avec Realtime
 * Créé par: Snowzy
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { citizensRealtimeService, type Citizen } from '@/services/citizensRealtimeService';

export function useCitizens() {
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`citizens-${Date.now()}`);

    const loadCitizens = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await citizensRealtimeService.getCitizens();
            setCitizens(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load citizens'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await citizensRealtimeService.connect();
            const unsubscribe = citizensRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newCitizen: Citizen) => setCitizens(prev => [...prev, newCitizen]),
                onUpdate: (updatedCitizen: Citizen) => setCitizens(prev => prev.map(c => c.id === updatedCitizen.id ? updatedCitizen : c)),
                onDelete: (id: string) => setCitizens(prev => prev.filter(c => c.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadCitizens();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadCitizens]);

    return {
        citizens,
        isLoading,
        error,
        isConnected,
        createCitizen: (data: any) => citizensRealtimeService.createCitizen(data),
        updateCitizen: (id: string, data: any) => citizensRealtimeService.updateCitizen(id, data),
        deleteCitizen: (id: string) => citizensRealtimeService.deleteCitizen(id),
        refresh: loadCitizens,
    };
}
