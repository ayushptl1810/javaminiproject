import { useState } from "react";
import { useQuery } from "react-query";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  DollarSign,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { analyticsAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SpendingTrendChart from "../components/analysis/SpendingTrendChart";
import CategoryBreakdownChart from "../components/analysis/CategoryBreakdownChart";
import TopSubscriptionsChart from "../components/analysis/TopSubscriptionsChart";
import BillingCycleChart from "../components/analysis/BillingCycleChart";
import InsightsPanel from "../components/analysis/InsightsPanel";
import ComparisonTool from "../components/analysis/ComparisonTool";

const Analysis = () => {
  const [dateRange, setDateRange] = useState("6months");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ["analytics", dateRange],
    () => analyticsAPI.getOverview({ dateRange }),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: {...} } }
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const { data: spendingTrend, isLoading: trendLoading } = useQuery(
    ["spending-trend", dateRange],
    () => analyticsAPI.getSpendingTrend({ dateRange }),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: {...} } }
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const { data: categoryBreakdown, isLoading: categoryLoading } = useQuery(
    ["category-breakdown", dateRange],
    () => analyticsAPI.getCategoryBreakdown({ dateRange }),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: {...} } }
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const { data: topSubscriptions, isLoading: topLoading } = useQuery(
    ["top-subscriptions", dateRange],
    () => analyticsAPI.getTopSubscriptions({ dateRange }),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: {...} } }
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const { data: billingCycleAnalysis, isLoading: billingLoading } = useQuery(
    ["billing-cycle", dateRange],
    () => analyticsAPI.getBillingCycleAnalysis({ dateRange }),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: {...} } }
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const { data: insights, isLoading: insightsLoading } = useQuery(
    ["insights", dateRange],
    () => analyticsAPI.getInsights({ dateRange }),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: {...} } }
        if (data?.data?.data) return data.data.data;
        if (data?.data) return data.data;
        return {};
      },
    }
  );

  const isLoading = analyticsLoading || trendLoading || categoryLoading || topLoading || billingLoading || insightsLoading;

  const dateRangeOptions = [
    { value: "1month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

  const handleExportData = async () => {
    try {
      // In a real app, this would call the export API
      console.log("Exporting analysis data...");
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

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
            Subscription Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insights and trends for your subscription spending
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowComparison(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </button>
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Spent
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${analytics?.totalSpent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Monthly
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${analytics?.averageMonthly || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Subscriptions
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics?.activeSubscriptions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Categories
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics?.categoryCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Spending Trend
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <SpendingTrendChart data={spendingTrend} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Breakdown
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <CategoryBreakdownChart data={categoryBreakdown} />
        </div>

        {/* Top Subscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Subscriptions by Cost
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <TopSubscriptionsChart data={topSubscriptions} />
        </div>

        {/* Billing Cycle Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Billing Cycle Distribution
            </h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <BillingCycleChart data={billingCycleAnalysis} />
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Insights & Recommendations
        </h3>
        <InsightsPanel insights={insights} />
      </div>

      {/* Comparison Tool Modal */}
      {showComparison && (
        <ComparisonTool
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default Analysis;
