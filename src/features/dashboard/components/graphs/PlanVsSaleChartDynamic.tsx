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

const mockData = [
  { city: "AHMEDABAD", planValue: 40, saleValue: 16, achevValue: 41.7 },
  { city: "INDORE", planValue: 0, saleValue: 0, achevValue: null },
  { city: "MUMBAI", planValue: 40, saleValue: 16, achevValue: 40.6 },
  { city: "NAGPUR", planValue: 42, saleValue: 21, achevValue: 52.1 },
  { city: "PUNE", planValue: 30, saleValue: 7, achevValue: 22.6 },
  { city: "RAJKOT", planValue: 45, saleValue: 32, achevValue: 71.4 },
  { city: "SURAT", planValue: 20, saleValue: 10, achevValue: 53.4 },
];

export const PlanVsSaleChartDynamic = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-slate-800 font-bold text-lg text-left">
            Sales Revenue (Cr)
          </h3>
        </div>
      </div>
      
      <div className="flex-1 w-full relative min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mockData}
            margin={{ top: 20, right: 20, bottom: 40, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="city"
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={false}
              angle={-30}
              tick={{ fill: "#64748B", fontSize: 10, textAnchor: "end", dy: 10 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={{ stroke: "#0EA5E9" }}
              tickLine={{ stroke: "#0EA5E9" }}
              tick={{ fill: "#64748B", fontSize: 12 }}
              domain={[0, 80]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: "#84CC16" }}
              tickLine={{ stroke: "#84CC16" }}
              tick={{ fill: "#64748B", fontSize: 12 }}
              domain={[0, 80]}
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
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
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
            >
              <LabelList dataKey="saleValue" position="top" fill="#64748B" fontSize={12} fontWeight="bold" />
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
              <LabelList dataKey="achevValue" position="top" fill="#64748B" fontSize={12} fontWeight="bold" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
