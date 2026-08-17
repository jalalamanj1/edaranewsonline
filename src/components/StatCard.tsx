import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'slate';
  description?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  icon: Icon,
  variant = 'blue',
  description,
  onClick,
}) => {
  const variantStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-700 border-blue-100',
      badge: 'text-blue-700 bg-blue-50/80',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-50/80',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      badge: 'text-amber-700 bg-amber-50/80',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      badge: 'text-slate-700 bg-slate-100',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between transition-all duration-200 w-full min-w-0 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
        <span className="text-xs font-bold text-slate-500 truncate">{title}</span>
        <div className="flex items-baseline gap-2">
          {/* Always Western / English Numerals */}
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight ltr-text text-right">
            {value}
          </span>
        </div>
        {description && (
          <span className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">{description}</span>
        )}
      </div>

      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border ${style.iconBg} shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
      </div>
    </div>
  );
};
