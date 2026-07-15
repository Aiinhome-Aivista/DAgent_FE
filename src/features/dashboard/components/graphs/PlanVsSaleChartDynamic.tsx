import React, { useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const regionData = [
  { city: "West", planValue: 214.4, saleValue: 101, achevValue: 47.1 },
  { city: "South - I", planValue: 95.1, saleValue: 31, achevValue: 32.6 },
  { city: "North", planValue: 225.2, saleValue: 91, achevValue: 40.4 },
  { city: "East", planValue: 139.0, saleValue: 57, achevValue: 41.0 },
  { city: "South - II", planValue: 125.6, saleValue: 54, achevValue: 43.0 },
];

const cityData = [
  { city: "AHMEDABAD", planValue: 40, saleValue: 16, achevValue: 41.7 },
  { city: "INDORE", planValue: 0, saleValue: 0, achevValue: null },
  { city: "MUMBAI", planValue: 40, saleValue: 16, achevValue: 40.6 },
  { city: "NAGPUR", planValue: 42, saleValue: 21, achevValue: 52.1 },
  { city: "PUNE", planValue: 30, saleValue: 7, achevValue: 22.6 },
  { city: "RAJKOT", planValue: 45, saleValue: 32, achevValue: 71.4 },
  { city: "SURAT", planValue: 20, saleValue: 10, achevValue: 53.4 },
];

export const PlanVsSaleChartDynamic = () => {
  const [view, setView] = useState<"region" | "city">("region");

  const handleDrilldown = (data: any) => {
    // Extract city name whether it's from a Bar click or an XAxis tick click
    const city = data?.value || data?.city || data?.payload?.city;
    if (view === "region" && city) {
      setView("city");
    }
  };

  const activeData = view === "region" ? regionData : cityData;
  const leftDomain = view === "region" ? [0, 300] : [0, 80];
  const rightDomain = view === "region" ? [0, 60] : [0, 80];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          {view === "city" && (
            <button
              onClick={() => setView("region")}
              className="bg-[#0070c0] text-white p-1 rounded hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer"
              style={{ width: "24px", height: "24px" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          <h3 className="text-slate-800 font-bold text-lg text-left">
            Sales Revenue (Cr)
          </h3>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[350px]">
        <style>{`
          .recharts-wrapper,
          .recharts-surface,
          .recharts-wrapper * {
            outline: none !important;
          }
        `}</style>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={activeData}
            margin={{ top: 20, right: 20, bottom: 40, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="city"
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
              angle={-30}
              tick={{
                fill: "#64748B",
                fontSize: 10,
                textAnchor: "end",
                dy: 10,
                cursor: view === "region" ? "pointer" : "default",
              }}
              onClick={handleDrilldown}
            />
            <YAxis
              yAxisId="left"
              axisLine={{ stroke: "#0EA5E9" }}
              tickLine={{ stroke: "#0EA5E9" }}
              tick={{ fill: "#64748B", fontSize: 12 }}
              domain={leftDomain}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: "#84CC16" }}
              tickLine={{ stroke: "#84CC16" }}
              tick={{ fill: "#64748B", fontSize: 12 }}
              domain={rightDomain}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              cursor={{ fill: "transparent" }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <Area
              yAxisId="left"
              type="linear"
              dataKey="planValue"
              name="Plan Value"
              fill="#FCD34D"
              stroke="none"
              activeDot={false}
            />
            <Bar
              yAxisId="left"
              dataKey="saleValue"
              name="Sale Value"
              fill="#0EA5E9"
              barSize={40}
              radius={[4, 4, 0, 0]}
              onClick={handleDrilldown}
              cursor={view === "region" ? "pointer" : "default"}
            >
              <LabelList
                dataKey="saleValue"
                position="top"
                fill="#64748B"
                fontSize={12}
                fontWeight="bold"
              />
            </Bar>
            <Line
              yAxisId="right"
              type="linear"
              dataKey="achevValue"
              name="Achev Value %"
              stroke="#84CC16"
              strokeWidth={2}
              dot={{ fill: "#84CC16", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            >
              <LabelList
                dataKey="achevValue"
                position="top"
                fill="#64748B"
                fontSize={12}
                fontWeight="bold"
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
