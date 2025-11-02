'use client';
export const dynamic = 'force-dynamic';

import MainLayout from '@/components/layout/MainLayout';
import ShiftCard from '@/components/planning/ShiftCard';
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, Clock, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const mockShifts = [
  {
    id: '1',
    title: 'Patrouille de nuit - Zone Nord',
    date: new Date(),
    startTime: '22:00',
    endTime: '06:00',
    officers: ['Off. Dupont', 'Off. Martin'],
    location: 'Vinewood Hills',
    type: 'patrol' as const,
    maxOfficers: 4,
  },
  {
    id: '2',
    title: 'Surveillance banque centrale',
    date: new Date(),
    startTime: '14:00',
    endTime: '22:00',
    officers: ['Off. Dubois'],
    location: 'Downtown',
    type: 'surveillance' as const,
    maxOfficers: 2,
  },
  {
    id: '3',
    title: 'Formation tactique',
    date: addDays(new Date(), 1),
    startTime: '09:00',
    endTime: '12:00',
    officers: ['Off. Bernard', 'Off. Petit', 'Off. Rousseau'],
    location: 'Centre de formation LSPD',
    type: 'training' as const,
    maxOfficers: 8,
  },
  {
    id: '4',
    title: 'Événement communautaire',
    date: addDays(new Date(), 2),
    startTime: '10:00',
    endTime: '18:00',
    officers: ['Off. Dupont', 'Off. Martin', 'Off. Dubois'],
    location: 'Legion Square',
    type: 'event' as const,
    maxOfficers: 6,
  },
];

export default function PlanificationPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const weekStart = startOfWeek(currentDate, { locale: fr });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const stats = [
    { label: 'Shifts cette semaine', value: '24', icon: CalendarDays, color: 'from-police-blue to-police-blue-light' },
    { label: 'Officiers actifs', value: '18', icon: Users, color: 'from-accent-purple to-police-blue' },
    { label: 'Heures planifiées', value: '156h', icon: Clock, color: 'from-accent-cyan to-accent-green' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Planification</h1>
            <p className="text-dark-400">Gérez les horaires et les affectations du personnel</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-police-blue to-police-blue-light text-white font-semibold hover:shadow-lg hover:shadow-police-blue/50 transition-all duration-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau shift
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass rounded-xl p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Calendar Header */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-police-blue-light" />
                <h2 className="text-xl font-bold text-white">
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(addDays(currentDate, -7))}
                  className="p-2 rounded-lg glass-strong hover:glass transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 rounded-lg glass-strong hover:glass transition-all duration-200 text-sm font-semibold text-white"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  onClick={() => setCurrentDate(addDays(currentDate, 7))}
                  className="p-2 rounded-lg glass-strong hover:glass transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'week'
                    ? 'glass-strong text-police-blue-light'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'glass-strong text-police-blue-light'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Mois
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl text-center transition-all duration-200 ${
                    isToday
                      ? 'glass-strong ring-2 ring-police-blue'
                      : 'glass hover:glass-strong'
                  }`}
                >
                  <div className="text-xs text-dark-400 mb-1">
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div className={`text-2xl font-bold ${isToday ? 'text-police-blue-light' : 'text-white'}`}>
                    {format(day, 'd')}
                  </div>
                  {isToday && (
                    <div className="w-2 h-2 bg-police-blue rounded-full mx-auto mt-2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shifts List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Shifts à venir</h2>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg glass-strong hover:glass transition-all duration-200 text-sm font-semibold text-white">
                Tous
              </button>
              <button className="px-4 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-semibold">
                Patrouille
              </button>
              <button className="px-4 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-semibold">
                Surveillance
              </button>
              <button className="px-4 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-semibold">
                Formation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        </div>

        {/* My Schedule */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Mon planning</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-strong flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-12 bg-police-blue rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-white">Patrouille de nuit - Zone Nord</h3>
                  <p className="text-sm text-dark-400">Aujourd&apos;hui, 22:00 - 06:00</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-accent-red/20 text-accent-red hover:bg-accent-red/30 transition-colors text-sm font-semibold">
                Annuler
              </button>
            </div>

            <div className="p-4 rounded-xl glass-strong flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-12 bg-accent-cyan rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-white">Formation tactique</h3>
                  <p className="text-sm text-dark-400">Demain, 09:00 - 12:00</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-accent-red/20 text-accent-red hover:bg-accent-red/30 transition-colors text-sm font-semibold">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
