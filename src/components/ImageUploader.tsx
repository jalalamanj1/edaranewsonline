import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { uploadNewsImage } from '../services/newsService';
import { getArabicErrorMessage } from '../lib/supabase';

interface ImageUploaderProps {
  currentImageUrl: string | null;
  onImageUploaded: (url: string | null) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, GIF)');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير جداً، الحد الأقصى المسموح به 5 ميجابايت');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const publicUrl = await uploadNewsImage(file);
      onImageUploaded(publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setErrorMessage(getArabicErrorMessage(err, 'تعذر رفع الصورة إلى مساحة التخزين'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUploaded(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerPicker = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div id="image-uploader-wrapper" className="space-y-2 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        id="news-image-input"
        disabled={disabled || isUploading}
      />

      {/* When an image exists: preview with replace/remove controls */}
      {currentImageUrl ? (
        <div 
          id="image-preview-container"
          className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 group w-full max-w-lg"
        >
          <img
            src={currentImageUrl}
            alt="معاينة صورة الخبر"
            className="w-full h-44 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-101"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop';
            }}
          />
          
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-xs">
            <button
              type="button"
              id="replace-image-button"
              onClick={handleTriggerPicker}
              disabled={isUploading || disabled}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>استبدال الصورة</span>
            </button>

            <button
              type="button"
              id="remove-image-button"
              onClick={handleRemove}
              disabled={isUploading || disabled}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف الصورة</span>
            </button>
          </div>

          {/* Bottom Bar Controls for Mobile & Desktop */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">تم رفع الصورة</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTriggerPicker}
                className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer text-xs p-1"
              >
                استبدال
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer text-xs p-1"
              >
                إزالة
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone view */
        <div
          id="image-dropzone"
          onClick={handleTriggerPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/60' 
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30'
          } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              <span className="text-xs sm:text-sm font-bold text-slate-700">جاري رفع الصورة إلى مساحة التخزين...</span>
              <span className="text-[11px] text-slate-400">يرجى الانتظار قليلاً</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 sm:mb-3">
                <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mb-1">
                انقر لاختيار صورة من جهازك <span className="text-blue-600 underline font-normal hidden sm:inline">أو اسحبها هنا</span>
              </p>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                PNG, JPG, WEBP (الحد الأقصى: 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
