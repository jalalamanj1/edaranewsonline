import React from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  ImageIcon,
  Send,
  EyeOff
} from 'lucide-react';
import { NewsItem } from '../types';
import { formatArabicDate } from '../utils/dateUtils';

interface NewsTableProps {
  newsList: NewsItem[];
  onEdit: (item: NewsItem) => void;
  onDeleteRequest: (item: NewsItem) => void;
  onTogglePublish: (item: NewsItem) => void;
  onPreview: (item: NewsItem) => void;
  isLoading?: boolean;
}

export const NewsTable: React.FC<NewsTableProps> = ({
  newsList,
  onEdit,
  onDeleteRequest,
  onTogglePublish,
  onPreview,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center w-full">
        <div className="inline-block w-6 h-6 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs sm:text-sm font-medium text-slate-500">جاري تحميل الأخبار...</p>
      </div>
    );
  }

  if (newsList.length === 0) {
    return (
      <div 
        id="empty-news-state"
        className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm font-medium w-full"
      >
        لا توجد أخبار حالياً
      </div>
    );
  }

  return (
    <div className="space-y-3.5 w-full">
      {newsList.map((item) => {
        const isPublished = item.published;

        return (
          <div
            key={item.id}
            id={`news-card-${item.id}`}
            className="bg-white rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 shadow-xs flex flex-col justify-between gap-3.5 w-full"
          >
            {/* Top Row: Info (Right) and Image Thumbnail (Left) */}
            <div className="flex items-start justify-between gap-3.5 min-w-0">
              
              {/* Right: Title, Description, Metadata */}
              <div className="flex-1 min-w-0 space-y-1 text-right">
                <h4 
                  onClick={() => onPreview(item)}
                  className="text-base font-bold text-slate-900 line-clamp-1 hover:text-blue-700 cursor-pointer"
                  title={item.title}
                >
                  {item.title}
                </h4>

                {item.content && (
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                )}

                {/* Metadata: Status • Date */}
                <div className="flex items-center gap-1.5 text-xs pt-1">
                  <span className={`font-semibold ${isPublished ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isPublished ? 'منشور' : 'مسودة'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">
                    {formatArabicDate(item.published_at)}
                  </span>
                  {item.category && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">{item.category}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Left: Thumbnail image (64-80px) */}
              <div 
                onClick={() => onPreview(item)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>

            </div>

            {/* Bottom Actions Row: Clean line with icons */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-start gap-4 text-xs font-semibold">
              
              {/* عرض */}
              <button
                onClick={() => onPreview(item)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer py-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض</span>
              </button>

              <span className="text-slate-200">|</span>

              {/* تعديل */}
              <button
                onClick={() => onEdit(item)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer py-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>

              <span className="text-slate-200">|</span>

              {/* تغيير حالة النشر */}
              <button
                onClick={() => onTogglePublish(item)}
                className={`inline-flex items-center gap-1 transition-colors cursor-pointer py-1 ${
                  isPublished
                    ? 'text-amber-700 hover:text-amber-800'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                {isPublished ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>تحويل لمسودة</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>نشر</span>
                  </>
                )}
              </button>

              <span className="text-slate-200">|</span>

              {/* حذف */}
              <button
                onClick={() => onDeleteRequest(item)}
                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>

            </div>

          </div>
        );
      })}

      {/* 9. Minimal End of News state */}
      {newsList.length > 0 && (
        <div className="text-center py-5 text-xs text-slate-400 font-medium">
          لا يوجد المزيد من الأخبار
        </div>
      )}
    </div>
  );
};
