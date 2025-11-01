/**
 * Hook React pour gérer les agents avec Supabase Realtime
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, type Agent, type AgentInsert, type AgentUpdate } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabaseAgentsReturn {
  agents: Agent[];
  isLoading: boolean;
  error: Error | null;
  addAgent: (agent: Omit<AgentInsert, 'agency_id'>) => Promise<Agent | null>;
  updateAgent: (id: string, updates: AgentUpdate) => Promise<Agent | null>;
  deleteAgent: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseAgents(agencyId: string): UseSupabaseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Vérifier si Supabase est configuré
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fonction pour charger les agents
  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Si Supabase n'est pas configuré, retourner un tableau vide
      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
        setAgents([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('agency_id', agencyId)
        .order('date_joined', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAgents(data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [agencyId, isSupabaseConfigured]);

  // Charger les agents au montage et quand l'agence change
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Configurer la subscription Realtime
  useEffect(() => {
    // Ne pas se connecter si Supabase n'est pas configuré
    if (!isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel(`agents:${agencyId}`)
      .on<Agent>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agents',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          console.log('Agent inserted:', payload.new);
          setAgents((current) => [payload.new, ...current]);
        }
      )
      .on<Agent>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agents',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          console.log('Agent updated:', payload.new);
          setAgents((current) =>
            current.map((agent) =>
              agent.id === payload.new.id ? payload.new : agent
            )
          );
        }
      )
      .on<Agent>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'agents',
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload: RealtimePostgresChangesPayload<Agent>) => {
          console.log('Agent deleted:', payload.old);
          setAgents((current) =>
            current.filter((agent) => agent.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agencyId, isSupabaseConfigured]);

  // Fonction pour ajouter un agent
  const addAgent = useCallback(
    async (agentData: Omit<AgentInsert, 'agency_id'>): Promise<Agent | null> => {
      try {
        const { data, error: insertError } = await supabase
          .from('agents')
          .insert({
            ...agentData,
            agency_id: agencyId,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return data;
      } catch (err) {
        console.error('Error adding agent:', err);
        setError(err as Error);
        return null;
      }
    },
    [agencyId]
  );

  // Fonction pour mettre à jour un agent
  const updateAgent = useCallback(
    async (id: string, updates: AgentUpdate): Promise<Agent | null> => {
      try {
        const { data, error: updateError } = await supabase
          .from('agents')
          .update(updates)
          .eq('id', id)
          .eq('agency_id', agencyId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return data;
      } catch (err) {
        console.error('Error updating agent:', err);
        setError(err as Error);
        return null;
      }
    },
    [agencyId]
  );

  // Fonction pour supprimer un agent
  const deleteAgent = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from('agents')
          .delete()
          .eq('id', id)
          .eq('agency_id', agencyId);

        if (deleteError) {
          throw deleteError;
        }

        return true;
      } catch (err) {
        console.error('Error deleting agent:', err);
        setError(err as Error);
        return false;
      }
    },
    [agencyId]
  );

  return {
    agents,
    isLoading,
    error,
    addAgent,
    updateAgent,
    deleteAgent,
    refetch: fetchAgents,
  };
}
