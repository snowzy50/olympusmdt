// Hook pour gérer les prescriptions médicales avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Prescription, PrescriptionInsert, PrescriptionUpdate } from '@/lib/supabase/client';

export function useSupabasePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      console.log('🔍 [Prescriptions] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('prescriptions')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      console.log(`✅ [Prescriptions] Fetched ${data?.length || 0} items`);
      setPrescriptions(data || []);
    } catch (err) {
      console.error('❌ [Prescriptions] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPrescription = useCallback(async (data: PrescriptionInsert): Promise<Prescription | null> => {
    try {
      console.log('🔵 [Prescriptions] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('prescriptions')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [Prescriptions] Added:', result);
        setPrescriptions((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Prescriptions] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updatePrescription = useCallback(async (id: string, updates: PrescriptionUpdate): Promise<Prescription | null> => {
    try {
      console.log('🔵 [Prescriptions] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Prescriptions] Updated:', data);
        setPrescriptions((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Prescriptions] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deletePrescription = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Prescriptions] Deleting:', id);
      const { error: deleteError } = await supabase.from('prescriptions').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Prescriptions] Deleted:', id);
      setPrescriptions((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Prescriptions] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [Prescriptions] Initializing...');
    fetchPrescriptions();

    const channel = supabase
      .channel('prescriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, (payload) => {
        console.log('📨 [Prescriptions] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setPrescriptions((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as Prescription, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPrescriptions((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as Prescription) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setPrescriptions((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Prescriptions] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchPrescriptions]);

  return { prescriptions, loading, error, addPrescription, updatePrescription, deletePrescription, refetch: fetchPrescriptions };
}
