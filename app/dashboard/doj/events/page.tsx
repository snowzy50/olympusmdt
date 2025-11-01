'use client';

import { useState, useMemo } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Modal } from '@/components/ui/Modal';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Filter,
  Search,
  Eye,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: 'patrol' | 'training' | 'meeting' | 'operation' | 'maintenance' | 'court' | 'personal' | 'other';
  location?: string;
  attendees?: string[];
  createdBy: string;
  color?: string;
  isAllDay?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'month' | 'week' | 'day';

const CATEGORY_CONFIG = {
  patrol: { label: 'Patrouille', color: 'bg-blue-600', textColor: 'text-blue-100' },
  training: { label: 'Formation', color: 'bg-green-600', textColor: 'text-green-100' },
  meeting: { label: 'Réunion', color: 'bg-purple-600', textColor: 'text-purple-100' },
  operation: { label: 'Opération', color: 'bg-red-600', textColor: 'text-red-100' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-600', textColor: 'text-yellow-100' },
  court: { label: 'Tribunal', color: 'bg-indigo-600', textColor: 'text-indigo-100' },
  personal: { label: 'Personnel', color: 'bg-pink-600', textColor: 'text-pink-100' },
  other: { label: 'Autre', color: 'bg-gray-600', textColor: 'text-gray-100' },
};

export default function EventsPage() {
  const { data: events, addItem, updateItem, deleteItem } = useRealtimeSync<CalendarEvent>('events');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données de test initiales - DOJ
  useMemo(() => {
    if (events.length === 0) {
      const testEvents: Partial<CalendarEvent>[] = [
        {
          title: "Briefing Matinal",
          description: "Réunion quotidienne de l'équipe pour coordination",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: "08:00",
          endTime: "08:30",
          category: "meeting",
          location: "Salle de briefing",
          attendees: ["Tous les agents"],
          createdBy: "Capitaine Johnson",
        },
        {
          title: "Formation Tir",
          description: "Entraînement au stand de tir - Recyclage annuel",
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: "14:00",
          endTime: "17:00",
          category: "training",
          location: "Stand de tir SASP",
          attendees: ["Unité A", "Unité B"],
          createdBy: "Sergent Martinez",
        },
        {
          title: "Opération Surveillance",
          description: "Mission de surveillance discrète secteur Grove Street",
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: "22:00",
          endTime: "02:00",
          category: "operation",
          location: "Grove Street, Davis",
          attendees: ["Équipe SWAT Alpha"],
          createdBy: "Lieutenant Davis",
        },
        {
          title: "Maintenance Flotte",
          description: "Révision mensuelle des véhicules de patrouille",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: "09:00",
          endTime: "16:00",
          category: "maintenance",
          location: "Garage central",
          createdBy: "Chef mécanicien",
          isAllDay: true,
        },
      ];

      testEvents.forEach(e => addItem(e));
    }
  }, []);

  // Filtrage des événements
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesSearch = !searchTerm ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [events, categoryFilter, searchTerm]);

  // Obtenir les événements pour une date donnée
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => {
      return event.startDate <= dateStr && event.endDate >= dateStr;
    });
  };

  // Navigation du calendrier
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtenir le nom du mois
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Générer les jours du mois
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Jours du mois précédent
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Calendrier des Événements</h1>
                <p className="text-gray-400">Planification collaborative de l&apos;agence</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvel Événement
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Navigation date */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Aujourd&apos;hui
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
              <h2 className="text-xl font-bold text-white ml-4 capitalize">
                {getMonthName(currentDate)}
              </h2>
            </div>

            <div className="flex-1" />

            {/* View mode (désactivé pour v1) */}
            {/* <div className="flex gap-2">
              {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div> */}

            {/* Filtres */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Toutes catégories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Légende */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-700">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <span className="text-sm text-gray-300">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* En-têtes jours de la semaine */}
          <div className="grid grid-cols-7 bg-gray-900">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((date, index) => {
              const isToday = date && date.toDateString() === new Date().toDateString();
              const dayEvents = date ? getEventsForDate(date) : [];

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b border-gray-700 p-2 ${
                    date ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-900'
                  }`}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            isToday
                              ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center'
                              : 'text-gray-300'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Événements du jour */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => {
                          const config = CATEGORY_CONFIG[event.category];
                          return (
                            <button
                              key={event.id}
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowDetailsModal(true);
                              }}
                              className={`w-full text-left px-2 py-1 rounded text-xs ${config.color} ${config.textColor} hover:opacity-80 transition-opacity truncate`}
                            >
                              {event.isAllDay ? '🌐' : event.startTime} {event.title}
                            </button>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-2">
                            +{dayEvents.length - 3} de plus
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des événements à venir */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Événements à venir</h3>
          <div className="space-y-3">
            {filteredEvents
              .filter(e => new Date(e.startDate) >= new Date(new Date().setHours(0,0,0,0)))
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 5)
              .map(event => {
                const config = CATEGORY_CONFIG[event.category];
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className={`w-1 h-12 rounded-full ${config.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{event.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${config.color} ${config.textColor}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(event.startDate).toLocaleDateString('fr-FR')} • {event.startTime} - {event.endTime}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Modal Création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel Événement"
        size="lg"
      >
        <EventForm
          onSubmit={(data) => {
            addItem(data);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal Détails */}
      {selectedEvent && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          title={selectedEvent.title}
          size="lg"
        >
          <EventDetails
            event={selectedEvent}
            onEdit={(updated) => {
              updateItem(selectedEvent.id, updated);
              setShowDetailsModal(false);
              setSelectedEvent(null);
            }}
            onDelete={() => {
              deleteItem(selectedEvent.id);
              setShowDetailsModal(false);
              setSelectedEvent(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Composant Formulaire Événement
function EventForm({
  event,
  onSubmit,
  onCancel
}: {
  event?: CalendarEvent;
  onSubmit: (data: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>(event || {
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    category: 'meeting',
    location: '',
    attendees: [],
    createdBy: 'Utilisateur Actuel',
    isAllDay: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="Ex: Briefing matinal"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="Détails de l'événement..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Catégorie *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lieu
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="Ex: Salle de briefing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date de début *
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date de fin *
          </label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={formData.isAllDay}
              onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            Événement sur toute la journée
          </label>
        </div>

        {!formData.isAllDay && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heure de début
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heure de fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {event ? 'Modifier' : 'Créer'} l&apos;événement
        </button>
      </div>
    </form>
  );
}

// Composant Détails Événement
function EventDetails({
  event,
  onEdit,
  onDelete
}: {
  event: CalendarEvent;
  onEdit: (updated: Partial<CalendarEvent>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const config = CATEGORY_CONFIG[event.category];

  if (isEditing) {
    return (
      <EventForm
        event={event}
        onSubmit={(data) => {
          onEdit(data);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className={`w-1 h-24 rounded-full ${config.color}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded ${config.color} ${config.textColor} text-sm font-medium`}>
              {config.label}
            </span>
            {event.isAllDay && (
              <span className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm">
                Toute la journée
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-gray-300">{event.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Date et heure</span>
          </div>
          <p className="text-white">
            {new Date(event.startDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          {!event.isAllDay && (
            <p className="text-gray-300 text-sm">
              {event.startTime} - {event.endTime}
            </p>
          )}
        </div>

        {event.location && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Lieu</span>
            </div>
            <p className="text-white">{event.location}</p>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4 col-span-2">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Participants</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((attendee, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300">
                  {attendee}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-700 rounded-lg p-4 col-span-2">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Créé par</span>
          </div>
          <p className="text-white">{event.createdBy}</p>
          <p className="text-gray-400 text-sm">
            {new Date(event.createdAt).toLocaleDateString('fr-FR')} à {new Date(event.createdAt).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={() => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
              onDelete();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Modifier
        </button>
      </div>
    </div>
  );
}
