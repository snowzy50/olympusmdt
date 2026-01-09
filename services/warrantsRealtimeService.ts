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
    number?: string;
    warrant_number?: string;
    suspect_name: string;
    reason: string;
    status: 'active' | 'executed' | 'cancelled' | 'expired';
    issued_at: string;
    issued_date?: string;
    expires_at?: string;
    expiry_date?: string;
    agent_id?: string;
    issued_by_name?: string;
    issued_by_id?: string;
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
        console.log('[WarrantsRealtime] Création mandat avec données brutes:', JSON.stringify(warrant, null, 2));

        // Mapper les champs pour correspondre au schéma de la base de données
        // Le schéma utilise: number, issued_at, expires_at, issued_by_name
        const dbWarrant: Record<string, any> = {
            suspect_name: warrant.suspect_name,
            reason: warrant.reason,
            status: warrant.status || 'active',
            notes: warrant.notes || null,
            agency_id: warrant.agency_id || null,
        };

        // Gérer le numéro de mandat (la colonne s'appelle warrant_number)
        if (warrant.number) {
            dbWarrant.warrant_number = warrant.number;
        } else if (warrant.warrant_number) {
            dbWarrant.warrant_number = warrant.warrant_number;
        } else {
            // Générer un numéro automatique
            dbWarrant.warrant_number = `MA-${Date.now()}`;
        }

        // Gérer issued_by_name (requis)
        dbWarrant.issued_by_name = warrant.issued_by_name || 'Inconnu';

        // Gérer les dates (la colonne s'appelle issued_date)
        if (warrant.issued_at) {
            dbWarrant.issued_date = warrant.issued_at;
        } else if (warrant.issued_date) {
            dbWarrant.issued_date = warrant.issued_date;
        } else {
            dbWarrant.issued_date = new Date().toISOString();
        }

        // Gérer expiry (la colonne s'appelle expiry_date)
        if (warrant.expires_at) {
            dbWarrant.expiry_date = warrant.expires_at;
        } else if (warrant.expiry_date) {
            dbWarrant.expiry_date = warrant.expiry_date;
        }

        console.log('[WarrantsRealtime] Données mappées pour DB:', JSON.stringify(dbWarrant, null, 2));

        const { data, error } = await this.supabase
            .from('warrants')
            .insert([dbWarrant])
            .select()
            .single();

        if (error) {
            console.error('[WarrantsRealtime] Erreur Supabase:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw new Error(`${error.message}${error.hint ? ` (${error.hint})` : ''}`);
        }

        console.log('[WarrantsRealtime] ✅ Mandat créé:', data);
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
