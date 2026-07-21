import React, { useRef, useState } from "react";
import { Download, ChevronUp, ChevronDown } from "lucide-react";
import { toPng } from "html-to-image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { dummyYoYData } from "./mockData";

const REGION_COLORS = [
  "#3b82f6", "#ef4444", "#0ea5e9", "#f97316", "#10b981", 
  "#8b5cf6", "#f43f5e", "#06b6d4", "#84cc16", "#14b8a6",
  "#a855f7", "#ec4899", "#6366f1", "#d97706", "#059669"
];

export const YoYGrowthGraph = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "yoy-growth-graph.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download chart", err);
    }
  };

  // Split dummyYoYData for pagination legend
  const pageSize = 16;
  const displayedRegions = currentPage === 1 
    ? dummyYoYData.slice(0, pageSize)
    : dummyYoYData.slice(pageSize, pageSize * 2);

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[500px]"
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-slate-800">
          YoY Growth by Region
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center p-1.5 md:p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          title="Download Graph"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              {
                name: "FY 2026",
                ...dummyYoYData.reduce(
                  (acc, curr) => ({ ...acc, [curr.name]: curr.y2026 * 10 }),
                  {},
                ),
              },
              {
                name: "FY 2025",
                ...dummyYoYData.reduce(
                  (acc, curr) => ({ ...acc, [curr.name]: curr.y2025 * 10 }),
                  {},
                ),
              },
            ]}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            barGap={0}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₹${val} Cr`}
            />
            <RechartsTooltip
              wrapperStyle={{ zIndex: 1000 }}
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: any) => [`₹${value} Cr`, "Sales"]}
            />
            {dummyYoYData.map((region, index) => (
              <Bar
                key={region.name}
                dataKey={region.name}
                fill={REGION_COLORS[index % REGION_COLORS.length]}
                radius={[2, 2, 0, 0]}
                barSize={3}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Region Legend Grid (Snapshot 3) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-y-1.5 gap-x-2 text-[11px] font-semibold text-slate-700">
          {displayedRegions.map((region, idx) => {
            const globalIdx = dummyYoYData.findIndex(r => r.name === region.name);
            return (
              <div key={region.name} className="flex items-center gap-1.5 truncate">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: REGION_COLORS[globalIdx % REGION_COLORS.length] }} 
                />
                <span className="truncate">{region.name}</span>
              </div>
            );
          })}
        </div>

        {/* Legend Pagination Toggle */}
        <div className="flex items-center justify-start gap-1 text-[11px] font-bold text-slate-600 pt-1">
          <span className="text-[#3B82F6]">{currentPage}/2</span>
          <button 
            onClick={() => setCurrentPage(prev => prev === 1 ? 2 : 1)}
            className="flex items-center hover:text-slate-900 cursor-pointer p-0.5"
            title="Toggle Legend Page"
          >
            {currentPage === 1 ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#3B82F6]" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-[#3B82F6]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

