import { Calendar, DollarSign, Clock } from "lucide-react";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";

const UpcomingSubscriptions = ({ subscriptions }) => {
  // Ensure subscriptions is an array
  const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];

  if (!subscriptionsArray || subscriptionsArray.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No upcoming renewals</p>
      </div>
    );
  }

  const getRenewalStatus = (date) => {
    if (isToday(date))
      return {
        label: "Today",
        color: "text-red-600 bg-red-100 dark:bg-red-900/20",
      };
    if (isTomorrow(date))
      return {
        label: "Tomorrow",
        color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
      };

    const days = differenceInDays(date, new Date());
    if (days <= 7)
      return {
        label: `${days} days`,
        color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      };

    return {
      label: `${days} days`,
      color: "text-gray-600 bg-gray-100 dark:bg-gray-700",
    };
  };

  return (
    <div className="space-y-3">
      {subscriptionsArray.slice(0, 5).map((subscription) => {
        const renewalDate = subscription.nextRenewalDate
          ? new Date(subscription.nextRenewalDate)
          : new Date();
        const status = getRenewalStatus(renewalDate);

        return (
          <div
            key={subscription.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {subscription.name || "Unnamed Subscription"}
                </h4>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{subscription.amount || "$0.00"}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>{format(renewalDate, "MMM dd, yyyy")}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {subscription.category || "Uncategorized"}
              </p>
            </div>
          </div>
        );
      })}

      {subscriptionsArray.length > 5 && (
        <div className="text-center pt-2">
          <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
            View all {subscriptionsArray.length} upcoming renewals
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingSubscriptions;
