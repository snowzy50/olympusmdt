'use client';

import AgencyDashboard from '@/components/dashboard/AgencyDashboard';
import { Home } from 'lucide-react';

export default function Dynasty8DashboardPage() {
  const agency = {
    id: 'dynasty8',
    name: 'Dynasty 8 Real Estate',
    shortName: 'D8',
    icon: Home,
    color: 'success',
    gradient: 'from-success-600 to-success-700',
    badgeNumber: '#RE-2345',
    stats: {
      critical: 2,
      urgent: 6,
      equipment: '99%',
      events: 14,
      active: 8,
      resolved: 124,
      units: 15,
    },
  };

  return <AgencyDashboard agency={agency} />;
}
