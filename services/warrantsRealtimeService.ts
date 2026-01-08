/**
 * Service de synchronisation temps réel pour les mandats
 * Créé par: Snowzy
 * Architecture: Singleton avec Supabase Realtime
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Warrant {
    id: string;
    agency_id?: string;
    citizen_id?: string;
    number: string;
    suspect_name: string;
    reason: string;
    status: 'active' | 'executed' | 'cancelled' | 'expired';
    issued_at: string;
    expires_at?: string;
    agent_id?: string;
    issued_by_name: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type WarrantCallback = (warrant: Warrant) => void;
type DeleteCallback = (warrantId: string) => void;
type ErrorCallback = (error: Error) => void;

class WarrantsRealtimeService {
    private static instance: WarrantsRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: WarrantCallback;
        onUpdate?: WarrantCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): WarrantsRealtimeService {
        if (!WarrantsRealtimeService.instance) {
            WarrantsRealtimeService.instance = new WarrantsRealtimeService();
        }
        return WarrantsRealtimeService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        if (this.channel) await this.disconnect();

        this.channel = this.supabase
            .channel('warrants-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'warrants' },
                (payload) => {
                    if (payload.eventType === 'INSERT') this.notifySubscribers('onInsert', payload.new as Warrant);
                    else if (payload.eventType === 'UPDATE') this.notifySubscribers('onUpdate', payload.new as Warrant);
                    else if (payload.eventType === 'DELETE') this.notifySubscribers('onDelete', (payload.old as { id: string }).id);
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    this.isConnected = true;
                    this.subscribers.forEach(cb => cb.onConnected?.());
                } else if (err) {
                    this.notifySubscribers('onError', err);
                }
            });
    }

    async disconnect(): Promise<void> {
        if (this.channel) {
            await this.supabase.removeChannel(this.channel);
            this.channel = null;
            this.isConnected = false;
        }
    }

    subscribe(id: string, callbacks: any): () => void {
        this.subscribers.set(id, callbacks);
        if (this.isConnected) callbacks.onConnected?.();
        return () => this.subscribers.delete(id);
    }

    private notifySubscribers(event: string, data: any): void {
        this.subscribers.forEach((callbacks: any) => {
            if (callbacks[event]) callbacks[event](data);
        });
    }

    async getWarrants(agencyId?: string): Promise<Warrant[]> {
        let query = this.supabase
            .from('warrants')
            .select('*')
            .order('issued_at', { ascending: false });

        if (agencyId) {
            // Note: Mapping agencyId to the UUID if needed, but for now we fetch all
            // If agencyId is 'sasp', we might need to resolve it to its UUID first
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Warrant[];
    }

    async createWarrant(warrant: Omit<Warrant, 'id' | 'created_at' | 'updated_at'>): Promise<Warrant> {
        const { data, error } = await this.supabase
            .from('warrants')
            .insert([warrant])
            .select()
            .single();
        if (error) throw error;
        return data as Warrant;
    }

    async updateWarrant(id: string, updates: Partial<Warrant>): Promise<Warrant> {
        const { data, error } = await this.supabase
            .from('warrants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Warrant;
    }

    async deleteWarrant(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('warrants')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const warrantsRealtimeService = WarrantsRealtimeService.getInstance();
