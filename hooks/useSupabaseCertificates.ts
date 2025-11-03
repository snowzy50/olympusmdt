/**
 * Hook React pour gérer les certificats avec Supabase Realtime
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, type Certificate, type CertificateInsert, type CertificateUpdate } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabaseCertificatesReturn {
  certificates: Certificate[];
  isLoading: boolean;
  error: Error | null;
  addCertificate: (certificate: CertificateInsert) => Promise<Certificate | null>;
  updateCertificate: (id: string, updates: CertificateUpdate) => Promise<Certificate | null>;
  deleteCertificate: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseCertificates(): UseSupabaseCertificatesReturn {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured');
        setCertificates([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setCertificates(data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('certificates')
      .on<Certificate>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'certificates' },
        (payload: RealtimePostgresChangesPayload<Certificate>) => {
          setCertificates((current) => [payload.new as Certificate, ...current]);
        })
      .on<Certificate>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'certificates' },
        (payload: RealtimePostgresChangesPayload<Certificate>) => {
          const updated = payload.new as Certificate;
          setCertificates((current) => current.map((c) => c.id === updated.id ? updated : c));
        })
      .on<Certificate>('postgres_changes', { event: 'DELETE', schema: 'public', table: 'certificates' },
        (payload: RealtimePostgresChangesPayload<Certificate>) => {
          const deleted = payload.old as Certificate;
          setCertificates((current) => current.filter((c) => c.id !== deleted.id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isSupabaseConfigured]);

  const addCertificate = useCallback(async (data: CertificateInsert): Promise<Certificate | null> => {
    try {
      const { data: result, error: insertError } = await supabase
        .from('certificates').insert(data).select().single();
      if (insertError) throw insertError;
      return result;
    } catch (err) {
      console.error('Error adding certificate:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateCertificate = useCallback(async (id: string, updates: CertificateUpdate): Promise<Certificate | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('certificates').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      return data;
    } catch (err) {
      console.error('Error updating certificate:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteCertificate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('certificates').delete().eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return { certificates, isLoading, error, addCertificate, updateCertificate, deleteCertificate, refetch: fetchCertificates };
}
