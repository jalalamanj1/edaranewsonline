import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  count?: number;
  fileName?: string;
  targetDocName?: string;
  isDeleting: boolean;
}

export const DeleteDocumentsModal: React.FC<DeleteDocumentsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="delete-documents-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 text-right space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              حذف الملفات
            </h3>
          </div>
        </div>

        {/* Confirmation Question */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
          هل أنت متأكد من حذف الملفات المحددة؟
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            id="confirm-delete-doc-btn"
            className="inline-flex items-center justify-center gap-2 min-h-[40px] px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الحذف...</span>
              </>
            ) : (
              <span>حذف</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
