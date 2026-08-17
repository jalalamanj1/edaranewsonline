import { supabase, isSupabaseConfigured, NEWS_IMAGES_BUCKET } from '../lib/supabase';
import { NewsItem } from '../types';
import { getTodayLocalDateString, normalizeDateToInputString } from '../utils/dateUtils';

// Initial starter sample items for seamless preview when Supabase credentials are in initial state
const INITIAL_STORAGE_KEY = 'edara_news_local_cache';

const DEFAULT_SAMPLE_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'تدشين المنظومة الرقمية الموحدة لتسهيل الإجراءات الإدارية لمنسوبي القطاع',
    content: 'أعلنت إدارة التحول الرقمي عن إطلاق الحزمة الأولى من الخدمات الإلكترونية المطورة، والتي تهدف إلى أتمتة كافة المعاملات الداخلية وتوفير تجربة مستخدم سلسة وفق أعلى المعايير القياسية.',
    category: 'أخبار الوزارة',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    source_url: 'https://edara.gov.sa/news/1',
    published: true,
    published_at: '2026-08-16',
    created_at: '2026-08-16T08:00:00Z',
    updated_at: '2026-08-16T08:00:00Z',
  },
  {
    id: '2',
    title: 'تعميم عاجل بشأن تنظيم مواعيد العمل وساعات الحضور خلال الربع الثالث',
    content: 'يُرجى من جميع الإدارات والأقسام الالتزام بالضوابط التنظيمية المحدثة، وتحديث الجداول التشغيلية في النظام الإلكتروني قبل نهاية الأسبوع الجاري لضمان انسيابية العمل.',
    category: 'تعاميم',
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop',
    source_url: '',
    published: true,
    published_at: '2026-08-15',
    created_at: '2026-08-15T09:30:00Z',
    updated_at: '2026-08-15T09:30:00Z',
  },
  {
    id: '3',
    title: 'إعلان موعد انعقاد ورشة العمل التفاعلية لتطوير الكفاءات القيادية',
    content: 'يسر مركز التدريب والتطوير دعوة كافة المشرفين لحضور ورشة العمل المتقدمة يوم الأربعاء القادم في القاعة الرئيسية وعبر البث الافتراضي المباشر.',
    category: 'إعلانات',
    image_url: null,
    source_url: 'https://edara.gov.sa/events/leadership',
    published: false,
    published_at: '2026-08-14',
    created_at: '2026-08-14T11:15:00Z',
    updated_at: '2026-08-14T11:15:00Z',
  },
  {
    id: '4',
    title: 'تنبيه أمني دوري بخصوص تحديث كلمات المرور والتحقق الثنائي',
    content: 'تنفيذاً لسياسات الأمن السيبراني المعتمدة، نؤكد على ضرورة تفعيل التحقق بخطوتين وتغيير الرمز السري للبريد الرسمي دورياً وعدم مشاركة بيانات الدخول.',
    category: 'تنبيهات',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
    source_url: '',
    published: true,
    published_at: '2026-08-12',
    created_at: '2026-08-12T14:00:00Z',
    updated_at: '2026-08-12T14:00:00Z',
  }
];

// Helper to access fallback storage
const getLocalFallbackNews = (): NewsItem[] => {
  try {
    const cached = localStorage.getItem(INITIAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Could not read from localStorage', e);
  }
  return DEFAULT_SAMPLE_NEWS;
};

const saveLocalFallbackNews = (items: NewsItem[]) => {
  try {
    localStorage.setItem(INITIAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
};

/**
 * Fetch all news items from Supabase 'news' table
 */
export const fetchNews = async (): Promise<NewsItem[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }

      if (data) {
        // Normalize date fields
        return data.map((item) => ({
          ...item,
          published_at: normalizeDateToInputString(item.published_at),
        })) as NewsItem[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to cached state:', err);
      // If table doesn't exist yet or connection issue, return local storage data
      return getLocalFallbackNews();
    }
  }

  return getLocalFallbackNews();
};

/**
 * Create a new news record in 'news' table
 */
export const createNews = async (
  newsData: {
    title: string;
    content: string;
    category?: string | null;
    image_url?: string | null;
    source_url?: string | null;
    published: boolean;
    published_at: string;
  }
): Promise<NewsItem> => {
  const normalizedPublishedAt = normalizeDateToInputString(newsData.published_at) || getTodayLocalDateString();
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const payload = {
        title: newsData.title.trim(),
        content: newsData.content.trim(),
        category: newsData.category || null,
        image_url: newsData.image_url || null,
        source_url: newsData.source_url ? newsData.source_url.trim() : null,
        published: newsData.published,
        published_at: normalizedPublishedAt,
      };

      const { data, error } = await supabase
        .from('news')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        published_at: normalizeDateToInputString(data.published_at),
      } as NewsItem;
    } catch (err) {
      console.warn('Supabase insert failed, saving to local fallback:', err);
    }
  }

  // Local fallback
  const newItem: NewsItem = {
    id: 'news_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: newsData.title.trim(),
    content: newsData.content.trim(),
    category: newsData.category || null,
    image_url: newsData.image_url || null,
    source_url: newsData.source_url ? newsData.source_url.trim() : null,
    published: newsData.published,
    published_at: normalizedPublishedAt,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const list = getLocalFallbackNews();
  const updated = [newItem, ...list];
  saveLocalFallbackNews(updated);
  return newItem;
};

