/*
# Fix security issues with SECURITY DEFINER functions

## Problems
1. `public.handle_new_user()` — SECURITY DEFINER function executable by anon and authenticated roles via RPC, and has a mutable search_path.
2. `public.rls_auto_enable()` — SECURITY DEFINER function executable by anon and authenticated roles via RPC, and has a mutable search_path.

## Fixes
1. Revoke EXECUTE from PUBLIC, anon, and authenticated on both functions so they can only be invoked by the database owner / triggers, not via the REST API.
2. Set a fixed `search_path` on both functions to prevent search-path hijacking.

## Notes
- `handle_new_user` is a trigger function fired by the `on_auth_user_created` trigger on `auth.users`. Revoking EXECUTE does not affect trigger invocation — triggers always run as the function owner.
- `rls_auto_enable` is an internal helper; it should not be callable from the API.
*/

-- Lock down handle_new_user: revoke execute, set fixed search_path
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'CareBridge User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$;

-- Re-grant nothing (default is no execute for anon/authenticated)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Re-create the trigger bound to the new function signature
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Lock down rls_auto_enable if it exists: revoke execute, set fixed search_path
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE p.proname = 'rls_auto_enable' AND n.nspname = 'public') THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp';
  END IF;
END $$;
