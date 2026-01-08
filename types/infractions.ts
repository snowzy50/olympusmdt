/**
 * Types pour le Livret Penal
 * Base de donnees des infractions avec categories et peines
 */

export type InfractionCategory = 'contravention' | 'delit_mineur' | 'delit_majeur' | 'crime';

export interface InfractionCategoryConfig {
  id: InfractionCategory;
  name: string;
  nameFr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  penalties: string[];
  icon: string;
}

export interface Infraction {
  id: string;
  category: InfractionCategory;
  name: string;
  description: string | null;
  base_fine: number | null;
  fine_formula: string | null;
  gav_duration: number | null;
  notes: string | null;
  penalties: string[] | null;
  requires_prosecutor: boolean;
  requires_tribunal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type InfractionInsert = Omit<Infraction, 'id' | 'created_at' | 'updated_at'>;
export type InfractionUpdate = Partial<InfractionInsert>;

/**
 * Configuration des categories d'infractions
 */
export const INFRACTION_CATEGORIES: Record<InfractionCategory, InfractionCategoryConfig> = {
  contravention: {
    id: 'contravention',
    name: 'Contravention',
    nameFr: 'Contravention',
    color: 'info',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500',
    description: 'Infractions mineures - Amendes et avertissements',
    penalties: [
      'Amende',
      'Retrait de points (RP)',
      'Avertissement ecrit',
      'Retrait du permis (temporaire RP)',
      'Mise en fourriere RP',
    ],
    icon: 'AlertCircle',
  },
  delit_mineur: {
    id: 'delit_mineur',
    name: 'Delit Mineur',
    nameFr: 'Delit Mineur',
    color: 'warning',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-500',
    description: 'Delits de faible gravite - GAV jusqu\'a 30 minutes',
    penalties: [
      'Amende',
      'TIG (1 a 3 cycles)',
      'GAV (jusqu\'a 30 min RP)',
      'Saisie',
      'Interdiction de contact RP (24-72h)',
    ],
    icon: 'AlertTriangle',
  },
  delit_majeur: {
    id: 'delit_majeur',
    name: 'Delit Majeur',
    nameFr: 'Delit Majeur',
    color: 'error',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500',
    description: 'Delits graves - Prison 20-60 minutes',
    penalties: [
      'Amende',
      'Prison (20-60 min RP)',
      'TIG (3 a 6 cycles)',
      'Confiscation substances/numeraire',
      'Perquisition RP (si cadre RP)',
      'Saisie de l\'arme',
      'Suspension/annulation PPA (RP)',
    ],
    icon: 'ShieldAlert',
  },
  crime: {
    id: 'crime',
    name: 'Crime',
    nameFr: 'Crime',
    color: 'error',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    description: 'Crimes graves - Prison 60-120 minutes, tribunal',
    penalties: [
      'Prison (60-120 min RP)',
      'Amende elevee',
      'Saisie des biens/armes',
      'Casier judiciaire RP',
      'Perte d\'emploi public RP',
      'Ineligibilite a fonctions RP',
      'Coordination DOJ/SASP/SAMD/SAFD',
    ],
    icon: 'Skull',
  },
};

/**
 * Obtenir la configuration d'une categorie
 */
export function getInfractionCategoryConfig(category: InfractionCategory): InfractionCategoryConfig {
  return INFRACTION_CATEGORIES[category];
}

/**
 * Formater le montant de l'amende
 */
export function formatFineAmount(infraction: Infraction): string {
  if (infraction.base_fine !== null) {
    return `${infraction.base_fine.toLocaleString('fr-FR')} $`;
  }
  if (infraction.fine_formula) {
    return infraction.fine_formula;
  }
  return 'Tribunal';
}

/**
 * Formater la duree de GAV
 */
export function formatGavDuration(minutes: number | null): string {
  if (minutes === null) return '-';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h${remainingMinutes}`;
}

/**
 * Calculer l'amende avec multiplicateur DEFCON
 */
export function calculateFineWithDefcon(baseFine: number, defconMultiplier: number): number {
  return Math.round(baseFine * defconMultiplier);
}

/**
 * Liste des categories dans l'ordre de severite
 */
export const INFRACTION_CATEGORY_ORDER: InfractionCategory[] = [
  'contravention',
  'delit_mineur',
  'delit_majeur',
  'crime',
];
