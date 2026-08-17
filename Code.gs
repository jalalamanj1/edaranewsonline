/**
 * Google Apps Script Web App Backend for Google Drive Integration
 * 
 * Target Google Drive Folder: 1KpUNo2Z0dqdxaY2kWkVT-67jrax2bmAy
 */

var API_VERSION = "EDARA-DRIVE-BACKEND-V4-GET-DELETE";

// Target Google Drive Folder ID (مجلد المستندات الحصري)
var TARGET_FOLDER_ID = '1KpUNo2Z0dqdxaY2kWkVT-67jrax2bmAy';

/**
 * معالجة طلبات GET (عرض الملفات، وحذف ملف برابط مباشر، واختبار الاتصال)
 */
function doGet(e) {
  try {
    var action =
      (e && e.parameter && e.parameter.action)
        ? String(e.parameter.action).trim()
        : 'list';

    // ==========================================
    // LIST FILES
    // ==========================================
    if (action === 'list') {
      return createJsonResponse(listFiles());
    }

    // ==========================================
    // DELETE SINGLE FILE
    // GET ?action=delete&fileId=XXXXXXXX
    // ==========================================
    if (action === 'delete') {
      var fileId =
        (e && e.parameter && e.parameter.fileId)
          ? String(e.parameter.fileId).trim()
          : '';

      return createJsonResponse(
        deleteFile(fileId)
      );
    }

    return createJsonResponse({
      success: false,
      message: 'إجراء غير معروف: ' + action
    });

  } catch (err) {

    return createJsonResponse({
      success: false,
      message:
        'خطأ في معالجة الطلب: ' +
        (err && err.message
          ? err.message
          : String(err))
    });
  }
}
/**
 * معالجة طلبات POST (رفع، حذف ملف، حذف متعدد، عرض)
 */
function doPost(e) {
  try {
    var data = {};
    
    // قراءة البيانات المرسلة سواء كانت بتنسيق JSON أو Form
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var action = data.action || (e && e.parameter && e.parameter.action) || 'list';
    
    if (action === 'ping') {
      return createJsonResponse({
        success: true,
        message: 'NEW BACKEND IS ACTIVE'
      });
    }

    if (action === 'list') {
      return createJsonResponse(listFiles());
    }
    
    if (action === 'upload') {
      return createJsonResponse(uploadFile(data));
    }
    
    if (action === 'delete') {
      return createJsonResponse(deleteFile(data.fileId || data.id));
    }
    
    if (action === 'deleteMultiple' || action === 'deleteMany') {
      return createJsonResponse(deleteMultipleFiles(data.fileIds || data.ids || []));
    }
    
    return createJsonResponse({
      success: false,
      message: 'إجراء غير مدعوم: ' + action
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: 'حدث خطأ أثناء معالجة طلب POST: ' + (err.message || err.toString())
    });
  }
}

/**
 * بناء استجابة JSON موحدة مع تضمين apiVersion
 */
function createJsonResponse(data) {
  var responseData = (typeof data === 'object' && data !== null) ? data : { data: data };
  responseData.apiVersion = API_VERSION;
  
  return ContentService
    .createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * جلب المجلد المستهدف حصراً
 */
function getTargetFolder() {
  try {
    return DriveApp.getFolderById(TARGET_FOLDER_ID);
  } catch (err) {
    throw new Error('تعذر الوصول إلى مجلد المستندات المحدد في Google Drive (' + TARGET_FOLDER_ID + '). يرجى التحقق من وجود المجلد والصلاحيات.');
  }
}

/**
 * 1. جلب قائمة الملفات الحقيقية من المجلد (خفيفة وسريعة بدون استدعاءات إضافية)
 */
function listFiles() {
  var folder = getTargetFolder();
  var filesIterator = folder.getFiles();
  var filesList = [];
  
  while (filesIterator.hasNext()) {
    var file = filesIterator.next();
    
    // استبعاد الملفات المحذوفة
    if (file.isTrashed()) {
      continue;
    }
    
    filesList.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      size: file.getSize(),
      modifiedTime: file.getLastUpdated().toISOString(),
      description: file.getDescription() || ''
    });
  }
  
  // ترتيب الملفات تنازلياً حسب تاريخ التعديل (الأحدث أولاً)
  filesList.sort(function(a, b) {
    return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
  });
  
  return {
    success: true,
    files: filesList
  };
}

