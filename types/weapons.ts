/**
 * Types pour le Gun Control (GCA)
 * Registre des armes avec categories et reglementations
 */

export type WeaponCategory = 'A' | 'B' | 'C' | 'D';

export interface WeaponCategoryConfig {
  id: WeaponCategory;
  name: string;
  nameFr: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  severity: number; // 1 = moins dangereux, 4 = plus dangereux
}

export interface Weapon {
  id: string;
  category: WeaponCategory;
  name: string;
  description: string | null;
  free_possession: boolean; // Detention libre
  carry_prohibited: boolean; // Port interdit
  possession_prohibited: boolean; // Detention interdite
  requires_permit: boolean; // Necessite permis (PPA)
  requires_declaration: boolean; // Soumise a declaration
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WeaponInsert = Omit<Weapon, 'id' | 'created_at' | 'updated_at'>;
export type WeaponUpdate = Partial<WeaponInsert>;

/**
 * Configuration des categories d'armes
 * D = moins dangereux -> A = plus dangereux
 */
export const WEAPON_CATEGORIES: Record<WeaponCategory, WeaponCategoryConfig> = {
  D: {
    id: 'D',
    name: 'Categorie D',
    nameFr: 'Categorie D',
    description: 'Armes blanches tranchantes, contondantes et non-letales',
    color: 'info',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500',
    icon: 'Sword',
    severity: 1,
  },
  C: {
    id: 'C',
    name: 'Categorie C',
    nameFr: 'Categorie C',
    description: 'Fusils a pompe et armes de chasse',
    color: 'warning',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-500',
    icon: 'Target',
    severity: 2,
  },
  B: {
    id: 'B',
    name: 'Categorie B',
    nameFr: 'Categorie B',
    description: 'Armes de poing, armes a feu courtes semi-automatiques',
    color: 'error',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500',
    icon: 'Crosshair',
    severity: 3,
  },
  A: {
    id: 'A',
    name: 'Categorie A',
    nameFr: 'Categorie A',
    description: 'Toutes armes a feu automatiques, mines, bombes, et armes avec munitions a balles perforantes',
    color: 'error',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    icon: 'Bomb',
    severity: 4,
  },
};

/**
 * Ordre des categories (du moins au plus dangereux)
 */
export const WEAPON_CATEGORY_ORDER: WeaponCategory[] = ['D', 'C', 'B', 'A'];

/**
 * Obtenir la configuration d'une categorie
 */
export function getWeaponCategoryConfig(category: WeaponCategory): WeaponCategoryConfig {
  return WEAPON_CATEGORIES[category];
}

/**
 * Interface pour les restrictions d'une arme
 */
export interface WeaponRestrictions {
  freeToOwn: boolean;
  canCarry: boolean;
  canPossess: boolean;
  needsPermit: boolean;
  needsDeclaration: boolean;
}

/**
 * Obtenir les restrictions d'une arme
 */
export function getWeaponRestrictions(weapon: Weapon): WeaponRestrictions {
  return {
    freeToOwn: weapon.free_possession,
    canCarry: !weapon.carry_prohibited,
    canPossess: !weapon.possession_prohibited,
    needsPermit: weapon.requires_permit,
    needsDeclaration: weapon.requires_declaration,
  };
}

/**
 * Verifier si une arme est illegale (detention interdite ou necessite permis)
 */
export function isWeaponIllegalWithoutPermit(weapon: Weapon): boolean {
  return weapon.possession_prohibited || weapon.requires_permit;
}

/**
 * Obtenir le statut legal d'une arme en texte
 */
export function getWeaponLegalStatus(weapon: Weapon): string {
  if (weapon.possession_prohibited) {
    return 'Detention interdite';
  }
  if (weapon.requires_permit) {
    return 'Necessite un permis (PPA)';
  }
  if (weapon.requires_declaration) {
    return 'Soumise a declaration';
  }
  if (weapon.carry_prohibited) {
    return 'Port interdit - Detention libre';
  }
  if (weapon.free_possession) {
    return 'Detention libre';
  }
  return 'Statut indetermine';
}

/**
 * Obtenir la couleur du badge selon le statut legal
 */
export function getWeaponStatusColor(weapon: Weapon): string {
  if (weapon.possession_prohibited) return 'error';
  if (weapon.requires_permit) return 'warning';
  if (weapon.requires_declaration) return 'info';
  return 'success';
}
