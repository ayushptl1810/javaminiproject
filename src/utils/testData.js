// Test data and setup utilities for development

export const TEST_USER_CREDENTIALS = {
  email: "test@subsentry.com",
  password: "password123",
  name: "Test User",
};

export const DEMO_SUBSCRIPTIONS = [
  {
    id: "demo-sub-1",
    name: "Netflix Premium",
    amount: 15.99,
    category: "Streaming",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01"),
    nextRenewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    autoRenewal: true,
    notes: "Premium plan with 4K streaming",
    paymentMethod: "Credit Card ending in 1234",
    portalLink: "https://netflix.com/account",
    status: "active",
  },
  {
    id: "demo-sub-2",
    name: "Spotify Premium",
    amount: 9.99,
    category: "Music",
    billingCycle: "monthly",
    startDate: new Date("2024-01-15"),
    nextRenewalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    autoRenewal: true,
    notes: "Student discount",
    paymentMethod: "PayPal",
    portalLink: "https://spotify.com/account",
    status: "active",
  },
  {
    id: "demo-sub-3",
    name: "Adobe Creative Cloud",
    amount: 52.99,
    category: "Software",
    billingCycle: "monthly",
    startDate: new Date("2024-02-01"),
    nextRenewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    autoRenewal: true,
    notes: "All apps plan",
    paymentMethod: "Credit Card ending in 5678",
    portalLink: "https://adobe.com/account",
    status: "active",
  },
  {
    id: "demo-sub-4",
    name: "Gym Membership",
    amount: 29.99,
    category: "Gym/Fitness",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01"),
    nextRenewalDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    autoRenewal: true,
    notes: "Premium membership",
    paymentMethod: "Bank Transfer",
    portalLink: "https://gym.com/account",
    status: "active",
  },
  {
    id: "demo-sub-5",
    name: "Microsoft 365",
    amount: 6.99,
    category: "Software",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01"),
    nextRenewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    autoRenewal: true,
    notes: "Personal plan",
    paymentMethod: "Credit Card ending in 9012",
    portalLink: "https://microsoft.com/account",
    status: "active",
  },
  {
    id: "demo-sub-6",
    name: "Dropbox Pro",
    amount: 9.99,
    category: "Cloud Services",
    billingCycle: "monthly",
    startDate: new Date("2024-01-01"),
    nextRenewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    autoRenewal: true,
    notes: "2TB storage plan",
    paymentMethod: "Credit Card ending in 3456",
    portalLink: "https://dropbox.com/account",
    status: "active",
  },
];

export const DEMO_CATEGORIES = [
  "Streaming",
  "Software", 
  "Cloud Services",
  "Gym/Fitness",
  "News/Magazines",
  "Gaming",
  "Music",
  "Productivity",
  "Security",
  "Other"
];

export const DEMO_ANALYTICS = {
  totalSpent: 125.94,
  averageMonthly: 125.94,
  activeSubscriptions: 6,
  categoryCount: 5,
  totalMonthlyCost: 125.94,
  monthlyCostChange: 5.2,
  subscriptionsChange: 1,
  annualProjection: 1511.28,
  annualProjectionChange: 5.2,
  upcomingRenewals: 3,
};

export const DEMO_NOTIFICATIONS = [
  {
    id: "demo-notif-1",
    type: "urgent",
    title: "Subscription Renewal Due Soon",
    message: "Gym Membership renews in 1 day",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "demo-notif-2", 
    type: "reminder",
    title: "Subscription Renewal Due Soon",
    message: "Spotify Premium renews in 2 days",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: "demo-notif-3",
    type: "success",
    title: "Subscription Added",
    message: "Dropbox Pro has been added to your subscriptions",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Function to set up demo data in localStorage
export const setupDemoData = () => {
  localStorage.setItem('demoMode', 'true');
  localStorage.setItem('demoSubscriptions', JSON.stringify(DEMO_SUBSCRIPTIONS));
  localStorage.setItem('demoNotifications', JSON.stringify(DEMO_NOTIFICATIONS));
  localStorage.setItem('demoAnalytics', JSON.stringify(DEMO_ANALYTICS));
};

// Function to clear demo data
export const clearDemoData = () => {
  localStorage.removeItem('demoMode');
  localStorage.removeItem('demoSubscriptions');
  localStorage.removeItem('demoNotifications');
  localStorage.removeItem('demoAnalytics');
};

// Function to check if demo mode is enabled
export const isDemoMode = () => {
  return localStorage.getItem('demoMode') === 'true';
};
