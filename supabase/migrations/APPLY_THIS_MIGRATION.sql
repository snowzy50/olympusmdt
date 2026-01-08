-- ===================================
-- OLYMPUS MDT - MIGRATION COMPLETE
-- ===================================
-- Version: 2.0.0
-- Date: 2025-01-08
-- Description: Script unifie pour creer toutes les tables necessaires
-- INSTRUCTIONS: Executez ce script dans Supabase SQL Editor
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 1. TABLE AGENCIES (Reference)
-- ===================================
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

-- Insert default agencies
INSERT INTO public.agencies (id, name, code, description, color) VALUES
  ('sasp', 'San Andreas State Police', 'SASP', 'Police d''Etat de San Andreas', '#3b82f6'),
  ('samc', 'San Andreas Medical Center', 'SAMC', 'Centre Medical de San Andreas', '#ef4444'),
  ('safd', 'San Andreas Fire Department', 'SAFD', 'Pompiers de San Andreas', '#f59e0b'),
  ('dynasty8', 'Dynasty 8', 'D8', 'Agence immobiliere', '#10b981'),
  ('doj', 'Department of Justice', 'DOJ', 'Departement de la Justice', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 2. TABLE AGENTS
-- ===================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  discord_avatar TEXT,
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'cadet',
  division TEXT NOT NULL DEFAULT 'patrol',
  certifications TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'off_duty',
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

-- ===================================
-- 3. TABLE CITIZENS
-- ===================================
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
  status TEXT NOT NULL DEFAULT 'clean', -- 'clean', 'flagged', 'wanted'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 4. TABLE VEHICLES
-- ===================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
  model TEXT,
  brand TEXT,
  color TEXT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'clean', -- 'clean', 'stolen', 'seized', 'in_service', 'maintenance', 'out_of_service'
  mileage INTEGER,
  assigned_to TEXT,
  registration_status TEXT DEFAULT 'active',
  insurance_status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 5. TABLE WARRANTS (Mandats)
-- ===================================
CREATE TABLE IF NOT EXISTS public.warrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT REFERENCES public.agencies(id),
  citizen_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
  number TEXT NOT NULL UNIQUE,
  suspect_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'executed', 'cancelled', 'expired'
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  issued_by_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 6. TABLE COMPLAINTS (Plaintes)
-- ===================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  complainant_name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  filed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'rejected', 'investigating'
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 7. TABLE SUMMONS (Convocations)
-- ===================================
CREATE TABLE IF NOT EXISTS public.summons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  person_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'honored', 'not_honored', 'cancelled'
  issued_by_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 8. TABLE EQUIPMENT (Equipement)
-- ===================================
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'in_use', 'out_of_service', 'maintenance'
  assigned_to TEXT,
  acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 9. TABLE DIVISIONS (Brigades)
-- ===================================
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  chief_name TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'restructuring'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 10. TABLE UNITS (Unites)
-- ===================================
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  callsign TEXT NOT NULL,
  type TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  commander_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'on_patrol'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 11. TABLE EVENTS (Evenements)
-- ===================================
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'planned',
  location TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  recurrence JSONB,
  color TEXT,
  reminder JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  all_day BOOLEAN DEFAULT FALSE
);

