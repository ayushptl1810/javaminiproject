import { CalendarDays, CircleDollarSign, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "$0.00";
  const numeric = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(numeric)) return value;
  return `$${numeric.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM dd, yyyy");
};

const statusStyles = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
};

const SubscriptionList = ({
  subscriptions = [],
  onEdit,
  onDelete,
  deletingId,
}) => {
  if (!subscriptions?.length) {
    return (
      <div className="text-center py-10 text-slate-500">
        No subscriptions yet. Start by adding your first one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {subscriptions.slice(0, 6).map((subscription) => {
        const status = (subscription.status || "active").toLowerCase();
        return (
          <div
            key={subscription.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl glass-tile shimmer-hover"
          >
            <div>
              <p className="text-base font-semibold text-slate-200">
                {subscription.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CircleDollarSign className="h-4 w-4" />
                  {formatCurrency(subscription.amount)}
                </span>
                <span className="inline-flex items-center gap-1 text-blue-400">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(subscription.nextRenewalDate)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusStyles[status] || statusStyles.active
                  }`}
                >
                  {subscription.category || "General"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(subscription)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-200 hover:text-white border border-blue-500/30 rounded-lg transition shimmer-hover"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete?.(subscription)}
                disabled={deletingId === subscription.id}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-rose-200 hover:text-white border border-rose-500/30 rounded-lg transition disabled:opacity-60 shimmer-hover"
              >
                <Trash2 className="h-4 w-4" />
                {deletingId === subscription.id ? "Removing..." : "Delete"}
              </button>
            </div>
          </div>
        );
      })}

      {subscriptions.length > 6 && (
        <div className="pt-2 text-sm text-slate-500">
          Showing latest 6 subscriptions. Use the analysis or reports section to
          view the complete list.
        </div>
      )}
    </div>
  );
};

export default SubscriptionList;

