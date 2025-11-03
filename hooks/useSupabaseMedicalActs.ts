// Hook pour gérer les actes médicaux avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { MedicalAct, MedicalActInsert, MedicalActUpdate } from '@/lib/supabase/client';

export function useSupabaseMedicalActs() {
  const [medicalActs, setMedicalActs] = useState<MedicalAct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedicalActs = useCallback(async () => {
    try {
      console.log('🔍 [Medical Acts] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medical_acts')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      console.log(`✅ [Medical Acts] Fetched ${data?.length || 0} items`);
      setMedicalActs(data || []);
    } catch (err) {
      console.error('❌ [Medical Acts] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMedicalAct = useCallback(async (data: MedicalActInsert): Promise<MedicalAct | null> => {
    try {
      console.log('🔵 [Medical Acts] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('medical_acts')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [Medical Acts] Added:', result);
        setMedicalActs((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Medical Acts] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateMedicalAct = useCallback(async (id: string, updates: MedicalActUpdate): Promise<MedicalAct | null> => {
    try {
      console.log('🔵 [Medical Acts] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('medical_acts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Medical Acts] Updated:', data);
        setMedicalActs((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Medical Acts] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteMedicalAct = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Medical Acts] Deleting:', id);
      const { error: deleteError } = await supabase.from('medical_acts').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Medical Acts] Deleted:', id);
      setMedicalActs((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Medical Acts] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [Medical Acts] Initializing...');
    fetchMedicalActs();

    const channel = supabase
      .channel('medical-acts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_acts' }, (payload) => {
        console.log('📨 [Medical Acts] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setMedicalActs((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as MedicalAct, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setMedicalActs((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as MedicalAct) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setMedicalActs((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Medical Acts] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchMedicalActs]);

  return { medicalActs, loading, error, createMedicalAct: addMedicalAct, updateMedicalAct, deleteMedicalAct, refetch: fetchMedicalActs };
}
