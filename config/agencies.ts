import { Activity, Shield, Scale, LucideIcon } from 'lucide-react';

export interface AgencyConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  logo: string;
  color: string;
  gradient: string;
  hoverBorder: string;
  hoverBg: string;
  dashboardPath: string;
  discordRoleName: string;
  discordRoleId?: string;
}

/**
 * Configuration centralisée des agences
 * Créé par Snowzy
 */
export const AGENCIES: AgencyConfig[] = [
  {
    id: 'sasp',
    name: 'Police d\'État',
    shortName: 'SASP',
    description: 'San Andreas State Police',
    icon: Shield,
    logo: '/images/agencies/sasp.png',
    color: 'primary',
    gradient: 'from-primary-600 to-primary-800',
    hoverBorder: 'border-primary-400',
    hoverBg: 'bg-primary-50',
    dashboardPath: '/dashboard/sasp',
    discordRoleName: 'SASP-MDT',
    discordRoleId: '1411802770092200078',
  },
  {
    id: 'samc',
    name: 'Services Médicaux',
    shortName: 'SAMC',
    description: 'San Andreas Medical Center',
    icon: Activity,
    logo: '/images/agencies/samc.webp',
    color: 'error',
    gradient: 'from-error-600 to-error-800',
    hoverBorder: 'border-error-400',
    hoverBg: 'bg-error-50',
    dashboardPath: '/dashboard/samc',
    discordRoleName: 'SAMC-MDT',
    discordRoleId: '1411802924954292308',
  },
  {
    id: 'safd',
    name: 'Pompiers',
    shortName: 'SAFD',
    description: 'San Andreas Fire Department',
    icon: Activity,
    logo: '/images/agencies/safd.png',
    color: 'warning',
    gradient: 'from-warning-600 to-warning-700',
    hoverBorder: 'border-warning-400',
    hoverBg: 'bg-warning-50',
    dashboardPath: '/dashboard/safd',
    discordRoleName: 'SAFD-MDT',
    discordRoleId: '1411802995188043908',
  },
  {
    id: 'dynasty8',
    name: 'Immobilier',
    shortName: 'Dynasty 8',
    description: 'Dynasty 8 Real Estate',
    icon: Shield,
    logo: '/images/agencies/dynasty8.png',
    color: 'success',
    gradient: 'from-success-600 to-success-700',
    hoverBorder: 'border-success-400',
    hoverBg: 'bg-success-50',
    dashboardPath: '/dashboard/dynasty8',
    discordRoleName: 'DYNASTY-MDT',
    discordRoleId: '1411803043145715783',
  },
  {
    id: 'doj',
    name: 'Justice',
    shortName: 'DOJ',
    description: 'Department of Justice',
    icon: Scale,
    logo: '/images/agencies/doj.webp',
    color: 'purple',
    gradient: 'from-purple-600 to-purple-800',
    hoverBorder: 'border-purple-400',
    hoverBg: 'bg-purple-50',
    dashboardPath: '/dashboard/doj',
    discordRoleName: 'DOJ-MDT',
    discordRoleId: '1411803096178360401',
  },
];

/**
 * Récupère une agence par son ID
 */
export function getAgencyById(id: string): AgencyConfig | undefined {
  return AGENCIES.find(agency => agency.id === id);
}

/**
 * Récupère toutes les agences
 */
export function getAllAgencies(): AgencyConfig[] {
  return AGENCIES;
}

/**
 * Récupère le mapping pour le service Discord
 */
export function getDiscordRoleMapping() {
  return AGENCIES.map(agency => ({
    roleName: agency.discordRoleName,
    roleId: agency.discordRoleId,
    agencyId: agency.id,
    agencyName: agency.description,
  }));
}

/**
 * Mappe les IDs de rôles Discord aux agences
 */
export function mapRoleIdsToAgencies(roleIds: string[]): string[] {
  const agencies: string[] = [];

  for (const roleId of roleIds) {
    const agency = AGENCIES.find(a => a.discordRoleId === roleId);
    if (agency) {
      agencies.push(agency.id);
    }
  }

  // Ajouter le rôle admin qui donne accès à tout
  const ADMIN_ROLE_ID = '1433941134081785927';
  if (roleIds.includes(ADMIN_ROLE_ID)) {
    return AGENCIES.map(a => a.id);
  }

  return agencies;
}
