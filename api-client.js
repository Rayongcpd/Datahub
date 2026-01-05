// =================================================================
// API CLIENT FOR GITHUB PAGES
// =================================================================
// ไฟล์นี้ใช้สำหรับ GitHub Pages เพื่อเรียก GAS Web App
// สร้าง shim สำหรับ google.script.run เพื่อให้โค้ดเดิมทำงานได้
// =================================================================

// 🔧 เปลี่ยน URL นี้หลังจาก Deploy GAS Web App แล้ว
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyMy8qS9Eds-R01duPCQwsfm2gvIZyZ09iur29jaB-vKZgsYol1VBzyGWSoYvS4YQ7Z_A/exec';

// =================================================================
// CORE API FUNCTION
// =================================================================

/**
 * เรียก API ไปยัง GAS Web App
 * @param {string} action - ชื่อ action ที่ต้องการเรียก
 * @param {Object} data - ข้อมูลที่ต้องการส่ง
 * @returns {Promise<Object>} - ผลลัพธ์จาก API
 */
async function callGASAPI(action, data = {}) {
  try {
    const response = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: action,
        data: data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// =================================================================
// google.script.run SHIM
// =================================================================
// สร้าง object ที่จำลอง google.script.run API
// เพื่อให้โค้ดเดิมใน index.html ทำงานได้โดยไม่ต้องแก้ไข

const google = {
  script: {
    run: new Proxy({}, {
      get: function (target, prop) {
        // This is the initial access (e.g., google.script.run.withSuccessHandler)

        // State for this chain
        const state = {
          successHandler: null,
          failureHandler: null
        };

        // Helper to execute API call
        const executeCall = async (functionName, args) => {
          try {
            let data = {};
            if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
              if (args[0].tagName === 'FORM') {
                data = args[0]; // Form element, pass as is (not fully supported in this shim yet)
              } else {
                data = args[0];
              }
            } else if (args.length > 1) {
              data = { args: args };
            } else if (args.length === 1) {
              data = { value: args[0] };
            }

            const result = await callGASAPI(functionName, data);

            if (state.successHandler) {
              state.successHandler(result);
            }
            return result;
          } catch (error) {
            if (state.failureHandler) {
              state.failureHandler(error);
            } else {
              console.error(`GAS API Error (${functionName}):`, error);
            }
            throw error;
          }
        };

        // Create the chainer object
        const chainer = new Proxy({}, {
          get: function (target, key) {
            if (key === 'withSuccessHandler') {
              return function (callback) {
                state.successHandler = callback;
                return chainer; // Return strict reference to self for chaining
              };
            }
            if (key === 'withFailureHandler') {
              return function (callback) {
                state.failureHandler = callback;
                return chainer; // Return strict reference to self for chaining
              };
            }

            // If it's not a handler setter, it's the target function call
            return async function (...args) {
              return executeCall(key, args);
            };
          }
        });

        // 🟢 Crucial fix: Check if the *first* property accessed is a handler or a function
        if (prop === 'withSuccessHandler') {
          return function (callback) {
            state.successHandler = callback;
            return chainer;
          };
        }
        if (prop === 'withFailureHandler') {
          return function (callback) {
            state.failureHandler = callback;
            return chainer;
          };
        }

        // Otherwise, it's a direct function call (e.g. google.script.run.myFunction())
        return async function (...args) {
          return executeCall(prop, args);
        };
      }
    })
  }
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * แปลงไฟล์เป็น Base64 สำหรับการอัปโหลด
 * @param {File} file - ไฟล์จาก input
 * @returns {Promise<Object>} - { name, mimeType, data }
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      resolve({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: reader.result.split(',')[1] // เอาเฉพาะ base64 data
      });
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * แปลงหลายไฟล์เป็น Base64
 * @param {FileList|Array<File>} files - รายการไฟล์
 * @returns {Promise<Array<Object>>} - [{ name, mimeType, data }, ...]
 */
async function filesToBase64(files) {
  const promises = Array.from(files).map(file => fileToBase64(file));
  return Promise.all(promises);
}

/**
 * อัปโหลดไฟล์ผ่าน API
 * ใช้แทน uploadFiles สำหรับ GitHub Pages
 * @param {Object} formData - ข้อมูลฟอร์ม
 * @param {FileList|Array<File>} rawFiles - ไฟล์ดิบจาก input
 * @returns {Promise<Object>} - ผลลัพธ์จาก API
 */
async function uploadFilesViaAPI(formData, rawFiles) {
  try {
    // แปลงไฟล์เป็น base64
    const files = await filesToBase64(rawFiles);

    // รวมข้อมูลทั้งหมด
    const payload = {
      ...formData,
      files: files
    };

    // เรียก API
    return await callGASAPI('uploadFiles', payload);
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message };
  }
}

// =================================================================
// INITIALIZATION
// =================================================================

// ตรวจสอบว่ากำลังรันบน GitHub Pages หรือไม่
function isGitHubPages() {
  return window.location.hostname.includes('github.io') ||
    !window.location.hostname.includes('script.google.com');
}

// Log ว่าใช้ API Client
if (isGitHubPages()) {
  console.log('🌐 Running on GitHub Pages - Using API Client');
  console.log('📡 API URL:', GAS_API_URL);
}
