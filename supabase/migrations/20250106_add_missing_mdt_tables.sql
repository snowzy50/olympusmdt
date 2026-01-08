-- COMPREHENSIVE MIGRATION FOR MISSING MDT TABLES
-- Date: 2025-01-06
-- Modules: Equipment, Summons, Complaints, Divisions, Units

-- EQUIPMENT
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL, 
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  assigned_to TEXT,
  acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUMMONS (Convocations)
CREATE TABLE IF NOT EXISTS public.summons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  number TEXT NOT NULL,
  person_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_by_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COMPLAINTS (Plaintes)
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  number TEXT NOT NULL,
  complainant_name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  filed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DIVISIONS (Brigades)
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  chief_name TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- UNITS (for MDT management)
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT NOT NULL,
  name TEXT NOT NULL,
  callsign TEXT NOT NULL,
  type TEXT NOT NULL,
  members_count INTEGER DEFAULT 0,
  commander_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime for all new tables
ALTER TABLE public.equipment REPLICA IDENTITY FULL;
ALTER TABLE public.summons REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.divisions REPLICA IDENTITY FULL;
ALTER TABLE public.units REPLICA IDENTITY FULL;

-- Add to publication for Realtime
-- Note: Assuming "supabase_realtime" publication exists or tables will be added automatically if setup correctly
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.summons;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.divisions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.units;
  END IF;
END $$;
