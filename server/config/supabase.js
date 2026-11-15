const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log('⚡ Supabase Client initialized successfully with URL:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not yet supplied in server/.env (using verified in-memory fallback).');
}

const isSupabaseConfigured = () => {
  return !!supabase;
};

module.exports = {
  supabase,
  isSupabaseConfigured,
};
