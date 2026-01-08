/**
 * Service de synchronisation temps reel pour le systeme DEFCON
 * Cree par: Snowzy
 * Architecture: Singleton avec Supabase Realtime
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { DefconLevel, DefconStatus, DefconStatusInsert } from '@/types/defcon';
import { DEFCON_CONFIGS, getDefconConfig } from '@/types/defcon';

type DefconCallback = (status: DefconStatus) => void;
type ErrorCallback = (error: Error) => void;

class DefconRealtimeService {
  private static instance: DefconRealtimeService;
  private supabase = supabaseClient;
  private channel: RealtimeChannel | null = null;
  private subscribers: Map<string, {
    onUpdate?: DefconCallback;
    onError?: ErrorCallback;
    onConnected?: () => void;
  }> = new Map();
  private currentAgencyId: string | null = null;
  private isConnected = false;
  private currentDefcon: DefconStatus | null = null;

  private constructor() {}

  static getInstance(): DefconRealtimeService {
    if (!DefconRealtimeService.instance) {
      DefconRealtimeService.instance = new DefconRealtimeService();
    }
    return DefconRealtimeService.instance;
  }

  /**
   * Se connecter au canal Realtime pour une agence specifique
   */
  async connect(agencyId: string): Promise<void> {
    if (this.isConnected && this.currentAgencyId === agencyId) {
      console.log(`[DefconRealtime] Deja connecte a l'agence ${agencyId}`);
      return;
    }

    // Deconnecter l'ancien canal si necessaire
    if (this.channel) {
      await this.disconnect();
    }

    this.currentAgencyId = agencyId;

    // Charger le niveau DEFCON actuel
    await this.loadCurrentDefcon(agencyId);

    // Creer un nouveau canal
    this.channel = this.supabase
      .channel('defcon-status-all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'defcon_status',
        },
        (payload) => {
          const status = payload.new as DefconStatus;
          if (status.agency_id === agencyId && status.is_active) {
            console.log('[DefconRealtime] Nouveau niveau DEFCON:', status.level);
            this.currentDefcon = status;
            this.notifySubscribers('onUpdate', status);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'defcon_status',
        },
        (payload) => {
          const status = payload.new as DefconStatus;
          if (status.agency_id === agencyId) {
            console.log('[DefconRealtime] DEFCON mis a jour:', status);
            if (status.is_active) {
              this.currentDefcon = status;
            } else if (this.currentDefcon?.id === status.id) {
              // Le DEFCON actuel a ete desactive, charger le nouveau
              this.loadCurrentDefcon(agencyId);
            }
            this.notifySubscribers('onUpdate', status);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[DefconRealtime] Status: ${status}`, err);

        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          console.log(`[DefconRealtime] Connecte a l'agence ${agencyId}`);
          this.subscribers.forEach((callbacks) => {
            if (callbacks.onConnected) {
              callbacks.onConnected();
            }
          });
        } else if (status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          console.error('[DefconRealtime] Erreur de connexion:', err);
          this.notifySubscribers('onError', new Error('Erreur de connexion au canal Realtime'));
        } else if (status === 'TIMED_OUT') {
          this.isConnected = false;
          console.error('[DefconRealtime] Timeout de connexion');
          this.notifySubscribers('onError', new Error('Timeout de connexion'));
        } else if (status === 'CLOSED') {
          this.isConnected = false;
          console.log('[DefconRealtime] Deconnecte');
        }
      });
  }

  /**
   * Charger le niveau DEFCON actuel depuis la base de donnees
   */
  private async loadCurrentDefcon(agencyId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('defcon_status')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      this.currentDefcon = data as DefconStatus | null;
      console.log('[DefconRealtime] DEFCON actuel charge:', this.currentDefcon?.level || 5);
    } catch (error) {
      console.error('[DefconRealtime] Erreur lors du chargement du DEFCON:', error);
      this.currentDefcon = null;
    }
  }

  /**
   * Se deconnecter du canal Realtime
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
      this.currentAgencyId = null;
      this.currentDefcon = null;
      console.log('[DefconRealtime] Deconnecte');
    }
  }

  /**
   * S'abonner aux changements
   */
  subscribe(
    id: string,
    callbacks: {
      onUpdate?: DefconCallback;
      onError?: ErrorCallback;
      onConnected?: () => void;
    }
  ): () => void {
    this.subscribers.set(id, callbacks);
    console.log(`[DefconRealtime] Nouvel abonne: ${id}`);

    if (this.isConnected && callbacks.onConnected) {
      callbacks.onConnected();
    }

    // Notifier immediatement avec le niveau actuel si disponible
    if (this.currentDefcon && callbacks.onUpdate) {
      callbacks.onUpdate(this.currentDefcon);
    }

    return () => this.unsubscribe(id);
  }

  /**
   * Se desabonner
   */
  unsubscribe(id: string): void {
    this.subscribers.delete(id);
    console.log(`[DefconRealtime] Desabonnement: ${id}`);
  }

  /**
   * Notifier tous les abonnes
   */
  private notifySubscribers(event: 'onUpdate', data: DefconStatus): void;
  private notifySubscribers(event: 'onError', data: Error): void;
  private notifySubscribers(
    event: 'onUpdate' | 'onError',
    data: DefconStatus | Error
  ): void {
    console.log(`[DefconRealtime] Notification ${event} vers ${this.subscribers.size} abonne(s)`);

    this.subscribers.forEach((callbacks) => {
      try {
        if (event === 'onUpdate' && callbacks.onUpdate && !(data instanceof Error)) {
          callbacks.onUpdate(data as DefconStatus);
        } else if (event === 'onError' && callbacks.onError && data instanceof Error) {
          callbacks.onError(data);
        }
      } catch (error) {
        console.error('[DefconRealtime] Erreur lors de la notification:', error);
      }
    });
  }

  /**
   * Obtenir le niveau DEFCON actuel d'une agence
   */
  async getCurrentDefcon(agencyId: string): Promise<DefconStatus | null> {
    try {
      const { data, error } = await this.supabase
        .from('defcon_status')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as DefconStatus | null;
    } catch (error) {
      console.error('[DefconRealtime] Erreur lors de la recuperation du DEFCON:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'historique DEFCON d'une agence
   */
  async getDefconHistory(agencyId: string, limit = 10): Promise<DefconStatus[]> {
    try {
      const { data, error } = await this.supabase
        .from('defcon_status')
        .select('*')
        .eq('agency_id', agencyId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as DefconStatus[];
    } catch (error) {
      console.error('[DefconRealtime] Erreur lors de la recuperation de l\'historique:', error);
      throw error;
    }
  }

  /**
   * Definir un nouveau niveau DEFCON
   */
  async setDefconLevel(
    level: DefconLevel,
    agencyId: string,
    activatedBy: string,
    options?: {
      notes?: string;
      durationHours?: number;
    }
  ): Promise<DefconStatus> {
    try {
      // Desactiver l'ancien niveau DEFCON s'il existe
      await this.supabase
        .from('defcon_status')
        .update({ is_active: false })
        .eq('agency_id', agencyId)
        .eq('is_active', true);

      // Calculer la date de fin si une duree est specifiee
      const config = getDefconConfig(level);
      const durationHours = options?.durationHours || null;
      let endsAt: string | null = null;

      if (durationHours) {
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + durationHours);
        endsAt = endDate.toISOString();
      }

      // Creer le nouveau niveau DEFCON
      const newDefcon: DefconStatusInsert = {
        agency_id: agencyId,
        level,
        description: config.description,
        duration_hours: durationHours,
        started_at: new Date().toISOString(),
        ends_at: endsAt,
        activated_by: activatedBy,
        notes: options?.notes || null,
        is_active: true,
      };

      const { data, error } = await this.supabase
        .from('defcon_status')
        .insert([newDefcon])
        .select()
        .single();

      if (error) throw error;

      console.log(`[DefconRealtime] Niveau DEFCON ${level} active pour ${agencyId}`);
      this.currentDefcon = data as DefconStatus;
      return data as DefconStatus;
    } catch (error) {
      console.error('[DefconRealtime] Erreur lors du changement de niveau DEFCON:', error);
      throw error;
    }
  }

  /**
   * Desactiver le niveau DEFCON actuel (revenir a DEFCON 5)
   */
  async deactivateDefcon(agencyId: string, deactivatedBy: string): Promise<void> {
    try {
      // Desactiver le niveau actuel
      await this.supabase
        .from('defcon_status')
        .update({ is_active: false })
        .eq('agency_id', agencyId)
        .eq('is_active', true);

      // Creer automatiquement un DEFCON 5
      await this.setDefconLevel(5, agencyId, deactivatedBy, {
        notes: 'Retour a la normale',
      });

      console.log(`[DefconRealtime] DEFCON desactive pour ${agencyId}, retour niveau 5`);
    } catch (error) {
      console.error('[DefconRealtime] Erreur lors de la desactivation du DEFCON:', error);
      throw error;
    }
  }

  /**
   * Obtenir le niveau DEFCON en cache
   */
  getCachedDefcon(): DefconStatus | null {
    return this.currentDefcon;
  }

  /**
   * Obtenir le niveau DEFCON actuel (nombre) - retourne 5 si aucun actif
   */
  getCurrentLevel(): DefconLevel {
    return this.currentDefcon?.level || 5;
  }

  /**
   * Obtenir la configuration du niveau DEFCON actuel
   */
  getCurrentConfig() {
    const level = this.getCurrentLevel();
    return DEFCON_CONFIGS[level];
  }

  /**
   * Obtenir le multiplicateur d'amende actuel
   */
  getCurrentFineMultiplier(): number {
    return this.getCurrentConfig().fineMultiplier;
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
export const defconRealtimeService = DefconRealtimeService.getInstance();
