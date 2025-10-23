// Mock API service for development and testing
// This simulates the backend API responses without requiring a real backend

import {
  TEST_USER_CREDENTIALS,
  DEMO_SUBSCRIPTIONS,
  DEMO_NOTIFICATIONS,
  DEMO_ANALYTICS,
  isDemoMode,
} from "../utils/testData";

// Mock data
const mockUser = {
  id: "test-user-123",
  name: TEST_USER_CREDENTIALS.name,
  email: TEST_USER_CREDENTIALS.email,
  defaultCurrency: "USD",
  timezone: "UTC",
  dateFormat: "MM/DD/YYYY",
  emailVerified: true,
  createdAt: new Date().toISOString(),
};

const mockSubscriptions = [
  {
    id: "sub-1",
    name: "Netflix Premium",
    amount: 15.99,
    category: "Streaming",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01").toISOString(),
    nextRenewalDate: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(), // 5 days from now
    autoRenewal: true,
    notes: "Premium plan with 4K streaming",
    paymentMethod: "Credit Card ending in 1234",
    portalLink: "https://netflix.com/account",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sub-2",
    name: "Spotify Premium",
    amount: 9.99,
    category: "Music",
    billingCycle: "monthly",
    startDate: new Date("2024-01-15").toISOString(),
    nextRenewalDate: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(), // 2 days from now
    autoRenewal: true,
    notes: "Student discount",
    paymentMethod: "PayPal",
    portalLink: "https://spotify.com/account",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sub-3",
    name: "Adobe Creative Cloud",
    amount: 52.99,
    category: "Software",
    billingCycle: "monthly",
    startDate: new Date("2024-02-01").toISOString(),
    nextRenewalDate: new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000
    ).toISOString(), // 15 days from now
    autoRenewal: true,
    notes: "All apps plan",
    paymentMethod: "Credit Card ending in 5678",
    portalLink: "https://adobe.com/account",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sub-4",
    name: "Gym Membership",
    amount: 29.99,
    category: "Gym/Fitness",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01").toISOString(),
    nextRenewalDate: new Date(
      Date.now() + 1 * 24 * 60 * 60 * 1000
    ).toISOString(), // 1 day from now
    autoRenewal: true,
    notes: "Premium membership",
    paymentMethod: "Bank Transfer",
    portalLink: "https://gym.com/account",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sub-5",
    name: "Microsoft 365",
    amount: 6.99,
    category: "Software",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01").toISOString(),
    nextRenewalDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days from now
    autoRenewal: true,
    notes: "Personal plan",
    paymentMethod: "Credit Card ending in 9012",
    portalLink: "https://microsoft.com/account",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAnalytics = {
  totalSpent: 115.95,
  averageMonthly: 115.95,
  activeSubscriptions: 5,
  categoryCount: 4,
  totalMonthlyCost: 115.95,
  monthlyCostChange: 5.2,
  subscriptionsChange: 0,
  annualProjection: 1391.4,
  annualProjectionChange: 5.2,
  upcomingRenewals: 2,
};

const mockNotifications = [
  {
    id: "notif-1",
    type: "urgent",
    title: "Subscription Renewal Due Soon",
    message: "Gym Membership renews in 1 day",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "notif-2",
    type: "reminder",
    title: "Subscription Renewal Due Soon",
    message: "Spotify Premium renews in 2 days",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "notif-3",
    type: "success",
    title: "Subscription Added",
    message: "Microsoft 365 has been added to your subscriptions",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

// Mock API functions
export const mockAuthAPI = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      credentials.email === TEST_USER_CREDENTIALS.email &&
      credentials.password === TEST_USER_CREDENTIALS.password
    ) {
      return {
        data: {
          user: mockUser,
          token: "mock-jwt-token-12345",
        },
      };
    }
    throw new Error("Invalid credentials");
  },

  signup: async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        user: { ...mockUser, ...userData },
        token: "mock-jwt-token-12345",
      },
    };
  },

  verifyToken: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        user: mockUser,
      },
    };
  },

  updateProfile: async (profileData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        user: { ...mockUser, ...profileData },
      },
    };
  },

  changePassword: async (passwordData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { success: true } };
  },

  forgotPassword: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { success: true } };
  },

  resetPassword: async (token, passwordData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { success: true } };
  },
};

