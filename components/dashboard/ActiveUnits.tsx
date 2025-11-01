'use client';

import { Radio, MapPin, Users } from 'lucide-react';

const units = [
  {
    id: '1-A-12',
    officers: ['Off. Dupont', 'Off. Martin'],
    status: 'En patrouille',
    location: 'Vinewood Hills',
    statusColor: 'bg-accent-green',
  },
  {
    id: '1-A-15',
    officers: ['Off. Dubois'],
    status: 'Intervention',
    location: 'Legion Square',
    statusColor: 'bg-accent-orange',
  },
  {
    id: '1-A-20',
    officers: ['Off. Bernard', 'Off. Petit'],
    status: 'Disponible',
    location: 'Mission Row PD',
    statusColor: 'bg-police-blue',
  },
  {
    id: '1-A-23',
    officers: ['Off. Rousseau'],
    status: 'En pause',
    location: 'Downtown',
    statusColor: 'bg-dark-600',
  },
];

export default function ActiveUnits() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-police-blue/20">
            <Radio className="w-5 h-5 text-police-blue-light" />
          </div>
          <h2 className="text-xl font-bold text-white">Unités actives</h2>
        </div>
        <span className="px-3 py-1 rounded-lg bg-accent-green/20 text-accent-green text-sm font-semibold">
          {units.length} unités
        </span>
      </div>

      <div className="space-y-3">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="p-4 rounded-xl glass-strong hover:bg-white/5 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-police-blue-light">
                  {unit.id}
                </div>
                <div className={`px-2 py-1 rounded-lg ${unit.statusColor} text-white text-xs font-semibold`}>
                  {unit.status}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-dark-300">
                <Users className="w-4 h-4" />
                <span>{unit.officers.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <MapPin className="w-4 h-4" />
                <span>{unit.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-3 rounded-xl glass-strong hover:glass transition-all duration-200 text-sm font-semibold text-police-blue-light hover:text-white">
        Voir toutes les unités
      </button>
    </div>
  );
}
