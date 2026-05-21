/**
 * API Client for Google Apps Script
 * ใช้สำหรับ GitHub Pages version
 */

// 🔧 แก้ไข URL นี้เป็น URL ของ Web App ที่ deploy แล้ว
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwzR7m5mBxeM8CYnYUFUEHtlOUw3WGyHcfS8ZAMEcX1lMoXWK9bXsu1FuuXWx6d_Tzz0A/exec';

/**
 * Send API request to Google Apps Script
 * @param {string} action - Function name to call
 * @param {Object} params - Parameters to pass
 * @returns {Promise<Object>} Response from API
 */
async function callAPI(action, params = {}) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                action: action,
                params: params
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Error (${action}):`, error);
        return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message
        };
    }
}

// =================================================================
// API WRAPPER FUNCTIONS
// =================================================================

async function apiGetInitialData() {
    return await callAPI('getInitialData');
}

async function apiGetTypes() {
    return await callAPI('getTypes');
}

async function apiGetCooperatives() {
    return await callAPI('getCooperatives');
}

async function apiGetGroups() {
    return await callAPI('getGroups');
}

async function apiGetUsers() {
    return await callAPI('getUsers');
}

async function apiLogin(credentials) {
    return await callAPI('login', { credentials });
}

async function apiUploadFiles(formObject) {
    return await callAPI('uploadFiles', { formObject });
}

async function apiIncrementDownload(fileId) {
    return await callAPI('incrementDownload', { fileId });
}

async function apiDeleteFile(fileId, deletedBy, callerId) {
    return await callAPI('deleteFile', { fileId, deletedBy, callerId });
}

async function apiDeleteMultipleFiles(fileIds, deletedBy, callerId) {
    return await callAPI('deleteMultipleFiles', { fileIds, deletedBy, callerId });
}

async function apiGetRecycleBinFiles() {
    return await callAPI('getRecycleBinFiles');
}

async function apiRestoreFile(recycleId) {
    return await callAPI('restoreFile', { recycleId });
}

async function apiPermanentDeleteFile(recycleId, callerId) {
    return await callAPI('permanentDeleteFile', { recycleId, callerId });
}

async function apiPermanentDeleteMultipleFiles(recycleIds, callerId) {
    return await callAPI('permanentDeleteMultipleFiles', { recycleIds, callerId });
}

async function apiEmptyRecycleBin(callerId) {
    return await callAPI('emptyRecycleBin', { callerId });
}

async function apiRequestDeleteFile(fileId, requestedBy, reason) {
    return await callAPI('requestDeleteFile', { fileId, requestedBy, reason });
}

async function apiGetDeleteRequests(userId) {
    return await callAPI('getDeleteRequests', { userId });
}

async function apiGetAllDeleteRequests() {
    return await callAPI('getAllDeleteRequests');
}

async function apiApproveDeleteRequest(requestId, approvedBy) {
    return await callAPI('approveDeleteRequest', { requestId, approvedBy });
}

async function apiRejectDeleteRequest(requestId, rejectedBy) {
    return await callAPI('rejectDeleteRequest', { requestId, rejectedBy });
}

async function apiGetPendingDeleteRequestsByFileIds(fileIds) {
    return await callAPI('getPendingDeleteRequestsByFileIds', { fileIds });
}

async function apiSaveUser(userData, callerId) {
    return await callAPI('saveUser', { userData, callerId });
}

async function apiSaveGroup(groupData, callerId) {
    return await callAPI('saveGroup', { groupData, callerId });
}

async function apiSaveThemeSetting(theme, callerId) {
    return await callAPI('saveThemeSetting', { theme, callerId });
}

async function apiSaveTableMode(mode, callerId) {
    return await callAPI('saveTableMode', { mode, callerId });
}

async function apiSaveTableAppearance(settings, callerId) {
    return await callAPI('saveTableAppearance', { settings, callerId });
}

async function apiGetKPIData() {
    return await callAPI('getKPIData');
}

async function apiGetCooperativeComparisonData() {
    return await callAPI('getCooperativeComparisonData');
}

async function apiGetCooperativeStats() {
    return await callAPI('getCooperativeStats');
}

async function apiGetActivityLogs() {
    return await callAPI('getActivityLogs');
}

async function apiGetStatistics() {
    return await callAPI('getStatistics');
}

async function apiGetActivitySummary() {
    return await callAPI('getActivitySummary');
}

async function apiSubmitSatisfaction(formData) {
    return await callAPI('submitSatisfaction', { formData });
}

async function apiGetSatisfactionForm() {
    return await callAPI('getSatisfactionForm');
}

async function apiIncrementVisitorCount() {
    return await callAPI('incrementVisitorCount');
}

async function runAPI(apiFunc, successHandler, failureHandler = null) {
    try {
        const result = await apiFunc();
        if (successHandler) {
            successHandler(result);
        }
    } catch (error) {
        if (failureHandler) {
            failureHandler(error);
        } else {
            console.error('API Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message
            });
        }
    }
}

// =================================================================
// SHIM: google.script.run Compatibility Layer
// =================================================================

window.google = window.google || {};
window.google.script = window.google.script || {};

(function () {
    function createRunnerResult(successHandler = null, failureHandler = null) {
        return new Proxy({}, {
            get(target, prop) {
                if (prop === 'withSuccessHandler') {
                    return (handler) => createRunnerResult(handler, failureHandler);
                }

                if (prop === 'withFailureHandler') {
                    return (handler) => createRunnerResult(successHandler, handler);
                }

                return async function (...args) {
                    try {
                        let params = {};
                        const funcName = prop;

                        switch (funcName) {
                            case 'login':
                                params = { credentials: args[0] };
                                break;
                            case 'saveUser':
                                params = { userData: args[0], callerId: args[1] };
                                break;
                            case 'saveGroup':
                                params = { groupData: args[0], callerId: args[1] };
                                break;
                            case 'deleteUser':
                                params = { UserId: args[0], callerId: args[1] };
                                break;
                            case 'deleteGroup':
                                params = { GroupId: args[0], callerId: args[1] };
                                break;
                            case 'deleteFile':
                                params = { fileId: args[0], deletedBy: args[1], callerId: args[2] };
                                break;
                            case 'deleteMultipleFiles':
                                params = { fileIds: args[0], deletedBy: args[1], callerId: args[2] };
                                break;
                            case 'permanentDeleteFile':
                                params = { recycleId: args[0], callerId: args[1] };
                                break;
                            case 'permanentDeleteMultipleFiles':
                                params = { recycleIds: args[0], callerId: args[1] };
                                break;
                            case 'emptyRecycleBin':
                                params = { callerId: args[0] };
                                break;
                            case 'restoreFile':
                                params = { recycleId: args[0], callerId: args[1] };
                                break;
                            case 'restoreMultipleFiles':
                                params = { recycleIds: args[0], callerId: args[1] };
                                break;
                            case 'requestDeleteFile':
                                params = { fileId: args[0], requestedBy: args[1], reason: args[2] };
                                break;
                            case 'approveDeleteRequest':
                                params = { requestId: args[0], approvedBy: args[1] };
                                break;
                            case 'rejectDeleteRequest':
                                params = { requestId: args[0], rejectedBy: args[1] };
                                break;
                            case 'getDeleteRequests':
                                params = { userId: args[0] };
                                break;
                            case 'saveThemeSetting':
                                params = { theme: args[0], callerId: args[1] };
                                break;
                            case 'saveTableMode':
                                params = { mode: args[0], callerId: args[1] };
                                break;
                            case 'saveTableAppearance':
                                params = { settings: args[0], callerId: args[1] };
                                break;
                            case 'recordDownloadAndGetFileUrl':
                                params = { fileId: args[0], driveFileId: args[1], score: args[2] };
                                break;
                            case 'previewFile':
                                params = { driveFileId: args[0] };
                                break;
                            case 'getFileForPrint':
                                params = { driveFileId: args[0] };
                                break;
                            case 'incrementDownload':
                                params = { fileId: args[0] };
                                break;
                            case 'uploadFiles':
                                params = { formObject: args[0] };
                                break;
                            case 'processImportFolder':
                                params = { importData: args[0] };
                                break;
                            case 'importFromDriveBatch':
                                params = {
                                    groupId: args[0],
                                    mainFolderId: args[1],
                                    userId: args[2],
                                    coopId: args[3],
                                    importSessionId: args[4],
                                    startIndex: args[5],
                                    importMode: args[6],
                                    skipFileNames: args[7],
                                    replaceFiles: args[8]
                                };
                                break;
                            case 'getImportProgress':
                                params = { importSessionId: args[0] };
                                break;
                            case 'cancelImport':
                                params = {};
                                break;
                            case 'checkImportDuplicates':
                                params = { mainFolderId: args[0], coopId: args[1] };
                                break;
                            case 'getFileTypesByCooperative':
                                params = { coopId: args[0] };
                                break;
                            case 'saveCoopDriveLink':
                                params = { coopName: args[0], folderUrl: args[1] };
                                break;
                            case 'cleanDuplicateFiles':
                                params = {};
                                break;
                            // ✅ Document Requests (ขอรับบริการข้อมูล)
                            case 'getDocumentRequests':
                                params = { userId: args[0] };
                                break;
                            case 'createDocumentRequest':
                                params = { requestData: args[0], userId: args[1] };
                                break;
                            case 'getRequestDetail':
                                params = { requestId: args[0], userId: args[1] };
                                break;
                            case 'replyToRequest':
                                params = { requestId: args[0], message: args[1], linkedFileId: args[2], userId: args[3] };
                                break;
                            case 'updateRequestStatus':
                                params = { requestId: args[0], status: args[1], linkedFileId: args[2], userId: args[3] };
                                break;
                            case 'deleteDocumentRequest':
                                params = { requestId: args[0], userId: args[1] };
                                break;
                            case 'getFilesForReference':
                                params = { userId: args[0] };
                                break;
                            case 'saveTemplate':
                                params = { templateData: args[0], callerId: args[1] };
                                break;
                            case 'deleteTemplate':
                                params = { templateId: args[0], callerId: args[1] };
                                break;
                            case 'importCpdTemplate':
                                params = { cpdData: args[0], callerId: args[1] };
                                break;
                            case 'getPendingDeleteRequestsByFileIds':
                                params = { fileIds: args[0] };
                                break;
                            case 'getFileTypesByCooperative':
                                params = { coopId: args[0] };
                                break;
                            // ✅ Title Edit Requests (ระบบเสนอแก้ไขชื่อเรื่อง)
                            case 'requestTitleEdit':
                                params = { fileId: args[0], oldTitle: args[1], newTitle: args[2], oldSubTitle: args[3], newSubTitle: args[4], userId: args[5], requesterName: args[6], reason: args[7] };
                                break;
                            case 'getTitleEditRequests':
                                params = {};
                                break;
                             case 'approveTitleEditRequest':
                                 params = { requestId: args[0], approverId: args[1] };
                                 break;
                             case 'rejectTitleEditRequest':
                                 params = { requestId: args[0], approverId: args[1] };
                                 break;
                             case 'approveTitleEditRequestsBatch':
                                 params = { requestIds: args[0], approverId: args[1] };
                                 break;
                             case 'rejectTitleEditRequestsBatch':
                                 params = { requestIds: args[0], approverId: args[1] };
                                 break;
                            default:
                                if (args.length > 0) {
                                    params = { args };
                                }
                        }

                        // Security: Removed console.log to prevent exposing sensitive data
                        const result = await callAPI(funcName, params);

                        if (successHandler) {
                            successHandler(result);
                        }
                    } catch (error) {
                        console.error(`[API SHIM] Error in ${prop}:`, error);
                        if (failureHandler) {
                            failureHandler(error);
                        }
                    }
                };
            }
        });
    }

    window.google.script.run = createRunnerResult();

    // API Client shim loaded
})();
