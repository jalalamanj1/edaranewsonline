import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X,
  Plus
} from 'lucide-react';
import { NewsItem, NewsCategory } from '../types';
import { NewsTable } from '../components/NewsTable';

interface NewsListViewProps {
  newsList: NewsItem[];
  onNavigateToAdd?: () => void;
  onEdit: (item: NewsItem) => void;
  onDeleteRequest: (item: NewsItem) => void;
  onTogglePublish: (item: NewsItem) => void;
  onPreview: (item: NewsItem) => void;
  isLoading: boolean;
}

type FilterStatus = 'all' | 'published' | 'draft';

const CATEGORIES: (NewsCategory | 'الكل')[] = [
  'الكل',
  'أخبار الوزارة',
  'إعلانات',
  'تعاميم',
  'تنبيهات',
  'أخرى',
];

export const NewsListView: React.FC<NewsListViewProps> = ({
  newsList,
  onNavigateToAdd,
  onEdit,
  onDeleteRequest,
  onTogglePublish,
  onPreview,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');

  // Filter items in memory
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      // Status filter
      if (statusFilter === 'published' && !item.published) return false;
      if (statusFilter === 'draft' && item.published) return false;

      // Category filter
      if (categoryFilter !== 'الكل' && item.category !== categoryFilter) return false;

      // Search term filter (title, content, category)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchContent = item.content.toLowerCase().includes(query);
        const matchCategory = item.category ? item.category.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchContent && !matchCategory) return false;
      }

      return true;
    });
  }, [newsList, statusFilter, categoryFilter, searchTerm]);

  const totalCount = newsList.length;
  const publishedCount = newsList.filter((i) => i.published).length;
  const draftsCount = newsList.filter((i) => !i.published).length;

  return (
    <div id="news-management-view" className="space-y-6 animate-in fade-in duration-150 w-full min-w-0">
      
      {/* Page Header with prominent single Add News button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 text-right">
        <div>
          <h2 id="news-management-title" className="text-xl sm:text-2xl font-bold text-slate-900">
            إدارة الأخبار
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            عرض وتحرير ونشر كافة الأخبار والتعاميم المنشورة
          </p>
        </div>

        {onNavigateToAdd && (
          <button
            id="add-news-primary-button"
            onClick={onNavigateToAdd}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>إضافة خبر</span>
          </button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-3.5 w-full">
        
        {/* Search Box */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 shrink-0" />
          </div>
          <input
            id="news-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="إبحث في الأخبار بالعنوان أو المحتوى..."
            className="w-full pr-10 pl-9 min-h-[46px] bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs transition-colors placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer min-h-[46px] min-w-[36px] justify-center"
              title="مسح البحث"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row: Status Tabs & Category Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
          
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              id="filter-all"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-center ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل (<span className="ltr-text">{totalCount}</span>)
            </button>

            <button
              id="filter-published"
              onClick={() => setStatusFilter('published')}
              className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-center ${
                statusFilter === 'published'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المنشورة (<span className="ltr-text">{publishedCount}</span>)
            </button>

            <button
              id="filter-drafts"
              onClick={() => setStatusFilter('draft')}
              className={`flex-1 sm:flex-initial min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-center ${
                statusFilter === 'draft'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المسودات (<span className="ltr-text">{draftsCount}</span>)
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-auto shrink-0">
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto min-h-[38px] px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'الكل' ? 'جميع التصنيفات' : cat}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Filter summary if active */}
      {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'الكل') && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            نتائج البحث: <strong className="ltr-text font-bold text-slate-700">{filteredNews.length}</strong> خبر
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('الكل');
            }}
            className="text-blue-700 hover:underline font-bold cursor-pointer"
          >
            إعادة تعيين المرشحات
          </button>
        </div>
      )}

      {/* News List */}
      <NewsTable
        newsList={filteredNews}
        onEdit={onEdit}
        onDeleteRequest={onDeleteRequest}
        onTogglePublish={onTogglePublish}
        onPreview={onPreview}
        isLoading={isLoading}
      />

    </div>
  );
};
