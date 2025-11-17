import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CategoryBreakdownChart = ({ data }) => {
  const chartData = Array.isArray(data?.categories)
    ? data.categories.map((entry, index) => ({
        name: entry.name ?? entry.category ?? `Category ${index + 1}`,
        value:
          typeof entry.value === "number"
            ? entry.value
            : typeof entry.amount === "number"
            ? entry.amount
            : 0,
      }))
    : [];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{data.name}</p>
          <p className="text-blue-600">
            ${data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center px-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add subscriptions to view category insights.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdownChart;
