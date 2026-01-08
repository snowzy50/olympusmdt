/**
 * Widget DEFCON compact pour le dashboard
 * Cree par: Snowzy
 * Affiche le niveau DEFCON actuel avec animation
 */

'use client';

import { Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import { useDefcon } from '@/hooks/useDefcon';
import { cn } from '@/lib/utils';

interface DefconWidgetProps {
  agencyId?: string;
  onClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function DefconWidget({ agencyId, onClick, showDetails = false, className }: DefconWidgetProps) {
  const { currentLevel, config, isCritical, fineMultiplier, isLoading, isConnected } = useDefcon({
    agencyId,
  });

  if (isLoading) {
    return (
      <div className={cn('bg-dark-200 rounded-xl p-4 animate-pulse', className)}>
        <div className="h-16 bg-dark-300 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-300',
        config.bgColor,
        config.borderColor,
        isCritical && 'animate-pulse',
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      {/* Background pattern for critical levels */}
      {isCritical && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
        </div>
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isCritical ? (
              <AlertTriangle className={cn('w-5 h-5', config.textColor)} />
            ) : (
              <Shield className={cn('w-5 h-5', config.textColor)} />
            )}
            <span className="text-sm font-medium text-gray-400">Niveau d'Alerte</span>
          </div>
          {!isConnected && (
            <span className="text-xs text-gray-500">Hors ligne</span>
          )}
        </div>

        {/* Level Display */}
        <div className="flex items-center gap-4">
          <div className={cn('text-4xl font-bold', config.textColor)}>
            {config.name}
          </div>
          {fineMultiplier > 1 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-dark-300 rounded-lg">
              <span className="text-xs text-gray-400">Amendes</span>
              <span className={cn('text-sm font-bold', config.textColor)}>
                x{fineMultiplier}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-400 line-clamp-1">
          {config.description}
        </p>

        {/* Details button */}
        {showDetails && onClick && (
          <div className="flex items-center justify-end mt-3">
            <button className={cn('flex items-center gap-1 text-sm', config.textColor)}>
              Voir les details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Level indicators */}
        <div className="flex gap-1 mt-4">
          {[5, 4, 3, 2, 1].map((level) => (
            <div
              key={level}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
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
      </div>
    </div>
  );
}

export default DefconWidget;
