'use client';

import AgencyDashboard from '@/components/dashboard/AgencyDashboard';
import { Activity } from 'lucide-react';

export default function SAMCDashboardPage() {
  const agency = {
    id: 'samc',
    name: 'San Andreas Medical Center',
    shortName: 'SAMC',
    icon: Activity,
    color: 'error',
    gradient: 'from-error-600 to-error-800',
    badgeNumber: '#MED-4567',
    stats: {
      critical: 5,
      urgent: 18,
      equipment: '97%',
      events: 31,
      active: 15,
      resolved: 203,
      units: 28,
    },
  };

  return <AgencyDashboard agency={agency} />;
}
