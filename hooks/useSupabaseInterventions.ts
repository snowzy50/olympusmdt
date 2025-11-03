// Hook pour gérer les interventions médicales avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Intervention, InterventionInsert, InterventionUpdate } from '@/lib/supabase/client';

export function useSupabaseInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour récupérer toutes les interventions
  const fetchInterventions = useCallback(async () => {
    try {
      console.log('🔍 [Interventions] Fetching interventions...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) {
        console.error('❌ [Interventions] Error fetching:', fetchError);
        throw fetchError;
      }

      console.log(`✅ [Interventions] Fetched ${data?.length || 0} interventions`);
      setInterventions(data || []);
    } catch (err) {
      console.error('❌ [Interventions] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour ajouter une nouvelle intervention
  const addIntervention = useCallback(async (interventionData: InterventionInsert): Promise<Intervention | null> => {
    try {
      console.log('🔵 [Interventions] addIntervention called with:', interventionData);
      const { data, error: insertError } = await supabase
        .from('interventions')
        .insert(interventionData)
        .select()
        .single();

      console.log('🟢 [Interventions] Insert result:', { data, error: insertError });

      if (insertError) throw insertError;

      if (data) {
        console.log('✅ [Interventions] Adding to local state:', data);
        setInterventions((current) => [data, ...current]);
      }

      return data;
    } catch (err) {
      console.error('❌ [Interventions] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Fonction pour mettre à jour une intervention
  const updateIntervention = useCallback(async (id: string, updates: InterventionUpdate): Promise<Intervention | null> => {
    try {
      console.log('🔵 [Interventions] updateIntervention called with:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('interventions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('🟢 [Interventions] Update result:', { data, error: updateError });

      if (updateError) throw updateError;

      if (data) {
        console.log('✅ [Interventions] Updating local state:', data);
        setInterventions((current) =>
          current.map((intervention) => (intervention.id === data.id ? data : intervention))
        );
      }

      return data;
    } catch (err) {
      console.error('❌ [Interventions] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Fonction pour supprimer une intervention
  const deleteIntervention = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Interventions] deleteIntervention called with id:', id);
      const { error: deleteError } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);

      console.log('🟢 [Interventions] Delete result:', { error: deleteError });

      if (deleteError) throw deleteError;

      console.log('✅ [Interventions] Removing from local state:', id);
      setInterventions((current) => current.filter((intervention) => intervention.id !== id));

      return true;
    } catch (err) {
      console.error('❌ [Interventions] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  // Initial fetch et subscription Realtime
  useEffect(() => {
    console.log('🚀 [Interventions] Initializing hook...');
    fetchInterventions();

    // S'abonner aux changements Realtime
    console.log('📡 [Interventions] Setting up Realtime subscription...');
    const channel = supabase
      .channel('interventions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interventions',
        },
        (payload) => {
          console.log('📨 [Interventions] Realtime event received:', payload);

          if (payload.eventType === 'INSERT') {
            console.log('➕ [Interventions] Realtime INSERT:', payload.new);
            setInterventions((current) => {
              // Vérifier si l'élément n'existe pas déjà (éviter les doublons)
              if (current.some((i) => i.id === payload.new.id)) {
                console.log('⚠️ [Interventions] Item already exists, skipping');
                return current;
              }
              return [payload.new as Intervention, ...current];
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ [Interventions] Realtime UPDATE:', payload.new);
            setInterventions((current) =>
              current.map((intervention) =>
                intervention.id === payload.new.id ? (payload.new as Intervention) : intervention
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ [Interventions] Realtime DELETE:', payload.old);
            setInterventions((current) =>
              current.filter((intervention) => intervention.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [Interventions] Subscription status:', status);
      });

    // Cleanup
    return () => {
      console.log('🔌 [Interventions] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [fetchInterventions]);

  return {
    interventions,
    loading,
    error,
    addIntervention,
    updateIntervention,
    deleteIntervention,
    refetch: fetchInterventions,
  };
}
