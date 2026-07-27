/*
# Create core CareBridge tables: profiles, reminders, voice_logs, emergency_contacts

## 1. New Tables
- `profiles` — user profile linked to auth.users. Columns: id (uuid PK, FK to auth.users), full_name, email, role (patient/doctor/caregiver/admin), preferred_language, phone, created_at.
- `reminders` — scheduled reminders for a user. Columns: id, user_id (FK profiles), title, description, reminder_time, is_completed, category (medication/appointment/task/general), created_at.
- `voice_logs` — AI voice assistant conversation logs. Columns: id, user_id (FK profiles), transcript, ai_response, language_code, created_at.
- `emergency_contacts` — emergency contacts for a patient. Columns: id, patient_id (FK profiles), contact_name, phone_number, relationship, created_at.

## 2. Owner Column Defaults
- `reminders.user_id` defaults to `auth.uid()` so client inserts omitting user_id succeed.
- `voice_logs.user_id` defaults to `auth.uid()`.
- `emergency_contacts.patient_id` defaults to `auth.uid()`.

## 3. Security (RLS)
- RLS enabled on all 4 tables.
- 4 per-verb policies (SELECT/INSERT/UPDATE/DELETE) on each table, scoped TO authenticated with ownership checks via auth.uid().
- profiles: ownership = auth.uid() = id
- reminders: ownership = auth.uid() = user_id
- voice_logs: ownership = auth.uid() = user_id
- emergency_contacts: ownership = auth.uid() = patient_id

## 4. Auto Profile Trigger
- `handle_new_user()` trigger fires AFTER INSERT on auth.users, creates a profiles row from the new user's metadata and email.

## 5. Idempotency
- All CREATE TABLE use IF NOT EXISTS.
- All policies are dropped before creation.
- Trigger uses CREATE OR REPLACE and DROP IF EXISTS.
*/

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor', 'caregiver', 'admin')) DEFAULT 'patient',
  preferred_language VARCHAR(10) DEFAULT 'en',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  category TEXT CHECK (category IN ('medication', 'appointment', 'task', 'general')) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VOICE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.voice_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  language_code VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES — profiles (4 per-verb)
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON public.profiles;
CREATE POLICY "delete_own_profile" ON public.profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- RLS POLICIES — reminders (4 per-verb)
DROP POLICY IF EXISTS "select_own_reminders" ON public.reminders;
CREATE POLICY "select_own_reminders" ON public.reminders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reminders" ON public.reminders;
CREATE POLICY "insert_own_reminders" ON public.reminders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reminders" ON public.reminders;
CREATE POLICY "update_own_reminders" ON public.reminders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reminders" ON public.reminders;
CREATE POLICY "delete_own_reminders" ON public.reminders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS POLICIES — voice_logs (4 per-verb)
DROP POLICY IF EXISTS "select_own_voice_logs" ON public.voice_logs;
CREATE POLICY "select_own_voice_logs" ON public.voice_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_voice_logs" ON public.voice_logs;
CREATE POLICY "insert_own_voice_logs" ON public.voice_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_voice_logs" ON public.voice_logs;
CREATE POLICY "update_own_voice_logs" ON public.voice_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_voice_logs" ON public.voice_logs;
CREATE POLICY "delete_own_voice_logs" ON public.voice_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS POLICIES — emergency_contacts (4 per-verb)
DROP POLICY IF EXISTS "select_own_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "select_own_emergency_contacts" ON public.emergency_contacts FOR SELECT
  TO authenticated USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "insert_own_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "insert_own_emergency_contacts" ON public.emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "update_own_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "update_own_emergency_contacts" ON public.emergency_contacts FOR UPDATE
  TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "delete_own_emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "delete_own_emergency_contacts" ON public.emergency_contacts FOR DELETE
  TO authenticated USING (auth.uid() = patient_id);

-- 7. AUTO USER PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
