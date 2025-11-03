/**
 * Hook React pour gérer les propriétés avec Supabase Realtime
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, type Property, type PropertyInsert, type PropertyUpdate } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabasePropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: Error | null;
  addProperty: (property: PropertyInsert) => Promise<Property | null>;
  updateProperty: (id: string, updates: PropertyUpdate) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseProperties(): UseSupabasePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured');
        setProperties([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('properties')
      .on<Property>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'properties' },
        (payload: RealtimePostgresChangesPayload<Property>) => {
          setProperties((current) => [payload.new as Property, ...current]);
        })
      .on<Property>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'properties' },
        (payload: RealtimePostgresChangesPayload<Property>) => {
          const updated = payload.new as Property;
          setProperties((current) => current.map((p) => p.id === updated.id ? updated : p));
        })
      .on<Property>('postgres_changes', { event: 'DELETE', schema: 'public', table: 'properties' },
        (payload: RealtimePostgresChangesPayload<Property>) => {
          const deleted = payload.old as Property;
          setProperties((current) => current.filter((p) => p.id !== deleted.id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isSupabaseConfigured]);

  const addProperty = useCallback(async (data: PropertyInsert): Promise<Property | null> => {
    try {
      const { data: result, error: insertError } = await supabase
        .from('properties').insert(data).select().single();
      if (insertError) throw insertError;
      return result;
    } catch (err) {
      console.error('Error adding property:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: PropertyUpdate): Promise<Property | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('properties').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      return data;
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteProperty = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('properties').delete().eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return { properties, isLoading, error, addProperty, updateProperty, deleteProperty, refetch: fetchProperties };
}
