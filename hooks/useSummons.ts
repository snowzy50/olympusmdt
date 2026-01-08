'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { summonsRealtimeService, type Summons } from '@/services/summonsRealtimeService';

export function useSummons(agencyId?: string) {
    const [summons, setSummons] = useState<Summons[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`summons-${Date.now()}`);

    const loadSummons = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await summonsRealtimeService.getSummons(agencyId);
            setSummons(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load summons'));
        } finally {
            setIsLoading(false);
        }
    }, [agencyId]);

    useEffect(() => {
        const init = async () => {
            await summonsRealtimeService.connect();
            const unsubscribe = summonsRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newS: Summons) => setSummons(prev => [newS, ...prev]),
                onUpdate: (updatedS: Summons) => setSummons(prev => prev.map(s => s.id === updatedS.id ? updatedS : s)),
                onDelete: (id: string) => setSummons(prev => prev.filter(s => s.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadSummons();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadSummons]);

    return {
        summons,
        isLoading,
        error,
        isConnected,
        createSummons: (data: any) => summonsRealtimeService.createSummons(data),
        updateSummons: (id: string, data: any) => summonsRealtimeService.updateSummons(id, data),
        deleteSummons: (id: string) => summonsRealtimeService.deleteSummons(id),
        refresh: loadSummons,
    };
}
