/**
 * Hook personnalisé pour gérer les rapports avec Supabase
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Report, ReportInsert, ReportUpdate } from '@/lib/supabase/client';

interface UseSupabaseReportsReturn {
  reports: Report[];
  isLoading: boolean;
  error: Error | null;
  addReport: (reportData: ReportInsert) => Promise<Report | null>;
  updateReport: (id: string, reportData: ReportUpdate) => Promise<Report | null>;
  deleteReport: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseReports(): UseSupabaseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if Supabase is configured
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fetch reports from Supabase
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured. Using local state only.');
        setReports([]);
        setIsLoading(false);
        return;
      }

      console.log('🔍 [Reports] Fetching from Supabase...');
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('date', { ascending: false });

      console.log('🟢 [Reports] Fetch result:', { count: data?.length, error: fetchError });

      if (fetchError) throw fetchError;

      setReports(data || []);
    } catch (err) {
      console.error('❌ [Reports] Error fetching:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('reports')
      .on<Report>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          setReports((current) => [payload.new as Report, ...current]);
        }
      )
      .on<Report>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reports' },
        (payload) => {
          const updated = payload.new as Report;
          setReports((current) =>
            current.map((rep) => (rep.id === updated.id ? updated : rep))
          );
        }
      )
      .on<Report>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reports' },
        (payload) => {
          const deleted = payload.old as Report;
          setReports((current) => current.filter((rep) => rep.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Add report
  const addReport = useCallback(async (reportData: ReportInsert): Promise<Report | null> => {
    try {
      console.log('🔵 [Reports] addReport called with:', reportData);
      const { data, error: insertError } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      console.log('🟢 [Reports] Insert result:', { data, error: insertError });

      if (insertError) throw insertError;

      // Ajouter immédiatement à la liste locale
      if (data) {
        console.log('✅ [Reports] Adding to local state:', data);
        setReports((current) => [data, ...current]);
      }

      return data;
    } catch (err) {
      console.error('❌ [Reports] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Update report
  const updateReport = useCallback(async (id: string, reportData: ReportUpdate): Promise<Report | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('reports')
        .update(reportData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour immédiatement dans la liste locale
      if (data) {
        setReports((current) =>
          current.map((rep) => (rep.id === data.id ? data : rep))
        );
      }

      return data;
    } catch (err) {
      console.error('Error updating report:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Delete report
  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Supprimer immédiatement de la liste locale
      setReports((current) => current.filter((rep) => rep.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return {
    reports,
    isLoading,
    error,
    addReport,
    updateReport,
    deleteReport,
    refetch: fetchReports,
  };
}
