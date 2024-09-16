import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow all origins (or specify your domain)
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info,Access-Control-Allow-Methods,Access-Control-Allow-Origin,accept-profile,apikey,Access-Control-Allow-Headers,prefer,content-profile',
    }
  });

export default supabase
