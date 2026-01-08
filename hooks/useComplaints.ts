'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { complaintsRealtimeService, type Complaint } from '@/services/complaintsRealtimeService';

export function useComplaints(agencyId?: string) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscriptionIdRef = useRef<string>(`complaints-${Date.now()}`);

    const loadComplaints = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await complaintsRealtimeService.getComplaints(agencyId);
            setComplaints(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load complaints'));
        } finally {
            setIsLoading(false);
        }
    }, [agencyId]);

    useEffect(() => {
        const init = async () => {
            await complaintsRealtimeService.connect();
            const unsubscribe = complaintsRealtimeService.subscribe(subscriptionIdRef.current, {
                onInsert: (newC: Complaint) => setComplaints(prev => [newC, ...prev]),
                onUpdate: (updatedC: Complaint) => setComplaints(prev => prev.map(c => c.id === updatedC.id ? updatedC : c)),
                onDelete: (id: string) => setComplaints(prev => prev.filter(c => c.id !== id)),
                onConnected: () => setIsConnected(true),
                onError: (err: Error) => setError(err),
            });

            await loadComplaints();
            return () => unsubscribe();
        };

        const cleanup = init();
        return () => {
            cleanup.then(unsub => unsub?.());
        };
    }, [loadComplaints]);

    return {
        complaints,
        isLoading,
        error,
        isConnected,
        createComplaint: (data: any) => complaintsRealtimeService.createComplaint(data),
        updateComplaint: (id: string, data: any) => complaintsRealtimeService.updateComplaint(id, data),
        deleteComplaint: (id: string) => complaintsRealtimeService.deleteComplaint(id),
        refresh: loadComplaints,
    };
}
