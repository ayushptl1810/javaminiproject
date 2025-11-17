import { Wallet, LayoutGrid, LineChart, BellRing } from "lucide-react";

const QuickStats = ({ analytics }) => {
  const stats = [
    {
      name: "Total Monthly Cost",
      value: `$${analytics?.totalMonthlyCost || 0}`,
      change: analytics?.monthlyCostChange || 0,
      icon: Wallet,
      color: "text-emerald-400",
      hint: "vs last month",
    },
    {
      name: "Active Subscriptions",
      value: analytics?.activeSubscriptions || 0,
      change: analytics?.subscriptionsChange || 0,
      icon: LayoutGrid,
      color: "text-blue-400",
      hint: "currently active",
    },
    {
      name: "Annual Projection",
      value: `$${analytics?.annualProjection || 0}`,
      change: analytics?.annualProjectionChange || 0,
      icon: LineChart,
      color: "text-violet-400",
      hint: "forecasted spend",
    },
    {
      name: "Upcoming Renewals",
      value: analytics?.upcomingRenewals || 0,
      change: null,
      icon: BellRing,
      color: "text-amber-400",
      hint: "next 14 days",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="card-base p-6 shimmer-hover transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30 shadow-inner">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-slate-400">
                {stat.name}
              </p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-slate-200">
                  {stat.value}
                </p>
                {stat.change !== null && (
                  <div className="ml-2 flex items-center">
                    {stat.change >= 0 ? (
                      <span className="text-emerald-400 text-sm font-medium">
                        +{stat.change}%
                      </span>
                    ) : (
                      <span className="text-rose-400 text-sm font-medium">
                        {stat.change}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{stat.hint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
