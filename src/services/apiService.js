/**
 * Centralized API Service
 * All API calls should go through this service
 */

import API, { API_BASE_URL } from '../config/API';
import axios from 'axios';

// Create axios instance with credentials for direct calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },  
});

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION APIs
// ============================================

export const authAPI = {
  // Unified login for both admin and student
  login: async (email, password, userType) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
      userType,
    });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: async (userType) => {
    if (userType === 'admin') {
      return await apiClient.post('/Admin/Logout');
    } else {
      return await apiClient.post('/Student/Logout');
    }
  },
};

// ============================================
// ADMIN APIs
// ============================================

export const adminAPI = {
  // Register admin
  register: async (adminData) => {
    const response = await apiClient.post('/Admin/Register', adminData);
    return response.data;
  },

  // Get admin dashboard stats
  getDashboard: async () => {
    const response = await apiClient.get('/Admin/dashboard');
    return response.data;
  },

  // Get admin statistics
  getStatistics: async () => {
    const response = await apiClient.get('/Admin/admin/statistics');
    return response.data;
  },

  // Get comprehensive dashboard analytics
  getDashboardAnalytics: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/analytics/dashboard?${params}`);
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    const response = await apiClient.get(`/analytics/activity?limit=${limit}`);
    return response.data;
  },
};

// ============================================
// STUDENT APIs
// ============================================

export const studentAPI = {
  // Register student
  register: async (studentData) => {
    const response = await apiClient.post('/Student/Register', studentData);
    return response.data;
  },

  // Get student list
  getList: async () => {
    const response = await apiClient.get('/Student/list');
    return response.data;
  },

  // Get student by ID
  getById: async (id) => {
    const response = await apiClient.get(`/Student/${id}`);
    return response.data;
  },

  // Update student
  update: async (id, studentData) => {
    const response = await apiClient.put(`/Student/update/${id}`, studentData);
    return response.data;
  },

  // Delete student
  delete: async (id) => {
    const response = await apiClient.delete(`/Student/delete/${id}`);
    return response.data;
  },

  // Get student profile
  getProfile: async (userId) => {
    const response = await apiClient.get(`/Student/student-profile/${userId}`);
    return response.data;
  },

  // Get student reports
  getReports: async (studentId) => {
    const response = await apiClient.get(`/Question/student/all-reports/${studentId}`);
    return response.data;
  },

  // Get exam status for student
  getExamStatus: async (userId) => {
    const response = await apiClient.get(`/Question/student/${userId}/exam/status`);
    return response.data;
  },

  // Get dashboard summary
  getDashboardSummary: async (studentId) => {
    const response = await apiClient.get(`/api/student-dashboard/summary/${studentId}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (studentId, period = 30) => {
    const response = await apiClient.get(`/api/student-dashboard/analytics/${studentId}?period=${period}`);
    return response.data;
  },

  // Get upcoming tests
  getUpcomingTests: async (studentId) => {
    const response = await apiClient.get(`/api/student-dashboard/upcoming-tests/${studentId}`);
    return response.data;
  },
};

// ============================================
// BATCH APIs
// ============================================

export const batchAPI = {
  // Get all batches
  getBatches: async () => {
    const response = await apiClient.get('/Batch/get-batches');
    return response.data;
  },

  // ✅ Get all exams (for admin listing page)
  getAllExams: async (showAll = true) => {
    const response = await apiClient.get(`/Question/exams/list?showAll=${showAll}`);
    return response.data;
  },

  // Get batch by name
  getBatchByName: async (batchName) => {
    const response = await apiClient.get(`/batch/exams/${encodeURIComponent(batchName)}`);
    return response.data;
  },

  // Get exams for a batch
  getBatchExams: async (batchId, examCode) => {
    const response = await apiClient.get(`/Batch/${batchId}/exams/${examCode}`);
    return response.data;
  },

  // Manual batch upload
  manualUpload: async (batchData) => {
    const response = await apiClient.post('/Batch/manual-upload', batchData);
    return response.data;
  },

  // Update batch exam
  updateBatchExam: async (batchId, examCode, examData) => {
    const response = await apiClient.put(`/Batch/manual-upload/${batchId}/${examCode}`, examData);
    return response.data;
  },

  // Upload exam from PDF with progress tracking
  uploadExamPDF: async (formData, onUploadProgress = null, onHeaders = null) => {
    const response = await apiClient.post('/Batch/upload-exam', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress({
          stage: 'upload',
          message: `Uploading files... ${percentCompleted}%`,
          progress: percentCompleted
        });
      } : undefined,
    });
    
    // Extract headers if callback provided
    if (onHeaders && response.headers) {
      onHeaders(response.headers);
    }
    
    return response.data;
  },

  // Get upload progress
  getUploadProgress: async (progressId) => {
    const response = await apiClient.get(`/Batch/upload-progress/${progressId}`);
    return response.data;
  },

  // Delete exam
  deleteExam: async (examCode) => {
    const response = await apiClient.delete(`/Question/exams/delete/${examCode}`);
    return response.data;
  },
};

