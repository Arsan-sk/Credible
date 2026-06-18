import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel settings or .env file. Mock client initialized.'
  );

  // Dynamic mock chain proxy to handle arbitrary method chaining without crashing
  const makeMockChain = () => {
    const chain = {};
    const handler = {
      get: (target, prop) => {
        if (prop === 'then') {
          return (resolve) => resolve({ data: null, error: null });
        }
        return () => new Proxy({}, handler);
      }
    };
    return new Proxy(chain, handler);
  };

  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null })
    },
    from: () => makeMockChain(),
    rpc: async () => ({ data: null, error: null })
  };
}

export const supabase = client;
