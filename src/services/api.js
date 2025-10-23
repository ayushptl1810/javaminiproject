import axios from "axios";
import { mockAPI } from "./mockApi.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Use mock API in development mode when backend is not available
const USE_MOCK_API = false; // Backend is now working, use real API

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => USE_MOCK_API ? mockAPI.auth.login(credentials) : api.post("/auth/login", credentials),
  signup: (userData) => USE_MOCK_API ? mockAPI.auth.signup(userData) : api.post("/auth/signup", userData),
  verifyToken: () => USE_MOCK_API ? mockAPI.auth.verifyToken() : api.get("/auth/verify"),
  updateProfile: (profileData) => USE_MOCK_API ? mockAPI.auth.updateProfile(profileData) : api.put("/auth/profile", profileData),
  changePassword: (passwordData) => USE_MOCK_API ? mockAPI.auth.changePassword(passwordData) : api.put("/auth/change-password", passwordData),
  forgotPassword: (email) => USE_MOCK_API ? mockAPI.auth.forgotPassword(email) : api.post("/auth/forgot-password", { email }),
  resetPassword: (token, passwordData) => USE_MOCK_API ? mockAPI.auth.resetPassword(token, passwordData) : api.post(`/auth/reset-password/${token}`, passwordData),
};

// Subscription API
export const subscriptionAPI = {
  getAll: (params = {}) => USE_MOCK_API ? mockAPI.subscription.getAll(params) : api.get("/subscriptions", { params }),
  getById: (id) => USE_MOCK_API ? mockAPI.subscription.getById(id) : api.get(`/subscriptions/${id}`),
  create: (subscriptionData) => USE_MOCK_API ? mockAPI.subscription.create(subscriptionData) : api.post("/subscriptions", subscriptionData),
  update: (id, subscriptionData) => USE_MOCK_API ? mockAPI.subscription.update(id, subscriptionData) : api.put(`/subscriptions/${id}`, subscriptionData),
  delete: (id) => USE_MOCK_API ? mockAPI.subscription.delete(id) : api.delete(`/subscriptions/${id}`),
  bulkUpdate: (updates) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : api.put("/subscriptions/bulk", updates),
  bulkDelete: (ids) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : api.delete("/subscriptions/bulk", { data: { ids } }),
  import: (file) => {
    if (USE_MOCK_API) {
      return Promise.resolve({ data: { success: true, imported: 5 } });
    }
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/subscriptions/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  export: (format = "csv", filters = {}) => {
    if (USE_MOCK_API) {
      const mockContent = "Mock CSV content";
      return Promise.resolve({ data: new Blob([mockContent], { type: 'text/csv' }) });
    }
    return api.get("/subscriptions/export", { 
      params: { format, ...filters },
      responseType: "blob",
    });
  },
  getUpcoming: (days = 7) => USE_MOCK_API ? mockAPI.subscription.getUpcoming(days) : api.get("/subscriptions/upcoming", { params: { days } }),
  getByDateRange: (startDate, endDate) => 
    USE_MOCK_API ? mockAPI.subscription.getAll({ startDate, endDate }) : api.get("/subscriptions/date-range", { params: { startDate, endDate } }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (params = {}) => USE_MOCK_API ? mockAPI.analytics.getOverview(params) : api.get("/analytics/overview", { params }),
  getSpendingTrend: (params = {}) => USE_MOCK_API ? mockAPI.analytics.getSpendingTrend(params) : api.get("/analytics/spending-trend", { params }),
  getCategoryBreakdown: (params = {}) => USE_MOCK_API ? mockAPI.analytics.getCategoryBreakdown(params) : api.get("/analytics/category-breakdown", { params }),
  getBillingCycleAnalysis: (params = {}) => USE_MOCK_API ? mockAPI.analytics.getBillingCycleAnalysis(params) : api.get("/analytics/billing-cycle", { params }),
  getTopSubscriptions: (params = {}) => USE_MOCK_API ? mockAPI.analytics.getTopSubscriptions(params) : api.get("/analytics/top-subscriptions", { params }),
  getProjections: (params = {}) => USE_MOCK_API ? Promise.resolve({ data: { annualProjection: 1391.40 } }) : Promise.resolve({ data: { annualProjection: 1391.40 } }), // Mock for now since endpoint not available
  getInsights: (params = {}) => USE_MOCK_API ? mockAPI.analytics.getInsights(params) : Promise.resolve({ data: { insights: ["Mock insight data"] } }), // Mock for now
  compareSubscriptions: (ids) => USE_MOCK_API ? Promise.resolve({ data: { comparison: "Mock comparison data" } }) : Promise.resolve({ data: { comparison: "Mock comparison data" } }), // Mock for now
};

// Reports API
export const reportAPI = {
  getTemplates: () => USE_MOCK_API ? Promise.resolve({ data: [] }) : Promise.resolve({ data: [] }), // Mock for now
  generate: (reportData) => USE_MOCK_API ? mockAPI.report.generate(reportData) : Promise.resolve({ data: { id: "report-123", name: "Generated Report" } }), // Mock for now
  getReport: (id) => USE_MOCK_API ? Promise.resolve({ data: { id, name: "Mock Report" } }) : Promise.resolve({ data: { id, name: "Mock Report" } }), // Mock for now
  getReports: (params = {}) => USE_MOCK_API ? mockAPI.report.getReports(params) : Promise.resolve({ data: [] }), // Mock for now
  deleteReport: (id) => USE_MOCK_API ? mockAPI.report.deleteReport(id) : Promise.resolve({ data: { success: true } }), // Mock for now
  downloadReport: (id, format = "pdf") => {
    if (USE_MOCK_API) {
      return mockAPI.report.downloadReport(id, format);
    }
    return Promise.resolve({ data: "Mock report download data" }); // Mock for now
  },
  scheduleReport: (scheduleData) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
  getScheduledReports: () => USE_MOCK_API ? mockAPI.report.getScheduledReports() : Promise.resolve({ data: [] }), // Mock for now
  updateSchedule: (id, scheduleData) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
  deleteSchedule: (id) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
};

// Notification API
export const notificationAPI = {
  getNotifications: (params = {}) => USE_MOCK_API ? mockAPI.notification.getNotifications(params) : api.get("/notifications", { params }),
  markAsRead: (id) => USE_MOCK_API ? mockAPI.notification.markAsRead(id) : api.put(`/notifications/${id}/read`),
  markAllAsRead: () => USE_MOCK_API ? mockAPI.notification.markAllAsRead() : api.put("/notifications/read-all"),
  deleteNotification: (id) => USE_MOCK_API ? mockAPI.notification.deleteNotification(id) : api.delete(`/notifications/${id}`),
  updatePreferences: (preferences) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
  getPreferences: () => USE_MOCK_API ? Promise.resolve({ data: { emailNotifications: true, browserNotifications: true } }) : Promise.resolve({ data: { emailNotifications: true, browserNotifications: true } }), // Mock for now
  testNotification: (type) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
};

// Settings API
export const settingsAPI = {
  getSettings: () => USE_MOCK_API ? mockAPI.settings.getSettings() : Promise.resolve({ data: { defaultCurrency: "USD", theme: "light" } }), // Mock for now
  updateSettings: (settings) => USE_MOCK_API ? mockAPI.settings.updateSettings(settings) : Promise.resolve({ data: { success: true } }), // Mock for now
  getCategories: () => USE_MOCK_API ? mockAPI.settings.getCategories() : Promise.resolve({ data: ["Streaming", "Software", "Music", "Other"] }), // Mock for now
  addCategory: (category) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
  updateCategory: (id, category) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
  deleteCategory: (id) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
  getCurrencies: () => USE_MOCK_API ? Promise.resolve({ data: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"] }) : Promise.resolve({ data: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"] }), // Mock for now
  updateCurrency: (currency) => USE_MOCK_API ? Promise.resolve({ data: { success: true } }) : Promise.resolve({ data: { success: true } }), // Mock for now
};

// File upload API
export const fileAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (fileId) => api.delete(`/files/${fileId}`),
};

export default api;
