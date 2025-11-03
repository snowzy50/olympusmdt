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
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('medical_records')
      .on<MedicalRecord>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'medical_records' },
        (payload: RealtimePostgresChangesPayload<MedicalRecord>) => {
          setRecords((current) => [payload.new as MedicalRecord, ...current]);
        })
      .on<MedicalRecord>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'medical_records' },
        (payload: RealtimePostgresChangesPayload<MedicalRecord>) => {
          const updated = payload.new as MedicalRecord;
          setRecords((current) => current.map((r) => r.id === updated.id ? updated : r));
        })
      .on<MedicalRecord>('postgres_changes', { event: 'DELETE', schema: 'public', table: 'medical_records' },
        (payload: RealtimePostgresChangesPayload<MedicalRecord>) => {
          const deleted = payload.old as MedicalRecord;
          setRecords((current) => current.filter((r) => r.id !== deleted.id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isSupabaseConfigured]);

  const addRecord = useCallback(async (data: MedicalRecordInsert): Promise<MedicalRecord | null> => {
    try {
      const { data: result, error: insertError } = await supabase
        .from('medical_records').insert(data).select().single();
      if (insertError) throw insertError;
      return result;
    } catch (err) {
      console.error('Error adding medical record:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateRecord = useCallback(async (id: string, updates: MedicalRecordUpdate): Promise<MedicalRecord | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('medical_records').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      return data;
    } catch (err) {
      console.error('Error updating medical record:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('medical_records').delete().eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting medical record:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return { records, isLoading, error, addRecord, updateRecord, deleteRecord, refetch: fetchRecords };
}
