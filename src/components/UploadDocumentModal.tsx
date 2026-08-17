import React, { useState, useRef } from 'react';
import { X, AlertCircle, FileUp } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string, description?: string) => Promise<void>;
  isUploading: boolean;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      // Auto-populate title if empty
      if (!title.trim()) {
        const lastDot = file.name.lastIndexOf('.');
        const nameWithoutExt = lastDot > 0 ? file.name.substring(0, lastDot) : file.name;
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('عنوان الملف مطلوب');
      return;
    }

    if (!selectedFile) {
      setError('يرجى اختيار ملف');
      return;
    }

    try {
      await onUpload(selectedFile, trimmedTitle, description.trim() || undefined);
      // ONLY on confirmed success: reset form and auto-close modal
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setError(null);
      onClose();
    } catch (err: any) {
      // On failure: keep form open, keep title, description, and selected file, display error
      setError(err?.message || 'تعذر رفع الملف، يرجى المحاولة مجدداً');
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="upload-document-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 sm:p-6 text-right space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            رفع ملف
          </h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* عنوان الملف * */}
          <div className="space-y-1.5">
            <label htmlFor="doc-title-input" className="block text-xs sm:text-sm font-bold text-slate-800">
              عنوان الملف <span className="text-rose-600">*</span>
            </label>
            <input
              id="doc-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              disabled={isUploading}
              placeholder="أدخل عنوان الملف"
              className="w-full px-3.5 py-2.5 min-h-[42px] bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs placeholder:text-slate-400"
            />
          </div>

          {/* وصف الملف */}
          <div className="space-y-1.5">
            <label htmlFor="doc-desc-input" className="block text-xs sm:text-sm font-bold text-slate-800">
              وصف الملف
            </label>
            <textarea
              id="doc-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              placeholder="أدخل وصفاً للملف (اختياري)"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 shadow-xs placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* اختيار الملف */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-800">
              اختيار الملف
            </label>

            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                selectedFile 
                  ? 'border-blue-300 bg-blue-50/50' 
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.zip,.rar"
              />
              
              <div className="flex flex-col items-center justify-center gap-1.5">
                <FileUp className="w-6 h-6 text-blue-600" />
                {selectedFile ? (
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 break-all">{selectedFile.name}</p>
                    <p className="text-slate-500 font-sans mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-blue-700">
                    اختيار ملف
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons: [ إلغاء ] [ رفع الملف ] */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              id="submit-doc-upload-btn"
              disabled={isUploading}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري رفع الملف...</span>
                </>
              ) : (
                <span>رفع الملف</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
