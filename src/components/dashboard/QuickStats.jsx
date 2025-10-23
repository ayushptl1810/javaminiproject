import { DollarSign, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

const QuickStats = ({ analytics }) => {
  const stats = [
    {
      name: "Total Monthly Cost",
      value: `$${analytics?.totalMonthlyCost || 0}`,
      change: analytics?.monthlyCostChange || 0,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      name: "Active Subscriptions",
      value: analytics?.activeSubscriptions || 0,
      change: analytics?.subscriptionsChange || 0,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      name: "Annual Projection",
      value: `$${analytics?.annualProjection || 0}`,
      change: analytics?.annualProjectionChange || 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      name: "Upcoming Renewals",
      value: analytics?.upcomingRenewals || 0,
      change: null,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-md bg-gray-100 dark:bg-gray-700`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.name}
              </p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.change !== null && (
                  <div className="ml-2 flex items-center">
                    {stat.change >= 0 ? (
                      <span className="text-green-600 text-sm font-medium">
                        +{stat.change}%
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">
                        {stat.change}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
