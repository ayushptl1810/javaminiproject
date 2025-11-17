import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { Plus, Filter, Search, Calendar as CalendarIcon } from "lucide-react";
import { subscriptionAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SubscriptionModal from "../components/subscription/SubscriptionModal";
import CustomCalendar from "../components/calendar/CustomCalendar";
import { useAuth } from "../contexts/AuthContext";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  // Fetch subscriptions
  const {
    data: subscriptions,
    isLoading,
    refetch,
  } = useQuery(
    ["subscriptions-calendar", userId],
    () => subscriptionAPI.getAll({ userId }),
    {
      enabled: !!userId,
      select: (data) => {
        if (data?.data?.data) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      },
    }
  );

  useEffect(() => {
    if (!userId) return;
    const handler = () => refetch();
    window.addEventListener("subscriptions:changed", handler);
    return () => window.removeEventListener("subscriptions:changed", handler);
  }, [userId, refetch]);

  // Filter subscriptions based on search and category
  const filteredSubscriptions =
    subscriptions?.filter((sub) => {
      const matchesSearch = sub.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || sub.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  // Get subscriptions for a specific date
  const getSubscriptionsForDate = (date) => {
    if (!filteredSubscriptions) return [];

    return filteredSubscriptions.filter((sub) => {
      const startDate = new Date(sub.startDate);
      const renewalDate = new Date(sub.nextRenewalDate);
      return isSameDay(startDate, date) || isSameDay(renewalDate, date);
    });
  };

  // Get unique categories
  const categories = [
    ...new Set(subscriptions?.map((sub) => sub.category) || []),
  ];

  const handleDateClick = (date, daySubscriptions) => {
    setSelectedDate(date);
    if (daySubscriptions.length > 0) {
      // Show subscriptions for that day
      console.log(
        "Subscriptions for",
        format(date, "MMM dd, yyyy"),
        daySubscriptions
      );
    } else {
      // Open modal to add new subscription
      setIsSubscriptionModalOpen(true);
    }
  };

  const handleAddSubscription = () => {
    setIsSubscriptionModalOpen(true);
  };

  if (authLoading || isLoading || !userId) {
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
            Subscription Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your subscription renewals and payments
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <CustomCalendar
            subscriptions={filteredSubscriptions}
            onDateClick={handleDateClick}
            onAddSubscription={handleAddSubscription}
          />
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          {/* Selected Date Subscriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {format(selectedDate, "MMM dd, yyyy")}
            </h3>
            <div className="space-y-3">
              {getSubscriptionsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No subscriptions for this date
                </p>
              ) : (
                getSubscriptionsForDate(selectedDate).map((subscription) => (
                  <div
                    key={subscription.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {subscription.name}
                      </h4>
                      <span className="text-sm font-medium text-blue-600">
                        ${subscription.amount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subscription.category}
                    </p>
                    <div className="flex items-center mt-2">
                      {isSameDay(
                        new Date(subscription.startDate),
                        selectedDate
                      ) ? (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                          Started
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                          Renews
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={() => {
          refetch();
          setIsSubscriptionModalOpen(false);
        }}
      />
    </div>
  );
};

export default CalendarPage;
