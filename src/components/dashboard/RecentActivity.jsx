import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { format } from "date-fns";

const RecentActivity = ({ subscriptions }) => {
  // Mock recent activity data - in a real app, this would come from an API
  const recentActivities = [
    {
      id: 1,
      type: "created",
      subscription: "Netflix",
      amount: "$15.99",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: Plus,
      color: "text-green-600 bg-green-100 dark:bg-green-900/20",
    },
    {
      id: 2,
      type: "updated",
      subscription: "Spotify Premium",
      amount: "$9.99",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      icon: Edit,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    },
    {
      id: 3,
      type: "renewed",
      subscription: "Adobe Creative Cloud",
      amount: "$52.99",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
    },
    {
      id: 4,
      type: "cancelled",
      subscription: "Gym Membership",
      amount: "$29.99",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: Trash2,
      color: "text-red-600 bg-red-100 dark:bg-red-900/20",
    },
  ];

  const getActivityText = (activity) => {
    switch (activity.type) {
      case "created":
        return "Added new subscription";
      case "updated":
        return "Updated subscription";
      case "renewed":
        return "Subscription renewed";
      case "cancelled":
        return "Cancelled subscription";
      default:
        return "Activity";
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return format(date, "MMM dd");
  };

  return (
    <div className="space-y-4">
      {recentActivities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${activity.color}`}>
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {getActivityText(activity)} - {activity.subscription}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getTimeAgo(activity.date)}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activity.amount}
            </p>
          </div>
        </div>
      ))}
      
      {recentActivities.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
