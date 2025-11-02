/**
 * Page d'accueil DOJ Dashboard
 * Créé par: Snowzy
 * Features: Vue d'ensemble avec statistiques en temps réel
 */

'use client';
export const dynamic = 'force-dynamic';

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default function DOJDashboardPage() {
  return (
    <DashboardOverview
      agencyId="doj"
      agencyName="Department of Justice"
    />
  );
}
