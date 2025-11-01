/**
 * Carte d'événement moderne et interactive
 * Créé par: Snowzy
 * Design: Glassmorphism avec animations et interactions tactiles
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import type { CalendarEvent } from '@/services/eventsRealtimeService';

interface EventCardProps {
  event: CalendarEvent;
  onView?: (event: CalendarEvent) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

const categoryConfig = {
  patrouille: { color: 'from-blue-600 to-blue-700', icon: '🚔', label: 'Patrouille' },
  formation: { color: 'from-purple-600 to-purple-700', icon: '📚', label: 'Formation' },
  réunion: { color: 'from-green-600 to-green-700', icon: '👥', label: 'Réunion' },
  opération: { color: 'from-red-600 to-red-700', icon: '⚡', label: 'Opération' },
  maintenance: { color: 'from-orange-600 to-orange-700', icon: '🔧', label: 'Maintenance' },
  tribunal: { color: 'from-yellow-600 to-yellow-700', icon: '⚖️', label: 'Tribunal' },
  personnel: { color: 'from-pink-600 to-pink-700', icon: '👤', label: 'Personnel' },
  autre: { color: 'from-gray-600 to-gray-700', icon: '📌', label: 'Autre' },
};

const statusConfig = {
  planned: { label: 'Planifié', color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: Calendar },
  in_progress: { label: 'En cours', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: Loader2 },
  completed: { label: 'Terminé', color: 'text-green-400', bgColor: 'bg-green-500/10', icon: CheckCircle2 },
  cancelled: { label: 'Annulé', color: 'text-red-400', bgColor: 'bg-red-500/10', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Faible', color: 'border-l-gray-400', badge: 'bg-gray-500/20 text-gray-300' },
  normal: { label: 'Normal', color: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-300' },
  high: { label: 'Élevée', color: 'border-l-orange-500', badge: 'bg-orange-500/20 text-orange-300' },
  urgent: { label: 'Urgent', color: 'border-l-red-600', badge: 'bg-red-500/20 text-red-300' },
};

export function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
  compact = false,
  showActions = true,
  className = '',
}: EventCardProps) {
  const categoryInfo = categoryConfig[event.category];
  const statusInfo = statusConfig[event.status];
  const priorityInfo = priorityConfig[event.priority];
  const StatusIcon = statusInfo.icon;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = new Date(event.start_date) > new Date();
  const isPast = new Date(event.end_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm
        rounded-xl border-l-4 ${priorityInfo.color} border-t border-r border-b border-gray-700
        overflow-hidden transition-all duration-300
        hover:shadow-2xl hover:shadow-blue-500/10
        ${className}
      `}
    >
      {/* Badge catégorie flottant */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r ${categoryInfo.color} text-white text-xs font-semibold shadow-lg flex items-center gap-1.5`}>
        <span>{categoryInfo.icon}</span>
        <span>{categoryInfo.label}</span>
      </div>

      <div className="p-4 md:p-5">
        {/* Header avec titre et statut */}
        <div className="mb-3">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-lg md:text-xl font-bold text-white flex-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
              {event.title}
            </h3>
          </div>

          {/* Statut et priorité */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${event.status === 'in_progress' ? 'animate-spin' : ''}`} />
              {statusInfo.label}
            </span>
            {event.priority !== 'normal' && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityInfo.badge}`}>
                {priorityInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {!compact && event.description && (
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Informations principales */}
        <div className="space-y-2 mb-4">
          {/* Date et heure */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-gray-300">
              {formatDate(event.start_date)}
              {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
            </span>
          </div>

          {!event.all_day && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-gray-300">
                {formatTime(event.start_date)} - {formatTime(event.end_date)}
              </span>
            </div>
          )}

          {/* Lieu */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300 truncate">{event.location}</span>
            </div>
          )}

          {/* Participants */}
          {!compact && event.participants && event.participants.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className="text-gray-300">
                {event.participants.length} participant{event.participants.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Badges additionnels */}
        {!compact && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {isUpcoming && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                À venir
              </span>
            )}
            {isPast && event.status !== 'completed' && event.status !== 'cancelled' && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                En retard
              </span>
            )}
            {event.recurrence && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                🔄 Récurrent
              </span>
            )}
            {event.reminder?.enabled && (
              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded text-xs font-medium">
                🔔 Rappel
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView?.(event)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Voir
            </motion.button>
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(event)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(event)}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Animation de bordure au survol */}
      <motion.div
        className={`absolute inset-0 border-2 border-blue-500/0 rounded-xl pointer-events-none`}
        whileHover={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
