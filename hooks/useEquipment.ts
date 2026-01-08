'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { equipmentRealtimeService, type Equipment } from '@/services/equipmentRealtimeService';

export function useEquipment(agencyId?: string) {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`equipment-${Date.now()}`);

    const loadEquipment = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await equipmentRealtimeService.getEquipment(agencyId);
            setEquipment(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load equipment'));
        } finally {
            setIsLoading(false);
        }
    }, [agencyId]);

    useEffect(() => {
        const init = async () => {
            await equipmentRealtimeService.connect();
            const unsubscribe = equipmentRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newItem: Equipment) => setEquipment(prev => [newItem, ...prev]),
                onUpdate: (updatedItem: Equipment) => setEquipment(prev => prev.map(e => e.id === updatedItem.id ? updatedItem : e)),
                onDelete: (id: string) => setEquipment(prev => prev.filter(e => e.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadEquipment();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadEquipment]);

    return {
        equipment,
        isLoading,
        error,
        isConnected,
        createEquipment: (data: any) => equipmentRealtimeService.createEquipment(data),
        updateEquipment: (id: string, data: any) => equipmentRealtimeService.updateEquipment(id, data),
        deleteEquipment: (id: string) => equipmentRealtimeService.deleteEquipment(id),
        refresh: loadEquipment,
    };
}
