/**
 * Selecteur d'arme avec autocomplete
 * Cree par: Snowzy
 * Pour integration dans le module des saisies
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Target, ChevronDown, Sword, Crosshair, Bomb, AlertTriangle, Check, Ban } from 'lucide-react';
import { useWeaponsRegistry } from '@/hooks/useWeaponsRegistry';
import type { Weapon, WeaponCategory } from '@/types/weapons';
import { WEAPON_CATEGORIES, getWeaponLegalStatus, getWeaponStatusColor } from '@/types/weapons';
import { cn } from '@/lib/utils';

interface WeaponSelectorProps {
  value?: Weapon | null;
  onChange: (weapon: Weapon | null) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const categoryIcons = {
  D: Sword,
  C: Target,
  B: Crosshair,
  A: Bomb,
};

export function WeaponSelector({
  value,
  onChange,
  className,
  placeholder = 'Rechercher une arme...',
  disabled = false,
}: WeaponSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WeaponCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { weapons, searchWeapons, isLoading } = useWeaponsRegistry();

  // Filtrer les resultats
  const filteredResults = searchWeapons(query, selectedCategory || undefined);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (weapon: Weapon) => {
    onChange(weapon);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const getCategoryConfig = (category: WeaponCategory) => WEAPON_CATEGORIES[category];

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected value display */}
      {value ? (
        <div
          className={cn(
            'flex items-center justify-between p-3 bg-dark-300 border rounded-lg',
            getCategoryConfig(value.category).borderColor
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn('p-1.5 rounded-lg', getCategoryConfig(value.category).bgColor)}>
              {(() => {
                const Icon = categoryIcons[value.category];
                return <Icon className={cn('w-4 h-4', getCategoryConfig(value.category).textColor)} />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{value.name}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={getCategoryConfig(value.category).textColor}>
                  {getCategoryConfig(value.category).nameFr}
                </span>
                <span className="text-gray-400">|</span>
                <span className={getStatusColorClass(getWeaponStatusColor(value))}>
                  {getWeaponLegalStatus(value)}
                </span>
              </div>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-dark-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      ) : (
        /* Search input */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full pl-10 pr-10 py-3 bg-dark-300 border border-dark-300 rounded-lg',
              'text-white placeholder-gray-500',
              'focus:outline-none focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            disabled={disabled}
          >
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !value && (
        <div className="absolute z-50 w-full mt-2 bg-dark-200 border border-dark-300 rounded-xl shadow-xl overflow-hidden">
          {/* Category filters */}
          <div className="p-2 border-b border-dark-300 flex gap-1 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                !selectedCategory ? 'bg-primary-500 text-white' : 'bg-dark-300 text-gray-400 hover:text-white'
              )}
            >
              Toutes
            </button>
            {(['D', 'C', 'B', 'A'] as WeaponCategory[]).map((cat) => {
              const config = WEAPON_CATEGORIES[cat];
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    selectedCategory === cat
                      ? `${config.bgColor} ${config.textColor}`
                      : 'bg-dark-300 text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  Cat. {cat}
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Chargement...</div>
            ) : filteredResults.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {query ? 'Aucune arme trouvee' : 'Commencez a taper pour rechercher'}
              </div>
            ) : (
              filteredResults.slice(0, 50).map((weapon) => {
                const catConfig = getCategoryConfig(weapon.category);
                const Icon = categoryIcons[weapon.category];
                const statusColor = getWeaponStatusColor(weapon);

                return (
                  <button
                    key={weapon.id}
                    onClick={() => handleSelect(weapon)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-dark-300 transition-colors text-left border-b border-dark-300 last:border-0"
                  >
                    <div className={cn('p-1.5 rounded-lg flex-shrink-0', catConfig.bgColor)}>
                      <Icon className={cn('w-4 h-4', catConfig.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{weapon.name}</p>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className={catConfig.textColor}>Cat. {weapon.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status icons */}
                      {weapon.free_possession && (
                        <div className="flex items-center gap-1 text-xs text-green-500" title="Detention libre">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      {weapon.possession_prohibited && (
                        <div className="flex items-center gap-1 text-xs text-red-500" title="Detention interdite">
                          <Ban className="w-3 h-3" />
                        </div>
                      )}
                      {weapon.requires_permit && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500" title="Permis requis">
                          <AlertTriangle className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with count */}
          <div className="p-2 border-t border-dark-300 text-xs text-gray-500 text-center">
            {filteredResults.length} arme{filteredResults.length > 1 ? 's' : ''} trouvee{filteredResults.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeaponSelector;
