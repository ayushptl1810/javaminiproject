import { X, CheckCircle2, BarChart3, Layers } from "lucide-react";

const TEMPLATE_PREVIEWS = {
  "Monthly Summary": {
    summary:
      "High-level snapshot covering total spend, active services, and renewals for the latest month.",
    metrics: [
      { label: "Monthly Spend", value: "$245.90", change: "+4.3%" },
      { label: "Active Subscriptions", value: "18", change: "2 new" },
      { label: "Upcoming Renewals", value: "5", change: "next 14 days" },
    ],
    sections: [
      "Spending overview with month-over-month trend",
      "Top vendors & categories",
      "Renewals and payment reminders",
      "AI insights & cost opportunities",
    ],
  },
  "Category Breakdown": {
    summary:
      "Drill-down into where your budget is going by category with top vendors and variance alerts.",
    metrics: [
      { label: "Software", value: "$120.00", change: "48%" },
      { label: "Media", value: "$65.00", change: "26%" },
      { label: "Productivity", value: "$41.00", change: "16%" },
    ],
    sections: [
      "Category level spend & change indicators",
      "Vendor concentration and redundancy hints",
      "Usage vs. budget call-outs",
      "Optimization checklist",
    ],
  },
  "Annual Projection": {
    summary:
      "Forecast subscription costs and renewals across the next 12 months with confidence bands.",
    metrics: [
      { label: "Projected Annual Spend", value: "$2,910", change: "+6%" },
      { label: "Peak Month", value: "April", change: "$310" },
      { label: "Contracts Renewing", value: "9", change: "this year" },
    ],
    sections: [
      "12‑month projection line chart",
      "Seasonality & variance commentary",
      "Upcoming contract expirations",
      "Action items to stay on budget",
    ],
  },
};

const ReportTemplatePreview = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  if (!isOpen || !template) return null;

  const preview =
    TEMPLATE_PREVIEWS[template.title] || TEMPLATE_PREVIEWS["Monthly Summary"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center">
        <div
          className="fixed inset-0 bg-black/70"
          aria-hidden="true"
          onClick={onClose}
        />

        <div className="relative z-10 inline-block w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-900 text-slate-100 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center space-x-3">
              <template.icon className={`h-6 w-6 ${template.color}`} />
              <div>
                <h3 className="text-xl font-semibold">{template.title}</h3>
                <p className="text-sm text-slate-400">{template.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 bg-slate-950/40 px-6 py-6">
            <p className="text-sm text-slate-300">{preview.summary}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {preview.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-white/5 bg-white/5 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                  {metric.change && (
                    <p className="text-xs text-slate-400">{metric.change}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 p-5">
              <div className="mb-3 flex items-center space-x-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span>Included sections</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                {preview.sections.map((item) => (
                  <li key={item} className="flex items-start space-x-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 p-5">
              <div className="mb-3 flex items-center space-x-2 text-sm font-semibold">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Sample layout</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 sm:grid-cols-4">
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-3 text-center">
                  Summary Cards
                </div>
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-3 text-center">
                  Trend Chart
                </div>
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-3 text-center">
                  Breakdown Table
                </div>
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-3 text-center">
                  AI Insights
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-slate-900/70 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Close
            </button>
            <button
              onClick={() => onUseTemplate(template)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Use this template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplatePreview;
