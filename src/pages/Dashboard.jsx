import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import {
  Plus,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { subscriptionAPI, analyticsAPI } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import QuickStats from "../components/dashboard/QuickStats";
import UpcomingSubscriptions from "../components/dashboard/UpcomingSubscriptions";
import RecentActivity from "../components/dashboard/RecentActivity";
import SpendingChart from "../components/dashboard/SpendingChart";

const Dashboard = () => {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { addNotification } = useNotification();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  // Fetch subscriptions
  const {
    data: subscriptions,
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useQuery(
    ["subscriptions", userId],
    () => subscriptionAPI.getAll({ userId }),
    {
      enabled: !!userId,
      select: (data) => {
        // Handle backend response format: { data: { data: [...] } }
        if (data?.data?.data) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      },
    }
  );

  // Fetch analytics overview
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery(
    ["analytics-overview", userId],
    () => analyticsAPI.getOverview({ userId }),
    {
      enabled: !!userId,
      select: (data) => {
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const {
    data: spendingTrendData,
    isLoading: trendLoading,
    refetch: refetchTrend,
  } = useQuery(
    ["dashboard-spending-trend", userId],
    () => analyticsAPI.getSpendingTrend({ userId }),
    {
      enabled: !!userId,
      select: (data) => {
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  // Fetch upcoming subscriptions
  const {
    data: upcomingSubscriptions,
    isLoading: upcomingLoading,
    refetch: refetchUpcoming,
  } = useQuery(
    ["upcoming-subscriptions", userId],
    () => subscriptionAPI.getUpcoming(7, { userId }),
    {
      enabled: !!userId,
      select: (data) => {
        // Handle backend response format: { data: { data: [...] } }
        if (data?.data?.data) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      },
    }
  );

  useEffect(() => {
    if (!userId) return;
    const handler = () => {
      refetchSubscriptions();
      refetchUpcoming();
      refetchAnalytics();
      refetchTrend();
    };
    window.addEventListener("subscriptions:changed", handler);
    return () => window.removeEventListener("subscriptions:changed", handler);
  }, [userId, refetchSubscriptions, refetchUpcoming, refetchAnalytics, refetchTrend]);

  useEffect(() => {
    // Check for urgent notifications
    if (userId && subscriptions && subscriptions.length > 0) {
      const urgentSubscriptions = subscriptions.filter((sub) => {
        const daysUntilRenewal = Math.ceil(
          (new Date(sub.nextRenewalDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilRenewal <= 2 && daysUntilRenewal >= 0;
      });

      urgentSubscriptions.forEach((sub) => {
        // Check if notification already exists to avoid duplicates
        const notificationId = `urgent-${sub.id}`;
        // Only add if not already present
        addNotification({
          id: notificationId,
          type: "urgent",
          title: "Subscription Renewal Due Soon",
          message: `${sub.name} renews in ${Math.ceil(
            (new Date(sub.nextRenewalDate) - new Date()) / (1000 * 60 * 60 * 24)
          )} days`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      });
    }
  }, [subscriptions, userId]);

  const isLoading =
    authLoading ||
    subscriptionsLoading ||
    analyticsLoading ||
    upcomingLoading ||
    trendLoading ||
    !userId;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's an overview of your subscriptions.
          </p>
        </div>
        <button
          onClick={() => setIsSubscriptionModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </button>
      </div>

      {/* Quick Stats */}
      <QuickStats analytics={analytics} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Spending Trend
              </h2>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                Last 6 months
              </div>
            </div>
            <SpendingChart data={spendingTrendData} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <RecentActivity subscriptions={subscriptions} />
          </div>
        </div>

        {/* Right Column - Upcoming & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Subscriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Renewals
              </h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <UpcomingSubscriptions subscriptions={upcomingSubscriptions} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Add New Subscription
                </span>
              </button>
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  View Analysis
                </span>
              </button>
              <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Open Calendar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={() => {
          refetchSubscriptions();
          setIsSubscriptionModalOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
