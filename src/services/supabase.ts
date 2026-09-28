import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. " +
    "Please set them in your .env or .env.local file."
  );
}

// Fallback to avoid runtime crash on initial client creation if env vars are missing
const validUrl = supabaseUrl && supabaseUrl.startsWith("http")
  ? supabaseUrl
  : "https://placeholder-project.supabase.co";
const validKey = supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient<Database>(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
