import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================
 * SUPABASE CONFIGURATION
 * ============================================================
 *
 * IMPORTANT:
 * SUPABASE_URL must be ONLY:
 *
 * https://YOUR_PROJECT_ID.supabase.co
 *
 * Do NOT add:
 * /auth/v1
 * /rest/v1
 * /storage/v1
 * or anything else.
 * ============================================================
 */

const DEFAULT_SUPABASE_URL =
  'https://oegdoqbmlvsgyafrlauv.supabase.co';

const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZ2RvcWJtbHZzZ3lhZnJsYXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzYwMTksImV4cCI6MjEwMjQ1MjAxOX0.nTqIH8tp0qHuYPojS2c8eOWJKO0rG0X7--GJP-q5FFg';

/**
 * ============================================================
 * READ ENVIRONMENT VARIABLES
 * ============================================================
 */

const getValidEnvUrl = (): string => {
  const envVal = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (
    !envVal ||
    envVal.includes('your-project') ||
    envVal.includes('YOUR_PROJECT') ||
    envVal.includes('example.supabase.co') ||
    envVal.includes('oegdoqbmlvzsgyafrlauv') // Prevents the old typo if present in browser cache
  ) {
    return DEFAULT_SUPABASE_URL;
  }
  return envVal;
};

const rawEnvUrl = getValidEnvUrl();

const rawEnvKey = String(
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
).trim();

/**
 * ============================================================
 * NORMALIZE SUPABASE URL
 * ============================================================
 *
 * This prevents accidental paths such as:
 *
 * https://project.supabase.co/rest/v1
 * https://project.supabase.co/auth/v1
 *
 * from being used as the Supabase client URL.
 */

const normalizeSupabaseUrl = (url: string): string => {
  if (!url) {
    return DEFAULT_SUPABASE_URL;
  }

  let normalized = url.trim();

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');

  // Remove accidental Supabase API paths
  normalized = normalized.replace(
    /\/(auth\/v1|rest\/v1|storage\/v1)(\/.*)?$/i,
    ''
  );

  // Make sure it is a valid HTTP(S) URL
  try {
    const parsed = new URL(normalized);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return DEFAULT_SUPABASE_URL;
    }

    // Supabase project URL should not contain a path
    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      return DEFAULT_SUPABASE_URL;
    }

    return normalized;
  } catch {
    return DEFAULT_SUPABASE_URL;
  }
};

/**
 * ============================================================
 * SUPABASE URL
 * ============================================================
 */

export const supabaseUrl = normalizeSupabaseUrl(
  rawEnvUrl || DEFAULT_SUPABASE_URL
);

/**
 * ============================================================
 * SUPABASE ANON KEY
 * ============================================================
 */

export const supabaseAnonKey =
  rawEnvKey &&
  rawEnvKey !== 'your-anon-key-here' &&
  rawEnvKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'
    ? rawEnvKey
    : DEFAULT_SUPABASE_ANON_KEY;

/**
 * ============================================================
 * CONFIGURATION CHECK
 * ============================================================
 */

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

/**
 * ============================================================
 * STORAGE BUCKETS
 * ============================================================
 */

export const NEWS_IMAGES_BUCKET = 'news-images';

/**
 * ============================================================
 * SUPABASE CLIENT
 * ============================================================
 */

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

/**
 * ============================================================
 * AUTHENTICATION HELPERS
 * ============================================================
 */

/**
 * Login with email and password.
 */