export const mockSubscriptionAPI = {
  getAll: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    let filteredSubscriptions = [...mockSubscriptions];

    if (params.category) {
      filteredSubscriptions = filteredSubscriptions.filter((sub) =>
        sub.category.toLowerCase().includes(params.category.toLowerCase())
      );
    }

    if (params.search) {
      filteredSubscriptions = filteredSubscriptions.filter((sub) =>
        sub.name.toLowerCase().includes(params.search.toLowerCase())
      );
    }

    return {
      data: filteredSubscriptions,
      total: filteredSubscriptions.length,
      page: params.page || 0,
      size: params.size || 20,
    };
  },

  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const subscription = mockSubscriptions.find((sub) => sub.id === id);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    return { data: subscription };
  },

  create: async (subscriptionData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newSubscription = {
      id: `sub-${Date.now()}`,
      ...subscriptionData,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSubscriptions.push(newSubscription);
    return { data: newSubscription };
  },

  update: async (id, subscriptionData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const index = mockSubscriptions.findIndex((sub) => sub.id === id);
    if (index === -1) {
      throw new Error("Subscription not found");
    }
    mockSubscriptions[index] = {
      ...mockSubscriptions[index],
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
    };
    return { data: mockSubscriptions[index] };
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockSubscriptions.findIndex((sub) => sub.id === id);
    if (index === -1) {
      throw new Error("Subscription not found");
    }
    mockSubscriptions.splice(index, 1);
    return { data: { success: true } };
  },

  getUpcoming: async (days = 7) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const upcomingDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const upcomingSubscriptions = mockSubscriptions.filter(
      (sub) => new Date(sub.nextRenewalDate) <= upcomingDate
    );
    return { data: upcomingSubscriptions };
  },
};

export const mockAnalyticsAPI = {
  getOverview: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { data: mockAnalytics };
  },

  getSpendingTrend: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const trendData = [
      { month: "Jan", amount: 115.95 },
      { month: "Feb", amount: 120.5 },
      { month: "Mar", amount: 118.75 },
      { month: "Apr", amount: 125.3 },
      { month: "May", amount: 115.95 },
      { month: "Jun", amount: 115.95 },
    ];
    return { data: trendData };
  },

  getCategoryBreakdown: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const breakdownData = [
      { name: "Streaming", value: 25.98 },
      { name: "Software", value: 59.98 },
      { name: "Gym/Fitness", value: 29.99 },
      { name: "Music", value: 9.99 },
    ];
    return { data: breakdownData };
  },

  getTopSubscriptions: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { data: mockSubscriptions.slice(0, 5) };
  },

  getBillingCycleAnalysis: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const billingData = [{ cycle: "Monthly", count: 5, amount: 115.95 }];
    return { data: billingData };
  },

  getInsights: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const insights = [
      {
        type: "savings",
        title: "Potential Savings Opportunity",
        message:
          "You could save $15/month by switching to a streaming bundle package.",
        priority: "high",
      },
      {
        type: "trend",
        title: "Spending Trend Alert",
        message:
          "Your subscription spending has increased by 5.2% over the last 3 months.",
        priority: "medium",
      },
      {
        type: "optimization",
        title: "Billing Cycle Optimization",
        message:
          "Consider switching to annual billing for Adobe Creative Cloud to save $60/year.",
        priority: "medium",
      },
    ];
    return { data: insights };
  },
};

export const mockReportAPI = {
  getReports: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const reports = [
      {
        id: "report-1",
        name: "Monthly Summary Report",
        type: "summary",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        format: "pdf",
        status: "completed",
      },
      {
        id: "report-2",
        name: "Category Breakdown Report",
        type: "category",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        format: "excel",
        status: "completed",
      },
    ];
    return { data: reports };
  },

  generate: async (reportData) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const newReport = {
      id: `report-${Date.now()}`,
      name: reportData.name,
      type: reportData.type,
      createdAt: new Date().toISOString(),
      format: reportData.format,
      status: "completed",
    };
    return { data: newReport };
  },

  downloadReport: async (reportId, format = "pdf") => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return a mock blob
    const mockContent = `Mock ${format.toUpperCase()} report content for report ${reportId}`;
    return {
      data: new Blob([mockContent], { type: "application/octet-stream" }),
    };
  },

  deleteReport: async (reportId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: { success: true } };
  },

  getScheduledReports: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: [] };
  },
};

export const mockNotificationAPI = {
  getNotifications: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: mockNotifications };
  },

  markAsRead: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const notification = mockNotifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return { data: { success: true } };
  },

  markAllAsRead: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockNotifications.forEach((n) => (n.read = true));
    return { data: { success: true } };
  },

  deleteNotification: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockNotifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
    }
    return { data: { success: true } };
  },
};

export const mockSettingsAPI = {
  getSettings: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: mockUser };
  },

  updateSettings: async (settings) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { data: { ...mockUser, ...settings } };
  },

  getCategories: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const categories = [
      "Streaming",
      "Software",
      "Cloud Services",
      "Gym/Fitness",
      "News/Magazines",
      "Gaming",
      "Music",
      "Productivity",
      "Security",
      "Other",
    ];
    return { data: categories };
  },
};

// Export all mock APIs
export const mockAPI = {
  auth: mockAuthAPI,
  subscription: mockSubscriptionAPI,
  analytics: mockAnalyticsAPI,
  report: mockReportAPI,
  notification: mockNotificationAPI,
  settings: mockSettingsAPI,
};
