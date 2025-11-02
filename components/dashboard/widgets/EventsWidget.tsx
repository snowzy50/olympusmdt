/**
 * Widget Événements pour la page d'accueil
 * Créé par: Snowzy
 * Features: Liste scrollable, Realtime, design premium
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ChevronRight, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/services/eventsRealtimeService';
import { formatDateParis, formatTimeParis } from '@/lib/dateUtils';

interface EventsWidgetProps {
  events: Event[];
  total: number;
  agencyId: string;
  isConnected: boolean;
}

const eventTypeLabels: Record<Event['event_type'], string> = {
  operation: 'Opération',
  training: 'Formation',
  patrol: 'Patrouille',
  meeting: 'Réunion',
  ceremony: 'Cérémonie',
  other: 'Autre',
};

const eventTypeIcons: Record<Event['event_type'], string> = {
  operation: '🎯',
  training: '📚',
  patrol: '🚔',
  meeting: '📋',
  ceremony: '🎖️',
  other: '📌',
};

const statusConfig = {
  scheduled: { label: 'Planifié', color: 'bg-blue-500/20 text-blue-300' },
  in_progress: { label: 'En cours', color: 'bg-green-500/20 text-green-300' },
  completed: { label: 'Terminé', color: 'bg-gray-500/20 text-gray-300' },
  cancelled: { label: 'Annulé', color: 'bg-red-500/20 text-red-300' },
};

export function EventsWidget({ events, total, agencyId, isConnected }: EventsWidgetProps) {
  const router = useRouter();

  const handleViewAll = () => {
    router.push(`/dashboard/${agencyId}/evenements`);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/${agencyId}/evenements?event=${eventId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="h-full flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Événements à venir</h3>
              <p className="text-xs text-gray-400">Prochaines 24 heures</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">{total} total</span>
          </div>
        </div>

        <button
          onClick={handleViewAll}
          className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Calendar className="w-4 h-4" />
          Voir tous les événements
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Liste des événements */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <AnimatePresence mode="popLayout">
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <Activity className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">Aucun événement prévu</p>
              <p className="text-gray-500 text-xs mt-1">dans les prochaines 24 heures</p>
            </motion.div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => handleEventClick(event.id)}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-800/90 to-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{eventTypeIcons[event.event_type]}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                        <p className="text-xs text-gray-400">{eventTypeLabels[event.event_type]}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[event.status].color} flex-shrink-0`}>
                      {statusConfig[event.status].label}
                    </span>
                  </div>

                  {/* Date & Heure */}
                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <div className="flex items-center gap-1 text-blue-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateParis(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeParis(event.date)}</span>
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-300">
                      <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  {/* Participants */}
                  {event.participants && event.participants.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <Users className="w-3 h-3" />
                      <span>{event.participants.length} participant(s)</span>
                    </div>
                  )}
                </div>

                {/* Hover Arrow */}
                <ChevronRight className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
