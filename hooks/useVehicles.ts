/**
 * Hook React pour la gestion des véhicules avec Realtime
 * Créé par: Snowzy
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { vehiclesRealtimeService, type Vehicle } from '@/services/vehiclesRealtimeService';

export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`vehicles-${Date.now()}`);

    const loadVehicles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await vehiclesRealtimeService.getVehicles();
            setVehicles(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load vehicles'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await vehiclesRealtimeService.connect();
            const unsubscribe = vehiclesRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newVehicle: Vehicle) => setVehicles(prev => [...prev, newVehicle]),
                onUpdate: (updatedVehicle: Vehicle) => setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)),
                onDelete: (id: string) => setVehicles(prev => prev.filter(v => v.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadVehicles();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadVehicles]);

    return {
        vehicles,
        isLoading,
        error,
        isConnected,
        createVehicle: (data: any) => vehiclesRealtimeService.createVehicle(data),
        updateVehicle: (id: string, data: any) => vehiclesRealtimeService.updateVehicle(id, data),
        deleteVehicle: (id: string) => vehiclesRealtimeService.deleteVehicle(id),
        refresh: loadVehicles,
    };
}
