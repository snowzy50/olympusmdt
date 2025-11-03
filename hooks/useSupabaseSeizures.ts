/**
 * Hook personnalisé pour gérer les saisies avec Supabase
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Seizure, SeizureInsert, SeizureUpdate } from '@/lib/supabase/client';

interface UseSupabaseSeizuresReturn {
  seizures: Seizure[];
  isLoading: boolean;
  error: Error | null;
  addSeizure: (seizureData: SeizureInsert) => Promise<Seizure | null>;
  updateSeizure: (id: string, seizureData: SeizureUpdate) => Promise<Seizure | null>;
  deleteSeizure: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseSeizures(): UseSupabaseSeizuresReturn {
  const [seizures, setSeizures] = useState<Seizure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fetch seizures from Supabase
  const fetchSeizures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured. Using local state only.');
        setSeizures([]);
        setIsLoading(false);
        return;
      }

      console.log('🔍 [Seizures] Fetching from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('seizures')
        .select('*')
        .order('date', { ascending: false });

      console.log('🟢 [Seizures] Fetch result:', { count: data?.length, error: fetchError });

      if (fetchError) throw fetchError;

      setSeizures(data || []);
    } catch (err) {
      console.error('❌ [Seizures] Error fetching:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Initial fetch
  useEffect(() => {
    fetchSeizures();
  }, [fetchSeizures]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('seizures')
      .on<Seizure>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'seizures' },
        (payload) => {
          setSeizures((current) => [payload.new as Seizure, ...current]);
        }
      )
      .on<Seizure>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'seizures' },
        (payload) => {
          const updated = payload.new as Seizure;
          setSeizures((current) =>
            current.map((seiz) => (seiz.id === updated.id ? updated : seiz))
          );
        }
      )
      .on<Seizure>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'seizures' },
        (payload) => {
          const deleted = payload.old as Seizure;
          setSeizures((current) => current.filter((seiz) => seiz.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Add seizure
  const addSeizure = useCallback(async (seizureData: SeizureInsert): Promise<Seizure | null> => {
    try {
      console.log('🔵 [Seizures] addSeizure called with:', seizureData);
      const { data, error: insertError } = await supabase
        .from('seizures')
        .insert(seizureData)
        .select()
        .single();

      console.log('🟢 [Seizures] Insert result:', { data, error: insertError });

      if (insertError) throw insertError;

      // Ajouter immédiatement à la liste locale
      if (data) {
        console.log('✅ [Seizures] Adding to local state:', data);
        setSeizures((current) => [data, ...current]);
      }

      return data;
    } catch (err) {
      console.error('❌ [Seizures] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Update seizure
  const updateSeizure = useCallback(async (id: string, seizureData: SeizureUpdate): Promise<Seizure | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('seizures')
        .update(seizureData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour immédiatement dans la liste locale
      if (data) {
        setSeizures((current) =>
          current.map((seiz) => (seiz.id === data.id ? data : seiz))
        );
      }

      return data;
    } catch (err) {
      console.error('Error updating seizure:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Delete seizure
  const deleteSeizure = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('seizures')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Supprimer immédiatement de la liste locale
      setSeizures((current) => current.filter((seiz) => seiz.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting seizure:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return {
    seizures,
    isLoading,
    error,
    addSeizure,
    updateSeizure,
    deleteSeizure,
    refetch: fetchSeizures,
  };
}
