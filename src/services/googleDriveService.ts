import { formatArabicDate } from '../utils/dateUtils';

export const DESIGNATED_FOLDER_ID =
  '1KpUNo2Z0dqdxaY2kWkVT-67jrax2bmAy';

export interface DriveDocument {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  sizeBytes?: number;
  modifiedTime?: string;
  formattedDate: string;
  description?: string;
  isFolder: boolean;
  typeLabel: string;
}

export interface DeleteDriveResult {
  success: true;
  fileId: string;
  fileName?: string;
  message?: string;
}

/* =========================================================
   CONFIGURATION
========================================================= */

export function getAppsScriptUrl(): string {
  return (import.meta.env.VITE_GOOGLE_DRIVE_APP_SCRIPT_URL || '').trim();
}

export function isGoogleDriveConfigured(): boolean {
  const url = getAppsScriptUrl();

  return Boolean(
    url &&
      url.startsWith('https://script.google.com/')
  );
}

/* =========================================================
   FILE SIZE
========================================================= */

export function formatBytes(
  bytes?: number | string
): string {
  if (
    bytes === undefined ||
    bytes === null ||
    bytes === ''
  ) {
    return '-';
  }

  const num =
    typeof bytes === 'string'
      ? parseInt(bytes, 10)
      : bytes;

  if (isNaN(num) || num <= 0) {
    return '0 B';
  }

  const k = 1024;

  const sizes = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
  ];

  const i = Math.floor(
    Math.log(num) / Math.log(k)
  );

  const value = parseFloat(
    (num / Math.pow(k, i)).toFixed(1)
  );

  return `${value} ${sizes[i]}`;
}

/* =========================================================
   FILE TYPE
========================================================= */

export function getFileTypeLabel(
  mimeType: string,
  fileName: string
): string {
  const lowerName = fileName.toLowerCase();

  if (
    mimeType ===
    'application/vnd.google-apps.folder'
  ) {
    return 'مجلد';
  }

  if (
    mimeType.includes('pdf') ||
    lowerName.endsWith('.pdf')
  ) {
    return 'PDF';
  }

  if (
    mimeType.includes('sheet') ||
    mimeType.includes(
      'officedocument.spreadsheetml'
    ) ||
    /\.(xls|xlsx|csv)$/i.test(lowerName)
  ) {
    return 'Excel';
  }

  if (
    mimeType.includes('word') ||
    mimeType.includes(
      'officedocument.wordprocessingml'
    ) ||
    /\.(doc|docx)$/i.test(lowerName)
  ) {
    return 'Word';
  }

  if (
    mimeType.includes('presentation') ||
    mimeType.includes(
      'officedocument.presentationml'
    ) ||
    /\.(ppt|pptx)$/i.test(lowerName)
  ) {
    return 'PowerPoint';
  }

  if (mimeType.startsWith('image/')) {
    return 'صورة';
  }

  if (mimeType.startsWith('video/')) {
    return 'فيديو';
  }

  if (mimeType.startsWith('audio/')) {
    return 'صوت';
  }

  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('7z')
  ) {
    return 'ملف مضغوط';
  }

  if (
    mimeType.includes('text/') ||
    lowerName.endsWith('.txt')
  ) {
    return 'نص';
  }

  return 'مستند';
}

/* =========================================================
   FILE → BASE64
========================================================= */

function fileToBase64(
  file: File
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result =
          String(reader.result || '');

        const base64 =
          result.includes('base64,')
            ? result.split('base64,')[1]
            : result;

        resolve(base64);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}

/* =========================================================
   LIST FILES
========================================================= */

