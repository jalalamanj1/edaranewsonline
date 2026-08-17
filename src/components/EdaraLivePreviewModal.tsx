import React from 'react';
import { X, Calendar, ExternalLink, Tag, Newspaper, ArrowLeft } from 'lucide-react';
import { NewsItem } from '../types';
import { formatArabicDate } from '../utils/dateUtils';

interface EdaraLivePreviewModalProps {
  item: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EdaraLivePreviewModal: React.FC<EdaraLivePreviewModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div 
      id="edara-preview-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="edara-preview-modal"
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Preview Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Newspaper className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-blue-300 block">معاينة مظهر الخبر</span>
              <span className="text-xs sm:text-sm font-semibold text-white truncate">تطبيق إدارة · آخر الأخبار</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          
          {/* Status Note */}
          <div className={`p-3 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 ${
            item.published 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <span>حالة الخبر: {item.published ? 'منشور (يظهر للمستخدمين)' : 'مسودة (غير معروض)'}</span>
            <span className="font-normal text-slate-500">تاريخ العرض: {formatArabicDate(item.published_at)}</span>
          </div>

          {/* Featured Image */}
          {item.image_url && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-60 sm:max-h-72">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2">
            {item.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Tag className="w-3 h-3" />
                <span>{item.category}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formatArabicDate(item.published_at)}</span>
            </span>
          </div>

          {/* Article Title */}
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {item.title}
          </h2>

          {/* Article Body */}
          <div className="text-slate-700 text-xs sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
            {item.content}
          </div>

          {/* Source Link */}
          {item.source_url && (
            <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-1">
              <span className="text-slate-400 font-medium">المصدر الرسمي:</span>
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline ltr-text truncate max-w-full"
              >
                <span className="truncate">{item.source_url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};
