/**
 * Adaptateur pour convertir entre les types Agent locaux et Supabase
 * Créé par Snowzy
 */

import type { Agent as LocalAgent, AgentCertification } from './agent';
import type { Agent as SupabaseAgent } from '@/lib/supabase/client';

// Convertir un agent Supabase en agent local
export function supabaseToLocal(agent: SupabaseAgent): LocalAgent {
  return {
    id: agent.id,
    discordUsername: agent.discord_username,
    discordAvatar: agent.discord_avatar || undefined,
    badge: agent.badge,
    firstName: agent.first_name,
    lastName: agent.last_name,
    grade: agent.grade,
    division: agent.division,
    certifications: agent.certifications as AgentCertification[],
    status: agent.status,
    dateJoined: new Date(agent.date_joined),
    supervisor: agent.supervisor_id || undefined,
    phone: agent.phone || undefined,
    radio: agent.radio || undefined,
    stats: {
      totalHours: agent.total_hours,
      interventions: agent.interventions,
      arrests: agent.arrests,
      reportsWritten: agent.reports_written,
    },
    history: [], // L'historique sera chargé séparément si nécessaire
    notes: agent.notes || undefined,
  };
}

// Convertir un agent local en agent Supabase (pour insertion)
export function localToSupabase(agent: Partial<LocalAgent>, agencyId: string) {
  return {
    agency_id: agencyId,
    discord_username: agent.discordUsername || '',
    discord_user_id: null, // TODO: Récupérer le vrai Discord ID via API
    discord_avatar: agent.discordAvatar || null,
    badge: agent.badge || '',
    first_name: agent.firstName || '',
    last_name: agent.lastName || '',
    grade: agent.grade || 'cadet',
    division: agent.division || 'patrol',
    certifications: agent.certifications || [],
    status: agent.status || 'off_duty',
    date_joined: agent.dateJoined ? agent.dateJoined.toISOString() : new Date().toISOString(),
    supervisor_id: agent.supervisor || null,
    phone: agent.phone || null,
    radio: agent.radio || null,
    total_hours: agent.stats?.totalHours || 0,
    interventions: agent.stats?.interventions || 0,
    arrests: agent.stats?.arrests || 0,
    reports_written: agent.stats?.reportsWritten || 0,
    notes: agent.notes || null,
  };
}
