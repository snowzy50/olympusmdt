/**
 * Hook React pour la gestion des mandats avec Realtime
 * Créé par: Snowzy
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { warrantsRealtimeService, type Warrant } from '@/services/warrantsRealtimeService';

export function useWarrants(agencyId?: string) {
    const [warrants, setWarrants] = useState<Warrant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`warrants-${Date.now()}`);

    const loadWarrants = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await warrantsRealtimeService.getWarrants(agencyId);
            setWarrants(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load warrants'));
        } finally {
            setIsLoading(false);
        }
    }, [agencyId]);

    useEffect(() => {
        const init = async () => {
            await warrantsRealtimeService.connect();
            const unsubscribe = warrantsRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newWarrant: Warrant) => {
                    // Simplistic filtering for now
                    setWarrants(prev => [newWarrant, ...prev]);
                },
                onUpdate: (updatedWarrant: Warrant) => setWarrants(prev => prev.map(w => w.id === updatedWarrant.id ? updatedWarrant : w)),
                onDelete: (id: string) => setWarrants(prev => prev.filter(w => w.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadWarrants();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadWarrants]);

    return {
        warrants,
        isLoading,
        error,
        isConnected,
        createWarrant: (data: any) => warrantsRealtimeService.createWarrant(data),
        updateWarrant: (id: string, data: any) => warrantsRealtimeService.updateWarrant(id, data),
        deleteWarrant: (id: string) => warrantsRealtimeService.deleteWarrant(id),
        refresh: loadWarrants,
    };
}
