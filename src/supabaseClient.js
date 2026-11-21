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

// For the class "hacker" demo: lets you type supabase commands in the
// browser console. This is safe. Anyone could send these same requests
// with the public key, which is exactly why the rules live in the database.
window.supabase = supabase;