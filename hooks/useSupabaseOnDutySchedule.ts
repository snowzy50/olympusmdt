// Hook pour gérer le planning des gardes avec Supabase Realtime
// Créé par Snowzy

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { OnDutySchedule, OnDutyScheduleInsert, OnDutyScheduleUpdate } from '@/lib/supabase/client';

export function useSupabaseOnDutySchedule() {
  const [schedules, setSchedules] = useState<OnDutySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      console.log('🔍 [On Duty Schedule] Fetching...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('on_duty_schedule')
        .select('*')
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      console.log(`✅ [On Duty Schedule] Fetched ${data?.length || 0} items`);
      setSchedules(data || []);
    } catch (err) {
      console.error('❌ [On Duty Schedule] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSchedule = useCallback(async (data: OnDutyScheduleInsert): Promise<OnDutySchedule | null> => {
    try {
      console.log('🔵 [On Duty Schedule] Adding:', data);
      const { data: result, error: insertError } = await supabase
        .from('on_duty_schedule')
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      if (result) {
        console.log('✅ [On Duty Schedule] Added:', result);
        setSchedules((current) => [result, ...current]);
      }
      return result;
    } catch (err) {
      console.error('❌ [On Duty Schedule] Error adding:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: OnDutyScheduleUpdate): Promise<OnDutySchedule | null> => {
    try {
      console.log('🔵 [On Duty Schedule] Updating:', { id, updates });
      const { data, error: updateError } = await supabase
        .from('on_duty_schedule')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        console.log('✅ [On Duty Schedule] Updated:', data);
        setSchedules((current) => current.map((item) => (item.id === data.id ? data : item)));
      }
      return data;
    } catch (err) {
      console.error('❌ [On Duty Schedule] Error updating:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🔵 [On Duty Schedule] Deleting:', id);
      const { error: deleteError } = await supabase.from('on_duty_schedule').delete().eq('id', id);
      if (deleteError) throw deleteError;
      console.log('✅ [On Duty Schedule] Deleted:', id);
      setSchedules((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('❌ [On Duty Schedule] Error deleting:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 [On Duty Schedule] Initializing...');
    fetchSchedules();

    const channel = supabase
      .channel('on-duty-schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'on_duty_schedule' }, (payload) => {
        console.log('📨 [On Duty Schedule] Realtime:', payload);
        if (payload.eventType === 'INSERT') {
          setSchedules((current) => {
            if (current.some((i) => i.id === payload.new.id)) return current;
            return [payload.new as OnDutySchedule, ...current];
          });
        } else if (payload.eventType === 'UPDATE') {
          setSchedules((current) =>
            current.map((item) => (item.id === payload.new.id ? (payload.new as OnDutySchedule) : item))
          );
        } else if (payload.eventType === 'DELETE') {
          setSchedules((current) => current.filter((item) => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 [On Duty Schedule] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [fetchSchedules]);

  return { schedules, loading, error, addSchedule, updateSchedule, deleteSchedule, refetch: fetchSchedules };
}
