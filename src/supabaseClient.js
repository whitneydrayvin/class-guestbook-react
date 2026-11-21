// =====================================================================
// CONNECT TO SUPABASE
// The URL and key come from .env.local (or Vercel's settings later).
// Both values are public by design. NEVER put your secret key here.
// =====================================================================
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// If either setting is missing, supabase stays null and the page says so.
export const supabase = url && key ? createClient(url, key) : null;