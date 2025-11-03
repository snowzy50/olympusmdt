/**
 * Hook personnalisé pour gérer les licences avec Supabase
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { License, LicenseInsert, LicenseUpdate } from '@/lib/supabase/client';

interface UseSupabaseLicensesReturn {
  licenses: License[];
  isLoading: boolean;
  error: Error | null;
  addLicense: (licenseData: LicenseInsert) => Promise<License | null>;
  updateLicense: (id: string, licenseData: LicenseUpdate) => Promise<License | null>;
  deleteLicense: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseLicenses(): UseSupabaseLicensesReturn {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fetch licenses from Supabase
  const fetchLicenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 isSupabaseConfigured:', isSupabaseConfigured);
      console.log('🔍 NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔍 VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured. Using local state only.');
        setLicenses([]);
        setIsLoading(false);
        return;
      }

      console.log('🔍 Fetching licenses from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('licenses')
        .select('*')
        .order('issue_date', { ascending: false });

      console.log('🟢 Fetch result:', { data, error: fetchError });

      if (fetchError) throw fetchError;

      setLicenses(data || []);
    } catch (err) {
      console.error('❌ Error fetching licenses:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Initial fetch
  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('licenses')
      .on<License>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'licenses' },
        (payload) => {
          setLicenses((current) => [payload.new as License, ...current]);
        }
      )
      .on<License>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'licenses' },
        (payload) => {
          const updated = payload.new as License;
          setLicenses((current) =>
            current.map((lic) => (lic.id === updated.id ? updated : lic))
          );
        }
      )
      .on<License>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'licenses' },
        (payload) => {
          const deleted = payload.old as License;
          setLicenses((current) => current.filter((lic) => lic.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Add license
  const addLicense = useCallback(async (licenseData: LicenseInsert): Promise<License | null> => {
    try {
      console.log('🔵 addLicense called with:', licenseData);
      const { data, error: insertError } = await supabase
        .from('licenses')
        .insert(licenseData)
        .select()
        .single();

      console.log('🟢 Insert result:', { data, error: insertError });

      if (insertError) throw insertError;

      // Ajouter immédiatement à la liste locale (ne pas attendre le Realtime)
      if (data) {
        console.log('✅ Adding to local state:', data);
        setLicenses((current) => [data, ...current]);
      }

      return data;
    } catch (err) {
      console.error('❌ Error adding license:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Update license
  const updateLicense = useCallback(async (id: string, licenseData: LicenseUpdate): Promise<License | null> => {
    try {
      console.log('🔵 updateLicense called for:', id, licenseData);
      const { data, error: updateError } = await supabase
        .from('licenses')
        .update(licenseData)
        .eq('id', id)
        .select()
        .single();

      console.log('🟢 Update result:', { data, error: updateError });

      if (updateError) throw updateError;

      // Mettre à jour immédiatement dans la liste locale
      if (data) {
        console.log('✅ Updating local state:', data);
        setLicenses((current) =>
          current.map((lic) => (lic.id === data.id ? data : lic))
        );
      }

      return data;
    } catch (err) {
      console.error('❌ Error updating license:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Delete license
  const deleteLicense = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 deleteLicense called for:', id);
      const { error: deleteError } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);

      console.log('🟢 Delete result:', { error: deleteError });

      if (deleteError) throw deleteError;

      // Supprimer immédiatement de la liste locale
      console.log('✅ Removing from local state:', id);
      setLicenses((current) => current.filter((lic) => lic.id !== id));

      return true;
    } catch (err) {
      console.error('❌ Error deleting license:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return {
    licenses,
    isLoading,
    error,
    addLicense,
    updateLicense,
    deleteLicense,
    refetch: fetchLicenses,
  };
}
