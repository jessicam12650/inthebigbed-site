// Reference type for the Supabase schema in supabase/schema.sql.
//
// NOT currently wired into the browser/server clients — postgrest-js v12's
// generic constraints are stricter than what hand-written shapes can
// satisfy without falling back to `never`. Replace this file with the
// output of `supabase gen types typescript --project-id <id> --schema public`
// once the Supabase CLI is linked, then re-enable the `<Database>` generic
// in lib/supabase.ts and lib/supabase-server.ts.
//
// Until then, this file is documentation only — it describes the row
// shapes returned by the queries used in the app.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type DogRow = {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  age: string | null;
  size: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type LostDogAlertRow = {
  id: string;
  reporter_id: string | null;
  dog_name: string;
  last_location: string;
  phone: string;
  photo_url: string | null;
  status: string;
  created_at: string;
};
