// Hook pour gérer le personnel de santé avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { MedicalStaff, MedicalStaffInsert, MedicalStaffUpdate } from '@/lib/supabase/client';

export function useSupabaseMedicalStaff() {
  const [medicalStaff, setMedicalStaff] = useState<MedicalStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedicalStaff = useCallback(async () => {
    try {
      console.log('🔍 [Medical Staff] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medical_staff')
        .select('*')
        .order('last_name', { ascending: true });

      if (fetchError) throw fetchError;
      console.log(`✅ [Medical Staff] Fetched ${data?.length || 0} items`);
      setMedicalStaff(data || []);
    } catch (err) {
      console.error('❌ [Medical Staff] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMedicalStaff = useCallback(async (data: MedicalStaffInsert): Promise<MedicalStaff | null> => {
    try {
      console.log('🔵 [Medical Staff] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('medical_staff')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [Medical Staff] Added:', result);
        setMedicalStaff((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Medical Staff] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateMedicalStaff = useCallback(async (id: string, updates: MedicalStaffUpdate): Promise<MedicalStaff | null> => {
    try {
      console.log('🔵 [Medical Staff] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('medical_staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Medical Staff] Updated:', data);
        setMedicalStaff((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Medical Staff] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteMedicalStaff = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Medical Staff] Deleting:', id);
      const { error: deleteError } = await supabase.from('medical_staff').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Medical Staff] Deleted:', id);
      setMedicalStaff((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Medical Staff] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [Medical Staff] Initializing...');
    fetchMedicalStaff();

    const channel = supabase
      .channel('medical-staff-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_staff' }, (payload) => {
        console.log('📨 [Medical Staff] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setMedicalStaff((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as MedicalStaff, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setMedicalStaff((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as MedicalStaff) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setMedicalStaff((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Medical Staff] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchMedicalStaff]);

  return { medicalStaff, loading, error, addMedicalStaff, updateMedicalStaff, deleteMedicalStaff, refetch: fetchMedicalStaff };
}
