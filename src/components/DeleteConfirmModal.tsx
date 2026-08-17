import React from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  newsTitle?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  newsTitle,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="delete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="delete-modal-card"
        className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              تأكيد حذف الخبر
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الخبر نهائياً من قاعدة بيانات Supabase؟
            </p>
            {newsTitle && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 line-clamp-2 mt-2">
                &ldquo;{newsTitle}&rdquo;
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-medium">
          تنبيه: هذا الإجراء نهائي ولا يمكن التراجع عنه، وسيتم حذف الصورة المرفوعة المرتبطة به إن وجدت.
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50 order-2 sm:order-1"
          >
            إلغاء الأمر
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50 order-1 sm:order-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>نعم، احذف الخبر</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
