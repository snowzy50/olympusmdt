/**
 * Hooks React pour la synchronisation temps réel via Supabase
 * Refactored to use actual Supabase Realtime instead of LocalStorage mock
 * Créé par Snowzy - 2025
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type DataType = 'cases' | 'complaints' | 'summons' | 'equipment' | 'warrants' | 'agents' | 'citizens' | 'events' | 'units' | 'divisions';

// Map generic types to actual table names
const TABLE_MAP: Record<DataType, string> = {
  cases: 'cases', // Assuming table exists or will exist
  complaints: 'complaints',
  summons: 'summons',
  equipment: 'equipment',
  warrants: 'warrants',
  agents: 'agents',
  citizens: 'citizens',
  events: 'events',
  units: 'units',
  divisions: 'divisions'
};

/**
 * Hook principal pour synchroniser un type de données
 */
export function useRealtimeSync<T = any>(type: DataType, filter?: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const tableName = TABLE_MAP[type];

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from(tableName).select('*');
        if (filter) {
          // Simple filter support: "column=value"
          const [col, val] = filter.split('=');
          if (col && val) {
            query = query.eq(col, val);
          }
        }

        const { data: initialData, error } = await query;
        if (error) {
          console.error(`[useRealtimeSync] Error fetching ${type}:`, error);
        } else {
          setData(initialData as T[] || []);
        }
      } catch (err) {
        console.error(`[useRealtimeSync] Unexpected error fetching ${type}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    const subscribe = () => {
      const channelName = `public:${tableName}${filter ? ':' + filter : ''}`;

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            // Optimistic update handling could go here, for now simple refresh
            // For lighter load we should process payload.new/payload.old
            handleRealtimeEvent(payload);
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    const handleRealtimeEvent = (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setData(prevData => {
        if (eventType === 'INSERT') {
          return [newRecord as T, ...prevData];
        } else if (eventType === 'UPDATE') {
          return prevData.map(item => (item as any).id === newRecord.id ? newRecord as T : item);
        } else if (eventType === 'DELETE') {
          return prevData.filter(item => (item as any).id !== oldRecord.id);
        }
        return prevData;
      });
    };

    fetchData().then(() => subscribe());

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [type, tableName, filter]);


  // Helper functions that wrap Supabase calls
  const addItem = async (item: Partial<T>) => {
    const { data: newItem, error } = await supabase.from(tableName).insert([item]).select().single();
    if (error) throw error;
    return newItem;
  };

  const updateItem = async (id: string | number, updates: Partial<T>) => {
    const { data: updated, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  };

  const deleteItem = async (id: string | number) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  };

  return {
    data,
    isLoading,
    isConnected,
    addItem,
    updateItem,
    deleteItem,
  };
}

/**
 * Hook pour s'abonner aux changements d'un type sans gérer l'état
 */
export function useRealtimeSubscription(
  type: DataType,
  callback: (payload: any) => void
) {
  const tableName = TABLE_MAP[type];
  useEffect(() => {
    const channel = supabase
      .channel(`sub:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, tableName, callback]);
}
