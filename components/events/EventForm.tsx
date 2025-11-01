/**
 * Formulaire interactif de création/édition d'événements
 * Créé par: Snowzy
 * Features: Validation temps réel, animations, UX optimisée mobile
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Bell,
  Repeat,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { CalendarEvent } from '@/services/eventsRealtimeService';

interface EventFormProps {
  event?: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<CalendarEvent>) => Promise<void>;
}

const categories = [
  { value: 'patrouille', label: 'Patrouille', icon: '🚔' },
  { value: 'formation', label: 'Formation', icon: '📚' },
  { value: 'réunion', label: 'Réunion', icon: '👥' },
  { value: 'opération', label: 'Opération', icon: '⚡' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'tribunal', label: 'Tribunal', icon: '⚖️' },
  { value: 'personnel', label: 'Personnel', icon: '👤' },
  { value: 'autre', label: 'Autre', icon: '📌' },
];

const priorities = [
  { value: 'low', label: 'Faible', color: 'text-gray-400' },
  { value: 'normal', label: 'Normal', color: 'text-blue-400' },
  { value: 'high', label: 'Élevée', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
];

const statuses = [
  { value: 'planned', label: 'Planifié' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

export function EventForm({ event, isOpen, onClose, onSubmit }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
    end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    category: event?.category || 'patrouille',
    priority: event?.priority || 'normal',
    status: event?.status || 'planned',
    location: event?.location || '',
    all_day: event?.all_day || false,
    notes: event?.notes || '',
    reminder_enabled: event?.reminder?.enabled || false,
    reminder_time: event?.reminder?.time_before || 30,
  });

  const [participants, setParticipants] = useState<Array<{ id: string; name: string; role: string }>>(
    event?.participants || []
  );

  const [newParticipant, setNewParticipant] = useState({ name: '', role: '' });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addParticipant = () => {
    if (newParticipant.name && newParticipant.role) {
      setParticipants([...participants, { ...newParticipant, id: Date.now().toString() }]);
      setNewParticipant({ name: '', role: '' });
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventData: Partial<CalendarEvent> = {
        title: formData.title,
        description: formData.description || undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        category: formData.category as CalendarEvent['category'],
        priority: formData.priority as CalendarEvent['priority'],
        status: formData.status as CalendarEvent['status'],
        location: formData.location || undefined,
        all_day: formData.all_day,
        notes: formData.notes || undefined,
        participants: participants.length > 0 ? participants : undefined,
        reminder: formData.reminder_enabled
          ? { enabled: true, time_before: formData.reminder_time }
          : undefined,
      };

      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la sauvegarde de l\'événement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white">
              {event ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {event ? 'Modifiez les détails de l\'événement' : 'Créez un nouvel événement pour votre agence'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Patrouille de nuit"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Catégorie et Priorité */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Catégorie *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Priorité</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date et heure de début *
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Date et heure de fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Journée entière */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="all_day"
                  id="all_day"
                  checked={formData.all_day}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="all_day" className="text-sm text-white">
                  Événement sur toute la journée
                </label>
              </div>

              {/* Lieu et Statut */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lieu
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Commissariat central"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez l'événement..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  Participants
                </label>

                <div className="space-y-2 mb-3">
                  {participants.map((participant) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{participant.name}</p>
                        <p className="text-xs text-gray-400">{participant.role}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant.id)}
                        className="p-2 hover:bg-red-600/20 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    placeholder="Nom"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    value={newParticipant.role}
                    onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
                    placeholder="Rôle"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rappel */}
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    name="reminder_enabled"
                    id="reminder_enabled"
                    checked={formData.reminder_enabled}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="reminder_enabled" className="text-sm font-semibold text-white">
                    <Bell className="w-4 h-4 inline mr-1" />
                    Activer un rappel
                  </label>
                </div>

                {formData.reminder_enabled && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Minutes avant l'événement</label>
                    <input
                      type="number"
                      name="reminder_time"
                      value={formData.reminder_time}
                      onChange={handleChange}
                      min="5"
                      step="5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Notes supplémentaires..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 bg-gray-800/50 border-t border-gray-700 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
