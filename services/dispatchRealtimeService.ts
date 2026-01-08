/**
 * Service de synchronisation temps réel pour les appels dispatch
 * Créé par: Snowzy
 * Architecture: Singleton avec Supabase Realtime
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DispatchCall {
  id: string;
  agency_id: string;
  title: string;
  description?: string;
  call_type: 'robbery' | 'medical' | 'traffic' | 'assault' | 'fire' | 'pursuit' | 'suspicious' | 'backup' | 'other';
  priority: 'code1' | 'code2' | 'code3';
  status: 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'resolved' | 'cancelled';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image_url?: string;
  assigned_units?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

type CallCallback = (call: DispatchCall) => void;
type DeleteCallback = (callId: string) => void;
type ErrorCallback = (error: Error) => void;

class DispatchRealtimeService {
  private static instance: DispatchRealtimeService;
  private supabase = supabaseClient;
  private channel: RealtimeChannel | null = null;
  private subscribers: Map<string, {
    onInsert?: CallCallback;
    onUpdate?: CallCallback;
    onDelete?: DeleteCallback;
    onError?: ErrorCallback;
    onConnected?: () => void;
  }> = new Map();
  private currentAgencyId: string | null = null;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DispatchRealtimeService {
    if (!DispatchRealtimeService.instance) {
      DispatchRealtimeService.instance = new DispatchRealtimeService();
    }
    return DispatchRealtimeService.instance;
  }

  /**
   * Se connecter au canal Realtime pour une agence spécifique
   */
  async connect(agencyId: string): Promise<void> {
    if (this.isConnected && this.currentAgencyId === agencyId) {
      console.log(`[DispatchRealtime] Déjà connecté à l'agence ${agencyId}`);
      return;
    }

    // Déconnecter l'ancien canal si nécessaire
    if (this.channel) {
      await this.disconnect();
    }

    this.currentAgencyId = agencyId;

    // Créer un nouveau canal
    this.channel = this.supabase
      .channel('dispatch-calls-all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispatch_calls',
        },
        (payload) => {
          const call = payload.new as DispatchCall;
          if (call.agency_id === agencyId) {
            console.log('[DispatchRealtime] Nouvel appel:', call);
            this.notifySubscribers('onInsert', call);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dispatch_calls',
        },
        (payload) => {
          const call = payload.new as DispatchCall;
          if (call.agency_id === agencyId) {
            console.log('[DispatchRealtime] Appel mis à jour:', call);
            this.notifySubscribers('onUpdate', call);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'dispatch_calls',
        },
        (payload) => {
          const call = payload.old as DispatchCall;
          if (call.agency_id === agencyId) {
            console.log('[DispatchRealtime] Appel supprimé:', call.id);
            this.notifySubscribers('onDelete', call.id);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[DispatchRealtime] 📡 Status: ${status}`, err);

        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          console.log(`[DispatchRealtime] ✅ Connecté à l'agence ${agencyId}`);
          this.subscribers.forEach((callbacks) => {
            if (callbacks.onConnected) {
              callbacks.onConnected();
            }
          });
        } else if (status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          console.error('[DispatchRealtime] ❌ Erreur de connexion:', err);
          this.notifySubscribers('onError', new Error('Erreur de connexion au canal Realtime'));
        } else if (status === 'TIMED_OUT') {
          this.isConnected = false;
          console.error('[DispatchRealtime] ⏱️ Timeout de connexion');
          this.notifySubscribers('onError', new Error('Timeout de connexion'));
        } else if (status === 'CLOSED') {
          this.isConnected = false;
          console.log('[DispatchRealtime] 🔌 Déconnecté');
        }
      });
  }

  /**
   * Se déconnecter du canal Realtime
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
      this.currentAgencyId = null;
      console.log('[DispatchRealtime] 🔌 Déconnecté');
    }
  }

  /**
   * S'abonner aux changements
   */
  subscribe(
    id: string,
    callbacks: {
      onInsert?: CallCallback;
      onUpdate?: CallCallback;
      onDelete?: DeleteCallback;
      onError?: ErrorCallback;
      onConnected?: () => void;
    }
  ): () => void {
    this.subscribers.set(id, callbacks);
    console.log(`[DispatchRealtime] 📡 Nouvel abonné: ${id}`);

    if (this.isConnected && callbacks.onConnected) {
      console.log(`[DispatchRealtime] ✅ Notification connexion existante pour: ${id}`);
      callbacks.onConnected();
    }

    return () => this.unsubscribe(id);
  }

  /**
   * Se désabonner
   */
  unsubscribe(id: string): void {
    this.subscribers.delete(id);
    console.log(`[DispatchRealtime] 🔕 Désabonnement: ${id}`);
  }

  /**
   * Notifier tous les abonnés
   */
  private notifySubscribers(event: 'onInsert' | 'onUpdate' | 'onError', data: DispatchCall | Error): void;
  private notifySubscribers(event: 'onDelete', data: string): void;
  private notifySubscribers(
    event: 'onInsert' | 'onUpdate' | 'onDelete' | 'onError',
    data: DispatchCall | string | Error
  ): void {
    console.log(`[DispatchRealtime] 🔔 Notification ${event} vers ${this.subscribers.size} abonné(s)`);

    this.subscribers.forEach((callbacks, subscriberId) => {
      try {
        if (event === 'onInsert' && callbacks.onInsert && data instanceof Object && 'id' in data) {
          callbacks.onInsert(data as DispatchCall);
        } else if (event === 'onUpdate' && callbacks.onUpdate && data instanceof Object && 'id' in data) {
          callbacks.onUpdate(data as DispatchCall);
        } else if (event === 'onDelete' && callbacks.onDelete && typeof data === 'string') {
          callbacks.onDelete(data);
        } else if (event === 'onError' && callbacks.onError && data instanceof Error) {
          callbacks.onError(data);
        }
      } catch (error) {
        console.error('[DispatchRealtime] Erreur lors de la notification:', error);
      }
    });
  }

  /**
   * Récupérer tous les appels d'une agence
   */
  async getCalls(agencyId: string): Promise<DispatchCall[]> {
    try {
      const { data, error } = await this.supabase
        .from('dispatch_calls')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DispatchCall[];
    } catch (error) {
      console.error('[DispatchRealtime] Erreur lors de la récupération des appels:', error);
      throw error;
    }
  }

  /**
   * Récupérer les appels actifs (non résolus)
   */
  async getActiveCalls(agencyId: string): Promise<DispatchCall[]> {
    try {
      const { data, error } = await this.supabase
        .from('dispatch_calls')
        .select('*')
        .eq('agency_id', agencyId)
        .neq('status', 'resolved')
        .neq('status', 'cancelled')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DispatchCall[];
    } catch (error) {
      console.error('[DispatchRealtime] Erreur lors de la récupération des appels actifs:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel appel
   */
  async createCall(call: Omit<DispatchCall, 'created_at' | 'updated_at'>): Promise<DispatchCall> {
    try {
      console.log('[DispatchRealtime] Création appel avec données:', JSON.stringify(call, null, 2));

      const { data, error } = await this.supabase
        .from('dispatch_calls')
        .insert([call])
        .select()
        .single();

      if (error) {
        console.error('[DispatchRealtime] Erreur Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`${error.message}${error.hint ? ` (${error.hint})` : ''}`);
      }

      console.log('[DispatchRealtime] ✅ Appel créé:', data);
      return data as DispatchCall;
    } catch (error: any) {
      console.error('[DispatchRealtime] Erreur lors de la création de l\'appel:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un appel
   */
  async updateCall(id: string, updates: Partial<DispatchCall>): Promise<DispatchCall> {
    try {
      const { data, error } = await this.supabase
        .from('dispatch_calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DispatchCall;
    } catch (error) {
      console.error('[DispatchRealtime] Erreur lors de la mise à jour de l\'appel:', error);
      throw error;
    }
  }

  /**
   * Supprimer un appel
   */
  async deleteCall(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('dispatch_calls')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('[DispatchRealtime] Erreur lors de la suppression de l\'appel:', error);
      throw error;
    }
  }

  /**
   * Générer un ID unique pour un appel
   */
  generateCallId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DIS-${year}-${random}`;
  }

  /**
   * Obtenir le statut de connexion
   */
  getConnectionStatus(): { isConnected: boolean; agencyId: string | null } {
    return {
      isConnected: this.isConnected,
      agencyId: this.currentAgencyId,
    };
  }
}

// Export du singleton
export const dispatchRealtimeService = DispatchRealtimeService.getInstance();
