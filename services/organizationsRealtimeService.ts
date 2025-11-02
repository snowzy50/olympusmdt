/**
 * Service Realtime pour les organisations, territoires et POI
 * Créé par: Snowzy
 * Features: CRUD complet, synchronisation temps réel, validation
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type {
  Organization,
  OrganizationMember,
  OrganizationRelation,
  Territory,
  TerritoryPOI,
  OrganizationWithDetails,
  Coordinates,
} from '@/types/organizations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface OrganizationSubscriber {
  onOrganizationInsert?: (organization: Organization) => void;
  onOrganizationUpdate?: (organization: Organization) => void;
  onOrganizationDelete?: (organizationId: string) => void;
  onTerritoryInsert?: (territory: Territory) => void;
  onTerritoryUpdate?: (territory: Territory) => void;
  onTerritoryDelete?: (territoryId: string) => void;
  onPOIInsert?: (poi: TerritoryPOI) => void;
  onPOIUpdate?: (poi: TerritoryPOI) => void;
  onPOIDelete?: (poiId: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

class OrganizationsRealtimeService {
  private supabase = createClient(supabaseUrl, supabaseAnonKey);
  private channel: RealtimeChannel | null = null;
  private subscribers: Map<string, OrganizationSubscriber> = new Map();
  private isConnected = false;

  /**
   * Connexion au canal Realtime
   */
  async connect(): Promise<void> {
    if (this.channel) {
      console.log('[OrganizationsRealtime] Déjà connecté');
      return;
    }

    console.log('[OrganizationsRealtime] Connexion au canal...');

    this.channel = this.supabase
      .channel('organizations-all')
      // Organizations
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'organizations' },
        (payload) => {
          console.log('[OrganizationsRealtime] Nouvelle organisation:', payload.new);
          this.notifySubscribers('onOrganizationInsert', payload.new as Organization);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'organizations' },
        (payload) => {
          console.log('[OrganizationsRealtime] Organisation mise à jour:', payload.new);
          this.notifySubscribers('onOrganizationUpdate', payload.new as Organization);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'organizations' },
        (payload) => {
          console.log('[OrganizationsRealtime] Organisation supprimée:', payload.old.id);
          this.notifySubscribers('onOrganizationDelete', payload.old.id as string);
        }
      )
      // Territories
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'territories' },
        (payload) => {
          console.log('[OrganizationsRealtime] Nouveau territoire:', payload.new);
          this.notifySubscribers('onTerritoryInsert', payload.new as Territory);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'territories' },
        (payload) => {
          console.log('[OrganizationsRealtime] Territoire mis à jour:', payload.new);
          this.notifySubscribers('onTerritoryUpdate', payload.new as Territory);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'territories' },
        (payload) => {
          console.log('[OrganizationsRealtime] Territoire supprimé:', payload.old.id);
          this.notifySubscribers('onTerritoryDelete', payload.old.id as string);
        }
      )
      // POIs
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'territory_pois' },
        (payload) => {
          console.log('[OrganizationsRealtime] Nouveau POI:', payload.new);
          this.notifySubscribers('onPOIInsert', payload.new as TerritoryPOI);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'territory_pois' },
        (payload) => {
          console.log('[OrganizationsRealtime] POI mis à jour:', payload.new);
          this.notifySubscribers('onPOIUpdate', payload.new as TerritoryPOI);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'territory_pois' },
        (payload) => {
          console.log('[OrganizationsRealtime] POI supprimé:', payload.old.id);
          this.notifySubscribers('onPOIDelete', payload.old.id as string);
        }
      )
      .subscribe((status) => {
        console.log('[OrganizationsRealtime] Status:', status);
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          this.notifySubscribers('onConnected');
        } else if (status === 'CLOSED') {
          this.isConnected = false;
          this.notifySubscribers('onDisconnected');
        }
      });
  }

  /**
   * Déconnexion du canal
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
      console.log('[OrganizationsRealtime] Déconnecté');
    }
  }

  /**
   * S'abonner aux événements
   */
  subscribe(id: string, subscriber: OrganizationSubscriber): () => void {
    this.subscribers.set(id, subscriber);
    console.log('[OrganizationsRealtime] Nouvel abonné:', id);

    // Notifier immédiatement si déjà connecté
    if (this.isConnected && subscriber.onConnected) {
      subscriber.onConnected();
    }

    return () => {
      this.subscribers.delete(id);
      console.log('[OrganizationsRealtime] Abonné retiré:', id);
    };
  }

  private notifySubscribers(event: keyof OrganizationSubscriber, data?: any) {
    this.subscribers.forEach((subscriber) => {
      const handler = subscriber[event] as any;
      if (handler) {
        handler(data);
      }
    });
  }

  // ============= CRUD Organizations =============

  async getAllOrganizations(): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getOrganizationWithDetails(id: string): Promise<OrganizationWithDetails | null> {
    const { data: org, error: orgError } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (orgError || !org) return null;

    const [members, relations, territories, pois] = await Promise.all([
      this.getOrganizationMembers(id),
      this.getOrganizationRelations(id),
      this.getOrganizationTerritories(id),
      this.getOrganizationPOIs(id),
    ]);

    return {
      ...org,
      members,
      allies: relations.filter((r) => r.relation_type === 'ally'),
      enemies: relations.filter((r) => r.relation_type === 'enemy'),
      territories,
      pois,
      member_count: members.length,
      territory_count: territories.length,
    };
  }

  async createOrganization(data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    const { data: newOrg, error } = await this.supabase
      .from('organizations')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newOrg;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOrganization(id: string): Promise<void> {
    const { error } = await this.supabase.from('organizations').delete().eq('id', id);
    if (error) throw error;
  }

  // ============= CRUD Members =============

  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .order('role', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addMember(data: Omit<OrganizationMember, 'id' | 'joined_at'>): Promise<OrganizationMember> {
    const { data: newMember, error } = await this.supabase
      .from('organization_members')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newMember;
  }

  async updateMember(id: string, updates: Partial<OrganizationMember>): Promise<OrganizationMember> {
    const { data, error } = await this.supabase
      .from('organization_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMember(id: string): Promise<void> {
    const { error } = await this.supabase.from('organization_members').delete().eq('id', id);
    if (error) throw error;
  }

  // ============= CRUD Relations =============

  async getOrganizationRelations(organizationId: string): Promise<OrganizationRelation[]> {
    const { data, error } = await this.supabase
      .from('organization_relations')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  async createRelation(data: Omit<OrganizationRelation, 'id' | 'created_at' | 'updated_at'>): Promise<OrganizationRelation> {
    const { data: newRelation, error } = await this.supabase
      .from('organization_relations')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newRelation;
  }

  async updateRelation(id: string, updates: Partial<OrganizationRelation>): Promise<OrganizationRelation> {
    const { data, error } = await this.supabase
      .from('organization_relations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRelation(id: string): Promise<void> {
    const { error } = await this.supabase.from('organization_relations').delete().eq('id', id);
    if (error) throw error;
  }

  // ============= CRUD Territories =============

  async getOrganizationTerritories(organizationId: string): Promise<Territory[]> {
    const { data, error } = await this.supabase
      .from('territories')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  async getAllTerritories(): Promise<Territory[]> {
    const { data, error } = await this.supabase
      .from('territories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTerritory(data: Omit<Territory, 'id' | 'created_at' | 'updated_at'>): Promise<Territory> {
    // Vérification anti-chevauchement (côté client pour l'instant)
    const allTerritories = await this.getAllTerritories();
    const hasOverlap = this.checkPolygonOverlap(
      data.coordinates,
      allTerritories.filter((t) => t.organization_id !== data.organization_id)
    );

    if (hasOverlap) {
      throw new Error('Le territoire chevauche un territoire existant');
    }

    const { data: newTerritory, error } = await this.supabase
      .from('territories')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newTerritory;
  }

  async updateTerritory(id: string, updates: Partial<Territory>): Promise<Territory> {
    const { data, error } = await this.supabase
      .from('territories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTerritory(id: string): Promise<void> {
    const { error } = await this.supabase.from('territories').delete().eq('id', id);
    if (error) throw error;
  }

  // ============= CRUD POIs =============

  async getOrganizationPOIs(organizationId: string): Promise<TerritoryPOI[]> {
    const { data, error } = await this.supabase
      .from('territory_pois')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  async getAllPOIs(): Promise<TerritoryPOI[]> {
    const { data, error } = await this.supabase
      .from('territory_pois')
      .select('*')
      .eq('is_secret', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createPOI(data: Omit<TerritoryPOI, 'id' | 'created_at' | 'updated_at'>): Promise<TerritoryPOI> {
    const { data: newPOI, error } = await this.supabase
      .from('territory_pois')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newPOI;
  }

  async updatePOI(id: string, updates: Partial<TerritoryPOI>): Promise<TerritoryPOI> {
    const { data, error } = await this.supabase
      .from('territory_pois')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePOI(id: string): Promise<void> {
    const { error } = await this.supabase.from('territory_pois').delete().eq('id', id);
    if (error) throw error;
  }

  // ============= Utilitaires =============

  /**
   * Vérifie si un polygone chevauche d'autres territoires
   */
  private checkPolygonOverlap(newPolygon: Coordinates[], existingTerritories: Territory[]): boolean {
    // Implémentation simplifiée : vérifier si des points sont à l'intérieur
    // Pour une vraie production, utiliser une bibliothèque comme turf.js
    for (const territory of existingTerritories) {
      const coords = territory.coordinates as Coordinates[];

      // Vérifier si un point du nouveau polygone est dans un territoire existant
      for (const point of newPolygon) {
        if (this.pointInPolygon(point, coords)) {
          return true;
        }
      }

      // Vérifier si un point d'un territoire existant est dans le nouveau polygone
      for (const point of coords) {
        if (this.pointInPolygon(point, newPolygon)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Algorithme point-in-polygon (ray casting)
   */
  private pointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect =
        yi > point.lng !== yj > point.lng &&
        point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton
const organizationsRealtimeService = new OrganizationsRealtimeService();
export default organizationsRealtimeService;
