/**
 * Client Supabase pour OlympusMDT
 * Créé par Snowzy
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    timeout: 30000, // 30 secondes au lieu de 10 par défaut
    heartbeatIntervalMs: 15000, // Heartbeat toutes les 15 secondes
  },
});

// Types de base de données
export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          agency_id: string;
          discord_username: string;
          discord_user_id: string | null;
          discord_avatar: string | null;
          badge: string;
          first_name: string;
          last_name: string;
          grade: 'cadet' | 'officer' | 'corporal' | 'sergeant' | 'lieutenant' | 'captain' | 'commander' | 'chief';
          division: 'patrol' | 'traffic' | 'k9' | 'swat' | 'detectives' | 'administration';
          certifications: string[];
          status: 'active' | 'off_duty' | 'training' | 'leave';
          supervisor_id: string | null;
          phone: string | null;
          radio: string | null;
          date_joined: string;
          created_at: string;
          updated_at: string;
          total_hours: number;
          interventions: number;
          arrests: number;
          reports_written: number;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
      agent_history: {
        Row: {
          id: string;
          agent_id: string;
          type: string;
          description: string;
          performed_by: string | null;
          created_at: string;
          metadata: Record<string, any>;
        };
        Insert: Omit<Database['public']['Tables']['agent_history']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agent_history']['Insert']>;
      };
    };
  };
};

export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];
export type AgentHistory = Database['public']['Tables']['agent_history']['Row'];
