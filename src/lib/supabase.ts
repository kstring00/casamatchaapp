import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

type Extra = { supabaseUrl?: string; supabaseAnonKey?: string };
const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const supabase =
  extra.supabaseUrl && extra.supabaseAnonKey
    ? createClient(extra.supabaseUrl, extra.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;
