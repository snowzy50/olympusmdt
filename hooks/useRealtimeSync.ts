/**
 * Hooks React pour la synchronisation temps réel
 * Créé par Snowzy - 2025
 */

import { useState, useEffect, useMemo } from 'react';
import realtimeSync from '../services/realtimeSync';

type DataType = 'cases' | 'complaints' | 'summons' | 'equipment' | 'warrants' | 'agents' | 'citizens';

/**
 * Hook principal pour synchroniser un type de données
 */
export function useRealtimeSync<T = any>(type: DataType) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les données initiales
    const initialData = realtimeSync.getData(type);
    setData(initialData);
    setIsLoading(false);

    // S'abonner aux changements
    const unsubscribe = realtimeSync.subscribe(type, (payload) => {
      setData(payload.data);
    });

    return unsubscribe;
  }, [type]);

  const addItem = (item: Partial<T>) => {
    realtimeSync.addItem(type, item);
  };

  const updateItem = (id: string | number, updates: Partial<T>) => {
    realtimeSync.updateItem(type, id, updates);
  };

  const deleteItem = (id: string | number) => {
    realtimeSync.deleteItem(type, id);
  };

  return {
    data,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
  };
}

/**
 * Hook pour obtenir des statistiques globales sur tous les types de données
 */
export function useGlobalSync() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    modified: 0,
    recent: 0,
    lastSync: new Date().toISOString(),
  });

  useEffect(() => {
    const updateStats = () => {
      const types: DataType[] = ['cases', 'complaints', 'summons', 'equipment', 'warrants', 'agents', 'citizens'];

      let total = 0;
      let recent = 0;

      types.forEach(type => {
        const typeStats = realtimeSync.stats(type);
        total += typeStats.total;
        recent += typeStats.recent;
      });

      setStats({
        total,
        new: recent,
        modified: recent,
        recent,
        lastSync: new Date().toISOString(),
      });
    };

    // Mise à jour initiale
    updateStats();

    // S'abonner à tous les types
    const unsubscribes: (() => void)[] = [];
    const types: DataType[] = ['cases', 'complaints', 'summons', 'equipment', 'warrants', 'agents', 'citizens'];

    types.forEach(type => {
      const unsub = realtimeSync.subscribe(type, updateStats);
      unsubscribes.push(unsub);
    });

    // Mise à jour périodique
    const interval = setInterval(updateStats, 5000);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearInterval(interval);
    };
  }, []);

  return stats;
}

/**
 * Hook pour s'abonner aux changements d'un type sans gérer l'état
 */
export function useRealtimeSubscription(
  type: DataType,
  callback: (data: any[]) => void
) {
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe(type, (payload) => {
      callback(payload.data);
    });

    return unsubscribe;
  }, [type, callback]);
}
