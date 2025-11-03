// Hook pour gérer les rapports d'incident médical avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { IncidentReport, IncidentReportInsert, IncidentReportUpdate } from '@/lib/supabase/client';

export function useSupabaseIncidentReports() {
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIncidentReports = useCallback(async () => {
    try {
      console.log('🔍 [Incident Reports] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('incident_reports')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      console.log(`✅ [Incident Reports] Fetched ${data?.length || 0} items`);
      setIncidentReports(data || []);
    } catch (err) {
      console.error('❌ [Incident Reports] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addIncidentReport = useCallback(async (data: IncidentReportInsert): Promise<IncidentReport | null> => {
    try {
      console.log('🔵 [Incident Reports] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('incident_reports')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [Incident Reports] Added:', result);
        setIncidentReports((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [Incident Reports] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateIncidentReport = useCallback(async (id: string, updates: IncidentReportUpdate): Promise<IncidentReport | null> => {
    try {
      console.log('🔵 [Incident Reports] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('incident_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [Incident Reports] Updated:', data);
        setIncidentReports((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [Incident Reports] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteIncidentReport = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [Incident Reports] Deleting:', id);
      const { error: deleteError } = await supabase.from('incident_reports').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [Incident Reports] Deleted:', id);
      setIncidentReports((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [Incident Reports] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [Incident Reports] Initializing...');
    fetchIncidentReports();

    const channel = supabase
      .channel('incident-reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, (payload) => {
        console.log('📨 [Incident Reports] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setIncidentReports((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as IncidentReport, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setIncidentReports((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as IncidentReport) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setIncidentReports((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [Incident Reports] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchIncidentReports]);

  return {
    incidentReports,
    loading,
    error,
    createIncidentReport: addIncidentReport,
    updateIncidentReport,
    deleteIncidentReport,
    refetch: fetchIncidentReports
  };
}
