import React, { useState, useMemo, memo, useCallback } from 'react';
import { 
  Upload, 
  RotateCw, 
  Trash2, 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Archive, 
  File, 
  CheckSquare, 
  Square, 
  AlertCircle 
} from 'lucide-react';
import { DocumentsProvider, useDocuments } from '../context/DocumentsContext';
import { isGoogleDriveConfigured, DriveDocument } from '../services/googleDriveService';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { DeleteDocumentsModal } from '../components/DeleteDocumentsModal';

// Render appropriate file icon based on mimeType and extension
const renderFileIcon = (mimeType: string, fileName: string) => {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />;
  }
  if (mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
    return <FileText className="w-5 h-5 text-rose-600 shrink-0" />;
  }
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('officedocument.spreadsheetml') ||
    fileName.toLowerCase().endsWith('.xls') ||
    fileName.toLowerCase().endsWith('.xlsx') ||
    fileName.toLowerCase().endsWith('.csv')
  ) {
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />;
  }
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument.wordprocessingml') ||
    fileName.toLowerCase().endsWith('.doc') ||
    fileName.toLowerCase().endsWith('.docx')
  ) {
    return <FileText className="w-5 h-5 text-blue-600 shrink-0" />;
  }
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-5 h-5 text-violet-600 shrink-0" />;
  }
  if (mimeType.startsWith('video/')) {
    return <Film className="w-5 h-5 text-orange-600 shrink-0" />;
  }
  if (mimeType.startsWith('audio/')) {
    return <Music className="w-5 h-5 text-pink-600 shrink-0" />;
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('7z')
  ) {
    return <Archive className="w-5 h-5 text-amber-600 shrink-0" />;
  }
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('html')) {
    return <FileCode className="w-5 h-5 text-indigo-600 shrink-0" />;
  }
  return <File className="w-5 h-5 text-slate-500 shrink-0" />;
};

// Memoized Table Row for optimal rendering speed
interface TableRowProps {
  doc: DriveDocument;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRequestDelete: (doc: DriveDocument) => void;
}

