/**
 * Service de synchronisation temps réel pour les événements
 * Créé par: Snowzy
 * Architecture: Singleton avec Supabase Realtime
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  category: 'patrouille' | 'formation' | 'réunion' | 'opération' | 'maintenance' | 'tribunal' | 'personnel' | 'autre';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  agency_id: string;
  location?: string;
  participants?: Array<{ id: string; name: string; role: string }>;
  resources?: Array<{ type: string; name: string; quantity: number }>;
  notes?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    end_date?: string;
  };
  color?: string;
  reminder?: {
    enabled: boolean;
    time_before: number; // en minutes
  };
  created_by: string;
  created_at: string;
  updated_at: string;
  all_day: boolean;
}

type EventCallback = (event: CalendarEvent) => void;
type DeleteCallback = (eventId: string) => void;
type ErrorCallback = (error: Error) => void;

class EventsRealtimeService {
  private static instance: EventsRealtimeService;
  private supabase = createClient();
  private channel: RealtimeChannel | null = null;
  private subscribers: Map<string, {
    onInsert?: EventCallback;
    onUpdate?: EventCallback;
    onDelete?: DeleteCallback;
    onError?: ErrorCallback;
  }> = new Map();
  private currentAgencyId: string | null = null;
  private isConnected = false;

  private constructor() {}

  static getInstance(): EventsRealtimeService {
    if (!EventsRealtimeService.instance) {
      EventsRealtimeService.instance = new EventsRealtimeService();
    }
    return EventsRealtimeService.instance;
  }

  /**
   * Se connecter au canal Realtime pour une agence spécifique
   */
  async connect(agencyId: string): Promise<void> {
    if (this.isConnected && this.currentAgencyId === agencyId) {
      console.log(`[EventsRealtime] Déjà connecté à l'agence ${agencyId}`);
      return;
    }

    // Déconnecter l'ancien canal si nécessaire
    if (this.channel) {
      await this.disconnect();
    }

    this.currentAgencyId = agencyId;

    // Créer un nouveau canal avec filtre sur l'agence
    this.channel = this.supabase
      .channel(`events:${agencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          console.log('[EventsRealtime] Nouvel événement:', payload.new);
          this.notifySubscribers('onInsert', payload.new as CalendarEvent);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          console.log('[EventsRealtime] Événement mis à jour:', payload.new);
          this.notifySubscribers('onUpdate', payload.new as CalendarEvent);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'events',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          console.log('[EventsRealtime] Événement supprimé:', payload.old);
          const eventId = (payload.old as CalendarEvent).id;
          this.notifySubscribers('onDelete', eventId);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          console.log(`[EventsRealtime] ✅ Connecté à l'agence ${agencyId}`);
        } else if (status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          console.error('[EventsRealtime] ❌ Erreur de connexion');
          this.notifySubscribers('onError', new Error('Erreur de connexion au canal Realtime'));
        } else if (status === 'TIMED_OUT') {
          this.isConnected = false;
          console.error('[EventsRealtime] ⏱️ Timeout de connexion');
          this.notifySubscribers('onError', new Error('Timeout de connexion'));
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
      console.log('[EventsRealtime] 🔌 Déconnecté');
    }
  }

  /**
   * S'abonner aux changements d'événements
   */
  subscribe(
    id: string,
    callbacks: {
      onInsert?: EventCallback;
      onUpdate?: EventCallback;
      onDelete?: DeleteCallback;
      onError?: ErrorCallback;
    }
  ): () => void {
    this.subscribers.set(id, callbacks);
    console.log(`[EventsRealtime] 📡 Nouvel abonné: ${id}`);

    // Retourner la fonction de désabonnement
    return () => this.unsubscribe(id);
  }

  /**
   * Se désabonner des changements
   */
  unsubscribe(id: string): void {
    this.subscribers.delete(id);
    console.log(`[EventsRealtime] 🔕 Désabonnement: ${id}`);
  }

  /**
   * Notifier tous les abonnés
   */
  private notifySubscribers(event: 'onInsert' | 'onUpdate' | 'onError', data: CalendarEvent | Error): void;
  private notifySubscribers(event: 'onDelete', data: string): void;
  private notifySubscribers(
    event: 'onInsert' | 'onUpdate' | 'onDelete' | 'onError',
    data: CalendarEvent | string | Error
  ): void {
    this.subscribers.forEach((callbacks) => {
      try {
        if (event === 'onInsert' && callbacks.onInsert && data instanceof Object && 'id' in data) {
          callbacks.onInsert(data as CalendarEvent);
        } else if (event === 'onUpdate' && callbacks.onUpdate && data instanceof Object && 'id' in data) {
          callbacks.onUpdate(data as CalendarEvent);
        } else if (event === 'onDelete' && callbacks.onDelete && typeof data === 'string') {
          callbacks.onDelete(data);
        } else if (event === 'onError' && callbacks.onError && data instanceof Error) {
          callbacks.onError(data);
        }
      } catch (error) {
        console.error('[EventsRealtime] Erreur lors de la notification:', error);
      }
    });
  }

  /**
   * Récupérer tous les événements d'une agence
   */
  async getEvents(agencyId: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('agency_id', agencyId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    } catch (error) {
      console.error('[EventsRealtime] Erreur lors de la récupération des événements:', error);
      throw error;
    }
  }

  /**
   * Récupérer les événements d'une période spécifique
   */
  async getEventsByDateRange(
    agencyId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('agency_id', agencyId)
        .gte('start_date', startDate)
        .lte('end_date', endDate)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    } catch (error) {
      console.error('[EventsRealtime] Erreur lors de la récupération des événements:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel événement
   */
  async createEvent(event: Omit<CalendarEvent, 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    } catch (error) {
      console.error('[EventsRealtime] Erreur lors de la création de l\'événement:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un événement
   */
  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    } catch (error) {
      console.error('[EventsRealtime] Erreur lors de la mise à jour de l\'événement:', error);
      throw error;
    }
  }

  /**
   * Supprimer un événement
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('[EventsRealtime] Erreur lors de la suppression de l\'événement:', error);
      throw error;
    }
  }

  /**
   * Générer un ID unique pour un événement
   */
  generateEventId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EVE-${year}-${random}`;
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
export const eventsRealtimeService = EventsRealtimeService.getInstance();
