// Hook pour gérer les arrêts de travail avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SickLeave, SickLeaveInsert, SickLeaveUpdate } from '@/lib/supabase/client';

export function useSupabaseSickLeaves() {
  const [sickLeaves, setSickLeaves] = useState<SickLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour récupérer tous les arrêts de travail
  const fetchSickLeaves = useCallback(async () => {
    try {
      console.log('🔍 [Sick Leaves] Fetching sick leaves...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sick_leaves')
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchError) {
        console.error('❌ [Sick Leaves] Error fetching:', fetchError);
        throw fetchError;
      }

      console.log(`✅ [Sick Leaves] Fetched ${data?.length || 0} sick leaves`);
      setSickLeaves(data || []);
    } catch (err) {
      console.error('❌ [Sick Leaves] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour ajouter un nouvel arrêt de travail
  const addSickLeave = useCallback(async (sickLeaveData: SickLeaveInsert): Promise<SickLeave | null> => {
    try {
      console.log('🔵 [Sick Leaves] addSickLeave called with:', sickLeaveData);
      const { data, error: insertError } = await supabase
        .from('sick_leaves')
        .insert(sickLeaveData)
        .select()
        .single();

      console.log('🟢 [Sick Leaves] Insert result:', { data, error: insertError });

      if (insertError) throw insertError;

      if (data) {
        console.log('✅ [Sick Leaves] Adding to local state:', data);
        setSickLeaves((current) => [data, ...current]);
      }

      return data;
    } catch (err) {
      console.error('❌ [Sick Leaves] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Fonction pour mettre à jour un arrêt de travail
  const updateSickLeave = useCallback(async (id: string, updates: SickLeaveUpdate): Promise<SickLeave | null> => {
    try {
      console.log('🔵 [Sick Leaves] updateSickLeave called with:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('sick_leaves')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('🟢 [Sick Leaves] Update result:', { data, error: updateError });

      if (updateError) throw updateError;

      if (data) {
        console.log('✅ [Sick Leaves] Updating local state:', data);
        setSickLeaves((current) =>
          current.map((sickLeave) => (sickLeave.id === data.id ? data : sickLeave))
        );
      }

      return data;
    } catch (err) {
      console.error('❌ [Sick Leaves] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Fonction pour supprimer un arrêt de travail
  const deleteSickLeave = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Sick Leaves] deleteSickLeave called with id:', id);
      const { error: deleteError } = await supabase
        .from('sick_leaves')
        .delete()
        .eq('id', id);

      console.log('🟢 [Sick Leaves] Delete result:', { error: deleteError });

      if (deleteError) throw deleteError;

      console.log('✅ [Sick Leaves] Removing from local state:', id);
      setSickLeaves((current) => current.filter((sickLeave) => sickLeave.id !== id));

      return true;
    } catch (err) {
      console.error('❌ [Sick Leaves] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  // Initial fetch et subscription Realtime
  useEffect(() => {
    console.log('🚀 [Sick Leaves] Initializing hook...');
    fetchSickLeaves();

    // S'abonner aux changements Realtime
    console.log('📡 [Sick Leaves] Setting up Realtime subscription...');
    const channel = supabase
      .channel('sick-leaves-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sick_leaves',
        },
        (payload) => {
          console.log('📨 [Sick Leaves] Realtime event received:', payload);

          if (payload.eventType === 'INSERT') {
            console.log('➕ [Sick Leaves] Realtime INSERT:', payload.new);
            setSickLeaves((current) => {
              // Vérifier si l'élément n'existe pas déjà (éviter les doublons)
              if (current.some((sl) => sl.id === payload.new.id)) {
                console.log('⚠️ [Sick Leaves] Item already exists, skipping');
                return current;
              }
              return [payload.new as SickLeave, ...current];
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ [Sick Leaves] Realtime UPDATE:', payload.new);
            setSickLeaves((current) =>
              current.map((sickLeave) =>
                sickLeave.id === payload.new.id ? (payload.new as SickLeave) : sickLeave
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ [Sick Leaves] Realtime DELETE:', payload.old);
            setSickLeaves((current) =>
              current.filter((sickLeave) => sickLeave.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [Sick Leaves] Subscription status:', status);
      });

    // Cleanup
    return () => {
      console.log('🔌 [Sick Leaves] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [fetchSickLeaves]);

  return {
    sickLeaves,
    loading,
    error,
    addSickLeave,
    updateSickLeave,
    deleteSickLeave,
    refetch: fetchSickLeaves,
  };
}
