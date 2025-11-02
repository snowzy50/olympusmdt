/**
 * Hook React pour gérer les organisations en temps réel
 * Créé par: Snowzy
 * Features: CRUD, Realtime sync, gestion d'état
 */

'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import organizationsRealtimeService from '@/services/organizationsRealtimeService';
import type {
  Organization,
  OrganizationMember,
  OrganizationRelation,
  Territory,
  TerritoryPOI,
  OrganizationWithDetails,
} from '@/types/organizations';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [pois, setPOIs] = useState<TerritoryPOI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const subscriberId = useId();

  // Charger les données initiales
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [orgsData, territoriesData, poisData] = await Promise.all([
        organizationsRealtimeService.getAllOrganizations(),
        organizationsRealtimeService.getAllTerritories(),
        organizationsRealtimeService.getAllPOIs(),
      ]);
      setOrganizations(orgsData);
      setTerritories(territoriesData);
      setPOIs(poisData);
    } catch (error) {
      console.error('[useOrganizations] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connexion et abonnement Realtime
  useEffect(() => {
    const initRealtime = async () => {
      await organizationsRealtimeService.connect();

      const unsubscribe = organizationsRealtimeService.subscribe(subscriberId, {
        // Organizations
        onOrganizationInsert: (newOrg) => {
          setOrganizations((prev) => [newOrg, ...prev]);
        },
        onOrganizationUpdate: (updatedOrg) => {
          setOrganizations((prev) =>
            prev.map((org) => (org.id === updatedOrg.id ? updatedOrg : org))
          );
        },
        onOrganizationDelete: (orgId) => {
          setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
        },

        // Territories
        onTerritoryInsert: (newTerritory) => {
          setTerritories((prev) => [newTerritory, ...prev]);
        },
        onTerritoryUpdate: (updatedTerritory) => {
          setTerritories((prev) =>
            prev.map((territory) =>
              territory.id === updatedTerritory.id ? updatedTerritory : territory
            )
          );
        },
        onTerritoryDelete: (territoryId) => {
          setTerritories((prev) => prev.filter((territory) => territory.id !== territoryId));
        },

        // POIs
        onPOIInsert: (newPOI) => {
          setPOIs((prev) => [newPOI, ...prev]);
        },
        onPOIUpdate: (updatedPOI) => {
          setPOIs((prev) => prev.map((poi) => (poi.id === updatedPOI.id ? updatedPOI : poi)));
        },
        onPOIDelete: (poiId) => {
          setPOIs((prev) => prev.filter((poi) => poi.id !== poiId));
        },

        onConnected: () => {
          console.log('[useOrganizations] Connecté');
          setIsConnected(true);
        },
        onDisconnected: () => {
          console.log('[useOrganizations] Déconnecté');
          setIsConnected(false);
        },
      });

      await loadData();

      return unsubscribe;
    };

    const unsubscribePromise = initRealtime();

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, [subscriberId, loadData]);

  // ============= Organizations =============

  const createOrganization = useCallback(
    async (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const result = await organizationsRealtimeService.createOrganization(data);
        // Refresh manuel car Realtime peut avoir un délai
        console.log('[useOrganizations] Refresh manuel après création organisation');
        await loadData();
        return result;
      } catch (error) {
        console.error('[useOrganizations] Erreur création organisation:', error);
        throw error;
      }
    },
    [loadData]
  );

  const updateOrganization = useCallback(async (id: string, updates: Partial<Organization>) => {
    try {
      return await organizationsRealtimeService.updateOrganization(id, updates);
    } catch (error) {
      console.error('[useOrganizations] Erreur mise à jour organisation:', error);
      throw error;
    }
  }, []);

  const deleteOrganization = useCallback(async (id: string) => {
    try {
      await organizationsRealtimeService.deleteOrganization(id);
    } catch (error) {
      console.error('[useOrganizations] Erreur suppression organisation:', error);
      throw error;
    }
  }, []);

  const getOrganizationWithDetails = useCallback(
    async (id: string): Promise<OrganizationWithDetails | null> => {
      try {
        return await organizationsRealtimeService.getOrganizationWithDetails(id);
      } catch (error) {
        console.error('[useOrganizations] Erreur chargement détails:', error);
        return null;
      }
    },
    []
  );

  // ============= Members =============

  const addMember = useCallback(
    async (data: Omit<OrganizationMember, 'id' | 'joined_at'>) => {
      try {
        return await organizationsRealtimeService.addMember(data);
      } catch (error) {
        console.error('[useOrganizations] Erreur ajout membre:', error);
        throw error;
      }
    },
    []
  );

  const updateMember = useCallback(async (id: string, updates: Partial<OrganizationMember>) => {
    try {
      return await organizationsRealtimeService.updateMember(id, updates);
    } catch (error) {
      console.error('[useOrganizations] Erreur mise à jour membre:', error);
      throw error;
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    try {
      await organizationsRealtimeService.deleteMember(id);
    } catch (error) {
      console.error('[useOrganizations] Erreur suppression membre:', error);
      throw error;
    }
  }, []);

  // ============= Relations =============

  const createRelation = useCallback(
    async (data: Omit<OrganizationRelation, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        return await organizationsRealtimeService.createRelation(data);
      } catch (error) {
        console.error('[useOrganizations] Erreur création relation:', error);
        throw error;
      }
    },
    []
  );

  const deleteRelation = useCallback(async (id: string) => {
    try {
      await organizationsRealtimeService.deleteRelation(id);
    } catch (error) {
      console.error('[useOrganizations] Erreur suppression relation:', error);
      throw error;
    }
  }, []);

  // ============= Territories =============

  const createTerritory = useCallback(
    async (data: Omit<Territory, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const result = await organizationsRealtimeService.createTerritory(data);
        // Refresh manuel car Realtime peut avoir un délai
        console.log('[useOrganizations] Refresh manuel après création territoire');
        await loadData();
        return result;
      } catch (error) {
        console.error('[useOrganizations] Erreur création territoire:', error);
        throw error;
      }
    },
    [loadData]
  );

  const updateTerritory = useCallback(async (id: string, updates: Partial<Territory>) => {
    try {
      return await organizationsRealtimeService.updateTerritory(id, updates);
    } catch (error) {
      console.error('[useOrganizations] Erreur mise à jour territoire:', error);
      throw error;
    }
  }, []);

  const deleteTerritory = useCallback(async (id: string) => {
    try {
      await organizationsRealtimeService.deleteTerritory(id);
    } catch (error) {
      console.error('[useOrganizations] Erreur suppression territoire:', error);
      throw error;
    }
  }, []);

  // ============= POIs =============

  const createPOI = useCallback(
    async (data: Omit<TerritoryPOI, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        return await organizationsRealtimeService.createPOI(data);
      } catch (error) {
        console.error('[useOrganizations] Erreur création POI:', error);
        throw error;
      }
    },
    []
  );

  const updatePOI = useCallback(async (id: string, updates: Partial<TerritoryPOI>) => {
    try {
      return await organizationsRealtimeService.updatePOI(id, updates);
    } catch (error) {
      console.error('[useOrganizations] Erreur mise à jour POI:', error);
      throw error;
    }
  }, []);

  const deletePOI = useCallback(async (id: string) => {
    try {
      await organizationsRealtimeService.deletePOI(id);
    } catch (error) {
      console.error('[useOrganizations] Erreur suppression POI:', error);
      throw error;
    }
  }, []);

  // ============= Utilitaires =============

  const getOrganizationTerritories = useCallback(
    (organizationId: string): Territory[] => {
      return territories.filter((t) => t.organization_id === organizationId);
    },
    [territories]
  );

  const getOrganizationPOIs = useCallback(
    (organizationId: string): TerritoryPOI[] => {
      return pois.filter((p) => p.organization_id === organizationId);
    },
    [pois]
  );

  return {
    // État
    organizations,
    territories,
    pois,
    isLoading,
    isConnected,

    // Organizations
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationWithDetails,

    // Members
    addMember,
    updateMember,
    deleteMember,

    // Relations
    createRelation,
    deleteRelation,

    // Territories
    createTerritory,
    updateTerritory,
    deleteTerritory,
    getOrganizationTerritories,

    // POIs
    createPOI,
    updatePOI,
    deletePOI,
    getOrganizationPOIs,

    // Utilities
    refresh: loadData,
  };
}
