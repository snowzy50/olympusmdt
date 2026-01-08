/**
 * Liste du Gun Control (GCA) avec filtres et recherche
 * Cree par: Snowzy
 * Affiche toutes les armes par categorie
 */

'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Sword,
  Target,
  Crosshair,
  Bomb,
  Check,
  X,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Shield,
} from 'lucide-react';
import { useWeaponsRegistry } from '@/hooks/useWeaponsRegistry';
import type { Weapon, WeaponCategory } from '@/types/weapons';
import { WEAPON_CATEGORIES, getWeaponLegalStatus, getWeaponStatusColor } from '@/types/weapons';
import { cn } from '@/lib/utils';

interface GunControlListProps {
  className?: string;
  onSelect?: (weapon: Weapon) => void;
}

const categoryIcons = {
  D: Sword,
  C: Target,
  B: Crosshair,
  A: Bomb,
};

export function GunControlList({ className, onSelect }: GunControlListProps) {
  const [selectedCategory, setSelectedCategory] = useState<WeaponCategory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    filteredWeapons,
    groupedByCategory,
    searchQuery,
    setSearchQuery,
    stats,
    isLoading,
  } = useWeaponsRegistry();

  const categoryOrder: WeaponCategory[] = ['D', 'C', 'B', 'A'];

  const displayedWeapons = selectedCategory
    ? groupedByCategory[selectedCategory]
    : filteredWeapons;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'error':
        return 'text-red-500 bg-red-500/20';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'success':
        return 'text-green-500 bg-green-500/20';
      default:
        return 'text-blue-500 bg-blue-500/20';
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with search */}
      <div className="p-4 border-b border-dark-300">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary-500" />
          <div>
            <h2 className="text-xl font-bold text-white">Gun Control Act (GCA)</h2>
            <p className="text-sm text-gray-400">{stats.total} armes repertoriees</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une arme..."
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
          Toutes ({stats.total})
        </button>
        {categoryOrder.map((catId) => {
          const cat = WEAPON_CATEGORIES[catId];
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
              Cat. {catId} ({count})
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="p-2 border-b border-dark-300 flex gap-2 overflow-x-auto text-xs">
        <div className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg">
          Detention libre: {stats.freeOwnership}
        </div>
        <div className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
          Permis requis: {stats.requiresPermit}
        </div>
        <div className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg">
          Interdites: {stats.prohibited}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : displayedWeapons.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune arme trouvee</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedWeapons.map((weapon) => {
              const catConfig = WEAPON_CATEGORIES[weapon.category];
              const Icon = categoryIcons[weapon.category];
              const isExpanded = expandedId === weapon.id;
              const statusColor = getWeaponStatusColor(weapon);

              return (
                <div
                  key={weapon.id}
                  className={cn(
                    'bg-dark-300/50 border rounded-lg overflow-hidden transition-all',
                    catConfig.borderColor,
                    isExpanded && catConfig.bgColor
                  )}
                >
                  {/* Main row */}
                  <div
                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-dark-300/50"
                    onClick={() => toggleExpand(weapon.id)}
                  >
                    <div className={cn('p-1.5 rounded-lg flex-shrink-0', catConfig.bgColor)}>
                      <Icon className={cn('w-4 h-4', catConfig.textColor)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{weapon.name}</p>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className={catConfig.textColor}>Categorie {weapon.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusColorClass(statusColor))}>
                        {getWeaponLegalStatus(weapon)}
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
                      <div className="pt-3 space-y-3">
                        {/* Restrictions grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 p-2 bg-dark-300/50 rounded">
                            {weapon.free_possession ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-300">Detention libre</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-dark-300/50 rounded">
                            {weapon.carry_prohibited ? (
                              <X className="w-4 h-4 text-red-500" />
                            ) : (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm text-gray-300">Port autorise</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-dark-300/50 rounded">
                            {weapon.requires_permit ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm text-gray-300">
                              {weapon.requires_permit ? 'Permis requis' : 'Pas de permis'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-dark-300/50 rounded">
                            {weapon.requires_declaration ? (
                              <AlertTriangle className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm text-gray-300">
                              {weapon.requires_declaration ? 'Declaration requise' : 'Pas de declaration'}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {weapon.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{weapon.notes}</span>
                          </div>
                        )}

                        {/* Category description */}
                        <div className="text-xs text-gray-400 italic">
                          {catConfig.description}
                        </div>

                        {/* Select button */}
                        {onSelect && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(weapon);
                            }}
                            className={cn(
                              'w-full mt-2 py-2 rounded-lg font-medium transition-colors',
                              catConfig.bgColor,
                              catConfig.textColor,
                              'hover:opacity-80'
                            )}
                          >
                            Selectionner cette arme
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

export default GunControlList;
