'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { unitsRealtimeService, type Unit } from '@/services/unitsRealtimeService';

export function useUnits(agencyId?: string) {
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`units-${Date.now()}`);

    const loadUnits = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await unitsRealtimeService.getUnits(agencyId);
            setUnits(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load units'));
        } finally {
            setIsLoading(false);
        }
    }, [agencyId]);

    useEffect(() => {
        const init = async () => {
            await unitsRealtimeService.connect();
            const unsubscribe = unitsRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newU: Unit) => setUnits(prev => [newU, ...prev]),
                onUpdate: (updatedU: Unit) => setUnits(prev => prev.map(u => u.id === updatedU.id ? updatedU : u)),
                onDelete: (id: string) => setUnits(prev => prev.filter(u => u.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadUnits();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadUnits]);

    return {
        units,
        isLoading,
        error,
        isConnected,
        createUnit: (data: any) => unitsRealtimeService.createUnit(data),
        updateUnit: (id: string, data: any) => unitsRealtimeService.updateUnit(id, data),
        deleteUnit: (id: string) => unitsRealtimeService.deleteUnit(id),
        refresh: loadUnits,
    };
}
