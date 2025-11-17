import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BillingCycleChart = ({ data }) => {
  const chartData = Array.isArray(data?.cycles)
    ? data.cycles.map((entry) => ({
        cycle: entry.name ?? entry.cycle ?? "Cycle",
        count:
          typeof entry.value === "number"
            ? entry.value
            : typeof entry.count === "number"
            ? entry.count
            : 0,
      }))
    : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          <p className="text-blue-600">
            Count: {payload[0].payload.count}
          </p>
          <p className="text-green-600">
            Amount: ${payload[0].payload.amount}
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
          Add subscriptions to analyze billing cycles.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="cycle" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BillingCycleChart;
