-- ===================================
-- OLYMPUS MDT - MASTER DATABASE SCHEMA
-- ===================================
-- Version: 1.0.0
-- Created by Snowzy
-- Description: Unified schema for SASP, SAMC, SAFD, Dynasty 8, DOJ, and Organizations.

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 1. TYPES & ENUMS
-- ===================================
DO $$ BEGIN
    CREATE TYPE agent_grade AS ENUM ('cadet', 'officer', 'corporal', 'sergeant', 'lieutenant', 'captain', 'commander', 'chief');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE agent_status AS ENUM ('active', 'off_duty', 'training', 'leave');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE agent_division AS ENUM ('patrol', 'traffic', 'k9', 'swat', 'detectives', 'administration');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ===================================
-- 2. CORE SYSTEM
-- ===================================

-- AGENCIES
CREATE TABLE IF NOT EXISTS public.agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AGENTS
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  discord_avatar TEXT,
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade agent_grade NOT NULL DEFAULT 'cadet',
  division agent_division NOT NULL DEFAULT 'patrol',
  certifications TEXT[] DEFAULT '{}',
  status agent_status NOT NULL DEFAULT 'off_duty',
  supervisor_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  phone TEXT,
  radio TEXT,
  date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_hours INTEGER DEFAULT 0,
  interventions INTEGER DEFAULT 0,
  arrests INTEGER DEFAULT 0,
  reports_written INTEGER DEFAULT 0,
  notes TEXT,
  CONSTRAINT unique_badge_per_agency UNIQUE (agency_id, badge),
  CONSTRAINT unique_discord_per_agency UNIQUE (agency_id, discord_username)
);

-- AGENT HISTORY
CREATE TABLE IF NOT EXISTS public.agent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ===================================
-- 3. CITIZENS & ASSETS
-- ===================================

-- CITIZENS
CREATE TABLE IF NOT EXISTS public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  phone TEXT,
  address TEXT,
  job TEXT,
  license_number TEXT UNIQUE,
  image_url TEXT,
  status TEXT DEFAULT 'clean', -- 'clean', 'flagged', 'wanted'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VEHICLES
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
  model TEXT,
  brand TEXT,
  color TEXT,
  type TEXT, -- 'sedan', 'suv', etc.
  status TEXT DEFAULT 'clean', -- 'clean', 'stolen', 'seized'
  registration_status TEXT DEFAULT 'active',
  insurance_status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 4. LAW ENFORCEMENT & PUBLIC SAFETY
-- ===================================

-- WARRANTS (MANDATS)
CREATE TABLE IF NOT EXISTS public.warrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warrant_number TEXT UNIQUE NOT NULL,
  suspect_id UUID REFERENCES public.citizens(id) ON DELETE CASCADE,
  suspect_name TEXT NOT NULL, -- Cached for easy search
  reason TEXT NOT NULL,
  issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active', 'executed', 'cancelled', 'expired'
  issued_by_id UUID REFERENCES public.agents(id),
  agency_id TEXT REFERENCES public.agencies(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DISPATCH CALLS
CREATE TABLE IF NOT EXISTS public.dispatch_calls (
  id TEXT PRIMARY KEY, -- DIS-YYYY-NNN
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'code2',
  status TEXT NOT NULL DEFAULT 'pending',
  location JSONB NOT NULL, -- {address: "", lat: 0, lng: 0}
  image_url TEXT,
  assigned_units JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES public.agents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY, -- EVE-YYYY-NNN
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'planned',
  location TEXT,
  participants TEXT[],
  resources TEXT[],
  notes TEXT,
  attachments TEXT[],
  color TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  all_day BOOLEAN DEFAULT FALSE
);

-- ===================================
-- 5. MEDICAL (SAMC)
-- ===================================

CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'emergency', 'hospitalization', etc.
  patient_name TEXT NOT NULL,
  patient_id UUID REFERENCES public.citizens(id),
  practitioner TEXT NOT NULL,
  practitioner_id UUID REFERENCES public.agents(id),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id UUID REFERENCES public.citizens(id),
  doctor TEXT NOT NULL,
  doctor_id UUID REFERENCES public.agents(id),
  medications JSONB NOT NULL,
  posology TEXT NOT NULL,
  treatment_duration TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 6. REAL ESTATE (Dynasty 8)
-- ===================================

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'house', 'apartment', etc.
  address TEXT NOT NULL,
  coordinates JSONB,
  status TEXT DEFAULT 'available',
  price DECIMAL(15,2),
  rent_price DECIMAL(15,2),
  surface INTEGER,
  owner_id UUID REFERENCES public.citizens(id),
  agent_id UUID REFERENCES public.agents(id),
  description TEXT,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 7. ORGANIZATIONS & TERRITORIES
-- ===================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(10),
  type TEXT NOT NULL, -- 'gang', 'mafia', etc.
  color VARCHAR(7) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  coordinates JSONB NOT NULL,
  color VARCHAR(7),
  opacity DECIMAL(3,2) DEFAULT 0.35,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 8. UTILITIES & AUTOMATION
-- ===================================

-- Updated At Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (Generic loop for ease of maintenance)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('agencies', 'agents', 'citizens', 'vehicles', 'warrants', 'dispatch_calls', 'events', 'interventions', 'prescriptions', 'properties', 'organizations', 'territories')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- 9. REALTIME & RLS
-- ===================================

-- Enable Realtime
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE agents, citizens, vehicles, warrants, dispatch_calls, events, interventions, prescriptions, properties, organizations, territories;
  ELSE
    CREATE PUBLICATION supabase_realtime FOR TABLE agents, citizens, vehicles, warrants, dispatch_calls, events, interventions, prescriptions, properties, organizations, territories;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Public read for authenticated, can be refined)
CREATE POLICY "Enable read access for all users" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Enable read access for authenticated" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated" ON public.citizens FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated" ON public.vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated" ON public.warrants FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated" ON public.dispatch_calls FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated" ON public.events FOR ALL TO authenticated USING (true);

-- ===================================
-- 10. INITIAL SEED DATA
-- ===================================

INSERT INTO public.agencies (id, name, code, description, color) VALUES
  ('sasp', 'San Andreas State Police', 'SASP', 'Police d''État de San Andreas', '#3b82f6'),
  ('samc', 'San Andreas Medical Center', 'SAMC', 'Centre Médical de San Andreas', '#ef4444'),
  ('safd', 'San Andreas Fire Department', 'SAFD', 'Pompiers de San Andreas', '#f59e0b'),
  ('dynasty8', 'Dynasty 8', 'D8', 'Agence immobilière', '#10b981'),
  ('doj', 'Department of Justice', 'DOJ', 'Département de la Justice', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.agents (agency_id, discord_username, badge, first_name, last_name, grade, division, status)
VALUES ('sasp', 'Admin', '#001', 'Admin', 'User', 'chief', 'administration', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.citizens (first_name, last_name, license_number, status, phone)
VALUES ('John', 'Doe', 'LS-123456', 'wanted', '555-0101')
ON CONFLICT DO NOTHING;
