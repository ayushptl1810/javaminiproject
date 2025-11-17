import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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
  login: (credentials) => api.post("/auth/login", credentials),
  signup: (userData) => api.post("/auth/signup", userData),
  verifyToken: () => api.get("/auth/verify"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, passwordData) =>
    api.post(`/auth/reset-password/${token}`, passwordData),
};

const getStoredUser = () => {
  const raw = sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const requireUserId = (explicitId) => {
  const id = explicitId || getStoredUser()?.id;
  if (!id) {
    throw new Error("User ID missing. Please sign in again.");
  }
  return id;
};

const withUserParams = (params = {}) => {
  const { userId, ...rest } = params || {};
  return { ...rest, userId: requireUserId(userId) };
};

const userConfig = (params = {}) => ({
  params: withUserParams(params),
});

// Subscription API
export const subscriptionAPI = {
  getAll: (params = {}) =>
    api.get("/subscriptions", { params: withUserParams(params) }),
  getById: (id, params = {}) =>
    api.get(`/subscriptions/${id}`, { params: withUserParams(params) }),
  create: (subscriptionData, params = {}) =>
    api.post("/subscriptions", subscriptionData, userConfig(params)),
  update: (id, subscriptionData, params = {}) =>
    api.put(`/subscriptions/${id}`, subscriptionData, userConfig(params)),
  delete: (id, params = {}) =>
    api.delete(`/subscriptions/${id}`, userConfig(params)),
  bulkUpdate: (updates, params = {}) =>
    api.put("/subscriptions/bulk", updates, userConfig(params)),
  bulkDelete: (ids, params = {}) =>
    api.delete("/subscriptions/bulk", {
      ...userConfig(params),
      data: { ids },
    }),
  import: (file, params = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/subscriptions/import", formData, {
      ...userConfig(params),
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  export: (format = "csv", filters = {}) =>
    api.get("/subscriptions/export", {
      params: withUserParams({ format, ...filters }),
      responseType: "blob",
    }),
  getUpcoming: (days = 7, params = {}) =>
    api.get("/subscriptions/upcoming", {
      params: withUserParams({ ...params, days }),
    }),
  getByDateRange: (startDate, endDate, params = {}) =>
    api.get("/subscriptions/date-range", {
      params: withUserParams({ ...params, startDate, endDate }),
    }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (params = {}) =>
    api.get("/analytics/overview", { params: withUserParams(params) }),
  getSpendingTrend: (params = {}) =>
    api.get("/analytics/spending-trend", { params: withUserParams(params) }),
  getCategoryBreakdown: (params = {}) =>
    api.get("/analytics/category-breakdown", {
      params: withUserParams(params),
    }),
  getBillingCycleAnalysis: (params = {}) =>
    api.get("/analytics/billing-cycle", { params: withUserParams(params) }),
  getTopSubscriptions: (params = {}) =>
    api.get("/analytics/top-subscriptions", { params: withUserParams(params) }),
  getProjections: (params = {}) =>
    api.get("/analytics/projections", { params: withUserParams(params) }),
  getInsights: (params = {}) =>
    api.get("/analytics/insights", { params: withUserParams(params) }),
  compareSubscriptions: (ids, params = {}) =>
    api.post(
      "/analytics/compare",
      { subscriptionIds: ids },
      { params: withUserParams(params) }
    ),
};

// Reports API
export const reportAPI = {
  getTemplates: () => api.get("/reports/templates"),
  generate: (reportData, params = {}) =>
    api.post("/reports/generate", reportData, userConfig(params)),
  getReport: (id, params = {}) =>
    api.get(`/reports/${id}`, { params: withUserParams(params) }),
  getReports: (params = {}) =>
    api.get("/reports", { params: withUserParams(params) }),
  deleteReport: (id, params = {}) =>
    api.delete(`/reports/${id}`, userConfig(params)),
  downloadReport: (id, format = "pdf", params = {}) =>
    api.get(`/reports/${id}/download`, {
      params: withUserParams({ ...params, format }),
      responseType: "blob",
    }),
  scheduleReport: (scheduleData, params = {}) =>
    api.post("/reports/schedule", scheduleData, userConfig(params)),
  getScheduledReports: (params = {}) =>
    api.get("/reports/scheduled", { params: withUserParams(params) }),
  updateSchedule: (id, scheduleData, params = {}) =>
    api.put(`/reports/schedule/${id}`, scheduleData, userConfig(params)),
  deleteSchedule: (id, params = {}) =>
    api.delete(`/reports/schedule/${id}`, userConfig(params)),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params = {}) =>
    api.get("/notifications", { params: withUserParams(params) }),
  markAsRead: (id, params = {}) =>
    api.put(`/notifications/${id}/read`, null, userConfig(params)),
  markAllAsRead: (params = {}) =>
    api.put("/notifications/read-all", null, userConfig(params)),
  deleteNotification: (id, params = {}) =>
    api.delete(`/notifications/${id}`, userConfig(params)),
  updatePreferences: (preferences, params = {}) =>
    api.put("/notifications/preferences", preferences, userConfig(params)),
  getPreferences: (params = {}) =>
    api.get("/notifications/preferences", { params: withUserParams(params) }),
  testNotification: (type, params = {}) =>
    api.post("/notifications/test", { type }, userConfig(params)),
};

// Settings API
export const settingsAPI = {
  getSettings: (params = {}) =>
    api.get("/settings", { params: withUserParams(params) }),
  updateSettings: (settings, params = {}) =>
    api.put("/settings", settings, userConfig(params)),
  getCategories: (params = {}) =>
    api.get("/settings/categories", { params: withUserParams(params) }),
  addCategory: (category, params = {}) =>
    api.post("/settings/categories", category, userConfig(params)),
  updateCategory: (id, category, params = {}) =>
    api.put(`/settings/categories/${id}`, category, userConfig(params)),
  deleteCategory: (id, params = {}) =>
    api.delete(`/settings/categories/${id}`, userConfig(params)),
  getCurrencies: () => api.get("/settings/currencies"),
  updateCurrency: (currency, params = {}) =>
    api.put("/settings/currency", { currency }, userConfig(params)),
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
