'use client';

import AgencyDashboard from '@/components/dashboard/AgencyDashboard';
import { Scale } from 'lucide-react';

export default function DOJDashboardPage() {
  const agency = {
    id: 'doj',
    name: 'Department of Justice',
    shortName: 'DOJ',
    icon: Scale,
    color: 'purple',
    gradient: 'from-purple-600 to-purple-800',
    badgeNumber: '#DOJ-6789',
    stats: {
      critical: 9,
      urgent: 15,
      equipment: '96%',
      events: 27,
      active: 18,
      resolved: 189,
      units: 35,
    },
  };

  return <AgencyDashboard agency={agency} />;
}
