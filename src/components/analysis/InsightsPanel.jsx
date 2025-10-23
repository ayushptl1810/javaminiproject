import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

const InsightsPanel = ({ insights }) => {
  // Mock insights data - in a real app, this would come from props
  const mockInsights = [
    {
      type: "savings",
      title: "Potential Savings Opportunity",
      message: "You could save $45/month by switching from individual streaming services to a bundle package.",
      icon: TrendingDown,
      color: "text-green-600 bg-green-100 dark:bg-green-900/20",
      priority: "high",
    },
    {
      type: "trend",
      title: "Spending Trend Alert",
      message: "Your subscription spending has increased by 15% over the last 3 months.",
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
      priority: "medium",
    },
    {
      type: "optimization",
      title: "Billing Cycle Optimization",
      message: "Consider switching to annual billing for Adobe Creative Cloud to save $60/year.",
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      priority: "medium",
    },
    {
      type: "unused",
      title: "Unused Subscription Detected",
      message: "You haven't used your gym membership in the last 30 days. Consider pausing or cancelling.",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100 dark:bg-red-900/20",
      priority: "high",
    },
  ];

  // Handle different data formats from backend
  let insightsToShow = mockInsights;
  
  if (insights) {
    if (Array.isArray(insights)) {
      insightsToShow = insights;
    } else if (insights.insights && Array.isArray(insights.insights)) {
      insightsToShow = insights.insights;
    } else if (insights.data && Array.isArray(insights.data)) {
      insightsToShow = insights.data;
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-orange-500";
      case "low":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {insightsToShow.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No insights available at the moment.</p>
        </div>
      ) : (
        insightsToShow.map((insight, index) => (
          <div
            key={index}
            className={`p-4 border-l-4 ${getPriorityColor(insight.priority)} bg-gray-50 dark:bg-gray-700 rounded-lg`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${insight.color}`}>
                {insight.icon ? (
                  <insight.icon className="h-5 w-5" />
                ) : (
                  <Lightbulb className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {insight.title}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {insight.message}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    insight.priority === "high" 
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : insight.priority === "medium"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}>
                    {insight.priority} priority
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Learn more
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default InsightsPanel;
