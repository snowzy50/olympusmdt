/**
 * Hook React pour gérer les dossiers médicaux avec Supabase Realtime
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, type MedicalRecord, type MedicalRecordInsert, type MedicalRecordUpdate } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabaseMedicalRecordsReturn {
  records: MedicalRecord[];
  isLoading: boolean;
  error: Error | null;
  addRecord: (record: MedicalRecordInsert) => Promise<MedicalRecord | null>;
  updateRecord: (id: string, updates: MedicalRecordUpdate) => Promise<MedicalRecord | null>;
  deleteRecord: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseMedicalRecords(): UseSupabaseMedicalRecordsReturn {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchRecords = useCallback(async () => {
    try {
      console.log('🔍 [Medical Records] Fetching...');
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured');
        setRecords([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('medical_records')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      console.log(`✅ [Medical Records] Fetched ${data?.length || 0} items`);
      setRecords(data || []);
    } catch (err) {
      console.error('❌ [Medical Records] Error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    console.log('🚀 [Medical Records] Initializing...');
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('medical-records-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_records' }, (payload) => {
        console.log('📨 [Medical Records] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setRecords((current) => {
            if (current.some((r) => r.id === payload.new.id)) return current;
            return [payload.new as MedicalRecord, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setRecords((current) =>
            current.map((record) => (record.id === payload.new.id ? (payload.new as MedicalRecord) : record))
          );
        } else if (payload.eventType === 'DELETE') {
          setRecords((current) => current.filter((record) => record.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Medical Records] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  const addRecord = useCallback(async (data: MedicalRecordInsert): Promise<MedicalRecord | null> => {
    try {
      console.log('🔵 [Medical Records] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('medical_records').insert(data).select().single();
      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [Medical Records] Added:', result);
        setRecords((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Medical Records] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateRecord = useCallback(async (id: string, updates: MedicalRecordUpdate): Promise<MedicalRecord | null> => {
    try {
      console.log('🔵 [Medical Records] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('medical_records').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Medical Records] Updated:', data);
        setRecords((current) => current.map((record) => (record.id === data.id ? data : record)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Medical Records] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Medical Records] Deleting:', id);
      const { error: deleteError } = await supabase
        .from('medical_records').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Medical Records] Deleted:', id);
      setRecords((current) => current.filter((record) => record.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Medical Records] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return { records, isLoading, error, addRecord, updateRecord, deleteRecord, refetch: fetchRecords };
}
