'use client';

import { Flame } from 'lucide-react';

export default function SAFDDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-800 rounded-xl flex items-center justify-center">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">SAFD Dashboard</h1>
          <p className="text-gray-400">San Andreas Fire Department</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-300">Bienvenue sur le dashboard SAFD. Les données pompiers sont isolées des autres agences.</p>
      </div>
    </div>
  );
}
