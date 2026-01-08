import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Summons {
    id: string;
    agency_id: string;
    number: string;
    person_name: string;
    reason: string;
    scheduled_at: string;
    location: string;
    status: 'pending' | 'honored' | 'not_honored' | 'cancelled';
    issued_by_name: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type SummonsCallback = (s: Summons) => void;
type DeleteCallback = (id: string) => void;
type ErrorCallback = (error: Error) => void;

class SummonsRealtimeService {
    private static instance: SummonsRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: SummonsCallback;
        onUpdate?: SummonsCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): SummonsRealtimeService {
        if (!SummonsRealtimeService.instance) {
            SummonsRealtimeService.instance = new SummonsRealtimeService();
        }
        return SummonsRealtimeService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        if (this.channel) await this.disconnect();

        this.channel = this.supabase
            .channel('summons-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'summons' },
                (payload) => {
                    if (payload.eventType === 'INSERT') this.notifySubscribers('onInsert', payload.new as Summons);
                    else if (payload.eventType === 'UPDATE') this.notifySubscribers('onUpdate', payload.new as Summons);
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

    async getSummons(agencyId?: string): Promise<Summons[]> {
        const { data, error } = await this.supabase
            .from('summons')
            .select('*')
            .order('scheduled_at', { ascending: false });

        if (error) throw error;
        return data as Summons[];
    }

    async createSummons(s: Omit<Summons, 'id' | 'created_at' | 'updated_at'>): Promise<Summons> {
        const { data, error } = await this.supabase
            .from('summons')
            .insert([s])
            .select()
            .single();
        if (error) throw error;
        return data as Summons;
    }

    async updateSummons(id: string, updates: Partial<Summons>): Promise<Summons> {
        const { data, error } = await this.supabase
            .from('summons')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Summons;
    }

    async deleteSummons(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('summons')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const summonsRealtimeService = SummonsRealtimeService.getInstance();
