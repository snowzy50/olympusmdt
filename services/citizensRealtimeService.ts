/**
 * Service de synchronisation temps réel pour les citoyens
 * Créé par: Snowzy
 * Architecture: Singleton avec Supabase Realtime
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Citizen {
    id: string;
    first_name: string;
    last_name: string;
    birth_date?: string;
    gender?: string;
    phone?: string;
    address?: string;
    job?: string;
    license_number?: string;
    image_url?: string;
    status: 'clean' | 'flagged' | 'wanted';
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type CitizenCallback = (citizen: Citizen) => void;
type DeleteCallback = (citizenId: string) => void;
type ErrorCallback = (error: Error) => void;

class CitizensRealtimeService {
    private static instance: CitizensRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: CitizenCallback;
        onUpdate?: CitizenCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): CitizensRealtimeService {
        if (!CitizensRealtimeService.instance) {
            CitizensRealtimeService.instance = new CitizensRealtimeService();
        }
        return CitizensRealtimeService.instance;
    }

    /**
     * Se connecter au canal Realtime
     */
    async connect(): Promise<void> {
        if (this.isConnected) return;

        if (this.channel) {
            await this.disconnect();
        }

        this.channel = this.supabase
            .channel('citizens-all')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'citizens',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        this.notifySubscribers('onInsert', payload.new as Citizen);
                    } else if (payload.eventType === 'UPDATE') {
                        this.notifySubscribers('onUpdate', payload.new as Citizen);
                    } else if (payload.eventType === 'DELETE') {
                        this.notifySubscribers('onDelete', (payload.old as { id: string }).id);
                    }
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

    async getCitizens(): Promise<Citizen[]> {
        const { data, error } = await this.supabase
            .from('citizens')
            .select('*')
            .order('last_name', { ascending: true });
        if (error) throw error;
        return data as Citizen[];
    }

    async createCitizen(citizen: Omit<Citizen, 'id' | 'created_at' | 'updated_at'>): Promise<Citizen> {
        const { data, error } = await this.supabase
            .from('citizens')
            .insert([citizen])
            .select()
            .single();
        if (error) throw error;
        return data as Citizen;
    }

    async updateCitizen(id: string, updates: Partial<Citizen>): Promise<Citizen> {
        const { data, error } = await this.supabase
            .from('citizens')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Citizen;
    }

    async deleteCitizen(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('citizens')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const citizensRealtimeService = CitizensRealtimeService.getInstance();
