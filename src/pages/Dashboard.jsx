import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  CalendarDays,
  LineChart,
  FilePlus2,
  PieChart,
  Sparkles,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { subscriptionAPI, analyticsAPI } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import QuickStats from "../components/dashboard/QuickStats";
import UpcomingSubscriptions from "../components/dashboard/UpcomingSubscriptions";
import RecentActivity from "../components/dashboard/RecentActivity";
import SpendingChart from "../components/dashboard/SpendingChart";
import SubscriptionList from "../components/subscription/SubscriptionList";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { addNotification } = useNotification();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
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

  const resolveGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const safeUpcoming = Array.isArray(upcomingSubscriptions)
    ? upcomingSubscriptions
    : [];
  const nextRenewal = safeUpcoming[0];
  const daysUntilNext = nextRenewal?.nextRenewalDate
    ? Math.max(
        0,
        differenceInDays(new Date(nextRenewal.nextRenewalDate), new Date())
      )
    : null;
  const nextRenewalDateLabel = nextRenewal?.nextRenewalDate
    ? format(new Date(nextRenewal.nextRenewalDate), "MMM dd, yyyy")
    : null;
  const greeting = resolveGreeting();
  const preferredName = user?.name?.split(" ")[0] || user?.name || "there";
  const heroDescription = safeUpcoming.length
    ? `You have ${safeUpcoming.length} renewal${
        safeUpcoming.length === 1 ? "" : "s"
      } on the horizon. Keep them organized here.`
    : "You're all caught up. Add new services to keep insights flowing.";
  const heroHighlights = [
    {
      label: "Next renewal",
      value: nextRenewal ? nextRenewal.name : "All clear",
      detail: nextRenewal
        ? `${nextRenewalDateLabel || ""}${
            daysUntilNext !== null
              ? ` • ${daysUntilNext} day${
                  daysUntilNext === 1 ? "" : "s"
                } left`
              : ""
          }`
        : "No renewals this week",
    },
    {
      label: "Active plans",
      value: analytics?.activeSubscriptions ?? 0,
      detail: "Currently tracked",
    },
    {
      label: "Annual projection",
      value: `$${analytics?.annualProjection || 0}`,
      detail: "Forecasted spend",
    },
  ];

  const handleAddSubscription = () => {
    setSelectedSubscription(null);
    setIsSubscriptionModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-10 relative">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-linear-to-r from-slate-800/80 via-slate-800/70 to-slate-900/80 text-slate-200 shadow-xl">
        <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl opacity-40" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl opacity-50" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-8">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-400">
              {greeting}
            </p>
            <h1 className="text-3xl font-semibold text-slate-100">
              Welcome back, {preferredName}
            </h1>
            <p className="text-slate-300">{heroDescription}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddSubscription}
                className="btn-primary shimmer-hover"
              >
                <PlusCircle className="h-4 w-4" />
                Add Subscription
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-medium text-slate-200 hover:border-blue-400/50 hover:bg-blue-500/20 transition-all shimmer-hover"
              >
                View Reports
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
            {heroHighlights.map((item) => (
              <div
                key={item.label}
                className="card-base p-4 shimmer-hover"
              >
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  {item.label}
                </p>
                <p className="text-xl font-semibold text-slate-100">{item.value}</p>
                <p className="text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuickStats analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">
                Spending Trend
              </h2>
              <div className="flex items-center text-sm text-slate-400">
                <LineChart className="h-4 w-4 mr-1" />
                Last 6 months
              </div>
            </div>
            <SpendingChart data={spendingTrendData} />
          </div>

          <div className="card-base p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">
              Recent Activity
            </h2>
            <RecentActivity subscriptions={subscriptions} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">
                Upcoming Renewals
              </h2>
              <CalendarDays className="h-5 w-5 text-slate-400" />
            </div>
            <UpcomingSubscriptions subscriptions={safeUpcoming} />
          </div>

          <div className="card-base p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleAddSubscription}
                className="w-full flex items-center gap-3 rounded-xl glass-tile px-4 py-3 text-left text-slate-200 hover:text-white transition-all shimmer-hover"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <FilePlus2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Add new subscription
                  </p>
                  <p className="text-xs text-slate-400">
                    Capture cost, cadence & start date
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate("/analysis")}
                className="w-full flex items-center gap-3 rounded-xl glass-tile px-4 py-3 text-left text-slate-200 hover:text-white transition-all shimmer-hover"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    View analysis
                  </p>
                  <p className="text-xs text-slate-400">
                    Dive into spending insights
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigate("/calendar")}
                className="w-full flex items-center gap-3 rounded-xl glass-tile px-4 py-3 text-left text-slate-200 hover:text-white transition-all shimmer-hover"
              >
                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Open calendar
                  </p>
                  <p className="text-xs text-slate-400">
                    Visualize renewals on the timeline
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">
              Your Subscriptions
            </h2>
            <p className="text-sm text-slate-400">
              Edit details or remove memberships as things change.
            </p>
          </div>
          <button
            onClick={handleAddSubscription}
            className="btn-primary"
          >
            <PlusCircle className="h-4 w-4" />
            New Subscription
          </button>
        </div>
        <SubscriptionList
          subscriptions={subscriptions}
          deletingId={deletingId}
          onEdit={(subscription) => {
            setSelectedSubscription(subscription);
            setIsSubscriptionModalOpen(true);
          }}
          onDelete={async (subscription) => {
            if (!subscription?.id) return;
            const confirmed = window.confirm(
              `Delete ${subscription.name}? This action cannot be undone.`
            );
            if (!confirmed) return;
            try {
              setDeletingId(subscription.id);
              await subscriptionAPI.delete(subscription.id, { userId });
              toast.success("Subscription removed.");
              refetchSubscriptions();
              refetchAnalytics();
              refetchUpcoming();
              refetchTrend();
            } catch (error) {
              toast.error(
                error.response?.data?.message ||
                  "Failed to delete subscription."
              );
            } finally {
              setDeletingId(null);
            }
          }}
        />
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        subscription={selectedSubscription}
        onClose={() => {
          setIsSubscriptionModalOpen(false);
          setSelectedSubscription(null);
        }}
        onSuccess={() => {
          refetchSubscriptions();
          refetchUpcoming();
          refetchAnalytics();
          refetchTrend();
          setIsSubscriptionModalOpen(false);
          setSelectedSubscription(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
