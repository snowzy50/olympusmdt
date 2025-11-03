// Hook pour gérer les certificats de décès avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { DeathCertificate, DeathCertificateInsert, DeathCertificateUpdate } from '@/lib/supabase/client';

export function useSupabaseDeathCertificates() {
  const [deathCertificates, setDeathCertificates] = useState<DeathCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeathCertificates = useCallback(async () => {
    try {
      console.log('🔍 [Death Certificates] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('death_certificates')
        .select('*')
        .order('date_of_death', { ascending: false });

      if (fetchError) throw fetchError;
      console.log(`✅ [Death Certificates] Fetched ${data?.length || 0} items`);
      setDeathCertificates(data || []);
    } catch (err) {
      console.error('❌ [Death Certificates] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeathCertificate = useCallback(async (data: DeathCertificateInsert): Promise<DeathCertificate | null> => {
    try {
      console.log('🔵 [Death Certificates] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('death_certificates')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [Death Certificates] Added:', result);
        setDeathCertificates((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Death Certificates] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateDeathCertificate = useCallback(async (id: string, updates: DeathCertificateUpdate): Promise<DeathCertificate | null> => {
    try {
      console.log('🔵 [Death Certificates] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('death_certificates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Death Certificates] Updated:', data);
        setDeathCertificates((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Death Certificates] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteDeathCertificate = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Death Certificates] Deleting:', id);
      const { error: deleteError } = await supabase.from('death_certificates').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Death Certificates] Deleted:', id);
      setDeathCertificates((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Death Certificates] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [Death Certificates] Initializing...');
    fetchDeathCertificates();

    const channel = supabase
      .channel('death-certificates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'death_certificates' }, (payload) => {
        console.log('📨 [Death Certificates] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setDeathCertificates((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as DeathCertificate, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setDeathCertificates((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as DeathCertificate) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setDeathCertificates((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Death Certificates] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchDeathCertificates]);

  return { deathCertificates, loading, error, addDeathCertificate, updateDeathCertificate, deleteDeathCertificate, refetch: fetchDeathCertificates };
}
