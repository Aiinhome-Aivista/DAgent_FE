import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";
import { useSessionId } from "./dashboardHooks";

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
  const [data, setData] = useState<any[]>([]);
  const sessionId = useSessionId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(`${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.OVERDUE_PCT}?session_id=${sessionId}`);
        const json = await response.json();

        if (json.status === "success" && json.data) {
          const fills = ["#38BDF8", "#A3E635", "#FBBF24", "#F87171", "#A78BFA"];
          const mappedData = json.data.map((item: any, index: number) => ({
            name: item.name,
            value: parseFloat(item.value) || 0,
            fill: item.fill || fills[index % fills.length]
          }));

          if (mappedData.length > 0) {
            setData(mappedData);
          }
        }
      } catch (e) {
        console.error("Error fetching overdue pct", e);
      }
    };
    fetchData();
  }, [sessionId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Overdue% (as on Date)
        </h3>
        {/* <div className="flex items-center gap-2">
          <input type="checkbox" id="legal" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
          <label htmlFor="legal" className="text-sm text-gray-500">Legal</label>
        </div> */}
      </div>

      <div className="flex-1 w-full relative min-h-[280px] flex items-center justify-center">
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
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              label={renderCustomLabel}
              labelLine={renderCustomLabelLine}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 5 Bottom Legend Items */}
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-2 text-[10px] sm:text-xs font-semibold text-gray-600 px-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-red-600"></div>
          <span>Most Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-red-400"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-yellow-400"></div>
          <span>Over Due</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-green-400"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-blue-400"></div>
          <span>Most Critical</span>
        </div>
      </div>
    </div>
  );
};
