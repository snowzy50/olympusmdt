'use client';

import AgencyDashboard from '@/components/dashboard/AgencyDashboard';
import { Flame } from 'lucide-react';

export default function SAFDDashboardPage() {
  const agency = {
    id: 'safd',
    name: 'San Andreas Fire Department',
    shortName: 'SAFD',
    icon: Flame,
    color: 'warning',
    gradient: 'from-warning-600 to-warning-700',
    badgeNumber: '#FD-7890',
    stats: {
      critical: 3,
      urgent: 8,
      equipment: '91%',
      events: 19,
      active: 12,
      resolved: 167,
      units: 22,
    },
  };

  return <AgencyDashboard agency={agency} />;
}
