export type NewsCategory = 
  | 'أخبار الوزارة'
  | 'إعلانات'
  | 'تعاميم'
  | 'تنبيهات'
  | 'أخرى';

export type NewsStatus = 'منشور' | 'مسودة' | 'غير منشور';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  source_url?: string | null;
  category?: NewsCategory | string | null;
  published: boolean;
  published_at: string; // ISO date string (YYYY-MM-DD or full timestamp)
  created_at?: string;
  updated_at?: string;
}

export type NewsFormData = {
  title: string;
  content: string;
  category: NewsCategory | string;
  image_url: string | null;
  source_url: string;
  published_at: string;
};

export type ActiveTab = 'news' | 'documents' | 'add' | 'edit';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
