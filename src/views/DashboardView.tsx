import React from 'react';
import { Clock } from 'lucide-react';
import { NewsItem } from '../types';
import { NewsTable } from '../components/NewsTable';

interface DashboardViewProps {
  newsList: NewsItem[];
  onNavigateToAdd: () => void;
  onNavigateToNews: () => void;
  onEdit: (item: NewsItem) => void;
  onDeleteRequest: (item: NewsItem) => void;
  onTogglePublish: (item: NewsItem) => void;
  onPreview: (item: NewsItem) => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  newsList,
  onEdit,
  onDeleteRequest,
  onTogglePublish,
  onPreview,
  isLoading,
}) => {
  const publishedCount = newsList.filter((item) => item.published).length;

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-150 w-full min-w-0">
      
      {/* 4. Main Page Header - Right aligned text ONLY, no duplicate Add button */}
      <div className="text-right pb-2">
        <h2 id="dashboard-main-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
          لوحة الأخبار
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          إدارة ونشر وتعديل الأخبار والتعاميم
        </p>
      </div>

      {/* 6. News Section Heading directly following the main header */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-2 text-slate-900">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <h3 className="text-base sm:text-lg font-bold">
            أحدث الأخبار {newsList.length > 0 && <span className="ltr-text text-sm font-normal text-slate-500">({publishedCount > 0 ? publishedCount : newsList.length})</span>}
          </h3>
        </div>

        {/* 7 & 8. News Cards List */}
        <NewsTable
          newsList={newsList}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
          onTogglePublish={onTogglePublish}
          onPreview={onPreview}
          isLoading={isLoading}
        />
      </div>

    </div>
  );
};
