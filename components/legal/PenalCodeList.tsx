/**
 * Liste du Livret Penal avec filtres et recherche
 * Cree par: Snowzy
 * Affiche toutes les infractions par categorie
 */

'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Skull,
  Clock,
  DollarSign,
  FileText,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useInfractions } from '@/hooks/useInfractions';
import type { Infraction, InfractionCategory } from '@/types/infractions';
import { INFRACTION_CATEGORIES, formatFineAmount, formatGavDuration } from '@/types/infractions';
import { cn } from '@/lib/utils';

interface PenalCodeListProps {
  className?: string;
  onSelect?: (infraction: Infraction) => void;
}

const categoryIcons = {
  contravention: AlertCircle,
  delit_mineur: AlertTriangle,
  delit_majeur: ShieldAlert,
  crime: Skull,
};

export function PenalCodeList({ className, onSelect }: PenalCodeListProps) {
  const [selectedCategory, setSelectedCategory] = useState<InfractionCategory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    filteredInfractions,
    groupedByCategory,
    searchQuery,
    setSearchQuery,
    stats,
    isLoading,
  } = useInfractions();

  const categories = Object.entries(INFRACTION_CATEGORIES) as [InfractionCategory, typeof INFRACTION_CATEGORIES[InfractionCategory]][];

  const displayedInfractions = selectedCategory
    ? groupedByCategory[selectedCategory]
    : filteredInfractions;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with search */}
      <div className="p-4 border-b border-dark-300">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-6 h-6 text-primary-500" />
          <div>
            <h2 className="text-xl font-bold text-white">Livret Penal</h2>
            <p className="text-sm text-gray-400">{stats.total} infractions repertoriees</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une infraction..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-300 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="p-2 border-b border-dark-300 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            !selectedCategory ? 'bg-primary-500 text-white' : 'bg-dark-300 text-gray-400 hover:text-white'
          )}
        >
          <Filter className="w-4 h-4" />
          Tous ({stats.total})
        </button>
        {categories.map(([catId, cat]) => {
          const Icon = categoryIcons[catId];
          const count = stats.byCategory[catId];
          return (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === catId
                  ? `${cat.bgColor} ${cat.textColor}`
                  : 'bg-dark-300 text-gray-400 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.nameFr} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : displayedInfractions.length === 0 ? (
          <div className="text-center py-8">
            <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune infraction trouvee</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedInfractions.map((infraction) => {
              const catConfig = INFRACTION_CATEGORIES[infraction.category];
              const Icon = categoryIcons[infraction.category];
              const isExpanded = expandedId === infraction.id;

              return (
                <div
                  key={infraction.id}
                  className={cn(
                    'bg-dark-300/50 border rounded-lg overflow-hidden transition-all',
                    catConfig.borderColor,
                    isExpanded && catConfig.bgColor
                  )}
                >
                  {/* Main row */}
                  <div
                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-dark-300/50"
                    onClick={() => toggleExpand(infraction.id)}
                  >
                    <div className={cn('p-1.5 rounded-lg flex-shrink-0', catConfig.bgColor)}>
                      <Icon className={cn('w-4 h-4', catConfig.textColor)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{infraction.name}</p>
                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <span className={catConfig.textColor}>{catConfig.nameFr}</span>
                        {infraction.gav_duration && (
                          <span className="flex items-center gap-1 text-orange-400">
                            <Clock className="w-3 h-3" />
                            GAV {formatGavDuration(infraction.gav_duration)}
                          </span>
                        )}
                        {infraction.requires_prosecutor && (
                          <span className="text-purple-400">Procureur</span>
                        )}
                        {infraction.requires_tribunal && (
                          <span className="text-red-400">Tribunal</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-yellow-500 font-bold">
                        {formatFineAmount(infraction)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-dark-300/50">
                      <div className="pt-3 space-y-2">
                        {/* Notes */}
                        {infraction.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{infraction.notes}</span>
                          </div>
                        )}

                        {/* Penalties */}
                        {infraction.penalties && infraction.penalties.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Scale className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-wrap gap-1">
                              {infraction.penalties.map((penalty, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-dark-300 rounded text-xs text-gray-300"
                                >
                                  {penalty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Select button */}
                        {onSelect && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(infraction);
                            }}
                            className={cn(
                              'w-full mt-2 py-2 rounded-lg font-medium transition-colors',
                              catConfig.bgColor,
                              catConfig.textColor,
                              'hover:opacity-80'
                            )}
                          >
                            Selectionner cette infraction
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PenalCodeList;