/**
 * Update an existing news record
 */
export const updateNews = async (
  id: string,
  newsData: Partial<NewsItem>
): Promise<NewsItem> => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (newsData.title !== undefined) payload.title = newsData.title.trim();
  if (newsData.content !== undefined) payload.content = newsData.content.trim();
  if (newsData.category !== undefined) payload.category = newsData.category || null;
  if (newsData.image_url !== undefined) payload.image_url = newsData.image_url || null;
  if (newsData.source_url !== undefined) payload.source_url = newsData.source_url ? newsData.source_url.trim() : null;
  if (newsData.published !== undefined) payload.published = newsData.published;
  if (newsData.published_at !== undefined) {
    payload.published_at = normalizeDateToInputString(newsData.published_at);
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('news')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        published_at: normalizeDateToInputString(data.published_at),
      } as NewsItem;
    } catch (err) {
      console.warn('Supabase update failed, saving to local fallback:', err);
    }
  }

  // Local fallback
  const list = getLocalFallbackNews();
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('الخبر غير موجود');
  }

  const updatedItem: NewsItem = {
    ...list[index],
    ...newsData,
    published_at: newsData.published_at 
      ? normalizeDateToInputString(newsData.published_at) 
      : list[index].published_at,
    updated_at: new Date().toISOString(),
  };

  list[index] = updatedItem;
  saveLocalFallbackNews(list);
  return updatedItem;
};

/**
 * Delete a news record and optionally its image from Storage
 */
export const deleteNews = async (id: string, imageUrl?: string | null): Promise<void> => {
  // If there is an image in Supabase storage bucket, delete it
  if (imageUrl && imageUrl.includes(NEWS_IMAGES_BUCKET)) {
    try {
      await deleteNewsImage(imageUrl);
    } catch (err) {
      console.warn('Failed to delete image from bucket:', err);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (err) {
      console.warn('Supabase delete failed, removing from local fallback:', err);
    }
  }

  // Local fallback
  const list = getLocalFallbackNews();
  const filtered = list.filter((item) => item.id !== id);
  saveLocalFallbackNews(filtered);
};

/**
 * Toggle publication status: publish or unpublish
 * CRITICAL: Preserves selected published_at date if provided, do not overwrite with current timestamp!
 */
export const toggleNewsPublish = async (
  id: string,
  targetPublished: boolean,
  currentPublishedAt?: string
): Promise<NewsItem> => {
  const dateToUse = currentPublishedAt ? normalizeDateToInputString(currentPublishedAt) : getTodayLocalDateString();
  return updateNews(id, {
    published: targetPublished,
    published_at: dateToUse,
  });
};

/**
 * Upload an image file to Supabase Storage bucket 'news-images'
 */
export const uploadNewsImage = async (file: File): Promise<string> => {
  if (!file) throw new Error('لم يتم تحديد ملف');

  if (isSupabaseConfigured()) {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(NEWS_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(NEWS_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Fallback for preview before Supabase is connected: convert to object URL or base64 preview
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Remove image from Supabase Storage bucket 'news-images'
 */
export const deleteNewsImage = async (imageUrl: string): Promise<void> => {
  if (!isSupabaseConfigured() || !imageUrl) return;

  try {
    const urlObj = new URL(imageUrl);
    const pathParts = urlObj.pathname.split(`${NEWS_IMAGES_BUCKET}/`);
    if (pathParts.length > 1) {
      const filePath = pathParts[1];
      await supabase.storage.from(NEWS_IMAGES_BUCKET).remove([filePath]);
    }
  } catch (e) {
    console.warn('Error parsing image URL for deletion:', e);
  }
};

/**
 * Realtime listener for the 'news' table
 */
export const subscribeToNewsTable = (onChange: () => void): (() => void) => {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('edara-news-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription error:', e);
    return () => {};
  }
};
