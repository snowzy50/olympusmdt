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
      console.log('🔍 [Certificates] Fetching...');
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
      console.log(`✅ [Certificates] Fetched ${data?.length || 0} items`);
      setCertificates(data || []);
    } catch (err) {
      console.error('❌ [Certificates] Error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    console.log('🚀 [Certificates] Initializing...');
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('certificates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, (payload) => {
        console.log('📨 [Certificates] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setCertificates((current) => {
            if (current.some((c) => c.id === payload.new.id)) return current;
            return [payload.new as Certificate, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setCertificates((current) =>
            current.map((cert) => (cert.id === payload.new.id ? (payload.new as Certificate) : cert))
          );
        } else if (payload.eventType === 'DELETE') {
          setCertificates((current) => current.filter((cert) => cert.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Certificates] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  const addCertificate = useCallback(async (data: CertificateInsert): Promise<Certificate | null> => {
    try {
      console.log('🔵 [Certificates] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('certificates').insert(data).select().single();
      if (insertError) {
        console.error('❌ [Certificates] Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });
        throw insertError;
      }
      if (result) {
        console.log('✅ [Certificates] Added:', result);
        setCertificates((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Certificates] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateCertificate = useCallback(async (id: string, updates: CertificateUpdate): Promise<Certificate | null> => {
    try {
      console.log('🔵 [Certificates] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('certificates').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Certificates] Updated:', data);
        setCertificates((current) => current.map((cert) => (cert.id === data.id ? data : cert)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Certificates] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteCertificate = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Certificates] Deleting:', id);
      const { error: deleteError } = await supabase
        .from('certificates').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Certificates] Deleted:', id);
      setCertificates((current) => current.filter((cert) => cert.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Certificates] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return { certificates, isLoading, error, addCertificate, updateCertificate, deleteCertificate, refetch: fetchCertificates };
}
