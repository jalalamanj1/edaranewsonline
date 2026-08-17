import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  DriveDocument, 
  listDriveFiles, 
  uploadDriveFile, 
  deleteDriveFile, 
  deleteMultipleDriveFiles,
  isGoogleDriveConfigured
} from '../services/googleDriveService';

interface DocumentsContextType {
  documents: DriveDocument[];
  isLoading: boolean;
  isRefreshing: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
  upload: (file: File, title: string, description?: string) => Promise<DriveDocument>;
  deleteSingle: (fileId: string) => Promise<void>;
  deleteBulk: () => Promise<{ successCount: number; failCount: number }>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export const DocumentsProvider: React.FC<{ children: React.ReactNode; onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void }> = ({
  children,
  onShowToast,
}) => {
  const [documents, setDocuments] = useState<DriveDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isInitializedRef = useRef<boolean>(false);
  const syncSeqRef = useRef<number>(0);

  /**
   * Fetch documents directly from Google Apps Script Web App
   */
  const loadDocumentsFromDrive = useCallback(
    async (options?: { isManualRefresh?: boolean }) => {
      if (!isGoogleDriveConfigured()) {
        setIsLoading(false);
        setIsRefreshing(false);
        setErrorMessage('لم يتم إعداد اتصال Google Drive بعد.');
        return;
      }

      const seq = ++syncSeqRef.current;
      const isManual = Boolean(options?.isManualRefresh);

      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const freshFiles = await listDriveFiles();
        
        if (seq !== syncSeqRef.current) return;

        setDocuments(freshFiles);
        setErrorMessage(null);

        if (isManual) {
          onShowToast('تم تحديث قائمة الملفات بنجاح', 'info');
        }
      } catch (err: any) {
        if (seq !== syncSeqRef.current) return;
        console.error('[Google Drive Fetch Error]', err);

        const errorMsg = err?.message || 'تعذر الاتصال بخدمة Google Drive.';
        if (isManual) {
          onShowToast(errorMsg, 'error');
        } else {
          setErrorMessage(errorMsg);
        }
      } finally {
        if (seq === syncSeqRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [onShowToast]
  );

  /**
   * Initial Load: Direct fetch from Google Drive
   */
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    loadDocumentsFromDrive({ isManualRefresh: false });
  }, [loadDocumentsFromDrive]);

  /**
   * Selection Controls
   */
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setDocuments((docs) => {
      setSelectedIds((prev) => {
        if (prev.size === docs.length && docs.length > 0) {
          return new Set();
        }
        return new Set(docs.map((d) => d.id));
      });
      return docs;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Manual Refresh (Button): calls GET ?action=list
   */
  const refresh = useCallback(async () => {
    await loadDocumentsFromDrive({ isManualRefresh: true });
  }, [loadDocumentsFromDrive]);

  /**
   * Real Upload: Sends real file to Google Drive and adds to list on confirmed success
   */
  const upload = useCallback(
    async (file: File, title: string, description?: string): Promise<DriveDocument> => {
      setIsUploading(true);
      try {
        const created = await uploadDriveFile(file, title, description);

        // Update list with the new Google Drive document
        setDocuments((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
        setErrorMessage(null);

        onShowToast('تم رفع الملف بنجاح', 'success');
        return created;
      } catch (err: any) {
        console.error('[Upload Error]', err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [onShowToast]
  );

  /**
   * Delete Single File:
   * GET ?action=delete&fileId=...
   */
  const deleteSingle = useCallback(
    async (fileId: string): Promise<void> => {
      setIsDeleting(true);
      let deletionSucceeded = false;

      try {
        await deleteDriveFile(fileId);
        deletionSucceeded = true;
      } catch (err: any) {
        console.error('[Delete Single Network Error]', err);
        onShowToast(err?.message || 'تعذر حذف الملف من Google Drive.', 'error');
        setIsDeleting(false);
        throw err;
      }

      // Backend deletion confirmed successful. Safely update UI state.
      if (deletionSucceeded) {
        try {
          setDocuments((prev) => prev.filter((d) => d.id !== fileId));
          setSelectedIds((prev) => {
            if (prev.has(fileId)) {
              const next = new Set(prev);
              next.delete(fileId);
              return next;
            }
            return prev;
          });
          onShowToast('تم حذف الملف بنجاح', 'success');
        } catch (uiErr) {
          console.error('[UI State Update Error after delete]', uiErr);
        } finally {
          setIsDeleting(false);
        }
      }
    },
    [onShowToast]
  );

  /**
   * Delete Bulk: Performs individual GET delete calls per file ID
   */
  const deleteBulk = useCallback(async (): Promise<{ successCount: number; failCount: number }> => {
    setIsDeleting(true);
    let res: { successCount: number; failCount: number; deletedIds: string[]; failedIds: string[] };

    try {
      const idsToDelete: string[] = Array.from(selectedIds);
      res = await deleteMultipleDriveFiles(idsToDelete);
    } catch (err: any) {
      console.error('[Bulk Delete Network Error]', err);
      onShowToast(err?.message || 'تعذر حذف الملفات من Google Drive.', 'error');
      setIsDeleting(false);
      throw err;
    }

    // Backend deletion completed. Safely update UI state.
    try {
      const deletedSet = new Set(res.deletedIds);
      setDocuments((prev) => prev.filter((d) => !deletedSet.has(d.id)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        res.deletedIds.forEach((id) => next.delete(id));
        return next;
      });

      if (res.failCount > 0 && res.successCount > 0) {
        onShowToast(`تم حذف ${res.successCount} ملفات، وتعذر حذف ${res.failCount}`, 'info');
      } else if (res.successCount > 0) {
        onShowToast('تم حذف الملفات بنجاح', 'success');
      } else if (res.failCount > 0) {
        onShowToast('تعذر حذف الملفات المحددة من Google Drive', 'error');
      }
    } catch (uiErr) {
      console.error('[UI State Update Error after bulk delete]', uiErr);
    } finally {
      setIsDeleting(false);
    }

    return { successCount: res.successCount, failCount: res.failCount };
  }, [selectedIds, onShowToast]);

  return (
    <DocumentsContext.Provider
      value={{
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
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
};

export function useDocuments(): DocumentsContextType {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}