export async function listDriveFiles(
  options?: {
    timeoutMs?: number;
  }
): Promise<DriveDocument[]> {
  const scriptUrl =
    getAppsScriptUrl();

  if (
    !scriptUrl ||
    !isGoogleDriveConfigured()
  ) {
    throw new Error(
      'لم يتم إعداد اتصال Google Drive بعد.'
    );
  }

  const timeoutMs =
    options?.timeoutMs || 25000;

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    );

  const url =
    `${scriptUrl}` +
    `${scriptUrl.includes('?') ? '&' : '?'}` +
    `action=list&_t=${Date.now()}`;

  try {
    const response =
      await fetch(url, {
        method: 'GET',
        headers: {
          Accept:
            'application/json',
        },
        signal:
          controller.signal,
        redirect: 'follow',
        cache: 'no-store',
      });

    const text =
      await response.text();

    let data: any;

    try {
      data =
        JSON.parse(text);
    } catch {
      throw new Error(
        'تعذر معالجة استجابة Google Drive.'
      );
    }

    if (
      data?.success !== true
    ) {
      throw new Error(
        data?.message ||
          'تعذر جلب الملفات من Google Drive.'
      );
    }

    const rawFiles: any[] =
      Array.isArray(data.files)
        ? data.files
        : [];

    return rawFiles.map(
      (file): DriveDocument => {
        const isFolder =
          file.mimeType ===
          'application/vnd.google-apps.folder';

        return {
          id: String(file.id),
          name: file.name,
          mimeType:
            file.mimeType ||
            'application/octet-stream',

          size: isFolder
            ? '-'
            : formatBytes(file.size),

          sizeBytes:
            file.size,

          modifiedTime:
            file.modifiedTime,

          formattedDate:
            file.modifiedTime
              ? formatArabicDate(
                  file.modifiedTime
                )
              : '-',

          description:
            file.description || '',

          isFolder,

          typeLabel:
            getFileTypeLabel(
              file.mimeType || '',
              file.name || ''
            ),
        };
      }
    );
  } catch (error: any) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'انتهت مهلة الاتصال بخدمة Google Drive.'
      );
    }

    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      'تعذر الاتصال بخدمة Google Drive.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const listDesignatedFolderFiles =
  listDriveFiles;

/* =========================================================
   UPLOAD FILE
========================================================= */

export async function uploadDriveFile(
  file: File,
  title: string,
  description?: string,
  timeoutMs = 60000
): Promise<DriveDocument> {
  const scriptUrl =
    getAppsScriptUrl();

  if (
    !scriptUrl ||
    !isGoogleDriveConfigured()
  ) {
    throw new Error(
      'لم يتم إعداد اتصال Google Drive بعد.'
    );
  }

  const trimmedTitle =
    title.trim();

  if (!trimmedTitle) {
    throw new Error(
      'عنوان الملف مطلوب'
    );
  }

  if (!file) {
    throw new Error(
      'يرجى اختيار ملف صالح للرفع'
    );
  }

  const base64Data =
    await fileToBase64(file);

  const payload = {
    action: 'upload',
    title: trimmedTitle,
    description:
      (description || '').trim(),
    originalFileName:
      file.name,
    mimeType:
      file.type ||
      'application/octet-stream',
    base64Data,
  };

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    );

  try {
    const response =
      await fetch(scriptUrl, {
        method: 'POST',

        headers: {
          'Content-Type':
            'text/plain;charset=utf-8',
        },

        body:
          JSON.stringify(payload),

        signal:
          controller.signal,

        redirect: 'follow',
      });

    const text =
      await response.text();

    let data: any = null;

    try {
      data =
        JSON.parse(text);
    } catch {
      data = null;
    }

    /*
      Normal successful response.
    */

    if (
      data?.success === true &&
      data?.file
    ) {
      const created =
        data.file;

      const isFolder =
        created.mimeType ===
        'application/vnd.google-apps.folder';

      return {
        id: String(created.id),

        name:
          created.name,

        mimeType:
          created.mimeType ||
          file.type ||
          'application/octet-stream',

        size:
          isFolder
            ? '-'
            : formatBytes(
                created.size ||
                  file.size
              ),

        sizeBytes:
          created.size ||
          file.size,

        modifiedTime:
          created.modifiedTime ||
          new Date().toISOString(),

        formattedDate:
          formatArabicDate(
            created.modifiedTime ||
              new Date().toISOString()
          ),

        description:
          created.description ||
          '',

        isFolder,

        typeLabel:
          getFileTypeLabel(
            created.mimeType ||
              file.type ||
              '',
            created.name
          ),
      };
    }

    /*
      If Apps Script completed the upload but
      the POST response was not readable, check
      the current Drive list.
    */

    if (
      !data ||
      !data.success ||
      !data.file
    ) {
      if (
        data?.success === false &&
        data?.message
      ) {
        throw new Error(
          data.message
        );
      }

      const refreshed =
        await listDriveFiles({
          timeoutMs: 15000,
        });

      const normalizedTitle =
        trimmedTitle.toLowerCase();

      const matching =
        refreshed.find(
          (doc) => {
            const name =
              doc.name.toLowerCase();

            return (
              name ===
                normalizedTitle ||
              name.startsWith(
                normalizedTitle
              ));
          }
        );

      if (matching) {
        return matching;
      }

      throw new Error(
        'تعذر معالجة استجابة رفع الملف.'
      );
    }

    throw new Error(
      'تعذر رفع الملف.'
    );
  } catch (error: any) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'استغرق رفع الملف وقتاً طويلاً وتجاوز المهلة المحددة.'
      );
    }

    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      'تعذر رفع الملف.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const uploadFileToDesignatedFolder =
  uploadDriveFile;

