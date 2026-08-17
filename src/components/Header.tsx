import React from 'react';
import { Newspaper, LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header 
      id="edara-global-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Right Side: Logo & App Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div 
              id="edara-logo-icon"
              className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-xs"
            >
              <Newspaper className="w-5 h-5" strokeWidth={2.2} />
            </div>
            
            <div className="flex items-center min-w-0">
              <h1 id="edara-app-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                إدارة الأخبار
              </h1>
            </div>
          </div>

          {/* Left Side: Simple Logout Icon / Button */}
          <div className="flex items-center shrink-0">
            <button
              id="logout-button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
