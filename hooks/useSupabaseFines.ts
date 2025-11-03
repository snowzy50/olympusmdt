/**
 * Hook personnalisé pour gérer les amendes avec Supabase
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Fine, FineInsert, FineUpdate } from '@/lib/supabase/client';

interface UseSupabaseFinesReturn {
  fines: Fine[];
  isLoading: boolean;
  error: Error | null;
  addFine: (fineData: FineInsert) => Promise<Fine | null>;
  updateFine: (id: string, fineData: FineUpdate) => Promise<Fine | null>;
  deleteFine: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseFines(): UseSupabaseFinesReturn {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fetch fines from Supabase
  const fetchFines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured. Using local state only.');
        setFines([]);
        setIsLoading(false);
        return;
      }

      console.log('🔍 [Fines] Fetching from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('fines')
        .select('*')
        .order('date', { ascending: false });

      console.log('🟢 [Fines] Fetch result:', { count: data?.length, error: fetchError });

      if (fetchError) throw fetchError;

      setFines(data || []);
    } catch (err) {
      console.error('❌ [Fines] Error fetching:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Initial fetch
  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('fines')
      .on<Fine>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fines' },
        (payload) => {
          setFines((current) => [payload.new as Fine, ...current]);
        }
      )
      .on<Fine>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'fines' },
        (payload) => {
          const updated = payload.new as Fine;
          setFines((current) =>
            current.map((fine) => (fine.id === updated.id ? updated : fine))
          );
        }
      )
      .on<Fine>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'fines' },
        (payload) => {
          const deleted = payload.old as Fine;
          setFines((current) => current.filter((fine) => fine.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Add fine
  const addFine = useCallback(async (fineData: FineInsert): Promise<Fine | null> => {
    try {
      console.log('🔵 [Fines] addFine called with:', fineData);
      const { data, error: insertError } = await supabase
        .from('fines')
        .insert(fineData)
        .select()
        .single();

      console.log('🟢 [Fines] Insert result:', { data, error: insertError });

      if (insertError) throw insertError;

      // Ajouter immédiatement à la liste locale
      if (data) {
        console.log('✅ [Fines] Adding to local state:', data);
        setFines((current) => [data, ...current]);
      }

      return data;
    } catch (err) {
      console.error('❌ [Fines] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Update fine
  const updateFine = useCallback(async (id: string, fineData: FineUpdate): Promise<Fine | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('fines')
        .update(fineData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour immédiatement dans la liste locale
      if (data) {
        setFines((current) =>
          current.map((fine) => (fine.id === data.id ? data : fine))
        );
      }

      return data;
    } catch (err) {
      console.error('Error updating fine:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Delete fine
  const deleteFine = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('fines')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Supprimer immédiatement de la liste locale
      setFines((current) => current.filter((fine) => fine.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting fine:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return {
    fines,
    isLoading,
    error,
    addFine,
    updateFine,
    deleteFine,
    refetch: fetchFines,
  };
}
