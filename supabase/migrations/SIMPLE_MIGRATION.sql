-- ===================================
-- OLYMPUS MDT - MIGRATION SIMPLIFIEE
-- ===================================
-- Executez ce script dans Supabase SQL Editor
-- Si une erreur survient, les tables precedentes seront quand meme creees

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- TABLE: agencies
-- ===================================
CREATE TABLE IF NOT EXISTS public.agencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  color TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.agencies (id, name, code, description, color) VALUES
  ('sasp', 'San Andreas State Police', 'SASP', 'Police Etat', '#3b82f6'),
  ('samc', 'San Andreas Medical Center', 'SAMC', 'Medical', '#ef4444'),
  ('safd', 'San Andreas Fire Department', 'SAFD', 'Pompiers', '#f59e0b'),
  ('dynasty8', 'Dynasty 8', 'D8', 'Immobilier', '#10b981'),
  ('doj', 'Department of Justice', 'DOJ', 'Justice', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- TABLE: agents
-- ===================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT REFERENCES public.agencies(id) ON DELETE CASCADE,
  discord_username TEXT NOT NULL,
  discord_user_id TEXT,
  discord_avatar TEXT,
  badge TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT DEFAULT 'cadet',
  division TEXT DEFAULT 'patrol',
  certifications TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'off_duty',
  supervisor_id UUID,
  phone TEXT,
  radio TEXT,
  date_joined TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  total_hours INTEGER DEFAULT 0,
  interventions INTEGER DEFAULT 0,
  arrests INTEGER DEFAULT 0,
  reports_written INTEGER DEFAULT 0,
  notes TEXT
);

-- ===================================
-- TABLE: citizens
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
  license_number TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'clean',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: vehicles
-- ===================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL,
  owner_id UUID,
  model TEXT,
  brand TEXT,
  color TEXT,
  type TEXT,
  status TEXT DEFAULT 'clean',
  mileage INTEGER,
  assigned_to TEXT,
  registration_status TEXT DEFAULT 'active',
  insurance_status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: warrants
-- ===================================
CREATE TABLE IF NOT EXISTS public.warrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT,
  citizen_id UUID,
  number TEXT NOT NULL,
  suspect_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  agent_id UUID,
  issued_by_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: complaints
-- ===================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  number TEXT NOT NULL,
  complainant_name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  filed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: summons
-- ===================================
CREATE TABLE IF NOT EXISTS public.summons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  number TEXT NOT NULL,
  person_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  issued_by_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: equipment
-- ===================================
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  assigned_to TEXT,
  acquisition_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: divisions
-- ===================================
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  chief_name TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: units
-- ===================================
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  name TEXT NOT NULL,
  callsign TEXT NOT NULL,
  type TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  commander_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: events
-- ===================================
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT DEFAULT 'autre',
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'planned',
  location TEXT,
  participants JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  recurrence JSONB,
  color TEXT,
  reminder JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  all_day BOOLEAN DEFAULT FALSE
);

-- ===================================
-- TABLE: dispatch_calls
-- ===================================
CREATE TABLE IF NOT EXISTS public.dispatch_calls (
  id TEXT PRIMARY KEY,
  agency_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  call_type TEXT DEFAULT 'other',
  priority TEXT DEFAULT 'code2',
  status TEXT DEFAULT 'pending',
  location JSONB NOT NULL,
  image_url TEXT,
  assigned_units JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ===================================
-- TABLE: organizations
-- ===================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
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
-- TABLE: organization_members
-- ===================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  citizen_id UUID,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  rank TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ===================================
-- TABLE: organization_relations
-- ===================================
CREATE TABLE IF NOT EXISTS public.organization_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  related_organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: territories
-- ===================================
CREATE TABLE IF NOT EXISTS public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  color TEXT,
  opacity DECIMAL(3,2) DEFAULT 0.35,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: territory_pois
-- ===================================
CREATE TABLE IF NOT EXISTS public.territory_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  territory_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- TABLE: agent_history
-- ===================================
CREATE TABLE IF NOT EXISTS public.agent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ===================================
-- REALTIME: Activer pour toutes les tables
-- ===================================
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

-- ===================================
-- RLS: Desactiver pour simplifier (dev mode)
-- ===================================
ALTER TABLE public.agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.warrants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.summons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_pois DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_history DISABLE ROW LEVEL SECURITY;

-- ===================================
-- FIN - Verification
-- ===================================
SELECT 'Migration terminee!' as status, COUNT(*) as tables_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
