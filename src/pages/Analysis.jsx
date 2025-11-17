import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
} from "lucide-react";
import { analyticsAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SpendingTrendChart from "../components/analysis/SpendingTrendChart";
import CategoryBreakdownChart from "../components/analysis/CategoryBreakdownChart";
import TopSubscriptionsChart from "../components/analysis/TopSubscriptionsChart";
import BillingCycleChart from "../components/analysis/BillingCycleChart";
import { useAuth } from "../contexts/AuthContext";

const Analysis = () => {
  const [dateRange, setDateRange] = useState("6months");
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  // Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchOverview,
  } = useQuery(
    ["analytics", dateRange, userId],
    () => analyticsAPI.getOverview({ dateRange, userId }),
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
    data: spendingTrend,
    isLoading: trendLoading,
    refetch: refetchTrend,
  } = useQuery(
    ["spending-trend", dateRange, userId],
    () => analyticsAPI.getSpendingTrend({ dateRange, userId }),
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
    data: categoryBreakdown,
    isLoading: categoryLoading,
    refetch: refetchCategory,
  } = useQuery(
    ["category-breakdown", dateRange, userId],
    () => analyticsAPI.getCategoryBreakdown({ dateRange, userId }),
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
    data: topSubscriptions,
    isLoading: topLoading,
    refetch: refetchTop,
  } = useQuery(
    ["top-subscriptions", dateRange, userId],
    () => analyticsAPI.getTopSubscriptions({ dateRange, userId }),
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
    data: billingCycleAnalysis,
    isLoading: billingLoading,
    refetch: refetchBilling,
  } = useQuery(
    ["billing-cycle", dateRange, userId],
    () => analyticsAPI.getBillingCycleAnalysis({ dateRange, userId }),
    {
      enabled: !!userId,
      select: (data) => {
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  useEffect(() => {
    if (!userId) return;
    const handler = () => {
      refetchOverview();
      refetchTrend();
      refetchCategory();
      refetchTop();
      refetchBilling();
    };
    window.addEventListener("subscriptions:changed", handler);
    return () => window.removeEventListener("subscriptions:changed", handler);
  }, [
    userId,
    refetchOverview,
    refetchTrend,
    refetchCategory,
    refetchTop,
    refetchBilling,
  ]);

  const isLoading =
    authLoading ||
    !userId ||
    analyticsLoading ||
    trendLoading ||
    categoryLoading ||
    topLoading ||
    billingLoading;

  const dateRangeOptions = [
    { value: "1month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

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
          <h1 className="text-2xl font-bold text-slate-200">
            Subscription Analysis
          </h1>
          <p className="text-slate-400">
            Insights and trends for your subscription spending
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-300">
              Date Range:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-800/50 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-900/40 text-slate-200"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/30">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">
                Total Spent
              </p>
              <p className="text-2xl font-semibold text-slate-200">
                ${analytics?.totalSpent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/30">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">
                Average Monthly
              </p>
              <p className="text-2xl font-semibold text-slate-200">
                ${analytics?.averageMonthly || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/30">
              <Calendar className="h-6 w-6 text-violet-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">
                Active Subscriptions
              </p>
              <p className="text-2xl font-semibold text-slate-200">
                {analytics?.activeSubscriptions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/30">
              <BarChart3 className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">
                Categories
              </p>
              <p className="text-2xl font-semibold text-slate-200">
                {analytics?.categoryCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Spending Trend
            </h3>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <SpendingTrendChart data={spendingTrend} />
        </div>

        {/* Category Breakdown */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Category Breakdown
            </h3>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>
          <CategoryBreakdownChart data={categoryBreakdown} />
        </div>

        {/* Top Subscriptions */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Top Subscriptions by Cost
            </h3>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <TopSubscriptionsChart data={topSubscriptions} />
        </div>

        {/* Billing Cycle Analysis */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Billing Cycle Distribution
            </h3>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          <BillingCycleChart data={billingCycleAnalysis} />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
