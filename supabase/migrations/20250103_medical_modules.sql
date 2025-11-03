-- Migration: Medical modules for SAMC
-- Créé par Snowzy
-- Description: Tables pour les modules médicaux avec Realtime activé

-- ============================================
-- 1. INTERVENTIONS MÉDICALES
-- ============================================
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('emergency', 'hospitalization', 'visit', 'consultation', 'transport')),
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  practitioner TEXT NOT NULL,
  practitioner_id TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ARRÊTS DE TRAVAIL
-- ============================================
CREATE TABLE IF NOT EXISTS sick_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sick_leave_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  doctor TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL,
  medical_reason TEXT NOT NULL,
  certificate_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'extended')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PRESCRIPTIONS MÉDICALES
-- ============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  doctor TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  medications JSONB NOT NULL, -- [{name: "", dosage: "", frequency: ""}]
  posology TEXT NOT NULL,
  treatment_duration TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  refills_allowed INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CERTIFICATS DE DÉCÈS
-- ============================================
CREATE TABLE IF NOT EXISTS death_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  deceased_name TEXT NOT NULL,
  deceased_id TEXT NOT NULL,
  date_of_death TIMESTAMPTZ NOT NULL,
  location_of_death TEXT NOT NULL,
  doctor TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  cause_of_death TEXT NOT NULL,
  circumstances TEXT,
  autopsy_required BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. RAPPORTS D'INCIDENT MÉDICAL
-- ============================================
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medical_error', 'accident', 'equipment_failure', 'other')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT NOT NULL,
  staff_involved TEXT NOT NULL,
  staff_ids TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  corrective_actions TEXT,
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'closed', 'pending_review')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ACTES MÉDICAUX
-- ============================================
CREATE TABLE IF NOT EXISTS medical_acts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  act_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consultation', 'care', 'surgery', 'analysis', 'imaging', 'other')),
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  practitioner TEXT NOT NULL,
  practitioner_id TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  description TEXT NOT NULL,
  act_code TEXT, -- Nomenclature code
  cost DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. PERSONNEL DE SANTÉ (Medical Staff)
-- ============================================
CREATE TABLE IF NOT EXISTS medical_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'paramedic', 'surgeon', 'specialist', 'intern', 'admin')),
  specialty TEXT, -- urgentiste, chirurgien, généraliste, etc.
  grade TEXT, -- Junior, Senior, Chef de service, etc.
  license_number TEXT,
  phone TEXT,
  email TEXT,
  service_hours INTEGER DEFAULT 0, -- Heures de service accumulées
  availability TEXT NOT NULL DEFAULT 'off_duty' CHECK (availability IN ('available', 'on_call', 'busy', 'off_duty')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. PLANNING DES GARDES
-- ============================================
CREATE TABLE IF NOT EXISTS on_duty_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_number TEXT UNIQUE NOT NULL,
  staff_id UUID NOT NULL REFERENCES medical_staff(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('day', 'night', 'weekend', 'on_call')),
  service TEXT NOT NULL, -- Urgences, Chirurgie, etc.
  unit TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  replacement_staff_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  replacement_staff_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. CERTIFICATS PPA (Port d'Arme)
-- ============================================
CREATE TABLE IF NOT EXISTS ppa_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  citizen_name TEXT NOT NULL,
  citizen_id TEXT NOT NULL,
  doctor TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  examination_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fitness TEXT NOT NULL CHECK (fitness IN ('fit', 'unfit', 'fit_with_restrictions')),
  validity_months INTEGER NOT NULL DEFAULT 12,
  expiry_date DATE NOT NULL,
  restrictions TEXT,
  medical_observations TEXT,
  sasp_validated BOOLEAN DEFAULT FALSE,
  sasp_validator TEXT,
  sasp_validation_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected', 'expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES pour performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_interventions_patient ON interventions(patient_id);
CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);

CREATE INDEX IF NOT EXISTS idx_sick_leaves_patient ON sick_leaves(patient_id);
CREATE INDEX IF NOT EXISTS idx_sick_leaves_dates ON sick_leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_sick_leaves_status ON sick_leaves(status);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(date DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

CREATE INDEX IF NOT EXISTS idx_death_certificates_deceased ON death_certificates(deceased_id);
CREATE INDEX IF NOT EXISTS idx_death_certificates_date ON death_certificates(date_of_death DESC);

CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON incident_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON incident_reports(severity);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);

CREATE INDEX IF NOT EXISTS idx_medical_acts_patient ON medical_acts(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_acts_date ON medical_acts(date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_acts_type ON medical_acts(type);

CREATE INDEX IF NOT EXISTS idx_medical_staff_role ON medical_staff(role);
CREATE INDEX IF NOT EXISTS idx_medical_staff_availability ON medical_staff(availability);
CREATE INDEX IF NOT EXISTS idx_medical_staff_status ON medical_staff(status);

CREATE INDEX IF NOT EXISTS idx_on_duty_schedule_staff ON on_duty_schedule(staff_id);
CREATE INDEX IF NOT EXISTS idx_on_duty_schedule_times ON on_duty_schedule(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_on_duty_schedule_status ON on_duty_schedule(status);

CREATE INDEX IF NOT EXISTS idx_ppa_certificates_citizen ON ppa_certificates(citizen_id);
CREATE INDEX IF NOT EXISTS idx_ppa_certificates_status ON ppa_certificates(status);
CREATE INDEX IF NOT EXISTS idx_ppa_certificates_expiry ON ppa_certificates(expiry_date);

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON interventions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sick_leaves_updated_at BEFORE UPDATE ON sick_leaves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_death_certificates_updated_at BEFORE UPDATE ON death_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_acts_updated_at BEFORE UPDATE ON medical_acts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_staff_updated_at BEFORE UPDATE ON medical_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_on_duty_schedule_updated_at BEFORE UPDATE ON on_duty_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ppa_certificates_updated_at BEFORE UPDATE ON ppa_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - À configurer selon vos besoins
-- ============================================
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sick_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE death_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_duty_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppa_certificates ENABLE ROW LEVEL SECURITY;

-- Politique de base: accès complet pour les utilisateurs authentifiés
-- IMPORTANT: Adapter selon vos besoins de sécurité
CREATE POLICY "Enable all for authenticated users" ON interventions FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON sick_leaves FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON prescriptions FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON death_certificates FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON incident_reports FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON medical_acts FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON medical_staff FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON on_duty_schedule FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON ppa_certificates FOR ALL USING (true);

-- ============================================
-- ACTIVER REALTIME pour toutes les tables
-- ============================================
-- Ces commandes doivent être exécutées via l'interface Supabase ou SQL Editor
-- ALTER PUBLICATION supabase_realtime ADD TABLE interventions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE sick_leaves;
-- ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE death_certificates;
-- ALTER PUBLICATION supabase_realtime ADD TABLE incident_reports;
-- ALTER PUBLICATION supabase_realtime ADD TABLE medical_acts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE medical_staff;
-- ALTER PUBLICATION supabase_realtime ADD TABLE on_duty_schedule;
-- ALTER PUBLICATION supabase_realtime ADD TABLE ppa_certificates;
