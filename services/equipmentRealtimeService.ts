import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Equipment {
    id: string;
    agency_id: string;
    name: string;
    type: string;
    serial_number: string;
    status: 'available' | 'in_use' | 'out_of_service' | 'maintenance';
    assigned_to?: string;
    acquisition_date: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type EquipmentCallback = (item: Equipment) => void;
type DeleteCallback = (id: string) => void;
type ErrorCallback = (error: Error) => void;

class EquipmentRealtimeService {
    private static instance: EquipmentRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: EquipmentCallback;
        onUpdate?: EquipmentCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): EquipmentRealtimeService {
        if (!EquipmentRealtimeService.instance) {
            EquipmentRealtimeService.instance = new EquipmentRealtimeService();
        }
        return EquipmentRealtimeService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        if (this.channel) await this.disconnect();

        this.channel = this.supabase
            .channel('equipment-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'equipment' },
                (payload) => {
                    if (payload.eventType === 'INSERT') this.notifySubscribers('onInsert', payload.new as Equipment);
                    else if (payload.eventType === 'UPDATE') this.notifySubscribers('onUpdate', payload.new as Equipment);
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

    async getEquipment(agencyId?: string): Promise<Equipment[]> {
        let query = this.supabase
            .from('equipment')
            .select('*')
            .order('name', { ascending: true });

        if (agencyId) {
            // filtering handled client-side or via RLS
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Equipment[];
    }

    async createEquipment(item: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Promise<Equipment> {
        const { data, error } = await this.supabase
            .from('equipment')
            .insert([item])
            .select()
            .single();
        if (error) throw error;
        return data as Equipment;
    }

    async updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
        const { data, error } = await this.supabase
            .from('equipment')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Equipment;
    }

    async deleteEquipment(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('equipment')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const equipmentRealtimeService = EquipmentRealtimeService.getInstance();
