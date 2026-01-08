import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Unit {
    id: string;
    agency_id: string;
    name: string;
    callsign: string;
    type: string;
    members_count: number;
    commander_name: string;
    status: 'active' | 'inactive' | 'on_patrol';
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type UnitCallback = (u: Unit) => void;
type DeleteCallback = (id: string) => void;
type ErrorCallback = (error: Error) => void;

class UnitsRealtimeService {
    private static instance: UnitsRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: UnitCallback;
        onUpdate?: UnitCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): UnitsRealtimeService {
        if (!UnitsRealtimeService.instance) {
            UnitsRealtimeService.instance = new UnitsRealtimeService();
        }
        return UnitsRealtimeService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        if (this.channel) await this.disconnect();

        this.channel = this.supabase
            .channel('units-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'units' },
                (payload) => {
                    if (payload.eventType === 'INSERT') this.notifySubscribers('onInsert', payload.new as Unit);
                    else if (payload.eventType === 'UPDATE') this.notifySubscribers('onUpdate', payload.new as Unit);
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

    async getUnits(agencyId?: string): Promise<Unit[]> {
        const { data, error } = await this.supabase
            .from('units')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Unit[];
    }

    async createUnit(u: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
        const { data, error } = await this.supabase
            .from('units')
            .insert([u])
            .select()
            .single();
        if (error) throw error;
        return data as Unit;
    }

    async updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
        const { data, error } = await this.supabase
            .from('units')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Unit;
    }

    async deleteUnit(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('units')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const unitsRealtimeService = UnitsRealtimeService.getInstance();
