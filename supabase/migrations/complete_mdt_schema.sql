-- ===================================
-- OLYMPUS MDT - COMPLETE DATABASE SCHEMA
-- ===================================
-- This script initializes the entire database for all agencies.
-- Includes: Agencies, Agents, Citizens, Vehicles, Warrants, etc.
-- Created by Snowzy

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 2. CORE TABLES
-- ===================================

-- AGENCIES
CREATE TABLE IF NOT EXISTS public.agencies (
  id TEXT PRIMARY KEY, -- e.g., 'sasp', 'samc'
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default Agencies
INSERT INTO public.agencies (id, name, code, description, color) VALUES
  ('sasp', 'San Andreas State Police', 'SASP', 'Police d''État de San Andreas', '#3b82f6'),
  ('samc', 'San Andreas Medical Center', 'SAMC', 'Centre Médical de San Andreas', '#ef4444'),
  ('safd', 'San Andreas Fire Department', 'SAFD', 'Pompiers de San Andreas', '#f59e0b'),
  ('dynasty8', 'Dynasty 8', 'D8', 'Agence immobilière', '#10b981'),
  ('doj', 'Department of Justice', 'DOJ', 'Département de la Justice', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- AGENTS
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'cadet',
  division TEXT NOT NULL DEFAULT 'patrol',
  status TEXT NOT NULL DEFAULT 'off_duty',
  phone TEXT,
  radio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_badge_per_agency UNIQUE (agency_id, badge)
);

-- CITIZENS
CREATE TABLE IF NOT EXISTS public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'clean', -- 'clean', 'flagged', 'wanted'
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
  color TEXT,
  status TEXT NOT NULL DEFAULT 'clean', -- 'clean', 'stolen', 'seized'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY, -- Format EVE-YYYY-NNN
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'planned',
  location TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DISPATCH_CALLS
CREATE TABLE IF NOT EXISTS public.dispatch_calls (
  id TEXT PRIMARY KEY, -- Format DIS-YYYY-NNN
  agency_id TEXT NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT NOT NULL DEFAULT 'other',
  priority TEXT NOT NULL DEFAULT 'code2',
  status TEXT NOT NULL DEFAULT 'pending',
  location JSONB NOT NULL,
  assigned_units JSONB DEFAULT '[]'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- 3. INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON public.agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_citizens_names ON public.citizens(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_events_agency ON public.events(agency_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_agency ON public.dispatch_calls(agency_id);

-- ===================================
-- 4. REALTIME CONFIGURATION
-- ===================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE agents, citizens, vehicles, events, dispatch_calls;
  END IF;
END $$;

-- ===================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ===================================
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_calls ENABLE ROW LEVEL SECURITY;

-- Basic Public Access Policies (To be tightened based on roles)
CREATE POLICY "Public Read Access" ON public.agencies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated Read Access Agents" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Read Access Citizens" ON public.citizens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Read Access Vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Read Access Events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated Read Access Dispatch" ON public.dispatch_calls FOR SELECT TO authenticated USING (true);

-- ===================================
-- 6. TEST DATA (SASP)
-- ===================================
INSERT INTO public.agents (agency_id, discord_username, badge, first_name, last_name, grade, division, status)
VALUES ('sasp', 'Admin', '#001', 'Admin', 'User', 'chief', 'administration', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.citizens (first_name, last_name, license_number, status, phone)
VALUES ('John', 'Doe', 'LS-123456', 'wanted', '555-0101')
ON CONFLICT DO NOTHING;
