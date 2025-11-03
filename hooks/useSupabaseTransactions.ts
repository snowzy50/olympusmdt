/**
 * Hook React pour gérer les transactions avec Supabase Realtime
 * Créé par Snowzy
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, type Transaction, type TransactionInsert, type TransactionUpdate } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseSupabaseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  addTransaction: (transaction: TransactionInsert) => Promise<Transaction | null>;
  updateTransaction: (id: string, updates: TransactionUpdate) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useSupabaseTransactions(): UseSupabaseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase not configured');
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('transactions')
      .on<Transaction>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload: RealtimePostgresChangesPayload<Transaction>) => {
          setTransactions((current) => [payload.new as Transaction, ...current]);
        })
      .on<Transaction>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions' },
        (payload: RealtimePostgresChangesPayload<Transaction>) => {
          const updated = payload.new as Transaction;
          setTransactions((current) => current.map((t) => t.id === updated.id ? updated : t));
        })
      .on<Transaction>('postgres_changes', { event: 'DELETE', schema: 'public', table: 'transactions' },
        (payload: RealtimePostgresChangesPayload<Transaction>) => {
          const deleted = payload.old as Transaction;
          setTransactions((current) => current.filter((t) => t.id !== deleted.id));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isSupabaseConfigured]);

  const addTransaction = useCallback(async (data: TransactionInsert): Promise<Transaction | null> => {
    try {
      const { data: result, error: insertError } = await supabase
        .from('transactions').insert(data).select().single();
      if (insertError) throw insertError;
      return result;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: TransactionUpdate): Promise<Transaction | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('transactions').update(updates).eq('id', id).select().single();
      if (updateError) throw updateError;
      return data;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('transactions').delete().eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  return { transactions, isLoading, error, addTransaction, updateTransaction, deleteTransaction, refetch: fetchTransactions };
}
