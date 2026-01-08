/**
 * Types pour le systeme DEFCON
 * Niveaux d'alerte avec regles et multiplicateurs d'amendes
 */

export type DefconLevel = 1 | 2 | 3 | 4 | 5;

export interface DefconConfig {
  level: DefconLevel;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  maxDurationHours: number | null; // null = indefini
  prolongationHours: string | null;
  authorization: string;
  idControl: string;
  searchPolicy: string;
  equipment: string;
  signification: string;
  fineMultiplier: number;
  applicationDecision: string;
}

export interface DefconStatus {
  id: string;
  agency_id: string;
  level: DefconLevel;
  description: string | null;
  duration_hours: number | null;
  started_at: string;
  ends_at: string | null;
  activated_by: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DefconStatusInsert = Omit<DefconStatus, 'id' | 'created_at' | 'updated_at'>;
export type DefconStatusUpdate = Partial<DefconStatusInsert>;

/**
 * Configuration complete des 5 niveaux DEFCON
 * Basee sur le document officiel DEFCON OLYMPUS RP
 */
export const DEFCON_CONFIGS: Record<DefconLevel, DefconConfig> = {
  5: {
    level: 5,
    name: 'DEFCON 5',
    color: 'success',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500',
    textColor: 'text-green-500',
    description: 'Aucun Danger',
    maxDurationHours: null,
    prolongationHours: null,
    authorization: 'Gouvernement & Chief SASP',
    idControl: 'Controle d\'identite (sans palpation)',
    searchPolicy: 'Aucune fouille systematique',
    equipment: 'Gilet sans poche & Arme legere',
    signification: 'Aucun Danger',
    fineMultiplier: 1.0,
    applicationDecision: 'Chief et Commandant SASP',
  },
  4: {
    level: 4,
    name: 'DEFCON 4',
    color: 'warning',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-500',
    description: 'Potentielle menace a la securite publique',
    maxDurationHours: 96,
    prolongationHours: '1 a 48h',
    authorization: 'Gouvernement & Chief SASP',
    idControl: 'Palpation de securite + Controle d\'identite',
    searchPolicy: 'Palpation de securite autorisee',
    equipment: 'Gilet avec Poche + Armes Lourdes dans le coffre',
    signification: 'Potentiel menace a la securite publique en cours',
    fineMultiplier: 1.0,
    applicationDecision: 'Chief et Commandant SASP',
  },
  3: {
    level: 3,
    name: 'DEFCON 3',
    color: 'warning',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500',
    description: 'Menace a la securite publique en cours',
    maxDurationHours: 72,
    prolongationHours: '1 a 48h',
    authorization: 'Gouvernement & Chief SASP',
    idControl: 'Fouille citoyen + Controle d\'identite',
    searchPolicy: 'Fouille des citoyens autorisee',
    equipment: 'Gilet avec poche & Armes lourdes autorisees en controle',
    signification: 'Menace a la securite publique en cours',
    fineMultiplier: 1.5,
    applicationDecision: 'SASP',
  },
  2: {
    level: 2,
    name: 'DEFCON 2',
    color: 'error',
    bgColor: 'bg-red-600/20',
    borderColor: 'border-red-600',
    textColor: 'text-red-600',
    description: 'La securite publique ne peut pas etre defendue',
    maxDurationHours: 48,
    prolongationHours: '1 a 24h',
    authorization: 'Gouvernement & Chief SASP',
    idControl: 'Fouille citoyens et coffre des vehicules + Controle d\'identite',
    searchPolicy: 'Fouille complete autorisee (citoyens et vehicules)',
    equipment: 'Gilet avec poche & Armes lourdes autorisees en deplacement',
    signification: 'La securite publique ne peut pas etre defendue afin de retablir l\'ordre',
    fineMultiplier: 3.0,
    applicationDecision: 'SASP',
  },
  1: {
    level: 1,
    name: 'DEFCON 1',
    color: 'error',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    description: 'L\'Etat de Los Santos est en guerre',
    maxDurationHours: 96,
    prolongationHours: '1 a 96h',
    authorization: 'Gouvernement & Chief SASP',
    idControl: 'Fouille & controle d\'identite sur citoyens ne respectant pas les directives',
    searchPolicy: 'Fouille systematique sur non-conformite',
    equipment: 'Gilet lourd & Armes lourdes autorisees pour tous deplacements',
    signification: 'L\'Etat de Los Santos est en guerre',
    fineMultiplier: 3.0,
    applicationDecision: 'SASP',
  },
};

/**
 * Obtenir la configuration d'un niveau DEFCON
 */
export function getDefconConfig(level: DefconLevel): DefconConfig {
  return DEFCON_CONFIGS[level];
}

/**
 * Obtenir le multiplicateur d'amende pour un niveau DEFCON
 */
export function getDefconFineMultiplier(level: DefconLevel): number {
  return DEFCON_CONFIGS[level].fineMultiplier;
}

/**
 * Verifier si un niveau est critique (1 ou 2)
 */
export function isDefconCritical(level: DefconLevel): boolean {
  return level <= 2;
}

/**
 * Obtenir la couleur Tailwind pour un niveau
 */
export function getDefconColorClass(level: DefconLevel): string {
  return DEFCON_CONFIGS[level].textColor;
}