// ============================================
// EXAM APIs
// ============================================

export const examAPI = {
  // Get exam by code
  getExam: async (examCode) => {
    const response = await apiClient.get(`/Question/student/exam/${examCode}`);
    return response.data;
  },

  // Get exam with batch name
  getExamWithBatch: async (examCode, batchName) => {
    const response = await apiClient.get(
      `/Question/student/exam/${examCode}/${encodeURIComponent(batchName)}`
    );
    return response.data;
  },

  // Get exam questions
  getQuestions: async (examCode) => {
    const response = await apiClient.get(`/Question/exams/${examCode}/questions`);
    return response.data;
  },

  // Get student exam status
  getStudentExamStatus: async (studentId, examCode) => {
    const response = await apiClient.get(
      `/Student/student/${studentId}/exam/${examCode}/status`
    );
    return response.data;
  },

  // Submit exam
  submitExam: async (examData) => {
    const response = await apiClient.post('/Question/student/exam/submit', examData);
    return response.data;
  },

  // Submit answer
  submitAnswer: async (answerData) => {
    const response = await apiClient.post('/Question/student/submit', answerData);
    return response.data;
  },

  // Get exam report
  getExamReport: async (examId, studentId) => {
    const response = await apiClient.get(`/Question/student/exam-report/${examId}/${studentId}`);
    return response.data;
  },

  // Save exam progress
  saveProgress: async (progressData) => {
    const response = await apiClient.post('/Exam/save-progress', progressData);
    return response.data;
  },
};

// ============================================
// BATCH ACCESS APIs
// ============================================

export const batchAccessAPI = {
  // Get access list for student
  getAccessList: async (studentId) => {
    const response = await apiClient.get(`/batch/access/list?studentId=${studentId}`);
    return response.data;
  },

  // Request batch access
  requestAccess: async (studentId, batchName) => {
    const response = await apiClient.post('/batch/request', {
      studentId,
      batchName,
    });
    return response.data;
  },

  // Request batch access (alternative endpoint)
  requestBatchAccess: async (requestData) => {
    const response = await apiClient.post('/batch/request', requestData);
    return response.data;
  },

  // Get all access requests (admin)
  getAllRequests: async () => {
    const response = await apiClient.get('/batch/access/requests/list');
    return response.data;
  },

  // Update access request status
  updateRequestStatus: async (studentId, status, batchName) => {
    const response = await apiClient.put('/batch/access/update', {
      studentId,
      status,
      batchName,
    });
    return response.data;
  },
};

// ============================================
// EXAM REQUEST APIs
// ============================================

