import React, { useState, useEffect } from 'react';
import { Newspaper, Lock, Mail, Loader2, AlertCircle, ArrowLeft, ShieldCheck, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured, checkSupabaseConnection, SupabaseDiagnosticResult } from '../lib/supabase';

export const LoginView: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<SupabaseDiagnosticResult | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      checkSupabaseConnection().then(setDiagnostic).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني للمشرف');
      return;
    }
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(trimmedEmail, password);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء الاتصال بالنظام، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div 
      id="login-screen"
      className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.18),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.6))] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Top Logo & App Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 border border-blue-400/20 mb-4">
            <Newspaper className="w-8 h-8" strokeWidth={2.2} />
          </div>
          
          <h1 id="login-app-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            إدارة الأخبار
          </h1>
          <p id="login-app-subtitle" className="text-sm font-medium text-slate-400 mt-1.5">
            لوحة تحكم المشرفين · منصة إدارة
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-7 sm:p-9 border border-slate-700/80 shadow-2xl shadow-black/40">
          
          <div className="mb-6 pb-4 border-b border-slate-700/60">
            <h2 className="text-lg font-bold text-white">تسجيل الدخول</h2>
            <p className="text-xs text-slate-400 mt-1">
              أدخل بيانات الاعتماد للمتابعة إلى لوحة التحكم
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div 
              id="login-error-alert"
              role="alert"
              className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-semibold flex items-start gap-3 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-300">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className="w-full pr-10 pl-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-300">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className="w-full pr-10 pl-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Security Badge */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نظام تسجيل دخول مشفر وآمن</span>
          </div>

        </div>

        {/* Development Diagnostic Panel (DEV ONLY) */}
        {import.meta.env.DEV && (
          <div 
            id="supabase-dev-diagnostic"
            className="mt-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono space-y-2.5 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                تشخيص بيئة Supabase
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                DEV ONLY
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project URL:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[200px]" title={supabaseUrl}>
                  {supabaseUrl || 'MISSING'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Anon Key:</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  {supabaseAnonKey && supabaseAnonKey.length > 20 ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      PRESENT
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span className="text-rose-400">MISSING</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Supabase Client:</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  {isSupabaseConfigured() ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      INITIALIZED
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span className="text-rose-400">FAILED</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network Endpoint:</span>
                <span className="flex items-center gap-1 font-bold">
                  {diagnostic === null ? (
                    <span className="text-slate-400">TESTING...</span>
                  ) : diagnostic.isReachable ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      CONNECTED
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      FAILED
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          منصة إدارة © {new Date().getFullYear()} · جميع الحقوق محفوظة
        </p>

      </div>
    </div>
  );
};
