/**
 * Hook React pour la gestion des événements avec Realtime
 * Créé par: Snowzy
 * Synchronisation en temps réel avec Supabase
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { eventsRealtimeService, type CalendarEvent } from '@/services/eventsRealtimeService';

interface UseEventsOptions {
  autoConnect?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  agencyId?: string; // Option pour override l'agence depuis l'URL
}

/**
 * Extrait l'ID de l'agence depuis le pathname
 * Ex: /dashboard/samc/events -> 'samc'
 */
function getAgencyFromPath(pathname: string): string | null {
  const match = pathname.match(/\/dashboard\/([^/]+)/);
  return match ? match[1] : null;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { autoConnect = true, dateRange, agencyId: agencyIdOverride } = options;
  const pathname = usePathname();
  const agencyId = agencyIdOverride || getAgencyFromPath(pathname);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionIdRef = useRef<string>(`events-${Date.now()}`);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Charger les événements depuis Supabase
   */
  const loadEvents = useCallback(async () => {
    if (!agencyId) return;

    setIsLoading(true);
    setError(null);

    try {
      let fetchedEvents: CalendarEvent[];

      if (dateRange) {
        fetchedEvents = await eventsRealtimeService.getEventsByDateRange(
          agencyId,
          dateRange.start,
          dateRange.end
        );
      } else {
        fetchedEvents = await eventsRealtimeService.getEvents(agencyId);
      }

      setEvents(fetchedEvents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement des événements');
      setError(error);
      console.error('[useEvents] Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, [agencyId, dateRange]);

  /**
   * Créer un nouvel événement
   */
  const createEvent = useCallback(
    async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'agency_id' | 'created_by'>) => {
      if (!agencyId) {
        throw new Error('Aucune agence sélectionnée');
      }

      try {
        const newEvent = await eventsRealtimeService.createEvent({
          ...eventData,
          id: eventsRealtimeService.generateEventId(),
          agency_id: agencyId,
          created_by: 'current-user', // TODO: Remplacer par l'ID utilisateur réel
        });

        return newEvent;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur lors de la création de l\'événement');
        setError(error);
        throw error;
      }
    },
    [agencyId]
  );

  /**
   * Mettre à jour un événement
   */
  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await eventsRealtimeService.updateEvent(id, updates);
      return updatedEvent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la mise à jour de l\'événement');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Supprimer un événement
   */
  const deleteEvent = useCallback(async (id: string) => {
    try {
      await eventsRealtimeService.deleteEvent(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors de la suppression de l\'événement');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Filtrer les événements par catégorie
   */
  const filterByCategory = useCallback(
    (category: CalendarEvent['category']) => {
      return events.filter((event) => event.category === category);
    },
    [events]
  );

  /**
   * Filtrer les événements par statut
   */
  const filterByStatus = useCallback(
    (status: CalendarEvent['status']) => {
      return events.filter((event) => event.status === status);
    },
    [events]
  );

  /**
   * Obtenir les événements d'une date spécifique
   */
  const getEventsByDate = useCallback(
    (date: string) => {
      return events.filter((event) => {
        const eventDate = new Date(event.start_date).toDateString();
        const targetDate = new Date(date).toDateString();
        return eventDate === targetDate;
      });
    },
    [events]
  );

  /**
   * Obtenir les événements à venir
   */
  const getUpcomingEvents = useCallback(
    (limit?: number) => {
      const now = new Date().toISOString();
      const upcoming = events
        .filter((event) => event.start_date > now && event.status !== 'cancelled')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    [events]
  );

  /**
   * Effet pour initialiser la connexion Realtime
   */
  useEffect(() => {
    if (!agencyId || !autoConnect) return;

    const initRealtime = async () => {
      try {
        // Se connecter au canal Realtime
        await eventsRealtimeService.connect(agencyId);

        // S'abonner aux changements
        const unsubscribe = eventsRealtimeService.subscribe(subscriptionIdRef.current, {
          onInsert: (newEvent) => {
            console.log('[useEvents] Nouvel événement reçu:', newEvent);
            setEvents((prev) => {
              // Éviter les doublons
              if (prev.some((e) => e.id === newEvent.id)) {
                return prev;
              }
              return [...prev, newEvent].sort(
                (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
              );
            });
          },
          onUpdate: (updatedEvent) => {
            console.log('[useEvents] Événement mis à jour:', updatedEvent);
            setEvents((prev) =>
              prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
            );
          },
          onDelete: (eventId) => {
            console.log('[useEvents] Événement supprimé:', eventId);
            setEvents((prev) => prev.filter((event) => event.id !== eventId));
          },
          onError: (err) => {
            console.error('[useEvents] Erreur Realtime:', err);
            setError(err);
            setIsConnected(false);
          },
          onConnected: () => {
            console.log('[useEvents] ✅ Connexion Realtime établie');
            setIsConnected(true);
          },
        });

        unsubscribeRef.current = unsubscribe;

        // Charger les événements initiaux
        await loadEvents();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur de connexion Realtime');
        setError(error);
        setIsConnected(false);
      }
    };

    initRealtime();

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [agencyId, autoConnect, loadEvents]);

  /**
   * Obtenir les statistiques des événements
   */
  const getStats = useCallback(() => {
    const total = events.length;
    const byCategory = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byStatus = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const upcoming = getUpcomingEvents().length;

    return { total, byCategory, byStatus, upcoming };
  }, [events, getUpcomingEvents]);

  return {
    // État
    events,
    isLoading,
    error,
    isConnected,

    // Actions CRUD
    createEvent,
    updateEvent,
    deleteEvent,
    loadEvents,

    // Filtres et recherche
    filterByCategory,
    filterByStatus,
    getEventsByDate,
    getUpcomingEvents,
    getStats,
  };
}
