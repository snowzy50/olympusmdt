/**
 * Service de synchronisation temps réel pour les véhicules
 * Créé par: Snowzy
 * Architecture: Singleton avec Supabase Realtime
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Vehicle {
    id: string;
    plate: string;
    owner_id?: string;
    model: string;
    brand?: string;
    color?: string;
    type: string;
    status: 'in_service' | 'maintenance' | 'out_of_service' | 'stolen' | 'seized' | 'clean';
    mileage?: number;
    assigned_to?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

type VehicleCallback = (vehicle: Vehicle) => void;
type DeleteCallback = (vehicleId: string) => void;
type ErrorCallback = (error: Error) => void;

class VehiclesRealtimeService {
    private static instance: VehiclesRealtimeService;
    private supabase = supabaseClient;
    private channel: RealtimeChannel | null = null;
    private subscribers: Map<string, {
        onInsert?: VehicleCallback;
        onUpdate?: VehicleCallback;
        onDelete?: DeleteCallback;
        onError?: ErrorCallback;
        onConnected?: () => void;
    }> = new Map();
    private isConnected = false;

    private constructor() { }

    static getInstance(): VehiclesRealtimeService {
        if (!VehiclesRealtimeService.instance) {
            VehiclesRealtimeService.instance = new VehiclesRealtimeService();
        }
        return VehiclesRealtimeService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;
        if (this.channel) await this.disconnect();

        this.channel = this.supabase
            .channel('vehicles-all')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'vehicles' },
                (payload) => {
                    if (payload.eventType === 'INSERT') this.notifySubscribers('onInsert', payload.new as Vehicle);
                    else if (payload.eventType === 'UPDATE') this.notifySubscribers('onUpdate', payload.new as Vehicle);
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

    async getVehicles(): Promise<Vehicle[]> {
        const { data, error } = await this.supabase
            .from('vehicles')
            .select('*')
            .order('plate', { ascending: true });
        if (error) throw error;
        return data as Vehicle[];
    }

    async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
        const { data, error } = await this.supabase
            .from('vehicles')
            .insert([vehicle])
            .select()
            .single();
        if (error) throw error;
        return data as Vehicle;
    }

    async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
        const { data, error } = await this.supabase
            .from('vehicles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Vehicle;
    }

    async deleteVehicle(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('vehicles')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
}

export const vehiclesRealtimeService = VehiclesRealtimeService.getInstance();
