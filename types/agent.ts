export type AgentGrade =
  | 'cadet'
  | 'officer'
  | 'corporal'
  | 'sergeant'
  | 'lieutenant'
  | 'captain'
  | 'commander'
  | 'chief';

export type AgentStatus =
  | 'active'      // En service
  | 'off_duty'    // Hors service
  | 'training'    // En formation
  | 'leave';      // Congé

export type AgentDivision =
  | 'patrol'
  | 'traffic'
  | 'k9'
  | 'swat'
  | 'detectives'
  | 'administration';

export type AgentCertification =
  | 'SWAT'
  | 'K9'
  | 'FTO'          // Field Training Officer
  | 'Detective'
  | 'Traffic'
  | 'Firearms'
  | 'Medic'
  | 'Negotiator'
  | 'Pilot';

export interface AgentStats {
  totalHours: number;
  interventions: number;
  arrests: number;
  reportsWritten: number;
}

export interface AgentHistoryEntry {
  id: string;
  type: 'promotion' | 'demotion' | 'certification' | 'action' | 'note';
  date: Date;
  description: string;
  performedBy?: string; // ID de l'agent qui a effectué l'action
}

export interface Agent {
  id: string;
  discordUsername: string;
  discordAvatar?: string;
  badge: string;              // Ex: "#247"
  firstName: string;
  lastName: string;
  grade: AgentGrade;
  division: AgentDivision;
  certifications: AgentCertification[];
  status: AgentStatus;
  dateJoined: Date;
  supervisor?: string;        // ID du supérieur hiérarchique
  phone?: string;
  radio?: string;
  stats: AgentStats;
  history: AgentHistoryEntry[];
  notes?: string;             // Notes administratives
}

export interface AgentFilters {
  search: string;
  grade: AgentGrade | 'all';
  status: AgentStatus | 'all';
  division: AgentDivision | 'all';
}

// Configurations des grades avec couleurs
export const GRADE_CONFIG: Record<AgentGrade, { label: string; color: string; order: number }> = {
  cadet: { label: 'Cadet', color: 'gray', order: 1 },
  officer: { label: 'Officer', color: 'blue', order: 2 },
  corporal: { label: 'Corporal', color: 'cyan', order: 3 },
  sergeant: { label: 'Sergeant', color: 'green', order: 4 },
  lieutenant: { label: 'Lieutenant', color: 'yellow', order: 5 },
  captain: { label: 'Captain', color: 'orange', order: 6 },
  commander: { label: 'Commander', color: 'red', order: 7 },
  chief: { label: 'Chief', color: 'purple', order: 8 },
};

// Configuration des statuts
export const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: string }> = {
  active: { label: 'En service', color: 'green', icon: '🟢' },
  off_duty: { label: 'Hors service', color: 'yellow', icon: '🟡' },
  training: { label: 'Formation', color: 'blue', icon: '🔵' },
  leave: { label: 'Congé', color: 'gray', icon: '⚫' },
};

// Configuration des divisions
export const DIVISION_CONFIG: Record<AgentDivision, { label: string; color: string }> = {
  patrol: { label: 'Patrol', color: 'blue' },
  traffic: { label: 'Traffic', color: 'orange' },
  k9: { label: 'K9', color: 'amber' },
  swat: { label: 'SWAT', color: 'red' },
  detectives: { label: 'Detectives', color: 'purple' },
  administration: { label: 'Administration', color: 'gray' },
};

// Configuration des certifications
export const CERTIFICATION_CONFIG: Record<AgentCertification, { label: string; color: string }> = {
  SWAT: { label: 'SWAT', color: 'red' },
  K9: { label: 'K9', color: 'amber' },
  FTO: { label: 'FTO', color: 'green' },
  Detective: { label: 'Detective', color: 'purple' },
  Traffic: { label: 'Traffic', color: 'orange' },
  Firearms: { label: 'Firearms', color: 'gray' },
  Medic: { label: 'Medic', color: 'blue' },
  Negotiator: { label: 'Negotiator', color: 'cyan' },
  Pilot: { label: 'Pilot', color: 'indigo' },
};
