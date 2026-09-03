import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  SUPABASE_URL: 'star_good_deeds_supabase_url',
  SUPABASE_KEY: 'star_good_deeds_supabase_key',
};

// Default public or environment configurations
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const customKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: customUrl || envUrl,
    key: customKey || envKey,
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);

  if (key) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);

  // Reset client instance
  supabaseInstance = null;
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseConfig();

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
};

export interface AppStatePayload {
  students: any[];
  classrooms: string[];
  rewards: any[];
  categories: any[];
  attendance: any[];
  teams: any[];
  updatedAt: number;
}

const TABLE_NAME = 'school_state';
const DEFAULT_DOC_ID = 'shared-school-data';

/**
 * Fetch state from Supabase
 */
export const fetchStateFromSupabase = async (docId = DEFAULT_DOC_ID): Promise<AppStatePayload | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('data, updated_at')
      .eq('id', docId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch notice:', error.message);
      return null;
    }

    if (data && data.data) {
      return {
        ...data.data,
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
      };
    }
  } catch (err) {
    console.warn('Supabase fetch exception:', err);
  }

  return null;
};

/**
 * Upsert state to Supabase
 */
export const saveStateToSupabase = async (payload: AppStatePayload, docId = DEFAULT_DOC_ID): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from(TABLE_NAME)
      .upsert(
        {
          id: docId,
          data: payload,
          updated_at: new Date(payload.updatedAt || Date.now()).toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save exception:', err);
    return false;
  }
};

/**
 * Subscribe to realtime changes in Supabase
 */
export const subscribeToSupabase = (
  onDataChange: (payload: AppStatePayload) => void,
  docId = DEFAULT_DOC_ID
) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel(`public:${TABLE_NAME}:id=${docId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE_NAME,
          filter: `id=eq.${docId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).data) {
            const newData = (payload.new as any).data;
            const updatedAt = (payload.new as any).updated_at
              ? new Date((payload.new as any).updated_at).getTime()
              : Date.now();

            onDataChange({
              ...newData,
              updatedAt,
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase subscription warning:', err);
    return () => {};
  }
};