-- ===================================
-- 12. TABLE DISPATCH_CALLS
-- ===================================
CREATE TABLE IF NOT EXISTS public.dispatch_calls (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'code2',
  status TEXT NOT NULL DEFAULT 'pending',
  location JSONB NOT NULL,
  image_url TEXT,
  assigned_units JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES public.agents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ===================================
-- 13. TABLE ORGANIZATIONS
-- ===================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(10),
  type TEXT NOT NULL,
  color VARCHAR(7) NOT NULL,
  description TEXT,
  leader_name TEXT,
  founded_date DATE,
  threat_level TEXT DEFAULT 'low',
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 14. TABLE ORGANIZATION_MEMBERS
-- ===================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  rank TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ===================================
-- 15. TABLE ORGANIZATION_RELATIONS
-- ===================================
CREATE TABLE IF NOT EXISTS public.organization_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  related_organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- 'ally', 'enemy', 'neutral'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 16. TABLE TERRITORIES
-- ===================================
CREATE TABLE IF NOT EXISTS public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  coordinates JSONB NOT NULL,
  color VARCHAR(7),
  opacity DECIMAL(3,2) DEFAULT 0.35,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 17. TABLE TERRITORY_POIS
-- ===================================
CREATE TABLE IF NOT EXISTS public.territory_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  territory_id UUID REFERENCES public.territories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- 18. TABLE AGENT_HISTORY
-- ===================================
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
-- INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_citizens_names ON public.citizens(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_citizens_license ON public.citizens(license_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_warrants_status ON public.warrants(status);
CREATE INDEX IF NOT EXISTS idx_complaints_agency ON public.complaints(agency_id);
CREATE INDEX IF NOT EXISTS idx_summons_agency ON public.summons(agency_id);
CREATE INDEX IF NOT EXISTS idx_equipment_agency ON public.equipment(agency_id);
CREATE INDEX IF NOT EXISTS idx_divisions_agency ON public.divisions(agency_id);
CREATE INDEX IF NOT EXISTS idx_units_agency ON public.units(agency_id);
CREATE INDEX IF NOT EXISTS idx_events_agency ON public.events(agency_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_agency ON public.dispatch_calls(agency_id);

-- ===================================
-- UPDATED_AT TRIGGER FUNCTION
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- CREATE TRIGGERS FOR ALL TABLES
-- ===================================
DO $$
DECLARE
    tbl TEXT;
    trigger_name TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
          'agencies', 'agents', 'citizens', 'vehicles', 'warrants',
          'complaints', 'summons', 'equipment', 'divisions', 'units',
          'events', 'dispatch_calls', 'organizations', 'territories',
          'territory_pois', 'organization_relations'
        )
    LOOP
        trigger_name := 'update_' || tbl || '_updated_at';
        -- Drop existing trigger if exists
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_name, tbl);
        -- Create new trigger
        EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', trigger_name, tbl);
    END LOOP;
END;
$$;

-- ===================================
-- REALTIME CONFIGURATION
-- ===================================

-- Enable REPLICA IDENTITY FULL for DELETE operations
ALTER TABLE public.agencies REPLICA IDENTITY FULL;
ALTER TABLE public.agents REPLICA IDENTITY FULL;
ALTER TABLE public.citizens REPLICA IDENTITY FULL;
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;
ALTER TABLE public.warrants REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.summons REPLICA IDENTITY FULL;
ALTER TABLE public.equipment REPLICA IDENTITY FULL;
ALTER TABLE public.divisions REPLICA IDENTITY FULL;
ALTER TABLE public.units REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.dispatch_calls REPLICA IDENTITY FULL;
ALTER TABLE public.organizations REPLICA IDENTITY FULL;
ALTER TABLE public.territories REPLICA IDENTITY FULL;
ALTER TABLE public.territory_pois REPLICA IDENTITY FULL;

-- Add tables to Realtime publication
DO $$
DECLARE
  tbl TEXT;
  tables_to_add TEXT[] := ARRAY[
    'agencies', 'agents', 'citizens', 'vehicles', 'warrants',
    'complaints', 'summons', 'equipment', 'divisions', 'units',
    'events', 'dispatch_calls', 'organizations', 'territories', 'territory_pois'
  ];
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH tbl IN ARRAY tables_to_add
    LOOP
      -- Check if table is already in publication
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = tbl
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
      END IF;
    END LOOP;
  END IF;
END $$;

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS on all tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_pois ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to avoid conflicts)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Create permissive policies (allow all for anon and authenticated)
-- NOTE: In production, you should restrict these policies based on your auth system

CREATE POLICY "Allow all for agencies" ON public.agencies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for agents" ON public.agents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for citizens" ON public.citizens FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for vehicles" ON public.vehicles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for warrants" ON public.warrants FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for complaints" ON public.complaints FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for summons" ON public.summons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for equipment" ON public.equipment FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for divisions" ON public.divisions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for units" ON public.units FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for events" ON public.events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for dispatch_calls" ON public.dispatch_calls FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for organizations" ON public.organizations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for territories" ON public.territories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for territory_pois" ON public.territory_pois FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for organization_members" ON public.organization_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for organization_relations" ON public.organization_relations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for agent_history" ON public.agent_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ===================================
-- TEST DATA
-- ===================================

-- Insert test agent
INSERT INTO public.agents (agency_id, discord_username, badge, first_name, last_name, grade, division, status)
VALUES ('sasp', 'Admin', '#001', 'Admin', 'User', 'chief', 'administration', 'active')
ON CONFLICT ON CONSTRAINT unique_badge_per_agency DO NOTHING;

-- Insert test citizen
INSERT INTO public.citizens (first_name, last_name, license_number, status, phone, address)
VALUES ('John', 'Doe', 'LS-123456', 'wanted', '555-0101', '123 Vinewood Blvd')
ON CONFLICT ON CONSTRAINT citizens_license_number_key DO NOTHING;

-- Insert test vehicle
INSERT INTO public.vehicles (plate, model, brand, color, type, status)
VALUES ('ABC123', 'Sultan RS', 'Karin', 'Red', 'sedan', 'clean')
ON CONFLICT ON CONSTRAINT vehicles_plate_key DO NOTHING;

-- ===================================
-- VERIFICATION
-- ===================================
DO $$
DECLARE
    tbl TEXT;
    cnt INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICATION DES TABLES ===';
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
        RAISE NOTICE 'Table %: OK (% rows)', tbl, cnt;
    END LOOP;
    RAISE NOTICE '=== MIGRATION TERMINEE AVEC SUCCES ===';
END $$;
