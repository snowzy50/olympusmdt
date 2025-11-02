/**
 * Composant réutilisable pour la page des événements
 * Créé par: Snowzy
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar as CalendarIcon,
  Search,
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Grid,
  List,
} from 'lucide-react';
import { InteractiveCalendar } from '@/components/events/InteractiveCalendar';
import { EventCard } from '@/components/events/EventCard';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';
import { EventForm } from '@/components/events/EventForm';
import { useEvents } from '@/hooks/useEvents';
import type { CalendarEvent } from '@/services/eventsRealtimeService';

interface EventsPageContentProps {
  agencyId: string;
  agencyName: string;
}

const AGENCY_COLORS = {
  sasp: {
    from: 'from-blue-500',
    to: 'to-blue-700',
    shadow: 'shadow-blue-500/20',
    hover: 'hover:from-blue-600 hover:to-blue-800',
  },
  samc: {
    from: 'from-red-500',
    to: 'to-red-700',
    shadow: 'shadow-red-500/20',
    hover: 'hover:from-red-600 hover:to-red-800',
  },
  safd: {
    from: 'from-orange-500',
    to: 'to-orange-700',
    shadow: 'shadow-orange-500/20',
    hover: 'hover:from-orange-600 hover:to-orange-800',
  },
  dynasty8: {
    from: 'from-purple-500',
    to: 'to-purple-700',
    shadow: 'shadow-purple-500/20',
    hover: 'hover:from-purple-600 hover:to-purple-800',
  },
  doj: {
    from: 'from-yellow-500',
    to: 'to-yellow-700',
    shadow: 'shadow-yellow-500/20',
    hover: 'hover:from-yellow-600 hover:to-yellow-800',
  },
};

export function EventsPageContent({ agencyId, agencyName }: EventsPageContentProps) {
  const {
    events,
    isLoading,
    error,
    isConnected,
    createEvent,
    updateEvent,
    deleteEvent,
    loadEvents,
    getStats,
    getUpcomingEvents,
  } = useEvents();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const colors = AGENCY_COLORS[agencyId as keyof typeof AGENCY_COLORS] || AGENCY_COLORS.sasp;
  const stats = getStats();
  const upcomingEvents = getUpcomingEvents(5);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (categoryFilter) result = result.filter((e) => e.category === categoryFilter);
    if (statusFilter) result = result.filter((e) => e.status === statusFilter);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.location?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [events, categoryFilter, statusFilter, searchQuery]);

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await deleteEvent(event.id);
      } catch (error) {
        alert('Erreur lors de la suppression de l\'événement');
      }
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setSelectedDate(undefined);
    setIsFormModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(undefined);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
    } else {
      await createEvent(eventData as Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'agency_id' | 'created_by'>);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${colors.from} ${colors.to} rounded-2xl shadow-lg ${colors.shadow}`}>
                <CalendarIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              Événements {agencyName}
            </h1>
            <p className="text-gray-400 text-lg ml-1">
              Planifiez et suivez vos événements en temps réel
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Badge de connexion */}
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-sm border ${
                isConnected
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-semibold">Temps réel actif</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-semibold">Hors ligne</span>
                </>
              )}
            </div>

            {/* Bouton création */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateEvent}
              className={`flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${colors.from} ${colors.to} ${colors.hover} text-white rounded-xl font-bold shadow-lg ${colors.shadow} transition-all duration-200`}
            >
              <Plus className="w-5 h-5" />
              <span>Créer un événement</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                <CalendarIcon className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Total</span>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium">À venir</span>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.upcoming}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium">En cours</span>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.byStatus.in_progress || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm font-medium">Terminés</span>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.byStatus.completed || 0}</p>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un événement..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes catégories</option>
                <option value="patrouille">Patrouille</option>
                <option value="formation">Formation</option>
                <option value="réunion">Réunion</option>
                <option value="opération">Opération</option>
                <option value="maintenance">Maintenance</option>
                <option value="tribunal">Tribunal</option>
                <option value="personnel">Personnel</option>
                <option value="autre">Autre</option>
              </select>

              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous statuts</option>
                <option value="planned">Planifié</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>

              <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenu */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <InteractiveCalendar
              events={filteredEvents}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onEventClick={handleViewEvent}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Prochains événements
              </h3>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      compact
                      showActions={false}
                      onView={handleViewEvent}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Aucun événement à venir
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Liste événements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Tous les événements ({filteredEvents.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 font-medium">{error.message}</p>
              <button
                onClick={() => loadEvents()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">
                {searchQuery || categoryFilter || statusFilter
                  ? 'Aucun événement ne correspond à vos critères'
                  : 'Aucun événement pour le moment'}
              </p>
              <button
                onClick={handleCreateEvent}
                className={`px-6 py-3 bg-gradient-to-r ${colors.from} ${colors.to} text-white rounded-lg font-semibold transition-all`}
              >
                Créer votre premier événement
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onView={handleViewEvent}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <EventForm
        event={editingEvent}
        initialDate={selectedDate}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
