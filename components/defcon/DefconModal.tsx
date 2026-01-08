/**
 * Modal pour changer le niveau DEFCON
 * Cree par: Snowzy
 * Selection du niveau avec preview des regles
 */

'use client';

import { useState } from 'react';
import { X, Shield, AlertTriangle, Clock, DollarSign, Check } from 'lucide-react';
import { DEFCON_CONFIGS, getDefconConfig } from '@/types/defcon';
import type { DefconLevel } from '@/types/defcon';
import { cn } from '@/lib/utils';

interface DefconModalProps {
  currentLevel: DefconLevel;
  onClose: () => void;
  onConfirm: (level: DefconLevel, notes?: string, durationHours?: number) => Promise<void>;
}

export function DefconModal({ currentLevel, onClose, onConfirm }: DefconModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<DefconLevel>(currentLevel);
  const [notes, setNotes] = useState('');
  const [durationHours, setDurationHours] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedConfig = getDefconConfig(selectedLevel);
  const levels: DefconLevel[] = [5, 4, 3, 2, 1];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedLevel, notes || undefined, durationHours);
    } catch (error) {
      console.error('Erreur lors du changement de niveau DEFCON:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-dark-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-300">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">Changer le niveau DEFCON</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Level selector */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {levels.map((level) => {
              const config = getDefconConfig(level);
              const isSelected = selectedLevel === level;
              const isCurrent = currentLevel === level;

              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    'relative p-3 rounded-xl border-2 transition-all',
                    isSelected
                      ? `${config.bgColor} ${config.borderColor}`
                      : 'bg-dark-300 border-dark-300 hover:border-gray-600'
                  )}
                >
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={cn('text-2xl font-bold', isSelected ? config.textColor : 'text-gray-400')}>
                    {level}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {level <= 2 ? 'Critique' : level === 3 ? 'Menace' : level === 4 ? 'Alerte' : 'Normal'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected level preview */}
          <div className={cn('p-4 rounded-xl border', selectedConfig.bgColor, selectedConfig.borderColor)}>
            <div className="flex items-start gap-3 mb-4">
              {selectedLevel <= 2 ? (
                <AlertTriangle className={cn('w-6 h-6', selectedConfig.textColor)} />
              ) : (
                <Shield className={cn('w-6 h-6', selectedConfig.textColor)} />
              )}
              <div>
                <h3 className={cn('text-xl font-bold', selectedConfig.textColor)}>
                  {selectedConfig.name}
                </h3>
                <p className="text-sm text-gray-400">{selectedConfig.description}</p>
              </div>
            </div>

            {/* Key info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-300/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Amendes</span>
                </div>
                <p className={cn('text-lg font-bold', selectedConfig.textColor)}>
                  x{selectedConfig.fineMultiplier}
                </p>
              </div>
              {selectedConfig.maxDurationHours && (
                <div className="bg-dark-300/50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Duree max</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {selectedConfig.maxDurationHours}h
                  </p>
                </div>
              )}
            </div>

            {/* Policies preview */}
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-400">Droits:</span>
                <span className="text-white">{selectedConfig.idControl}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400">Equipement:</span>
                <span className="text-white">{selectedConfig.equipment}</span>
              </div>
            </div>
          </div>

          {/* Duration input */}
          {selectedConfig.maxDurationHours && (
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">
                Duree (heures) - Optionnel
              </label>
              <input
                type="number"
                min={1}
                max={selectedConfig.maxDurationHours}
                value={durationHours || ''}
                onChange={(e) => setDurationHours(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder={`Max: ${selectedConfig.maxDurationHours}h`}
                className="w-full bg-dark-300 border border-dark-300 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2">
              Notes / Raison - Optionnel
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Attaque en cours sur le centre-ville..."
              rows={2}
              className="w-full bg-dark-300 border border-dark-300 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-dark-300">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || selectedLevel === currentLevel}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-all',
              selectedLevel === currentLevel
                ? 'bg-dark-300 text-gray-500 cursor-not-allowed'
                : `${selectedConfig.bgColor} ${selectedConfig.textColor} hover:opacity-90`,
              isSubmitting && 'opacity-50 cursor-wait'
            )}
          >
            {isSubmitting ? 'Activation...' : `Activer ${selectedConfig.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DefconModal;
