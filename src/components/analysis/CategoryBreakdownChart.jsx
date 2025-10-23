import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CategoryBreakdownChart = ({ data }) => {
  // Mock data - in a real app, this would come from props
  const chartData = [
    { name: "Streaming", value: 45, color: "#3B82F6" },
    { name: "Software", value: 30, color: "#10B981" },
    { name: "Cloud Services", value: 15, color: "#F59E0B" },
    { name: "Gym/Fitness", value: 10, color: "#EF4444" },
  ];

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