/**
 * 2. رفع ملف حقيقي وإنشاؤه داخل المجلد
 */
function uploadFile(data) {
  var title = (data.title || '').trim();
  if (!title) {
    return {
      success: false,
      message: 'عنوان الملف مطلوب'
    };
  }
  
  var base64Data = data.base64Data || data.data || data.fileBase64;
  if (!base64Data) {
    return {
      success: false,
      message: 'محتوى الملف غير موجود أو فارغ'
    };
  }
  
  // إزالة ترويسة data URL إذا وجدت
  if (base64Data.indexOf('base64,') > -1) {
    base64Data = base64Data.split('base64,')[1];
  }
  
  var mimeType = data.mimeType || data.type || 'application/octet-stream';
  var originalFileName = data.originalFileName || data.fileName || '';
  
  // الحفاظ على الامتداد الأصلي دون تكراره
  var ext = '';
  if (originalFileName && originalFileName.indexOf('.') > -1) {
    var lastDot = originalFileName.lastIndexOf('.');
    ext = originalFileName.substring(lastDot);
  }
  
  var finalFileName = title;
  if (ext) {
    var lowerTitle = title.toLowerCase();
    var lowerExt = ext.toLowerCase();
    if (lowerTitle.indexOf(lowerExt) === -1 || !lowerTitle.endsWith(lowerExt)) {
      finalFileName = title + ext;
    }
  }
  
  var folder = getTargetFolder();
  
  // فك تشفير Base64 وإنشاء ملف Google Drive الفعلي
  var decodedBytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(decodedBytes, mimeType, finalFileName);
  
  var createdFile = folder.createFile(blob);
  
  // حفظ الوصف إذا وُجد
  var description = (data.description || '').trim();
  if (description) {
    createdFile.setDescription(description);
  }
  
  return {
    success: true,
    message: 'تم رفع الملف بنجاح',
    file: {
      id: createdFile.getId(),
      name: createdFile.getName(),
      mimeType: createdFile.getMimeType(),
      size: createdFile.getSize(),
      modifiedTime: createdFile.getLastUpdated().toISOString(),
      description: createdFile.getDescription() || ''
    }
  };
}

/**
 * 3. حذف ملف واحد حصرياً من مجلد المستندات المحدد
 */
function deleteFile(fileId) {
  fileId = String(fileId || '').trim();

  if (!fileId) {
    return {
      success: false,
      message: 'معرف الملف غير محدد'
    };
  }

  try {
    var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    var files = folder.getFiles();
    var targetFile = null;

    while (files.hasNext()) {
      var file = files.next();
      if (String(file.getId()) === fileId) {
        targetFile = file;
        break;
      }
    }

    if (!targetFile) {
      return {
        success: false,
        message: 'الملف غير موجود داخل مجلد المستندات',
        fileId: fileId
      };
    }

    var fileName = targetFile.getName();
    targetFile.setTrashed(true);

    if (!targetFile.isTrashed()) {
      return {
        success: false,
        message: 'تعذر تأكيد حذف الملف',
        fileId: fileId
      };
    }

    return {
      success: true,
      message: 'تم حذف الملف بنجاح',
      fileId: fileId,
      fileName: fileName
    };
  } catch (error) {
    return {
      success: false,
      message: 'تعذر حذف الملف',
      error: error.message || String(error),
      fileId: fileId
    };
  }
}

/**
 * 4. حذف عدة ملفات دفعة واحدة
 */
function deleteMultipleFiles(fileIds) {
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return {
      success: false,
      message: 'لم يتم تحديد أي ملفات للحذف',
      deletedIds: [],
      failedIds: []
    };
  }

  var deletedIds = [];
  var failedIds = [];

  for (var i = 0; i < fileIds.length; i++) {
    var id = fileIds[i];
    try {
      var res = deleteFile(id);
      if (res && res.success) {
        deletedIds.push(String(id));
      } else {
        failedIds.push(String(id));
      }
    } catch (e) {
      failedIds.push(String(id));
    }
  }

  if (deletedIds.length === 0 && failedIds.length > 0) {
    return {
      success: false,
      message: 'فشل حذف الملفات المحددة من Google Drive',
      deletedIds: [],
      failedIds: failedIds
    };
  }

  return {
    success: true,
    message: 'تم حذف ' + deletedIds.length + ' ملف بنجاح',
    deletedIds: deletedIds,
    failedIds: failedIds
  };
}