export const examRequestAPI = {
  // Get all exam requests (admin)
  getAllExamRequests: async (status = null) => {
    const url = status 
      ? `/Admin/exam-requests?status=${status}`
      : '/Admin/exam-requests';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Approve exam request (admin)
  approveRequest: async (requestId, examCode, studentId) => {
    const response = await apiClient.put(`/Admin/exam-requests/${requestId}/approve`, {
      examCode,
      studentId,
    });
    return response.data;
  },

  // Reject exam request (admin)
  rejectRequest: async (requestId, examCode, studentId) => {
    const response = await apiClient.put(`/Admin/exam-requests/${requestId}/reject`, {
      examCode,
      studentId,
    });
    return response.data;
  },
};

// ============================================
// EXAM PUBLISH APIs
// ============================================

export const examPublishAPI = {
  // Publish exam (change status from draft to active)
  publishExam: async (examCode, batchName = null) => {
    const response = await apiClient.put('/Admin/exams/publish', {
      examCode,
      batchName,
    });
    return response.data;
  },

  // Unpublish exam (change status from active to draft)
  unpublishExam: async (examCode, batchName = null) => {
    const response = await apiClient.put('/Admin/exams/unpublish', {
      examCode,
      batchName,
    });
    return response.data;
  },
};

// ============================================
// REPORTS APIs
// ============================================

export const reportsAPI = {
  // Get all student reports (admin)
  getAllReports: async () => {
    const response = await apiClient.get('/Student/Reports');
    return response.data;
  },
};

// ============================================
// UPLOAD APIs
// ============================================

export const uploadAPI = {
  // Upload exam file
  uploadExam: async (formData) => {
    const response = await apiClient.post('/upload-exam', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ============================================
// PRACTICE APIs
// ============================================

export const practiceAPI = {
  // Get daily practice questions
  getDailyPractice: async (studentId, date, category) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (category) params.append('category', category);
    const response = await apiClient.get(`/api/practice/daily/${studentId}?${params}`);
    return response.data;
  },

  // Get topic-wise practice questions
  getTopicPractice: async (studentId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/api/practice/topic/${studentId}?${params}`);
    return response.data;
  },

  // Submit practice answer
  submitAnswer: async (answerData) => {
    const response = await apiClient.post('/api/practice/submit', answerData);
    return response.data;
  },

  // Get practice statistics
  getStats: async (studentId, period = 30) => {
    const response = await apiClient.get(`/api/practice/stats/${studentId}?period=${period}`);
    return response.data;
  },

  // Get topic mastery
  getMastery: async (studentId) => {
    const response = await apiClient.get(`/api/practice/mastery/${studentId}`);
    return response.data;
  },
};

// ============================================
// ENHANCED ANALYTICS APIs
// ============================================

export const analyticsAPI = {
  // Get comprehensive analytics
  getComprehensive: async (studentId, period = 30) => {
    const response = await apiClient.get(`/api/analytics/comprehensive/${studentId}?period=${period}`);
    return response.data;
  },

  // Get weak vs strong topics
  getTopics: async (studentId) => {
    const response = await apiClient.get(`/api/analytics/topics/${studentId}`);
    return response.data;
  },

  // Get comparative analytics
  getComparative: async (studentId) => {
    const response = await apiClient.get(`/api/analytics/comparative/${studentId}`);
    return response.data;
  },

  // Get time-based analytics
  getTimeBased: async (studentId, period = 30) => {
    const response = await apiClient.get(`/api/analytics/time-based/${studentId}?period=${period}`);
    return response.data;
  },
};

// ============================================
// GAMIFICATION APIs
// ============================================

export const gamificationAPI = {
  // Get student XP & level
  getXP: async (studentId) => {
    const response = await apiClient.get(`/api/gamification/xp/${studentId}`);
    return response.data;
  },

  // Add XP
  addXP: async (xpData) => {
    const response = await apiClient.post('/api/gamification/xp/add', xpData);
    return response.data;
  },

  // Update streak
  updateStreak: async (studentId) => {
    const response = await apiClient.post('/api/gamification/streak/update', { studentId });
    return response.data;
  },

  // Get badges
  getBadges: async (studentId) => {
    const response = await apiClient.get(`/api/gamification/badges/${studentId}`);
    return response.data;
  },

  // Check and award badges
  checkBadges: async (studentId) => {
    const response = await apiClient.post('/api/gamification/badges/check', { studentId });
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (period = 'all_time', limit = 100) => {
    const response = await apiClient.get(`/api/gamification/leaderboard?period=${period}&limit=${limit}`);
    return response.data;
  },

  // Get XP transactions
  getXPTransactions: async (studentId, limit = 50) => {
    const response = await apiClient.get(`/api/gamification/xp/transactions/${studentId}?limit=${limit}`);
    return response.data;
  },
};

// ============================================
// STUDENT PROFILE APIs
// ============================================

export const profileAPI = {
  // Get complete profile
  getProfile: async (studentId) => {
    const response = await apiClient.get(`/api/student-profile/${studentId}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (studentId, profileData) => {
    const response = await apiClient.put(`/api/student-profile/${studentId}`, profileData);
    return response.data;
  },

  // Update preferences
  updatePreferences: async (studentId, preferences) => {
    const response = await apiClient.put(`/api/student-profile/preferences/${studentId}`, preferences);
    return response.data;
  },

  // Get learning goals
  getLearningGoals: async (studentId) => {
    const response = await apiClient.get(`/api/student-profile/goals/${studentId}`);
    return response.data;
  },
};

// ============================================
// TEST SERIES APIs
// ============================================

export const testSeriesAPI = {
  // Get all test series
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/api/test-series?${params}`);
    return response.data;
  },

  // Get test series by ID
  getById: async (id) => {
    const response = await apiClient.get(`/api/test-series/${id}`);
    return response.data;
  },

  // Get mock tests
  getMockTests: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/api/test-series/mock-tests/list?${params}`);
    return response.data;
  },

  // Get exam categories
  getCategories: async () => {
    const response = await apiClient.get(`/api/test-series/categories/list`);
    return response.data;
  },
};

// Export default API instance for direct use if needed
export default {
  auth: authAPI,
  admin: adminAPI,
  student: studentAPI,
  batch: batchAPI,
  exam: examAPI,
  batchAccess: batchAccessAPI,
  reports: reportsAPI,
  upload: uploadAPI,
  testSeries: testSeriesAPI,
};

