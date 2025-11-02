/**
 * Page d'accueil SAMC Dashboard
 * Créé par: Snowzy
 * Features: Vue d'ensemble avec statistiques en temps réel
 */

'use client';
export const dynamic = 'force-dynamic';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function SAMCDashboardPage() {
  return (
    <DashboardOverview
      agencyId="samc"
      agencyName="San Andreas Medical Center"
    />
  );
}
