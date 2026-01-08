/**
 * Hook React pour la gestion du Livret Penal
 * Cree par: Snowzy
 * CRUD et recherche des infractions
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Infraction, InfractionInsert, InfractionUpdate, InfractionCategory } from '@/types/infractions';
import { INFRACTION_CATEGORIES, INFRACTION_CATEGORY_ORDER, formatFineAmount, formatGavDuration } from '@/types/infractions';

interface UseInfractionsOptions {
  autoLoad?: boolean;
  category?: InfractionCategory;
}

export function useInfractions(options: UseInfractionsOptions = {}) {
  const { autoLoad = true, category: filterCategory } = options;

  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Charger les infractions depuis Supabase
   */
  const loadInfractions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('infractions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setInfractions(data as Infraction[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des infractions');
      setError(error);
      console.error('[useInfractions] Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  /**
   * Ajouter une nouvelle infraction
   */
  const addInfraction = useCallback(async (data: InfractionInsert): Promise<Infraction | null> => {
    try {
      const { data: newInfraction, error: insertError } = await supabase
        .from('infractions')
        .insert([data])
        .select()
        .single();

      if (insertError) throw insertError;

      setInfractions((prev) => [...prev, newInfraction as Infraction]);
      return newInfraction as Infraction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de l\'ajout de l\'infraction');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Mettre a jour une infraction
   */
  const updateInfraction = useCallback(async (id: string, data: InfractionUpdate): Promise<Infraction | null> => {
    try {
      const { data: updatedInfraction, error: updateError } = await supabase
        .from('infractions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setInfractions((prev) =>
        prev.map((inf) => (inf.id === id ? (updatedInfraction as Infraction) : inf))
      );
      return updatedInfraction as Infraction;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise a jour de l\'infraction');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Supprimer une infraction (soft delete)
   */
  const deleteInfraction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('infractions')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setInfractions((prev) => prev.filter((inf) => inf.id !== id));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de l\'infraction');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Rechercher des infractions par texte
   */
  const searchInfractions = useCallback(
    (query: string, category?: InfractionCategory): Infraction[] => {
      let results = infractions;

      if (category) {
        results = results.filter((inf) => inf.category === category);
      }

      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(
          (inf) =>
            inf.name.toLowerCase().includes(lowerQuery) ||
            inf.description?.toLowerCase().includes(lowerQuery) ||
            inf.notes?.toLowerCase().includes(lowerQuery)
        );
      }

      return results;
    },
    [infractions]
  );

  /**
   * Obtenir les infractions par categorie
   */
  const getByCategory = useCallback(
    (category: InfractionCategory): Infraction[] => {
      return infractions.filter((inf) => inf.category === category);
    },
    [infractions]
  );

  /**
   * Obtenir une infraction par ID
   */
  const getById = useCallback(
    (id: string): Infraction | undefined => {
      return infractions.find((inf) => inf.id === id);
    },
    [infractions]
  );

  /**
   * Infractions filtrees par recherche
   */
  const filteredInfractions = useMemo(() => {
    return searchInfractions(searchQuery, filterCategory);
  }, [searchInfractions, searchQuery, filterCategory]);

  /**
   * Grouper les infractions par categorie
   */
  const groupedByCategory = useMemo(() => {
    const groups: Record<InfractionCategory, Infraction[]> = {
      contravention: [],
      delit_mineur: [],
      delit_majeur: [],
      crime: [],
    };

    filteredInfractions.forEach((inf) => {
      groups[inf.category].push(inf);
    });

    return groups;
  }, [filteredInfractions]);

  /**
   * Statistiques
   */
  const stats = useMemo(() => {
    return {
      total: infractions.length,
      byCategory: {
        contravention: infractions.filter((i) => i.category === 'contravention').length,
        delit_mineur: infractions.filter((i) => i.category === 'delit_mineur').length,
        delit_majeur: infractions.filter((i) => i.category === 'delit_majeur').length,
        crime: infractions.filter((i) => i.category === 'crime').length,
      },
      withGav: infractions.filter((i) => i.gav_duration !== null).length,
      requiresProsecutor: infractions.filter((i) => i.requires_prosecutor).length,
      requiresTribunal: infractions.filter((i) => i.requires_tribunal).length,
    };
  }, [infractions]);

  /**
   * Effet pour charger les infractions au montage
   */
  useEffect(() => {
    if (autoLoad) {
      loadInfractions();
    }
  }, [autoLoad, loadInfractions]);

  return {
    // Etat
    infractions,
    filteredInfractions,
    groupedByCategory,
    isLoading,
    error,
    searchQuery,
    stats,

    // Actions
    setSearchQuery,
    loadInfractions,
    addInfraction,
    updateInfraction,
    deleteInfraction,

    // Helpers
    searchInfractions,
    getByCategory,
    getById,
    formatFineAmount,
    formatGavDuration,

    // Constantes
    categories: INFRACTION_CATEGORIES,
    categoryOrder: INFRACTION_CATEGORY_ORDER,
  };
}
