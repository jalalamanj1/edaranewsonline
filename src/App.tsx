import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveTab, NewsItem, ToastMessage } from './types';
import { 
  fetchNews, 
  createNews, 
  updateNews, 
  deleteNews, 
  toggleNewsPublish,
  subscribeToNewsTable 
} from './services/newsService';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ToastContainer } from './components/Toast';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EdaraLivePreviewModal } from './components/EdaraLivePreviewModal';
import { LoginView } from './views/LoginView';
import { NewsListView } from './views/NewsListView';
import { DocumentsView } from './views/DocumentsView';
import { AddNewsView } from './views/AddNewsView';
import { EditNewsView } from './views/EditNewsView';
import { Newspaper, Loader2 } from 'lucide-react';
import { getArabicErrorMessage } from './lib/supabase';

const MainApp: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('news');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  
  // Modals state
  const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load news list
  const loadNews = useCallback(async () => {
    try {
      setIsLoadingNews(true);
      const data = await fetchNews();
      setNewsList(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      showToast(getArabicErrorMessage(err, 'تعذر تحميل الأخبار'), 'error');
    } finally {
      setIsLoadingNews(false);
    }
  }, [showToast]);

  // Initial load and realtime listener
  useEffect(() => {
    if (user) {
      loadNews();
      const unsubscribe = subscribeToNewsTable(() => {
        loadNews();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [user, loadNews]);

  // Handle Add News submission
  const handleCreateNews = async (data: {
    title: string;
    content: string;
    category: string | null;
    image_url: string | null;
    source_url: string | null;
    published: boolean;
    published_at: string;
  }) => {
    setIsSubmitting(true);
    try {
      const created = await createNews(data);
      setNewsList((prev) => [created, ...prev]);
      showToast(
        data.published 
          ? 'تم نشر الخبر بنجاح في تطبيق إدارة' 
          : 'تم حفظ الخبر كمسودة بنجاح',
        'success'
      );
      setActiveTab('news');
    } catch (err) {
      console.error('Error creating news:', err);
      showToast(getArabicErrorMessage(err, 'تعذر حفظ الخبر'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit News submission
  const handleUpdateNews = async (data: {
    title: string;
    content: string;
    category: string | null;
    image_url: string | null;
    source_url: string | null;
    published: boolean;
    published_at: string;
  }) => {
    if (!editingItem) return;

    setIsSubmitting(true);
    try {
      const updated = await updateNews(editingItem.id, data);
      setNewsList((prev) =>
        prev.map((item) => (item.id === editingItem.id ? updated : item))
      );
      showToast('تم تحديث بيانات الخبر بنجاح', 'success');
      setEditingItem(null);
      setActiveTab('news');
    } catch (err) {
      console.error('Error updating news:', err);
      showToast(getArabicErrorMessage(err, 'تعذر حفظ تعديلات الخبر'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Publish / Unpublish
  const handleTogglePublish = async (item: NewsItem) => {
    const targetStatus = !item.published;
    try {
      // Immediate optimistic update
      setNewsList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, published: targetStatus } : n))
      );

      await toggleNewsPublish(item.id, targetStatus, item.published_at);
      
      showToast(
        targetStatus 
          ? 'تم نشر الخبر وسيظهر الآن للمستخدمين في إدارة' 
          : 'تم إلغاء نشر الخبر وتحويله إلى مسودة',
        'success'
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
      // Revert on error
      setNewsList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, published: item.published } : n))
      );
      showToast(getArabicErrorMessage(err, 'تعذر تحديث حالة النشر'), 'error');
    }
  };

  // Open Edit view
  const handleStartEdit = (item: NewsItem) => {
    setEditingItem(item);
    setActiveTab('edit');
  };

  // Delete flow
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteNews(itemToDelete.id, itemToDelete.image_url);
      setNewsList((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast('تم حذف الخبر بنجاح', 'success');
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting news:', err);
      showToast(getArabicErrorMessage(err, 'تعذر حذف الخبر'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-700/25">
          <Newspaper className="w-7 h-7 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>جاري تحميل نظام إدارة الأخبار...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Login screen
  if (!user) {
    return (
      <>
        <LoginView />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div id="edara-news-app" className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Global Header */}
      <Header onLogout={signOut} />

      {/* Primary Top Navigation - Only 2 tabs: الأخبار & الملفات والمستندات */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'edit') {
            setEditingItem(null);
          }
          setActiveTab(tab);
        }}
        totalNewsCount={newsList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* News Section */}
        {activeTab === 'news' && (
          <NewsListView
            newsList={newsList}
            onNavigateToAdd={() => setActiveTab('add')}
            onEdit={handleStartEdit}
            onDeleteRequest={(item) => setItemToDelete(item)}
            onTogglePublish={handleTogglePublish}
            onPreview={(item) => setPreviewItem(item)}
            isLoading={isLoadingNews}
          />
        )}

        {/* Documents Section */}
        {activeTab === 'documents' && (
          <DocumentsView onShowToast={showToast} />
        )}

        {/* Add News Sub-View */}
        {activeTab === 'add' && (
          <AddNewsView
            onSubmit={handleCreateNews}
            onCancel={() => setActiveTab('news')}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Edit News Sub-View */}
        {activeTab === 'edit' && editingItem && (
          <EditNewsView
            item={editingItem}
            onSubmit={handleUpdateNews}
            onCancel={() => {
              setEditingItem(null);
              setActiveTab('news');
            }}
            isSubmitting={isSubmitting}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام إدارة الأخبار المتكامل · منصة إدارة</span>
          <span className="text-slate-400 font-sans">الإصدار 2.5.0</span>
        </div>
      </footer>

      {/* Delete Confirmation Modal for News */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        newsTitle={itemToDelete?.title}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Edara Live App Preview Modal for News */}
      <EdaraLivePreviewModal
        item={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
