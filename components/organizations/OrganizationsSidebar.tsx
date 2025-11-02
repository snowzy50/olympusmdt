/**
 * Sidebar des organisations et territoires
 * Créé par: Snowzy
 * Features: Liste organisations, highlight territoires au clic
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, MapPin, Users, X } from 'lucide-react';
import type { Organization, Territory } from '@/types/organizations';
import { organizationTypeLabels, organizationTypeIcons } from '@/types/organizations';

interface OrganizationsSidebarProps {
  organizations: Organization[];
  territories: Territory[];
  selectedOrgId: string | null;
  onSelectOrganization: (orgId: string | null) => void;
  onTerritoryFocus?: (territory: Territory) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function OrganizationsSidebar({
  organizations,
  territories,
  selectedOrgId,
  onSelectOrganization,
  onTerritoryFocus,
  isOpen,
  onToggle,
}: OrganizationsSidebarProps) {
  const [expandedOrgs, setExpandedOrgs] = React.useState<Set<string>>(new Set());

  const toggleOrg = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const getOrgTerritories = (orgId: string) => {
    return territories.filter((t) => t.organization_id === orgId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        exit={{ x: 320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-700 shadow-2xl z-[1001] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Organisations</h2>
              <p className="text-xs text-gray-400">{organizations.length} organisations</p>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Liste des organisations */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {organizations.map((org) => {
            const orgTerritories = getOrgTerritories(org.id);
            const isExpanded = expandedOrgs.has(org.id);
            const isSelected = selectedOrgId === org.id;

            return (
              <div key={org.id} className="space-y-1">
                {/* Organisation */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  <div
                    onClick={() => {
                      if (isSelected) {
                        onSelectOrganization(null);
                      } else {
                        onSelectOrganization(org.id);
                        setExpandedOrgs(new Set([...expandedOrgs, org.id]));
                      }
                    }}
                    className="p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: org.color }}
                      >
                        {organizationTypeIcons[org.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate">{org.name}</h3>
                        <p className="text-xs text-gray-400">{organizationTypeLabels[org.type]}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          <MapPin className="w-3 h-3" />
                          {orgTerritories.length}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrg(org.id);
                          }}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-gray-600/50">
                        <div className="text-xs text-gray-400">
                          Cliquez à nouveau pour désélectionner
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Liste des territoires */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1">
                          {orgTerritories.length === 0 ? (
                            <div className="text-xs text-gray-500 italic py-2">
                              Aucun territoire
                            </div>
                          ) : (
                            orgTerritories.map((territory) => (
                              <div
                                key={territory.id}
                                onClick={() => onTerritoryFocus?.(territory)}
                                className="pl-4 py-2 bg-gray-900/50 rounded border-l-2 hover:bg-gray-800/50 transition-colors cursor-pointer"
                                style={{ borderLeftColor: territory.color || org.color }}
                                title="Cliquer pour zoomer sur ce territoire"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-300 truncate">
                                    {territory.name}
                                  </span>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {territory.coordinates.length} pts
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}

          {organizations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune organisation</p>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-700 bg-gray-800/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-700/30 rounded p-2">
              <div className="text-gray-400">Organisations</div>
              <div className="text-white font-bold">{organizations.length}</div>
            </div>
            <div className="bg-gray-700/30 rounded p-2">
              <div className="text-gray-400">Territoires</div>
              <div className="text-white font-bold">{territories.length}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
