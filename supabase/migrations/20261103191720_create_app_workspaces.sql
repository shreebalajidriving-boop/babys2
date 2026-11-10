/*
# Create app workspaces storage (no sign-in, id-scoped access)

## Plain-English summary
Each installed copy of Baby Bliss keeps its whole saved state (parent profile, children, cart, orders, bookings, progress) as one document. The document is stored under a random workspace id that the app creates once on the device. The app only reads or writes a document when it presents that id, so one family's data cannot be listed or read without knowing its id.

## 1. New table
- `app_workspaces`
  - `id` (text, primary key): random workspace id, 16 to 64 characters.
  - `state` (jsonb, not null): the full saved app state.
  - `updated_at` (timestamptz): time of the last save.

## 2. New functions
- `get_workspace_state(p_workspace_id)`: returns the saved state for that id, or null if none exists.
- `save_workspace_state(p_workspace_id, p_state)`: creates or replaces the saved state for that id.

## 3. Security
- Row level security is enabled on `app_workspaces` with no policies, and all direct table privileges are revoked from anon, authenticated and PUBLIC. The table cannot be listed or edited through the data API.
- Both functions run with the owner's rights and a fixed search path, and validate their inputs.
- Both functions are granted to anon and authenticated because the app has no sign-in screen.

## 4. Important notes
1. Access is by possession of the workspace id. Ids are 48 random hexadecimal characters, so they cannot be guessed, but anyone who obtains an id can read and overwrite that workspace.
2. Nothing is deleted or altered in existing tables. This migration only adds objects.
3. The migration is safe to re-run: it uses IF NOT EXISTS and CREATE OR REPLACE.
*/

CREATE TABLE IF NOT EXISTS public.app_workspaces (
  id text PRIMARY KEY CHECK (char_length(id) BETWEEN 16 AND 64),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_workspaces ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_workspaces FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_workspace_state(p_workspace_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_workspace_id IS NULL OR char_length(p_workspace_id) NOT BETWEEN 16 AND 64 THEN
    RAISE EXCEPTION 'invalid workspace id' USING ERRCODE = '22023';
  END IF;
  RETURN (SELECT w.state FROM public.app_workspaces w WHERE w.id = p_workspace_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_workspace_state(p_workspace_id text, p_state jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_workspace_id IS NULL OR char_length(p_workspace_id) NOT BETWEEN 16 AND 64 THEN
    RAISE EXCEPTION 'invalid workspace id' USING ERRCODE = '22023';
  END IF;
  IF p_state IS NULL OR jsonb_typeof(p_state) <> 'object' THEN
    RAISE EXCEPTION 'invalid workspace state' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.app_workspaces (id, state, updated_at)
  VALUES (p_workspace_id, p_state, now())
  ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_workspace_state(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.save_workspace_state(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_workspace_state(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_workspace_state(text, jsonb) TO anon, authenticated;
