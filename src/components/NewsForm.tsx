import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Save, 
  ArrowRight, 
  Calendar, 
  Tag, 
  Link as LinkIcon, 
  FileText, 
  Heading, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { NewsItem, NewsCategory } from '../types';
import { getTodayLocalDateString, normalizeDateToInputString } from '../utils/dateUtils';
import { ImageUploader } from './ImageUploader';

interface NewsFormProps {
  initialData?: NewsItem | null;
  mode: 'add' | 'edit';
  onSubmit: (data: {
    title: string;
    content: string;
    category: string | null;
    image_url: string | null;
    source_url: string | null;
    published: boolean;
    published_at: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CATEGORIES: NewsCategory[] = [
  'أخبار الوزارة',
  'إعلانات',
  'تعاميم',
  'تنبيهات',
  'أخرى',
];

export const NewsForm: React.FC<NewsFormProps> = ({
  initialData,
  mode,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('أخبار الوزارة');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [publishedAt, setPublishedAt] = useState<string>(getTodayLocalDateString());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'publish' | 'draft' | null>(null);

  // Initialize form with initialData when in 'edit' mode or when initialData changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCategory(initialData.category || 'أخبار الوزارة');
      setImageUrl(initialData.image_url || null);
      setSourceUrl(initialData.source_url || '');
      setPublishedAt(normalizeDateToInputString(initialData.published_at));
    } else {
      setTitle('');
      setContent('');
      setCategory('أخبار الوزارة');
      setImageUrl(null);
      setSourceUrl('');
      setPublishedAt(getTodayLocalDateString());
    }
    setValidationError(null);
  }, [initialData, mode]);

  const handleFormSubmit = async (targetPublished: boolean) => {
    setValidationError(null);

    // Validation
    if (!title.trim()) {
      setValidationError('يرجى كتابة عنوان الخبر (حقل مطلوب)');
      return;
    }
    if (!content.trim()) {
      setValidationError('يرجى كتابة محتوى الخبر (حقل مطلوب)');
      return;
    }
    if (!publishedAt) {
      setValidationError('يرجى تحديد تاريخ النشر');
      return;
    }

    setActionType(targetPublished ? 'publish' : 'draft');

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      category: category || null,
      image_url: imageUrl,
      source_url: sourceUrl.trim() || null,
      published: targetPublished,
      published_at: normalizeDateToInputString(publishedAt),
    });

    setActionType(null);
  };

  return (
    <div id="news-form-container" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full min-w-0">
      
      {/* Form Top Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <button
              id="back-to-list-button"
              type="button"
              onClick={onCancel}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer shrink-0"
              title="الرجوع للأخبار"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h2 id="form-heading" className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {mode === 'add' ? 'إضافة خبر جديد' : 'تعديل الخبر'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 mr-7 sm:mr-8">
            {mode === 'add' 
              ? 'قم بتعبئة بيانات الخبر لنشره مباشرة في تطبيق إدارة أو حفظه كمسودة' 
              : 'تعديل وتحديث بيانات الخبر في قاعدة البيانات'}
          </p>
        </div>

        {/* Current status pill if editing */}
        {mode === 'edit' && initialData && (
          <div className="flex items-center gap-2 mr-7 sm:mr-0">
            <span className="text-xs text-slate-500 font-medium">الحالة:</span>
            {initialData.published ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>منشور</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span>مسودة</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div id="form-validation-alert" className="m-4 sm:m-6 mb-0 p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={(e) => e.preventDefault()} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Title Field */}
        <div className="space-y-1.5">
          <label htmlFor="news-title-input" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
            <Heading className="w-4 h-4 text-blue-600 shrink-0" />
            <span>عنوان الخبر</span>
            <span className="text-rose-500 text-xs">*</span>
          </label>
          <input
            id="news-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان الخبر الواضح والشامل..."
            disabled={isSubmitting}
            className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] bg-white border border-slate-300 rounded-xl text-slate-900 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Two Columns: Category & Publication Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="news-category-select" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
              <Tag className="w-4 h-4 text-blue-600 shrink-0" />
              <span>التصنيف</span>
              <span className="text-slate-400 text-xs font-normal">(اختياري)</span>
            </label>
            <select
              id="news-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 sm:px-4 py-2.5 min-h-[44px] bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Published At Date Field */}
          <div className="space-y-1.5">
            <label htmlFor="news-published-at-input" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>تاريخ النشر</span>
              <span className="text-rose-500 text-xs">*</span>
            </label>
            <input
              id="news-published-at-input"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 sm:px-4 py-2.5 min-h-[44px] bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ltr-text text-right"
            />
          </div>

        </div>

        {/* Content Multiline Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="news-content-textarea" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>المحتوى</span>
              <span className="text-rose-500 text-xs">*</span>
            </label>
            <span className="text-xs text-slate-400 ltr-text font-medium">
              {content.length} حرف
            </span>
          </div>
          <textarea
            id="news-content-textarea"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب تفاصيل ومحتوى الخبر هنا..."
            disabled={isSubmitting}
            className="w-full p-3.5 sm:p-4 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Image Upload Component */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-900">
            <span>صورة الخبر</span>
            <span className="text-slate-400 text-xs font-normal mr-1 sm:mr-2">(اختياري · حفظ في news-images)</span>
          </label>
          <ImageUploader
            currentImageUrl={imageUrl}
            onImageUploaded={(url) => setImageUrl(url)}
            disabled={isSubmitting}
          />
        </div>

        {/* Source URL Field */}
        <div className="space-y-1.5">
          <label htmlFor="news-source-url-input" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
            <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span>رابط المصدر</span>
            <span className="text-slate-400 text-xs font-normal">(اختياري)</span>
          </label>
          <input
            id="news-source-url-input"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://edara.gov.sa/news/..."
            disabled={isSubmitting}
            className="w-full px-3.5 sm:px-4 py-2.5 min-h-[44px] bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 ltr-text text-left"
          />
        </div>

        {/* Action Buttons: Stacked on mobile with 44px min-touch targets, horizontal on desktop */}
        <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
          
          <button
            id="form-cancel-button"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 order-3 sm:order-1"
          >
            إلغاء
          </button>

          {/* Draft button: published = false */}
          <button
            id="save-draft-button"
            type="button"
            onClick={() => handleFormSubmit(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50 order-2 sm:order-2"
          >
            {isSubmitting && actionType === 'draft' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-600 shrink-0" />
                <span>حفظ كمسودة</span>
              </>
            )}
          </button>

          {/* Publish button: published = true */}
          <button
            id="publish-news-button"
            type="button"
            onClick={() => handleFormSubmit(true)}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50 order-1 sm:order-3"
          >
            {isSubmitting && actionType === 'publish' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري النشر...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 shrink-0" />
                <span>نشر الخبر</span>
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};
