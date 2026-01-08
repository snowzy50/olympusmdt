/**
 * Client Supabase pour OlympusMDT
 * Créé par Snowzy
 */

import { createClient } from '@supabase/supabase-js';

// Détection robuste des variables d'environnement (Next.js vs Vite)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined') {
  if (!supabaseUrl) console.warn('Supabase URL is missing!');
  if (!supabaseAnonKey) console.warn('Supabase Anon Key is missing!');

  if (supabaseUrl && supabaseAnonKey) {
    console.log('Supabase Client initialized with URL:', supabaseUrl.substring(0, 15) + '...');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    timeout: 30000,
    heartbeatIntervalMs: 15000,
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
          weapon_id: string | null;
          weapon_category: 'A' | 'B' | 'C' | 'D' | null;
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
          infraction_id: string | null;
          defcon_multiplier: number;
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
      // ============================================
      // SYSTEME DEFCON, LIVRET PENAL, GUN CONTROL
      // ============================================
      defcon_status: {
        Row: {
          id: string;
          agency_id: string;
          level: 1 | 2 | 3 | 4 | 5;
          description: string | null;
          duration_hours: number | null;
          started_at: string;
          ends_at: string | null;
          activated_by: string;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['defcon_status']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['defcon_status']['Insert']>;
      };
      infractions: {
        Row: {
          id: string;
          category: 'contravention' | 'delit_mineur' | 'delit_majeur' | 'crime';
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
        };
        Insert: Omit<Database['public']['Tables']['infractions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['infractions']['Insert']>;
      };
      weapons_registry: {
        Row: {
          id: string;
          category: 'A' | 'B' | 'C' | 'D';
          name: string;
          description: string | null;
          free_possession: boolean;
          carry_prohibited: boolean;
          possession_prohibited: boolean;
          requires_permit: boolean;
          requires_declaration: boolean;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weapons_registry']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weapons_registry']['Insert']>;
      };
      // ============================================
      // NOUVELLES TABLES MÉDICALES - SAMC
      // ============================================
      interventions: {
        Row: {
          id: string;
          intervention_number: string;
          type: 'emergency' | 'hospitalization' | 'visit' | 'consultation' | 'transport';
          patient_name: string;
          patient_id: string;
          practitioner: string;
          practitioner_id: string;
          date: string;
          location: string;
          diagnosis: string | null;
          treatment: string | null;
          notes: string | null;
          status: 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['interventions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['interventions']['Insert']>;
      };
      sick_leaves: {
        Row: {
          id: string;
          sick_leave_number: string;
          patient_name: string;
          patient_id: string;
          doctor: string;
          doctor_id: string;
          start_date: string;
          end_date: string;
          duration_days: number;
          medical_reason: string;
          certificate_id: string | null;
          status: 'active' | 'expired' | 'extended';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sick_leaves']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sick_leaves']['Insert']>;
      };
      prescriptions: {
        Row: {
          id: string;
          prescription_number: string;
          patient_name: string;
          patient_id: string;
          doctor: string;
          doctor_id: string;
          medications: Array<{ name: string; dosage: string; frequency: string }>;
          posology: string;
          treatment_duration: string;
          date: string;
          refills_allowed: number;
          notes: string | null;
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prescriptions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['prescriptions']['Insert']>;
      };
      death_certificates: {
        Row: {
          id: string;
          certificate_number: string;
          deceased_name: string;
          deceased_id: string;
          date_of_death: string;
          location_of_death: string;
          doctor: string;
          doctor_id: string;
          cause_of_death: string;
          circumstances: string | null;
          autopsy_required: boolean;
          status: 'draft' | 'validated' | 'archived';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['death_certificates']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['death_certificates']['Insert']>;
      };
      incident_reports: {
        Row: {
          id: string;
          report_number: string;
          type: 'medical_error' | 'accident' | 'equipment_failure' | 'other';
          date: string;
          location: string;
          staff_involved: string;
          staff_ids: string | null;
          description: string;
          severity: 'minor' | 'moderate' | 'severe' | 'critical';
          corrective_actions: string | null;
          status: 'investigating' | 'closed' | 'pending_review';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['incident_reports']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['incident_reports']['Insert']>;
      };
      medical_acts: {
        Row: {
          id: string;
          act_number: string;
          type: 'consultation' | 'care' | 'surgery' | 'analysis' | 'imaging' | 'other';
          patient_name: string;
          patient_id: string;
          practitioner: string;
          practitioner_id: string;
          date: string;
          duration_minutes: number | null;
          description: string;
          act_code: string | null;
          cost: number;
          notes: string | null;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medical_acts']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medical_acts']['Insert']>;
      };
      medical_staff: {
        Row: {
          id: string;
          staff_number: string;
          first_name: string;
          last_name: string;
          role: 'doctor' | 'nurse' | 'paramedic' | 'surgeon' | 'specialist' | 'intern' | 'admin';
          specialty: string | null;
          grade: string | null;
          license_number: string | null;
          phone: string | null;
          email: string | null;
          service_hours: number;
          availability: 'available' | 'on_call' | 'busy' | 'off_duty';
          status: 'active' | 'on_leave' | 'suspended' | 'inactive';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medical_staff']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medical_staff']['Insert']>;
      };
      on_duty_schedule: {
        Row: {
          id: string;
          schedule_number: string;
          staff_id: string;
          staff_name: string;
          staff_role: string;
          start_time: string;
          end_time: string;
          shift_type: 'day' | 'night' | 'weekend' | 'on_call';
          service: string;
          unit: string | null;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          replacement_staff_id: string | null;
          replacement_staff_name: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['on_duty_schedule']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['on_duty_schedule']['Insert']>;
      };
      ppa_certificates: {
        Row: {
          id: string;
          certificate_number: string;
          citizen_name: string;
          citizen_id: string;
          doctor: string;
          doctor_id: string;
          examination_date: string;
          fitness: 'fit' | 'unfit' | 'fit_with_restrictions';
          validity_months: number;
          expiry_date: string;
          restrictions: string | null;
          medical_observations: string | null;
          sasp_validated: boolean;
          sasp_validator: string | null;
          sasp_validation_date: string | null;
          status: 'pending' | 'validated' | 'rejected' | 'expired';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ppa_certificates']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ppa_certificates']['Insert']>;
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

// Types pour les modules médicaux SAMC
export type Intervention = Database['public']['Tables']['interventions']['Row'];
export type InterventionInsert = Database['public']['Tables']['interventions']['Insert'];
export type InterventionUpdate = Database['public']['Tables']['interventions']['Update'];

export type SickLeave = Database['public']['Tables']['sick_leaves']['Row'];
export type SickLeaveInsert = Database['public']['Tables']['sick_leaves']['Insert'];
export type SickLeaveUpdate = Database['public']['Tables']['sick_leaves']['Update'];

export type Prescription = Database['public']['Tables']['prescriptions']['Row'];
export type PrescriptionInsert = Database['public']['Tables']['prescriptions']['Insert'];
export type PrescriptionUpdate = Database['public']['Tables']['prescriptions']['Update'];

export type DeathCertificate = Database['public']['Tables']['death_certificates']['Row'];
export type DeathCertificateInsert = Database['public']['Tables']['death_certificates']['Insert'];
export type DeathCertificateUpdate = Database['public']['Tables']['death_certificates']['Update'];

export type IncidentReport = Database['public']['Tables']['incident_reports']['Row'];
export type IncidentReportInsert = Database['public']['Tables']['incident_reports']['Insert'];
export type IncidentReportUpdate = Database['public']['Tables']['incident_reports']['Update'];

export type MedicalAct = Database['public']['Tables']['medical_acts']['Row'];
export type MedicalActInsert = Database['public']['Tables']['medical_acts']['Insert'];
export type MedicalActUpdate = Database['public']['Tables']['medical_acts']['Update'];

export type MedicalStaff = Database['public']['Tables']['medical_staff']['Row'];
export type MedicalStaffInsert = Database['public']['Tables']['medical_staff']['Insert'];
export type MedicalStaffUpdate = Database['public']['Tables']['medical_staff']['Update'];

export type OnDutySchedule = Database['public']['Tables']['on_duty_schedule']['Row'];
export type OnDutyScheduleInsert = Database['public']['Tables']['on_duty_schedule']['Insert'];
export type OnDutyScheduleUpdate = Database['public']['Tables']['on_duty_schedule']['Update'];

export type PPACertificate = Database['public']['Tables']['ppa_certificates']['Row'];
export type PPACertificateInsert = Database['public']['Tables']['ppa_certificates']['Insert'];
export type PPACertificateUpdate = Database['public']['Tables']['ppa_certificates']['Update'];

// Types pour DEFCON, Livret Penal, Gun Control
export type DbDefconStatus = Database['public']['Tables']['defcon_status']['Row'];
export type DbDefconStatusInsert = Database['public']['Tables']['defcon_status']['Insert'];
export type DbDefconStatusUpdate = Database['public']['Tables']['defcon_status']['Update'];

export type DbInfraction = Database['public']['Tables']['infractions']['Row'];
export type DbInfractionInsert = Database['public']['Tables']['infractions']['Insert'];
export type DbInfractionUpdate = Database['public']['Tables']['infractions']['Update'];

export type DbWeapon = Database['public']['Tables']['weapons_registry']['Row'];
export type DbWeaponInsert = Database['public']['Tables']['weapons_registry']['Insert'];
export type DbWeaponUpdate = Database['public']['Tables']['weapons_registry']['Update'];
