-- FIX REALTIME SETUP ESTABLISHMENT
-- Date: 2026-01-08

-- 1. Enable REPLICA IDENTITY FULL for all tables to ensure we get the full row on updates/deletes
-- We wrap these in a DO block to suppress errors if tables don't exist
DO $$
DECLARE
  table_names text[] := ARRAY['agencies', 'agents', 'citizens', 'vehicles', 'warrants', 'dispatch_calls', 'events', 'interventions', 'prescriptions', 'properties', 'organizations', 'territories', 'territory_pois', 'equipment', 'summons', 'complaints', 'divisions', 'units'];
  t_name text;
BEGIN
  FOREACH t_name IN ARRAY table_names
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t_name);
    END IF;
  END LOOP;
END $$;

-- 2. Add all tables to the supabase_realtime publication
-- Robust dynamic SQL to check existence and prevent "already in publication" errors
DO $$
DECLARE
  table_names text[] := ARRAY['agencies', 'agents', 'citizens', 'vehicles', 'warrants', 'dispatch_calls', 'events', 'interventions', 'prescriptions', 'properties', 'organizations', 'territories', 'territory_pois', 'equipment', 'summons', 'complaints', 'divisions', 'units'];
  t_name text;
BEGIN
  -- Create publication if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  FOREACH t_name IN ARRAY table_names
  LOOP
    -- Check if table exists in public schema
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t_name) THEN
      -- Check if table is NOT already in the publication
      IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = t_name
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t_name);
      END IF;
    END IF;
  END LOOP;
END $$;
