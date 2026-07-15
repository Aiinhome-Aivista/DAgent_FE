import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { name: "31 - 45", value: 62.9, fill: "#38BDF8" },
  { name: "46 - 90", value: 11.9, fill: "#A3E635" },
  { name: "90+", value: 25.2, fill: "#FBBF24" },
];

const renderCustomLabel = (props: any) => {
  const { value, x, y, textAnchor } = props;
  return (
    <text
      x={x}
      y={y}
      fill="#000000"
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontWeight="bold"
      fontSize={12}
    >
      {`${value}%`}
    </text>
  );
};

const renderCustomLabelLine = (props: any) => {
  const { points } = props;
  if (!points || !points.length) return null;
  return (
    <polyline
      points={points.map((p: any) => `${p.x},${p.y}`).join(" ")}
      stroke="#64748B"
      strokeWidth={1}
      fill="none"
    />
  );
};

export const OverduePieChartDynamic = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Overdue% (as on Date)
        </h3>
      </div>
      
      <div className="flex-1 w-full relative min-h-[350px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip 
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{ paddingBottom: '20px' }} />
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              label={renderCustomLabel}
              labelLine={renderCustomLabelLine}
            >
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
