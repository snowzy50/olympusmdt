/**
 * Hook React pour la gestion du Gun Control (GCA)
 * Cree par: Snowzy
 * CRUD et recherche des armes
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Weapon, WeaponInsert, WeaponUpdate, WeaponCategory } from '@/types/weapons';
import {
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ORDER,
  getWeaponCategoryConfig,
  getWeaponRestrictions,
  getWeaponLegalStatus,
  getWeaponStatusColor,
  isWeaponIllegalWithoutPermit,
} from '@/types/weapons';

interface UseWeaponsRegistryOptions {
  autoLoad?: boolean;
  category?: WeaponCategory;
}

export function useWeaponsRegistry(options: UseWeaponsRegistryOptions = {}) {
  const { autoLoad = true, category: filterCategory } = options;

  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Charger les armes depuis Supabase
   */
  const loadWeapons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('weapons_registry')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setWeapons(data as Weapon[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des armes');
      setError(error);
      console.error('[useWeaponsRegistry] Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  /**
   * Ajouter une nouvelle arme
   */
  const addWeapon = useCallback(async (data: WeaponInsert): Promise<Weapon | null> => {
    try {
      const { data: newWeapon, error: insertError } = await supabase
        .from('weapons_registry')
        .insert([data])
        .select()
        .single();

      if (insertError) throw insertError;

      setWeapons((prev) => [...prev, newWeapon as Weapon]);
      return newWeapon as Weapon;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de l\'ajout de l\'arme');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Mettre a jour une arme
   */
  const updateWeapon = useCallback(async (id: string, data: WeaponUpdate): Promise<Weapon | null> => {
    try {
      const { data: updatedWeapon, error: updateError } = await supabase
        .from('weapons_registry')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setWeapons((prev) =>
        prev.map((w) => (w.id === id ? (updatedWeapon as Weapon) : w))
      );
      return updatedWeapon as Weapon;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise a jour de l\'arme');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Supprimer une arme (soft delete)
   */
  const deleteWeapon = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('weapons_registry')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setWeapons((prev) => prev.filter((w) => w.id !== id));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de l\'arme');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Rechercher des armes par texte
   */
  const searchWeapons = useCallback(
    (query: string, category?: WeaponCategory): Weapon[] => {
      let results = weapons;

      if (category) {
        results = results.filter((w) => w.category === category);
      }

      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(
          (w) =>
            w.name.toLowerCase().includes(lowerQuery) ||
            w.description?.toLowerCase().includes(lowerQuery) ||
            w.notes?.toLowerCase().includes(lowerQuery)
        );
      }

      return results;
    },
    [weapons]
  );

  /**
   * Obtenir les armes par categorie
   */
  const getByCategory = useCallback(
    (category: WeaponCategory): Weapon[] => {
      return weapons.filter((w) => w.category === category);
    },
    [weapons]
  );

  /**
   * Obtenir une arme par ID
   */
  const getById = useCallback(
    (id: string): Weapon | undefined => {
      return weapons.find((w) => w.id === id);
    },
    [weapons]
  );

  /**
   * Obtenir les armes illegales
   */
  const getIllegalWeapons = useCallback((): Weapon[] => {
    return weapons.filter((w) => isWeaponIllegalWithoutPermit(w));
  }, [weapons]);

  /**
   * Armes filtrees par recherche
   */
  const filteredWeapons = useMemo(() => {
    return searchWeapons(searchQuery, filterCategory);
  }, [searchWeapons, searchQuery, filterCategory]);

  /**
   * Grouper les armes par categorie
   */
  const groupedByCategory = useMemo(() => {
    const groups: Record<WeaponCategory, Weapon[]> = {
      D: [],
      C: [],
      B: [],
      A: [],
    };

    filteredWeapons.forEach((w) => {
      groups[w.category].push(w);
    });

    return groups;
  }, [filteredWeapons]);

  /**
   * Statistiques
   */
  const stats = useMemo(() => {
    return {
      total: weapons.length,
      byCategory: {
        A: weapons.filter((w) => w.category === 'A').length,
        B: weapons.filter((w) => w.category === 'B').length,
        C: weapons.filter((w) => w.category === 'C').length,
        D: weapons.filter((w) => w.category === 'D').length,
      },
      freeOwnership: weapons.filter((w) => w.free_possession).length,
      requiresPermit: weapons.filter((w) => w.requires_permit).length,
      prohibited: weapons.filter((w) => w.possession_prohibited).length,
    };
  }, [weapons]);

  /**
   * Effet pour charger les armes au montage
   */
  useEffect(() => {
    if (autoLoad) {
      loadWeapons();
    }
  }, [autoLoad, loadWeapons]);

  return {
    // Etat
    weapons,
    filteredWeapons,
    groupedByCategory,
    isLoading,
    error,
    searchQuery,
    stats,

    // Actions
    setSearchQuery,
    loadWeapons,
    addWeapon,
    updateWeapon,
    deleteWeapon,

    // Helpers
    searchWeapons,
    getByCategory,
    getById,
    getIllegalWeapons,
    getWeaponRestrictions,
    getWeaponLegalStatus,
    getWeaponStatusColor,
    getCategoryConfig: getWeaponCategoryConfig,

    // Constantes
    categories: WEAPON_CATEGORIES,
    categoryOrder: WEAPON_CATEGORY_ORDER,
  };
}