/* =========================================================
   DELETE SINGLE FILE
========================================================= */

export async function deleteDriveFile(
  fileId: string,
  timeoutMs = 30000
): Promise<DeleteDriveResult> {
  const scriptUrl =
    getAppsScriptUrl();

  if (
    !scriptUrl ||
    !isGoogleDriveConfigured()
  ) {
    throw new Error(
      'لم يتم إعداد اتصال Google Drive بعد.'
    );
  }

  const id =
    String(fileId || '').trim();

  if (!id) {
    throw new Error(
      'معرف الملف غير صالح'
    );
  }

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    );

  const url =
    `${scriptUrl}` +
    `${scriptUrl.includes('?') ? '&' : '?'}` +
    `action=delete` +
    `&fileId=${encodeURIComponent(id)}` +
    `&_t=${Date.now()}`;

  try {
    const response =
      await fetch(url, {
        method: 'GET',

        headers: {
          Accept:
            'application/json',
        },

        signal:
          controller.signal,

        redirect: 'follow',

        cache: 'no-store',
      });

    const text =
      await response.text();

    let result: any;

    try {
      result =
        JSON.parse(text);
    } catch {
      throw new Error(
        'تعذر معالجة استجابة حذف الملف.'
      );
    }

    /*
      THIS IS THE IMPORTANT PART.

      Google Apps Script returns:

      {
        success: true,
        message: "...",
        fileId: "...",
        fileName: "..."
      }

      We explicitly return the successful
      result to the DocumentsContext.
    */

    if (
      result?.success === true
    ) {
      return {
        success: true,

        fileId:
          String(
            result.fileId || id
          ),

        fileName:
          result.fileName,

        message:
          result.message,
      };
    }

    /*
      Backend explicitly reported failure.
    */

    if (
      result?.message
    ) {
      if (
        result.error
      ) {
        throw new Error(
          `${result.message}: ${result.error}`
        );
      }

      throw new Error(
        result.message
      );
    }

    throw new Error(
      'تعذر حذف الملف من Google Drive.'
    );
  } catch (error: any) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw new Error(
        'انتهت مهلة حذف الملف.'
      );
    }

    if (
      error instanceof Error
    ) {
      throw error;
    }

    throw new Error(
      'تعذر حذف الملف من Google Drive.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================
   DELETE MULTIPLE FILES
========================================================= */

export async function deleteMultipleDriveFiles(
  fileIds: string[],
  timeoutMs = 45000
): Promise<{
  successCount: number;
  failCount: number;
  deletedIds: string[];
  failedIds: string[];
}> {
  if (
    !fileIds ||
    fileIds.length === 0
  ) {
    throw new Error(
      'لم يتم تحديد أي ملفات للحذف'
    );
  }

  const results =
    await Promise.allSettled(
      fileIds.map(
        (id) =>
          deleteDriveFile(
            id,
            timeoutMs
          )
      )
    );

  const deletedIds: string[] = [];
  const failedIds: string[] = [];

  results.forEach(
    (result, index) => {
      const id =
        fileIds[index];

      if (
        result.status ===
        'fulfilled'
      ) {
        deletedIds.push(id);
      } else {
        failedIds.push(id);
      }
    }
  );

  return {
    successCount:
      deletedIds.length,

    failCount:
      failedIds.length,

    deletedIds,

    failedIds,
  };
}