export const signInWithEmail = async (
  email: string,
  password: string
) => {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error('يرجى إدخال البريد الإلكتروني.');
  }

  if (!password) {
    throw new Error('يرجى إدخال كلمة المرور.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Logout current user.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

/**
 * Get currently logged-in user.
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};

/**
 * Get current session.
 */
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
};

/**
 * ============================================================
 * ARABIC ERROR TRANSLATOR
 * ============================================================
 */

export const getArabicErrorMessage = (
  error: unknown,
  fallback: string = 'حدث خطأ أثناء تسجيل الدخول'
): string => {
  if (!error) {
    return fallback;
  }

  const rawMessage =
    typeof error === 'object' &&
    error !== null &&
    'message' in error
      ? String(
          (error as { message: unknown }).message
        )
      : String(error);

  const message = rawMessage.toLowerCase();

  /**
   * Invalid credentials
   */
  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid_grant')
  ) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }

  /**
   * Email confirmation
   */
  if (
    message.includes('email not confirmed') ||
    message.includes('email_not_confirmed')
  ) {
    return 'البريد الإلكتروني غير مؤكد. يرجى تأكيد البريد الإلكتروني من Supabase.';
  }

  /**
   * User not found
   */
  if (
    message.includes('user not found') ||
    message.includes('user_not_found')
  ) {
    return 'المستخدم غير موجود في Supabase.';
  }

  /**
   * Invalid URL / request path
   */
  if (
    message.includes('invalid path') ||
    message.includes('request url') ||
    message.includes('pgrst125')
  ) {
    return 'حدث خطأ في عنوان الاتصال بخادم Supabase. يرجى التحقق من إعدادات الاتصال.';
  }

  /**
   * Invalid API Key / Configuration
   */
  if (
    message.includes('invalid api key') ||
    message.includes('api key not found') ||
    message.includes('apikey') ||
    message.includes('jwt malformed') ||
    message.includes('invalid claim')
  ) {
    return 'مفتاح API الخاص بـ Supabase غير صالح أو غير مهيأ.';
  }

  /**
   * Network / Connection failure
   */
  if (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('networkrequestfailed') ||
    message.includes('net::err') ||
    message.includes('load failed') ||
    message.includes('offline') ||
    message.includes('econnrefused')
  ) {
    return 'تعذر الاتصال بخادم Supabase. تحقق من اتصال الإنترنت.';
  }

  /**
   * JWT / session
   */
  if (
    message.includes('jwt') ||
    message.includes('session expired') ||
    message.includes('token')
  ) {
    return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
  }

  /**
   * Rate limit
   */
  if (
    message.includes('too many requests') ||
    message.includes('rate limit')
  ) {
    return 'تم تجاوز عدد محاولات تسجيل الدخول المسموح بها. حاول مرة أخرى لاحقًا.';
  }

  /**
   * Server errors
   */
  if (
    message.includes('500') ||
    message.includes('internal server error')
  ) {
    return 'حدث خطأ داخلي في خادم Supabase. حاول مرة أخرى.';
  }

  /**
   * Default
   */
  return rawMessage
    ? `رسالة السيرفر: ${rawMessage}`
    : fallback;
};

/**
 * ============================================================
 * DEBUG INFORMATION
 * ============================================================
 *
 * This does NOT expose the API key.
 * It only shows the URL and basic configuration state.
 */

/**
 * ============================================================
 * DIAGNOSTIC CONNECTION CHECK (DEV ONLY)
 * ============================================================
 * Safe network diagnostic: verifies Supabase endpoint is reachable.
 * Never reveals the API key.
 */
export interface SupabaseDiagnosticResult {
  url: string;
  isConfigured: boolean;
  hasAnonKey: boolean;
  isReachable: boolean;
  error?: string;
}

export const checkSupabaseConnection = async (): Promise<SupabaseDiagnosticResult> => {
  const result: SupabaseDiagnosticResult = {
    url: supabaseUrl,
    isConfigured: isSupabaseConfigured(),
    hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey.length > 20),
    isReachable: false,
  };

  if (!result.isConfigured) {
    result.error = 'Supabase is not configured';
    return result;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timer);
    result.isReachable = response.status < 500;
  } catch (err: any) {
    result.isReachable = false;
    result.error = err?.message || 'Network unreachable';
  }

  return result;
};

if (import.meta.env.DEV) {
  console.log('[Supabase Diagnostic] Initializing with URL:', supabaseUrl);
  console.log('[Supabase Diagnostic] Anon Key Present:', Boolean(supabaseAnonKey && supabaseAnonKey.length > 20));
  console.log('[Supabase Diagnostic] Configured:', isSupabaseConfigured());
  
  checkSupabaseConnection().then((diag) => {
    console.log('[Supabase Diagnostic] Network Health Result:', {
      url: diag.url,
      hasAnonKey: diag.hasAnonKey,
      isReachable: diag.isReachable,
      error: diag.error,
    });
  }).catch(() => {});
}
