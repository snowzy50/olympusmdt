/**
 * Calendrier interactif moderne pour les événements
 * Créé par: Snowzy
 * Design: Responsive Web & Mobile avec animations fluides
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import type { CalendarEvent } from '@/services/eventsRealtimeService';

interface InteractiveCalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  selectedDate?: Date;
  className?: string;
}

const categoryColors = {
  patrouille: 'bg-blue-500',
  formation: 'bg-purple-500',
  réunion: 'bg-green-500',
  opération: 'bg-red-500',
  maintenance: 'bg-orange-500',
  tribunal: 'bg-yellow-500',
  personnel: 'bg-pink-500',
  autre: 'bg-gray-500',
};

const priorityBorders = {
  low: 'border-l-gray-400',
  normal: 'border-l-blue-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-600',
};

export function InteractiveCalendar({
  events,
  onDateClick,
  onEventClick,
  selectedDate,
  className = '',
}: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Calculer les jours du mois
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Jours du mois actuel
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Obtenir les événements pour une date spécifique
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const dateStr = date.toDateString();

      return (
        eventStart.toDateString() === dateStr ||
        eventEnd.toDateString() === dateStr ||
        (eventStart < date && eventEnd > date)
      );
    }).filter((event) => !filterCategory || event.category === filterCategory);
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 md:p-6 ${className}`}>
      {/* Header avec navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white capitalize">{monthName}</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtre catégorie */}
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes catégories</option>
            {Object.keys(categoryColors).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 hover:bg-gray-700 rounded text-sm text-gray-300 transition-colors"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-gray-700 rounded transition-colors"
              aria-label="Mois suivant"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="popLayout">
          {daysInMonth.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === day.date.toDateString();
            const hasEvents = dayEvents.length > 0;

            return (
              <motion.div
                key={`${day.date.toISOString()}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className={`
                  relative min-h-[80px] md:min-h-[100px] p-1 rounded-lg transition-all duration-200
                  border ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                  ${isToday ? 'bg-blue-600/10 border-2 border-blue-500' : 'border-gray-700'}
                  ${isSelected ? 'ring-2 ring-blue-400' : ''}
                  ${!day.isCurrentMonth ? 'opacity-50' : ''}
                  ${!hasEvents ? 'hover:bg-gray-800 cursor-pointer' : ''}
                `}
                onClick={() => !hasEvents && onDateClick?.(day.date)}
              >
                {/* Numéro du jour */}
                <div
                  className={`text-xs md:text-sm font-medium mb-1 ${isToday ? 'text-blue-300' : ''} ${hasEvents ? 'cursor-pointer hover:text-blue-400' : ''}`}
                  onClick={(e) => {
                    if (hasEvents) {
                      e.stopPropagation();
                      onDateClick?.(day.date);
                    }
                  }}
                >
                  {day.date.getDate()}
                </div>

                {/* Liste des événements avec titre */}
                {hasEvents && (
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event) => {
                      const startTime = new Date(event.start_date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className={`
                            text-[9px] md:text-[10px] px-1 py-0.5 rounded
                            ${categoryColors[event.category]} bg-opacity-90
                            ${priorityBorders[event.priority]} border-l-2
                            cursor-pointer hover:scale-105 transition-all
                            text-white font-medium truncate
                            hover:z-10 hover:shadow-lg
                          `}
                          title={`${startTime} - ${event.title}`}
                        >
                          {!event.all_day && <span className="opacity-75">{startTime}</span>} {event.title}
                        </motion.div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div
                        className="text-center cursor-pointer hover:bg-gray-700 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateClick?.(day.date);
                        }}
                      >
                        <span className="text-[9px] text-gray-300 font-semibold">
                          +{dayEvents.length - 3} autre{dayEvents.length - 3 > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Catégories :</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-gray-300 capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
