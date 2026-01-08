import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Division {
    id: string;
    agency_id: string;
    name: string;
    code: string;
    chief_name: string;
    members_count: number;
    department: string;
    status: 'active' | 'inactive' | 'restructuring';
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type DivisionCallback = (d: Division) => void;
type DeleteCallback = (id: string) => void;
type ErrorCallback = (error: Error) => void;

class DivisionsRealtimeService {
    private static instance: DivisionsRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: DivisionCallback;
        onUpdate?: DivisionCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): DivisionsRealtimeService {
        if (!DivisionsRealtimeService.instance) {
            DivisionsRealtimeService.instance = new DivisionsRealtimeService();
        }
        return DivisionsRealtimeService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        if (this.channel) await this.disconnect();

        this.channel = this.supabase
            .channel('divisions-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'divisions' },
                (payload) => {
                    if (payload.eventType === 'INSERT') this.notifySubscribers('onInsert', payload.new as Division);
                    else if (payload.eventType === 'UPDATE') this.notifySubscribers('onUpdate', payload.new as Division);
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

    async getDivisions(agencyId?: string): Promise<Division[]> {
        const { data, error } = await this.supabase
            .from('divisions')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Division[];
    }

    async createDivision(d: Omit<Division, 'id' | 'created_at' | 'updated_at'>): Promise<Division> {
        const { data, error } = await this.supabase
            .from('divisions')
            .insert([d])
            .select()
            .single();
        if (error) throw error;
        return data as Division;
    }

    async updateDivision(id: string, updates: Partial<Division>): Promise<Division> {
        const { data, error } = await this.supabase
            .from('divisions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Division;
    }

    async deleteDivision(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('divisions')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const divisionsRealtimeService = DivisionsRealtimeService.getInstance();
