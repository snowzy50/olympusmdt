/**
 * Panel DEFCON detaille pour la page Dispatch
 * Cree par: Snowzy
 * Affiche toutes les informations du niveau DEFCON actuel
 */

'use client';

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  User,
  DollarSign,
  Search,
  Shirt,
  FileText,
  Settings,
} from 'lucide-react';
import { useDefcon } from '@/hooks/useDefcon';
import { DefconModal } from './DefconModal';
import { cn } from '@/lib/utils';
import type { DefconLevel } from '@/types/defcon';

interface DefconPanelProps {
  agencyId?: string;
  canEdit?: boolean;
  userName?: string;
  className?: string;
}

export function DefconPanel({ agencyId, canEdit = false, userName, className }: DefconPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const {
    currentDefcon,
    currentLevel,
    config,
    isCritical,
    fineMultiplier,
    history,
    isLoading,
    setLevel,
  } = useDefcon({ agencyId });

  const handleChangeLevel = async (level: DefconLevel, notes?: string, durationHours?: number) => {
    if (!userName) return;
    await setLevel(level, userName, { notes, durationHours });
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className={cn('bg-dark-200 rounded-xl p-4 animate-pulse', className)}>
        <div className="h-48 bg-dark-300 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border',
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        {/* Critical animation overlay */}
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse" />
          </div>
        )}

        <div className="relative p-4">
          {/* Header with level */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', config.bgColor)}>
                {isCritical ? (
                  <AlertTriangle className={cn('w-6 h-6', config.textColor)} />
                ) : (
                  <Shield className={cn('w-6 h-6', config.textColor)} />
                )}
              </div>
              <div>
                <h3 className={cn('text-2xl font-bold', config.textColor)}>
                  {config.name}
                </h3>
                <p className="text-sm text-gray-400">{config.description}</p>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => setShowModal(true)}
                className="p-2 bg-dark-300 rounded-lg hover:bg-dark-200 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Level indicators */}
          <div className="flex gap-1 mb-4">
            {[5, 4, 3, 2, 1].map((level) => (
              <div
                key={level}
                className={cn(
                  'flex-1 h-2 rounded-full transition-all duration-300',
                  level >= currentLevel
                    ? level <= 2
                      ? 'bg-red-500'
                      : level === 3
                      ? 'bg-orange-500'
                      : level === 4
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    : 'bg-dark-300'
                )}
              />
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Fine multiplier */}
            <div className="bg-dark-300/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Amendes</span>
              </div>
              <p className={cn('text-lg font-bold', fineMultiplier > 1 ? config.textColor : 'text-white')}>
                x{fineMultiplier}
              </p>
            </div>

            {/* Duration */}
            {config.maxDurationHours && (
              <div className="bg-dark-300/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Duree max</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {config.maxDurationHours}h
                </p>
              </div>
            )}
          </div>

          {/* Policies */}
          <div className="space-y-2">
            {/* ID Control */}
            <div className="flex items-start gap-2 p-2 bg-dark-300/30 rounded-lg">
              <Search className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-400 block">Droits LSPD & BCSO</span>
                <span className="text-sm text-white">{config.idControl}</span>
              </div>
            </div>

            {/* Equipment */}
            <div className="flex items-start gap-2 p-2 bg-dark-300/30 rounded-lg">
              <Shirt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-400 block">Equipement Police</span>
                <span className="text-sm text-white">{config.equipment}</span>
              </div>
            </div>

            {/* Authorization */}
            <div className="flex items-start gap-2 p-2 bg-dark-300/30 rounded-lg">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-400 block">Autorisation</span>
                <span className="text-sm text-white">{config.authorization}</span>
              </div>
            </div>
          </div>

          {/* Active DEFCON info */}
          {currentDefcon && (
            <div className="mt-4 pt-4 border-t border-dark-300">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="w-4 h-4" />
                <span>
                  Active par <span className="text-white">{currentDefcon.activated_by}</span>
                </span>
              </div>
              {currentDefcon.notes && (
                <p className="mt-2 text-sm text-gray-300 italic">
                  "{currentDefcon.notes}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for changing level */}
      {showModal && (
        <DefconModal
          currentLevel={currentLevel}
          onClose={() => setShowModal(false)}
          onConfirm={handleChangeLevel}
        />
      )}
    </>
  );
}

export default DefconPanel;
