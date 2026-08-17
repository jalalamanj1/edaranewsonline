import React from 'react';
import { Newspaper, Folder } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  totalNewsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  totalNewsCount = 0,
}) => {
  const isNewsActive = activeTab === 'news' || activeTab === 'add' || activeTab === 'edit';
  const isDocumentsActive = activeTab === 'documents';

  return (
    <nav id="edara-main-navigation" className="bg-white border-b border-slate-200 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2.5 scrollbar-none">
          
          {/* الأخبار */}
          <button
            id="nav-tab-news"
            onClick={() => onSelectTab('news')}
            className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              isNewsActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Newspaper className="w-4 h-4 shrink-0" />
            <span>الأخبار</span>
            {totalNewsCount > 0 && (
              <span className="text-xs text-slate-500 ltr-text font-normal">
                ({totalNewsCount})
              </span>
            )}
          </button>

          {/* الملفات والمستندات */}
          <button
            id="nav-tab-documents"
            onClick={() => onSelectTab('documents')}
            className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              isDocumentsActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Folder className="w-4 h-4 shrink-0" />
            <span>الملفات والمستندات</span>
          </button>

        </div>
      </div>
    </nav>
  );
};
