/**
 * Modal de détails d'événement avec design moderne
 * Créé par: Snowzy
 * Features: Responsive, animations fluides, actions rapides
 */

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Paperclip,
  Bell,
  Edit2,
  Trash2,
  Share2,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import type { CalendarEvent } from '@/services/eventsRealtimeService';
import { formatDateParis, formatTimeParis } from '@/lib/dateUtils';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
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
  planned: { label: 'Planifié', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
  in_progress: { label: 'En cours', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
  completed: { label: 'Terminé', color: 'bg-green-500/20 text-green-300 border-green-500/50' },
  cancelled: { label: 'Annulé', color: 'bg-red-500/20 text-red-300 border-red-500/50' },
};

const priorityConfig = {
  low: { label: 'Faible', color: 'bg-gray-500/20 text-gray-300' },
  normal: { label: 'Normal', color: 'bg-blue-500/20 text-blue-300' },
  high: { label: 'Élevée', color: 'bg-orange-500/20 text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-300' },
};

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsModalProps) {
  const [copied, setCopied] = React.useState(false);

  // Fermer avec Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!event) return null;

  const categoryInfo = categoryConfig[event.category];
  const statusInfo = statusConfig[event.status];
  const priorityInfo = priorityConfig[event.priority];

  const formatDateTime = (date: string) => {
    // Utiliser le fuseau horaire de Paris
    return formatDateParis(date, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyEventLink = () => {
    navigator.clipboard.writeText(window.location.href + '#' + event.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !event) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="details-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          key="details-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
        >
              {/* Header avec gradient de catégorie */}
              <div className={`bg-gradient-to-r ${categoryInfo.color} p-6 relative`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-start gap-4">
                  <span className="text-4xl">{categoryInfo.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                        {categoryInfo.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {event.priority !== 'normal' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityInfo.color}`}>
                          🔥 {priorityInfo.label}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {event.title}
                    </h2>
                    <p className="text-sm text-white/80">ID: {event.id}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Description */}
                {event.description && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Description</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed bg-gray-800/50 p-4 rounded-lg">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Informations principales */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Date de début */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Début</span>
                    </div>
                    <p className="text-white">{formatDateTime(event.start_date)}</p>
                  </div>

                  {/* Date de fin */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Fin</span>
                    </div>
                    <p className="text-white">{formatDateTime(event.end_date)}</p>
                  </div>

                  {/* Lieu */}
                  {event.location && (
                    <div className="bg-gray-800/50 p-4 rounded-lg md:col-span-2">
                      <div className="flex items-center gap-2 mb-2 text-green-400">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">Lieu</span>
                      </div>
                      <p className="text-white">{event.location}</p>
                    </div>
                  )}
                </div>

                {/* Participants */}
                {event.participants && event.participants.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Participants ({event.participants.length})
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {event.participants.map((participant, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {participant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{participant.name}</p>
                            <p className="text-xs text-gray-400">{participant.role}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ressources */}
                {event.resources && event.resources.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Ressources</h3>
                    <div className="space-y-2">
                      {event.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                          <span className="text-white">{resource.name}</span>
                          <span className="text-gray-400 text-sm">
                            {resource.quantity} {resource.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {event.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                    <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg whitespace-pre-wrap">
                      {event.notes}
                    </p>
                  </div>
                )}

                {/* Pièces jointes */}
                {event.attachments && event.attachments.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Pièces jointes</h3>
                    </div>
                    <div className="space-y-2">
                      {event.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-blue-400" />
                          <span className="text-white flex-1">{attachment.name}</span>
                          <span className="text-xs text-gray-400">{attachment.type}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rappel */}
                {event.reminder?.enabled && (
                  <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Bell className="w-5 h-5" />
                      <span className="font-semibold">
                        Rappel activé - {event.reminder.time_before} minutes avant
                      </span>
                    </div>
                  </div>
                )}

                {/* Récurrence */}
                {event.recurrence && (
                  <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-purple-400">
                      <span className="font-semibold">
                        🔄 Événement récurrent - {event.recurrence.type} (tous les {event.recurrence.interval})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer avec actions */}
              <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyEventLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier le lien
                    </>
                  )}
                </motion.button>

                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onEdit(event);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </motion.button>
                )}

                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
                        onDelete(event);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </motion.button>
                )}
              </div>
        </motion.div>
      </div>
    </>
  );
}
