/**
 * Page Gun Control (GCA)
 * Cree par: Snowzy
 * Affiche toutes les armes par categorie
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Scale, Target } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GunControlList } from '@/components/legal/GunControlList';
import { DefconWidget } from '@/components/defcon/DefconWidget';
import { DefconModal } from '@/components/defcon/DefconModal';
import { useDefcon } from '@/hooks/useDefcon';
import { getAgencyById } from '@/config/agencies';
import type { DefconLevel } from '@/types/defcon';

export default function GunControlPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const agencyId = params.agencyId as string;
  const agency = getAgencyById(agencyId);

  const [showDefconModal, setShowDefconModal] = useState(false);
  const { currentLevel, setLevel } = useDefcon({ agencyId });

  const handleDefconChange = async (level: DefconLevel, notes?: string, durationHours?: number) => {
    const username = session?.user?.name || 'Inconnu';
    await setLevel(level, username, { notes, durationHours });
    setShowDefconModal(false);
  };

  if (!agency) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Agence non trouvee</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Gun Control Act (GCA)</h1>
                  <p className="text-sm text-gray-400">
                    Registre des armes - OLYMPUS RP
                  </p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/${agencyId}/legal/penal-code`)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Scale className="w-4 h-4" />
                Livret Penal
              </button>
            </div>
          </div>

          {/* DEFCON Widget */}
          <div className="mt-4">
            <DefconWidget
              agencyId={agencyId}
              className="max-w-md cursor-pointer"
              onClick={() => setShowDefconModal(true)}
              showDetails
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <GunControlList className="h-full" />
        </div>
      </div>

      {/* DEFCON Modal */}
      {showDefconModal && (
        <DefconModal
          currentLevel={currentLevel}
          onClose={() => setShowDefconModal(false)}
          onConfirm={handleDefconChange}
        />
      )}
    </MainLayout>
  );
}
