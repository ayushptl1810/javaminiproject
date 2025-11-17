import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RecentActivity = ({ subscriptions }) => {
  const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const activities = Array.isArray(subscriptions)
    ? subscriptions
        .map((sub) => {
          const createdAt = parseDate(sub.createdAt);
          const updatedAt = parseDate(sub.updatedAt);
          const renewal = parseDate(sub.nextRenewalDate);
          const fallback =
            updatedAt || createdAt || renewal || parseDate(sub.startDate);

          if (!fallback) return null;

          const status = (sub.status || "active").toLowerCase();
          let type = "created";

          if (status === "cancelled") {
            type = "cancelled";
          } else if (
            updatedAt &&
            createdAt &&
            updatedAt.getTime() !== createdAt.getTime()
          ) {
            type = "updated";
          } else if (renewal && fallback.getTime() === renewal.getTime()) {
            type = "renewed";
          }

          return {
            id: sub.id,
            type,
            subscription: sub.name ?? "Subscription",
            amount:
              typeof sub.amount === "number"
                ? `$${sub.amount.toFixed(2)}`
                : sub.amount || "",
            date: fallback,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
    : [];

  const typeConfig = {
    created: {
      icon: Plus,
      color: "text-emerald-400 bg-emerald-900/20",
      label: "Added subscription",
    },
    updated: {
      icon: Edit,
      color: "text-blue-400 bg-blue-900/20",
      label: "Updated subscription",
    },
    renewed: {
      icon: DollarSign,
      color: "text-violet-400 bg-violet-900/20",
      label: "Upcoming renewal",
    },
    cancelled: {
      icon: Trash2,
      color: "text-rose-400 bg-rose-900/20",
      label: "Cancelled subscription",
    },
  };

  if (!activities.length) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">
          Add subscriptions to see recent activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const config = typeConfig[activity.type] || typeConfig.created;
        const Icon = config.icon;

        return (
          <div key={activity.id} className="flex items-center space-x-3 glass-tile rounded-xl px-3 py-2 shimmer-hover">
            <div className={`p-2 rounded-full ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {config.label} · {activity.subscription}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDistanceToNow(activity.date, { addSuffix: true })}
                </p>
              </div>
              {activity.amount && (
                <p className="text-sm text-slate-400">
                  {activity.amount}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
