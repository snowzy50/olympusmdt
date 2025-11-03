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
      ankle_monitors: {
        Row: {
          id: string;
          monitor_number: string;
          citizen_name: string;
          citizen_id: string;
          device_id: string;
          status: 'active' | 'inactive' | 'violation' | 'low_battery';
          install_date: string;
          removal_date: string | null;
          assigned_officer: string;
          officer_id: string;
          last_location: string | null;
          battery_level: number | null;
          violations: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ankle_monitors']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ankle_monitors']['Insert']>;
      };
      medical_records: {
        Row: {
          id: string;
          record_number: string;
          patient_name: string;
          patient_id: string;
          type: 'emergency' | 'consultation' | 'hospitalization';
          diagnosis: string;
          treatment: string;
          doctor: string;
          doctor_id: string;
          date: string;
          location: string;
          status: 'ongoing' | 'completed' | 'follow_up_required';
          priority: 'low' | 'medium' | 'high' | 'critical';
          prescriptions: string[] | null;
          sick_leave: { startDate: string; endDate: string; reason: string } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medical_records']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medical_records']['Insert']>;
      };
      certificates: {
        Row: {
          id: string;
          certificate_number: string;
          type: 'medical' | 'ppa' | 'death' | 'incident';
          patient_name: string;
          patient_id: string;
          issued_by: string;
          doctor_id: string;
          date: string;
          status: 'valid' | 'expired' | 'revoked';
          description: string;
          valid_until: string | null;
          shared_with: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          property_number: string;
          type: 'house' | 'apartment' | 'commercial' | 'land';
          address: string;
          coordinates: { lat: number; lng: number };
          status: 'available' | 'rented' | 'sold' | 'reserved';
          price: number;
          rent_price: number | null;
          surface: number;
          rooms: number;
          tenant: string | null;
          owner: string | null;
          agent: string;
          agent_id: string;
          description: string;
          features: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          transaction_number: string;
          type: 'sale' | 'rent' | 'commission' | 'expense';
          category: string;
          amount: number;
          property: string | null;
          agent: string;
          agent_id: string;
          client: string | null;
          date: string;
          description: string;
          status: 'pending' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      licenses: {
        Row: {
          id: string;
          license_number: string;
          citizen_name: string;
          citizen_id: string;
          type: 'car' | 'motorcycle' | 'truck' | 'boat' | 'aircraft';
          status: 'valid' | 'suspended' | 'revoked' | 'expired';
          issue_date: string;
          expiry_date: string;
          points: number;
          restrictions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['licenses']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['licenses']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          report_number: string;
          type: 'operation' | 'shooting' | 'arrest';
          title: string;
          officer: string;
          officer_id: string;
          date: string;
          location: string;
          status: 'draft' | 'submitted' | 'validated' | 'archived';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          summary: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      seizures: {
        Row: {
          id: string;
          seizure_number: string;
          type: 'weapons' | 'drugs' | 'vehicle' | 'goods';
          description: string;
          quantity: number;
          unit: string;
          estimated_value: number;
          seized_by: string;
          officer_id: string;
          location: string;
          date: string;
          status: 'stored' | 'evidence' | 'destroyed' | 'returned';
          case_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['seizures']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['seizures']['Insert']>;
      };
      fines: {
        Row: {
          id: string;
          fine_number: string;
          citizen_name: string;
          citizen_id: string;
          violation: string;
          amount: number;
          issued_by: string;
          officer_id: string;
          date: string;
          due_date: string;
          status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
          payment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fines']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['fines']['Insert']>;
      };
    };
  };
};

export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];
export type AgentHistory = Database['public']['Tables']['agent_history']['Row'];

// Types pour les nouveaux modules
export type AnkleMonitor = Database['public']['Tables']['ankle_monitors']['Row'];
export type AnkleMonitorInsert = Database['public']['Tables']['ankle_monitors']['Insert'];
export type AnkleMonitorUpdate = Database['public']['Tables']['ankle_monitors']['Update'];

export type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];
export type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert'];
export type MedicalRecordUpdate = Database['public']['Tables']['medical_records']['Update'];

export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update'];

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type License = Database['public']['Tables']['licenses']['Row'];
export type LicenseInsert = Database['public']['Tables']['licenses']['Insert'];
export type LicenseUpdate = Database['public']['Tables']['licenses']['Update'];

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export type Seizure = Database['public']['Tables']['seizures']['Row'];
export type SeizureInsert = Database['public']['Tables']['seizures']['Insert'];
export type SeizureUpdate = Database['public']['Tables']['seizures']['Update'];

export type Fine = Database['public']['Tables']['fines']['Row'];
export type FineInsert = Database['public']['Tables']['fines']['Insert'];
export type FineUpdate = Database['public']['Tables']['fines']['Update'];
