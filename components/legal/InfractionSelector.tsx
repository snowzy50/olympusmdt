/**
 * Selecteur d'infraction avec autocomplete
 * Cree par: Snowzy
 * Pour integration dans le module des amendes
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Scale, ChevronDown, AlertCircle, AlertTriangle, ShieldAlert, Skull } from 'lucide-react';
import { useInfractions } from '@/hooks/useInfractions';
import type { Infraction, InfractionCategory } from '@/types/infractions';
import { INFRACTION_CATEGORIES, formatFineAmount } from '@/types/infractions';
import { cn } from '@/lib/utils';

interface InfractionSelectorProps {
  value?: Infraction | null;
  onChange: (infraction: Infraction | null) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const categoryIcons = {
  contravention: AlertCircle,
  delit_mineur: AlertTriangle,
  delit_majeur: ShieldAlert,
  crime: Skull,
};

export function InfractionSelector({
  value,
  onChange,
  className,
  placeholder = 'Rechercher une infraction...',
  disabled = false,
}: InfractionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InfractionCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { infractions, searchInfractions, isLoading } = useInfractions();

  // Filtrer les resultats
  const filteredResults = searchInfractions(query, selectedCategory || undefined);

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

  const handleSelect = (infraction: Infraction) => {
    onChange(infraction);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const getCategoryConfig = (category: InfractionCategory) => INFRACTION_CATEGORIES[category];

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
                <span className="text-yellow-500 font-medium">
                  {formatFineAmount(value)}
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
              Tous
            </button>
            {Object.values(INFRACTION_CATEGORIES).map((cat) => {
              const Icon = categoryIcons[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    selectedCategory === cat.id
                      ? `${cat.bgColor} ${cat.textColor}`
                      : 'bg-dark-300 text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.nameFr}
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
                {query ? 'Aucune infraction trouvee' : 'Commencez a taper pour rechercher'}
              </div>
            ) : (
              filteredResults.slice(0, 50).map((infraction) => {
                const catConfig = getCategoryConfig(infraction.category);
                const Icon = categoryIcons[infraction.category];

                return (
                  <button
                    key={infraction.id}
                    onClick={() => handleSelect(infraction)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-dark-300 transition-colors text-left border-b border-dark-300 last:border-0"
                  >
                    <div className={cn('p-1.5 rounded-lg flex-shrink-0', catConfig.bgColor)}>
                      <Icon className={cn('w-4 h-4', catConfig.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{infraction.name}</p>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className={catConfig.textColor}>{catConfig.nameFr}</span>
                        {infraction.gav_duration && (
                          <>
                            <span className="text-gray-500">|</span>
                            <span className="text-orange-400">GAV {infraction.gav_duration}min</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-yellow-500 font-medium text-sm">
                        {formatFineAmount(infraction)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with count */}
          <div className="p-2 border-t border-dark-300 text-xs text-gray-500 text-center">
            {filteredResults.length} infraction{filteredResults.length > 1 ? 's' : ''} trouvee{filteredResults.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

export default InfractionSelector;
