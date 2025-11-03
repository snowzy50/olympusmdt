/**
 * Hook React pour gérer les bracelets électroniques avec Supabase Realtime
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, type AnkleMonitor, type AnkleMonitorInsert, type AnkleMonitorUpdate } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabaseAnkleMonitorsReturn {
  monitors: AnkleMonitor[];
  isLoading: boolean;
  error: Error | null;
  addMonitor: (monitor: AnkleMonitorInsert) => Promise<AnkleMonitor | null>;
  updateMonitor: (id: string, updates: AnkleMonitorUpdate) => Promise<AnkleMonitor | null>;
  deleteMonitor: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseAnkleMonitors(): UseSupabaseAnkleMonitorsReturn {
  const [monitors, setMonitors] = useState<AnkleMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Vérifier si Supabase est configuré
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fonction pour charger les bracelets
  const fetchMonitors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Si Supabase n'est pas configuré, retourner un tableau vide
      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
        setMonitors([]);
        setIsLoading(false);
        return;
      }

      console.log('🔍 [Ankle Monitors] Fetching from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('ankle_monitors')
        .select('*')
        .order('install_date', { ascending: false });

      console.log('🟢 [Ankle Monitors] Fetch result:', { count: data?.length, error: fetchError });

      if (fetchError) {
        throw fetchError;
      }

      setMonitors(data || []);
    } catch (err) {
      console.error('Error fetching ankle monitors:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Charger les bracelets au montage
  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  // Configurer la subscription Realtime
  useEffect(() => {
    // Ne pas se connecter si Supabase n'est pas configuré
    if (!isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel('ankle_monitors')
      .on<AnkleMonitor>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ankle_monitors',
        },
        (payload: RealtimePostgresChangesPayload<AnkleMonitor>) => {
          console.log('Ankle monitor inserted:', payload.new);
          setMonitors((current) => [payload.new as AnkleMonitor, ...current]);
        }
      )
      .on<AnkleMonitor>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ankle_monitors',
        },
        (payload: RealtimePostgresChangesPayload<AnkleMonitor>) => {
          console.log('Ankle monitor updated:', payload.new);
          const updatedMonitor = payload.new as AnkleMonitor;
          setMonitors((current) =>
            current.map((monitor) =>
              monitor.id === updatedMonitor.id ? updatedMonitor : monitor
            )
          );
        }
      )
      .on<AnkleMonitor>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ankle_monitors',
        },
        (payload: RealtimePostgresChangesPayload<AnkleMonitor>) => {
          console.log('Ankle monitor deleted:', payload.old);
          const deletedMonitor = payload.old as AnkleMonitor;
          setMonitors((current) =>
            current.filter((monitor) => monitor.id !== deletedMonitor.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Fonction pour ajouter un bracelet
  const addMonitor = useCallback(
    async (monitorData: AnkleMonitorInsert): Promise<AnkleMonitor | null> => {
      try {
        console.log('🔵 [Ankle Monitors] addMonitor called with:', monitorData);
        const { data, error: insertError } = await supabase
          .from('ankle_monitors')
          .insert(monitorData)
          .select()
          .single();

        console.log('🟢 [Ankle Monitors] Insert result:', { data, error: insertError });

        if (insertError) {
          throw insertError;
        }

        // Ajouter immédiatement à la liste locale
        if (data) {
          console.log('✅ [Ankle Monitors] Adding to local state:', data);
          setMonitors((current) => [data, ...current]);
        }

        return data;
      } catch (err) {
        console.error('❌ [Ankle Monitors] Error adding:', err);
        setError(err as Error);
        return null;
      }
    },
    []
  );

  // Fonction pour mettre à jour un bracelet
  const updateMonitor = useCallback(
    async (id: string, updates: AnkleMonitorUpdate): Promise<AnkleMonitor | null> => {
      try {
        const { data, error: updateError } = await supabase
          .from('ankle_monitors')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Mettre à jour immédiatement dans la liste locale
        if (data) {
          setMonitors((current) =>
            current.map((m) => (m.id === data.id ? data : m))
          );
        }

        return data;
      } catch (err) {
        console.error('Error updating ankle monitor:', err);
        setError(err as Error);
        return null;
      }
    },
    []
  );

  // Fonction pour supprimer un bracelet
  const deleteMonitor = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from('ankle_monitors')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw deleteError;
        }

        // Supprimer immédiatement de la liste locale
        setMonitors((current) => current.filter((m) => m.id !== id));

        return true;
      } catch (err) {
        console.error('Error deleting ankle monitor:', err);
        setError(err as Error);
        return false;
      }
    },
    []
  );

  return {
    monitors,
    isLoading,
    error,
    addMonitor,
    updateMonitor,
    deleteMonitor,
    refetch: fetchMonitors,
  };
}
