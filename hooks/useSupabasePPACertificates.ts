// Hook pour gérer les certificats PPA (Port d'Arme) avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { PPACertificate, PPACertificateInsert, PPACertificateUpdate } from '@/lib/supabase/client';

export function useSupabasePPACertificates() {
  const [ppaCertificates, setPPACertificates] = useState<PPACertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPPACertificates = useCallback(async () => {
    try {
      console.log('🔍 [PPA Certificates] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ppa_certificates')
        .select('*')
        .order('examination_date', { ascending: false });

      if (fetchError) throw fetchError;
      console.log(`✅ [PPA Certificates] Fetched ${data?.length || 0} items`);
      setPPACertificates(data || []);
    } catch (err) {
      console.error('❌ [PPA Certificates] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPPACertificate = useCallback(async (data: PPACertificateInsert): Promise<PPACertificate | null> => {
    try {
      console.log('🔵 [PPA Certificates] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('ppa_certificates')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [PPA Certificates] Added:', result);
        setPPACertificates((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [PPA Certificates] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updatePPACertificate = useCallback(async (id: string, updates: PPACertificateUpdate): Promise<PPACertificate | null> => {
    try {
      console.log('🔵 [PPA Certificates] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('ppa_certificates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [PPA Certificates] Updated:', data);
        setPPACertificates((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [PPA Certificates] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deletePPACertificate = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [PPA Certificates] Deleting:', id);
      const { error: deleteError } = await supabase.from('ppa_certificates').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [PPA Certificates] Deleted:', id);
      setPPACertificates((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [PPA Certificates] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [PPA Certificates] Initializing...');
    fetchPPACertificates();

    const channel = supabase
      .channel('ppa-certificates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ppa_certificates' }, (payload) => {
        console.log('📨 [PPA Certificates] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setPPACertificates((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as PPACertificate, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setPPACertificates((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as PPACertificate) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setPPACertificates((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [PPA Certificates] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchPPACertificates]);

  return { ppaCertificates, loading, error, addPPACertificate, updatePPACertificate, deletePPACertificate, refetch: fetchPPACertificates };
}
