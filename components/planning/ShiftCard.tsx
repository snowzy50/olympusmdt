'use client';

import { Clock, MapPin, Users, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Shift {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  officers: string[];
  location: string;
  type: 'patrol' | 'surveillance' | 'training' | 'event';
  maxOfficers: number;
}

interface ShiftCardProps {
  shift: Shift;
}

const typeConfig = {
  patrol: { label: 'Patrouille', color: 'from-police-blue to-police-blue-light' },
  surveillance: { label: 'Surveillance', color: 'from-accent-purple to-police-blue' },
  training: { label: 'Formation', color: 'from-accent-cyan to-accent-green' },
  event: { label: 'Événement', color: 'from-accent-orange to-accent-red' },
};

export default function ShiftCard({ shift }: ShiftCardProps) {
  const typeStyle = typeConfig[shift.type];
  const isFull = shift.officers.length >= shift.maxOfficers;

  return (
    <div className="glass rounded-xl p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${typeStyle.color} text-white text-xs font-semibold mb-2`}>
            {typeStyle.label}
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-police-blue-light transition-colors">
            {shift.title}
          </h3>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <MoreVertical className="w-4 h-4 text-dark-400" />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-dark-300">
          <Clock className="w-4 h-4" />
          <span>{shift.startTime} - {shift.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-300">
          <MapPin className="w-4 h-4" />
          <span>{shift.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-dark-400" />
          <span className="text-sm text-dark-300">
            {shift.officers.length}/{shift.maxOfficers} officiers
          </span>
        </div>
        <button
          disabled={isFull}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isFull
              ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
              : 'glass-strong hover:glass text-police-blue-light hover:text-white'
          }`}
        >
          {isFull ? 'Complet' : 'Rejoindre'}
        </button>
      </div>
    </div>
  );
}
