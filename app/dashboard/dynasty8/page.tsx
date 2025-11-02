/**
 * Page d'accueil Dynasty8 Dashboard
 * Créé par: Snowzy
 * Features: Vue d'ensemble avec statistiques en temps réel
 */

'use client';
export const dynamic = 'force-dynamic';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function Dynasty8DashboardPage() {
  return (
    <DashboardOverview
      agencyId="dynasty8"
      agencyName="Dynasty 8 Real Estate"
    />
  );
}
