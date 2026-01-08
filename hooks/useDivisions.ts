'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { divisionsRealtimeService, type Division } from '@/services/divisionsRealtimeService';

export function useDivisions(agencyId?: string) {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`divisions-${Date.now()}`);

    const loadDivisions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await divisionsRealtimeService.getDivisions(agencyId);
            setDivisions(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load divisions'));
        } finally {
            setIsLoading(false);
        }
    }, [agencyId]);

    useEffect(() => {
        const init = async () => {
            await divisionsRealtimeService.connect();
            const unsubscribe = divisionsRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newD: Division) => setDivisions(prev => [newD, ...prev]),
                onUpdate: (updatedD: Division) => setDivisions(prev => prev.map(d => d.id === updatedD.id ? updatedD : d)),
                onDelete: (id: string) => setDivisions(prev => prev.filter(d => d.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadDivisions();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadDivisions]);

    return {
        divisions,
        isLoading,
        error,
        isConnected,
        createDivision: (data: any) => divisionsRealtimeService.createDivision(data),
        updateDivision: (id: string, data: any) => divisionsRealtimeService.updateDivision(id, data),
        deleteDivision: (id: string) => divisionsRealtimeService.deleteDivision(id),
        refresh: loadDivisions,
    };
}
