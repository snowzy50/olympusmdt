/**
 * Types TypeScript pour le système d'organisations
 * Créé par: Snowzy
 * Description: Types pour gangs, mafias, MC, territoires et POI
 */

// Types d'organisations
export type OrganizationType = 'gang' | 'mafia' | 'mc' | 'cartel' | 'other';

// Rôles dans les organisations
export type MemberRole = 'boss' | 'underboss' | 'lieutenant' | 'soldier' | 'associate';

// Types de relations
export type RelationType = 'ally' | 'enemy' | 'neutral' | 'war';

// Types de points d'intérêt
export type POIType =
  | 'lab'
  | 'safehouse'
  | 'dealpoint'
  | 'garage'
  | 'warehouse'
  | 'clubhouse'
  | 'hideout'
  | 'business'
  | 'landmark'
  | 'other';

// Interface pour les coordonnées
export interface Coordinates {
  lat: number;
  lng: number;
}

// Interface pour une organisation
export interface Organization {
  id: string;
  name: string;
  short_name?: string;
  type: OrganizationType;
  color: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Interface pour un membre d'organisation
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id?: string;
  user_name: string;
  role: MemberRole;
  joined_at: string;
  notes?: string;
}

// Interface pour une relation entre organisations
export interface OrganizationRelation {
  id: string;
  organization_id: string;
  target_organization_id: string;
  relation_type: RelationType;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour un territoire
export interface Territory {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  coordinates: Coordinates[]; // Polygone
  color?: string;
  opacity: number;
  created_at: string;
  updated_at: string;
}

// Interface pour un point d'intérêt
export interface TerritoryPOI {
  id: string;
  territory_id?: string;
  organization_id: string;
  name: string;
  type: POIType;
  coordinates: Coordinates;
  description?: string;
  icon?: string;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

// Interface pour une organisation avec toutes ses données
export interface OrganizationWithDetails extends Organization {
  members?: OrganizationMember[];
  allies?: OrganizationRelation[];
  enemies?: OrganizationRelation[];
  territories?: Territory[];
  pois?: TerritoryPOI[];
  member_count?: number;
  territory_count?: number;
}

// Labels pour les types
export const organizationTypeLabels: Record<OrganizationType, string> = {
  gang: 'Gang',
  mafia: 'Mafia',
  mc: 'Motorcycle Club',
  cartel: 'Cartel',
  other: 'Autre',
};

export const memberRoleLabels: Record<MemberRole, string> = {
  boss: 'Chef',
  underboss: 'Sous-chef',
  lieutenant: 'Lieutenant',
  soldier: 'Soldat',
  associate: 'Associé',
};

export const relationTypeLabels: Record<RelationType, string> = {
  ally: 'Allié',
  enemy: 'Ennemi',
  neutral: 'Neutre',
  war: 'En guerre',
};

export const poiTypeLabels: Record<POIType, string> = {
  lab: 'Laboratoire',
  safehouse: 'Planque',
  dealpoint: 'Point de deal',
  garage: 'Garage',
  warehouse: 'Entrepôt',
  clubhouse: 'Clubhouse',
  hideout: 'Cachette',
  business: 'Business',
  landmark: 'Point d\'intérêt',
  other: 'Autre',
};

// Icônes pour les types
export const poiTypeIcons: Record<POIType, string> = {
  lab: '⚗️',
  safehouse: '🏠',
  dealpoint: '💊',
  garage: '🔧',
  warehouse: '📦',
  clubhouse: '🏍️',
  hideout: '🕵️',
  business: '💼',
  landmark: '📍',
  other: '❓',
};

export const organizationTypeIcons: Record<OrganizationType, string> = {
  gang: '🔫',
  mafia: '👔',
  mc: '🏍️',
  cartel: '💰',
  other: '🎭',
};