const DocumentTableRow = memo<TableRowProps>(({
  doc,
  isSelected,
  onToggleSelect,
  onRequestDelete,
}) => {
  return (
    <tr
      className={`hover:bg-slate-50/70 transition-colors ${
        isSelected ? 'bg-blue-50/40' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => onToggleSelect(doc.id)}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-blue-700" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      </td>

      {/* File Name & Icon */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {renderFileIcon(doc.mimeType, doc.name)}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate max-w-md" title={doc.name}>
              {doc.name}
            </p>
            {doc.description && (
              <p className="text-xs text-slate-400 truncate max-w-md mt-0.5" title={doc.description}>
                {doc.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-4 text-slate-600 font-medium">
        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
          {doc.typeLabel}
        </span>
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-slate-500 font-medium">
        {doc.formattedDate}
      </td>

      {/* Size */}
      <td className="py-3 px-4 text-slate-500 font-medium ltr-text">
        {doc.size}
      </td>

      {/* Action (Single Delete) */}
      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => onRequestDelete(doc)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="حذف الملف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});
DocumentTableRow.displayName = 'DocumentTableRow';

// Memoized Mobile Card for optimal rendering speed
const DocumentMobileCard = memo<TableRowProps>(({
  doc,
  isSelected,
  onToggleSelect,
  onRequestDelete,
}) => {
  return (
    <div
      className={`p-4 flex items-start gap-3 transition-colors ${
        isSelected ? 'bg-blue-50/40' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleSelect(doc.id)}
        className="text-slate-400 hover:text-slate-600 mt-1 cursor-pointer"
      >
        {isSelected ? (
          <CheckSquare className="w-4 h-4 text-blue-700" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {renderFileIcon(doc.mimeType, doc.name)}
          <p className="font-semibold text-slate-900 text-xs truncate" title={doc.name}>
            {doc.name}
          </p>
        </div>

        {doc.description && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            {doc.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
            {doc.typeLabel}
          </span>
          <span>{doc.formattedDate}</span>
          <span className="ltr-text">{doc.size}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRequestDelete(doc)}
        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
        title="حذف الملف"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
});
DocumentMobileCard.displayName = 'DocumentMobileCard';

const DocumentsViewContent: React.FC = () => {
  const {
    documents,
    isLoading,
    isRefreshing,
    isUploading,
    isDeleting,
    errorMessage,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    refresh,
    upload,
    deleteSingle,
    deleteBulk,
  } = useDocuments();

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<DriveDocument | null>(null);

  // Single delete initiation
  const handleRequestSingleDelete = useCallback((doc: DriveDocument) => {
    setSingleDeleteTarget(doc);
    setIsDeleteModalOpen(true);
  }, []);

  // Multi-delete initiation
  const handleRequestBulkDelete = useCallback(() => {
    setSingleDeleteTarget(null);
    setIsDeleteModalOpen(true);
  }, []);

  // Confirm real delete
  const handleConfirmDelete = async () => {
    try {
      if (singleDeleteTarget) {
        await deleteSingle(singleDeleteTarget.id);
      } else {
        await deleteBulk();
      }
      setIsDeleteModalOpen(false);
    } catch {
      // Error handled by context
    } finally {
      setSingleDeleteTarget(null);
    }
  };

  const isConfigured = isGoogleDriveConfigured();
  const allSelected = useMemo(
    () => documents.length > 0 && selectedIds.size === documents.length,
    [documents.length, selectedIds.size]
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            الملفات والمستندات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة الملفات والمستندات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Upload Button */}
          <button
            id="open-upload-modal-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>رفع ملف</span>
          </button>

          {/* Refresh Button */}
          <button
            id="refresh-docs-btn"
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 sm:px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="تحديث الملفات"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-700' : 'text-slate-500'}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Error / Not Configured State */}
      {errorMessage && !isLoading && documents.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {!isConfigured ? 'لم يتم إعداد اتصال Google Drive بعد.' : 'تعذر الاتصال بخدمة Google Drive.'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {!isConfigured
                ? 'يرجى إضافة رابط Google Apps Script Web App إلى متغير البيئة (VITE_GOOGLE_DRIVE_APP_SCRIPT_URL).'
                : errorMessage}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Selection Action Bar (Shown when items are selected) */}
      {!isLoading && selectedIds.size > 0 && (
        <div 
          id="docs-selection-bar"
          className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              إلغاء التحديد
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs sm:text-sm font-bold text-blue-900">
              تم تحديد <span className="ltr-text">{selectedIds.size}</span> عناصر
            </span>
          </div>

          <button
            id="bulk-delete-btn"
            onClick={handleRequestBulkDelete}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>
        </div>
      )}

      {/* 3. Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center w-full shadow-xs">
          <div className="inline-block w-7 h-7 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs sm:text-sm font-medium text-slate-600">جاري تحميل الملفات...</p>
        </div>
      )}

      {/* 4. Empty State */}
      {!isLoading && !errorMessage && documents.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center w-full space-y-2 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Folder className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد ملفات حالياً</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            يمكنك رفع ملف جديد من زر "رفع ملف"
          </p>
        </div>
      )}

      {/* 5. Documents List (Desktop Table / Mobile Cards) */}
      {!isLoading && documents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-700" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">اسم الملف</th>
                  <th className="py-3.5 px-4 w-28">النوع</th>
                  <th className="py-3.5 px-4 w-40">تاريخ التعديل</th>
                  <th className="py-3.5 px-4 w-28">الحجم</th>
                  <th className="py-3.5 px-4 w-16 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {documents.map((doc) => (
                  <DocumentTableRow
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedIds.has(doc.id)}
                    onToggleSelect={toggleSelect}
                    onRequestDelete={handleRequestSingleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {documents.map((doc) => (
              <DocumentMobileCard
                key={doc.id}
                doc={doc}
                isSelected={selectedIds.has(doc.id)}
                onToggleSelect={toggleSelect}
                onRequestDelete={handleRequestSingleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={upload}
        isUploading={isUploading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDocumentsModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSingleDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        count={singleDeleteTarget ? 1 : selectedIds.size}
        targetDocName={singleDeleteTarget?.name}
      />
    </div>
  );
};

export const DocumentsView: React.FC<{ onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  onShowToast = () => {},
}) => {
  return (
    <DocumentsProvider onShowToast={onShowToast}>
      <DocumentsViewContent />
    </DocumentsProvider>
  );
};

