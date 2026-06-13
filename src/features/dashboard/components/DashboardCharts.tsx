import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Label,
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Plus,
  Minus,
  Map,
  PieChart as PieChartIcon,
  TrendingUp,
  BarChart2,
  X,
  Download,
} from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

export const dummyYoYData = [
  { name: "JAIPUR", y2026: 65.5, y2025: 59.5 },
  { name: "BNGLR", y2026: 47.6, y2025: 45.2 },
  { name: "CUTTAK", y2026: 41.7, y2025: 40.5 },
  { name: "DELHI", y2026: 35.7, y2025: 34.5 },
  { name: "KANPUR", y2026: 33.3, y2025: 29.8 },
  { name: "SALEM", y2026: 29.8, y2025: 27.4 },
  { name: "SURAT", y2026: 26.2, y2025: 23.8 },
  { name: "FARIDABAD", y2026: 25.1, y2025: 22.0 },
  { name: "NAGPUR", y2026: 24.5, y2025: 21.5 },
  { name: "VIJAYAWADA", y2026: 23.8, y2025: 21.0 },
  { name: "GUWAHATI", y2026: 22.5, y2025: 20.1 },
  { name: "HUBLI", y2026: 21.4, y2025: 19.5 },
  { name: "MEERUT", y2026: 20.8, y2025: 18.2 },
  { name: "INDORE", y2026: 19.5, y2025: 17.5 },
  { name: "RAJKOT", y2026: 18.2, y2025: 16.0 },
  { name: "JODHPUR", y2026: 17.5, y2025: 15.5 },
  { name: "H.BAD", y2026: 16.8, y2025: 14.8 },
  { name: "CHENNAI", y2026: 15.5, y2025: 14.0 },
  { name: "PUNE", y2026: 14.8, y2025: 13.5 },
  { name: "KOLKATA", y2026: 13.5, y2025: 12.0 },
  { name: "JABALPUR", y2026: 12.8, y2025: 11.5 },
  { name: "MUMBAI", y2026: 12.0, y2025: 10.5 },
  { name: "AHMEDABAD", y2026: 11.5, y2025: 10.0 },
  { name: "Udaipur", y2026: 10.8, y2025: 9.5 },
  { name: "CHANDIGARH", y2026: 10.0, y2025: 8.5 },
  { name: "JALANDHAR", y2026: 9.5, y2025: 8.0 },
  { name: "JAMSHEDPUR", y2026: 8.8, y2025: 7.5 },
  { name: "VARANASI", y2026: 8.0, y2025: 7.0 },
];

export const dummyYearComparisonData = [
  {
    month: "JAN",
    y2022: 47.6,
    y2023: 53.6,
    y2024: 71.4,
    y2025: 77.4,
    y2026: 85.7,
  },
  {
    month: "FEB",
    y2022: 45.2,
    y2023: 57.1,
    y2024: 69.0,
    y2025: 71.4,
    y2026: 81.0,
  },
  {
    month: "MAR",
    y2022: 53.6,
    y2023: 59.5,
    y2024: 77.4,
    y2025: 83.3,
    y2026: 92.9,
  },
  {
    month: "APR",
    y2022: 50.0,
    y2023: 54.8,
    y2024: 69.0,
    y2025: 67.9,
    y2026: 82.1,
  },
  {
    month: "MAY",
    y2022: 54.8,
    y2023: 58.3,
    y2024: 73.8,
    y2025: 76.2,
    y2026: 79.8,
  },
  {
    month: "JUN",
    y2022: 58.3,
    y2023: 61.9,
    y2024: 78.6,
    y2025: 85.7,
    y2026: 84.5,
  },
  {
    month: "JUL",
    y2022: 54.8,
    y2023: 59.5,
    y2024: 73.8,
    y2025: 71.4,
    y2026: 83.3,
  },
  {
    month: "AUG",
    y2022: 57.1,
    y2023: 60.7,
    y2024: 75.0,
    y2025: 76.2,
    y2026: 85.7,
  },
  {
    month: "SEP",
    y2022: 59.5,
    y2023: 65.5,
    y2024: 78.6,
    y2025: 81.0,
    y2026: 88.1,
  },
  {
    month: "OCT",
    y2022: 53.6,
    y2023: 61.9,
    y2024: 70.2,
    y2025: 81.0,
    y2026: 85.7,
  },
  {
    month: "NOV",
    y2022: 51.2,
    y2023: 58.3,
    y2024: 66.7,
    y2025: 78.6,
    y2026: 86.9,
  },
  {
    month: "DEC",
    y2022: 65.5,
    y2023: 72.6,
    y2024: 85.7,
    y2025: 88.1,
    y2026: 92.9,
  },
];

export const dummyZoneData = [
  { name: "Central", value: 31.2 },
  { name: "North", value: 29.6 },
  { name: "East", value: 20.6 },
  { name: "South-I", value: 10.9 },
  { name: "West", value: 4.1 },
  { name: "South-II", value: 3.2 },
  { name: "Nepal", value: 0.4 },
];
export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#E06666",
  "#93C47D",
];

export const dummyTyreData = [
  { name: "TRUCK", value: 27.53 },
  { name: "CAR", value: 5.99 },
  { name: "LCV", value: 3.59 },
  { name: "Motor Cycle", value: 2.39 },
  { name: "SCV", value: 1.84 },
  { name: "TRACTOR REAR", value: 1.46 },
  { name: "OTR", value: 1.19 },
  { name: "SCOOTER", value: 1.0 },
];

export const DashboardKPIs = () => (
  <div className="flex flex-col gap-3 w-full">
    {/* KPI 1 */}
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
          ₹
        </div>
        <p
          className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 whitespace-nowrap overflow-hidden"
          title="Total Sales Revenue"
        >
          Total Sales Revenue
        </p>
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-black text-slate-700 leading-tight my-1">
          ₹43.82 M
        </h3>

        <p className="text-[10px] text-slate-400 mt-0.5">6.71 Lac units sold</p>
      </div>
    </div>

    {/* KPI 2 */}
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <p
          className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 whitespace-nowrap overflow-hidden"
          title="Top Performing Tyre"
        >
          Top Performing Tyre
        </p>
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-black text-emerald-600 leading-tight my-1">
          TRUCK
        </h3>

        <p className="text-[10px] text-slate-400 mt-0.5">₹27.53 M</p>
      </div>
    </div>

    {/* KPI 3 */}
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p
          className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 whitespace-nowrap overflow-hidden"
          title="Leading Region"
        >
          Leading Region
        </p>
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-black text-purple-600 leading-tight my-1">
          JAIPUR
        </h3>

        <p className="text-[10px] text-slate-400 mt-0.5">₹3.83 M</p>
      </div>
    </div>

    {/* KPI 4 */}
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <p
          className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5 whitespace-nowrap overflow-hidden"
          title="Year-Over-Year"
        >
          Year-Over-Year
        </p>
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-black text-slate-700 leading-tight my-1">
          +0.0%
        </h3>

        <p className="text-[10px] text-slate-400 mt-0.5">
          vs same period last year
        </p>
      </div>
    </div>
  </div>
);

const coverageMarkers = [
  {
    name: "Delhi",
    coordinates: [77.1025, 28.7041],
    coverage: 85,
    color: "#0ea5e9",
  },
  {
    name: "Jaipur",
    coordinates: [75.7873, 26.9124],
    coverage: 65,
    color: "#84cc16",
  },
  {
    name: "Lucknow",
    coordinates: [80.9462, 26.8467],
    coverage: 45,
    color: "#3b82f6",
  },
  {
    name: "Bhopal",
    coordinates: [77.4126, 23.2599],
    coverage: 55,
    color: "#6366f1",
  },
  {
    name: "Kolkata",
    coordinates: [88.3639, 22.5726],
    coverage: 90,
    color: "#06b6d4",
  },
  {
    name: "Hyderabad",
    coordinates: [78.4867, 17.385],
    coverage: 75,
    color: "#ef4444",
  },
  {
    name: "Bengaluru",
    coordinates: [77.5946, 12.9716],
    coverage: 95,
    color: "#ec4899",
  },
  {
    name: "Chennai",
    coordinates: [80.2707, 13.0827],
    coverage: 80,
    color: "#f59e0b",
  },
  {
    name: "Mumbai",
    coordinates: [72.8777, 19.076],
    coverage: 92,
    color: "#a855f7",
  },
];

const IndiaCoverageMap = () => {
  const [position, setPosition] = useState({ coordinates: [80, 22], zoom: 1 });
  const [tooltipContent, setTooltipContent] = useState("");

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 800 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography="/india-states.geojson">
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#f1f5f9", outline: "none" },
                    pressed: { fill: "#e2e8f0", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {coverageMarkers.map(({ name, coordinates, coverage, color }) => (
            <Marker
              key={name}
              coordinates={coordinates as [number, number]}
              onMouseEnter={() => {
                setTooltipContent(`${name} - ${coverage}% Coverage`);
              }}
              onMouseLeave={() => {
                setTooltipContent("");
              }}
            >
              <circle
                r={5}
                fill={color}
                stroke="#fff"
                strokeWidth={1.5}
                className="cursor-pointer transition-all duration-300"
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {tooltipContent && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-10 pointer-events-none transition-opacity">
          {tooltipContent}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col shadow-sm border border-slate-200 rounded-md overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-200"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const DashboardGraphs = () => {
  const [selectedYears, setSelectedYears] = useState<number[]>([2024, 2025]);
  const [chartType, setChartType] = useState<"column" | "line" | "area">(
    "column",
  );

  const availableYears = [2022, 2023, 2024, 2025, 2026];

  // Dynamic colors for different years to ensure they are visually distinct
  const yearColors: Record<number, string> = {
    2022: "#3b82f6", // Blue
    2023: "#10b981", // Emerald
    2024: "#8b5cf6", // Violet
    2025: "#f59e0b", // Amber
    2026: "#ef4444", // Red
  };

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year].sort(),
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: dummyYearComparisonData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const commonAxes = (
      <>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `$${val} M`}
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
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
      </>
    );

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {commonAxes}
          {selectedYears.map((year) => (
            <Line
              key={year}
              type="monotone"
              dataKey={`y${year}`}
              stroke={yearColors[year]}
              name={`${year}`}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          {commonAxes}
          {selectedYears.map((year) => (
            <Area
              key={year}
              type="monotone"
              dataKey={`y${year}`}
              stroke={yearColors[year]}
              fill={yearColors[year]}
              name={`${year}`}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      );
    }

    // Default to column (BarChart)
    return (
      <BarChart {...commonProps} barGap={7}>
        {commonAxes}
        {selectedYears.map((year) => (
          <Bar
            key={year}
            dataKey={`y${year}`}
            fill={yearColors[year]}
            name={`${year}`}
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
        ))}
      </BarChart>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Placeholder */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            India coverage by region
          </h3>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* <IndiaCoverageMap /> */}
          </div>
        </div>

        {/* YoY Growth Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            YoY Growth by Region
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "FY 2026",
                    ...dummyYoYData.reduce(
                      (acc, curr) => ({ ...acc, [curr.name]: curr.y2026 }),
                      {},
                    ),
                  },
                  {
                    name: "FY 2025",
                    ...dummyYoYData.reduce(
                      (acc, curr) => ({ ...acc, [curr.name]: curr.y2025 }),
                      {},
                    ),
                  },
                ]}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                barGap={0}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val} M`}
                  label={{
                    value: "Sales ($)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fontSize: 12,
                      fill: "#64748b",
                    },
                  }}
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
                />
                <Legend
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <div className="mt-12 flex flex-col">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          {payload?.map((entry: any, index: number) => (
                            <div
                              key={`item-${index}`}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-6 text-xs font-bold text-slate-500">
                          <span className="text-slate-300 cursor-pointer">
                            ▲
                          </span>{" "}
                          1/2{" "}
                          <span className="text-blue-600 cursor-pointer">
                            ▼
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                {dummyYoYData.map((region, index) => {
                  const colors = [
                    "#3b82f6",
                    "#ef4444",
                    "#0ea5e9",
                    "#f97316",
                    "#10b981",
                    "#8b5cf6",
                    "#f43f5e",
                    "#06b6d4",
                    "#84cc16",
                    "#14b8a6",
                    "#6366f1",
                    "#d946ef",
                    "#f43f5e",
                    "#f59e0b",
                    "#22c55e",
                    "#a855f7",
                    "#ec4899",
                    "#06b6d4",
                  ];
                  return (
                    <Bar
                      key={region.name}
                      dataKey={region.name}
                      fill={colors[index % colors.length]}
                      radius={[2, 2, 0, 0]}
                      barSize={4}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Year Comparison Filterable Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-slate-800">Year comparison</h3>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">Years</span>
              <div className="flex items-center gap-1.5">
                {availableYears.map((year) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                        isSelected
                          ? "border-yellow-200 bg-yellow-50 text-yellow-700 shadow-sm"
                          : "border-transparent text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setChartType("column")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === "column"
                    ? "bg-yellow-100 text-yellow-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Column
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === "line"
                    ? "bg-yellow-100 text-yellow-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                Line
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === "area"
                    ? "bg-yellow-100 text-yellow-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <AreaChartIcon className="w-3.5 h-3.5" />
                Area
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {selectedYears.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
              Please select at least one year to view the comparison.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Sales by Zone
          </h3>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dummyZoneData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={true}
                  stroke="none"
                >
                  {dummyZoneData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  wrapperStyle={{ zIndex: 1000 }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Top 10 Tyre Types by Sales
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dummyTyreData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val} M`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
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
                  formatter={(val) => [`$${val} M`, "Sales"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {dummyTyreData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Graph Panel Items & Side Panel ---

export const graphPanelItems = [
  {
    id: "yearcomp",
    name: "Year Comparison",
    icon: BarChart3,
    color: "text-violet-500 bg-violet-50",
  },
  {
    id: "map",
    name: "India Coverage",
    icon: Map,
    color: "text-cyan-500 bg-cyan-50",
  },
  {
    id: "yoy",
    name: "YoY Growth",
    icon: TrendingUp,
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: "zone",
    name: "Sales by Zone",
    icon: PieChartIcon,
    color: "text-amber-500 bg-amber-50",
  },
  {
    id: "tyre",
    name: "Tyre Sales",
    icon: BarChart2,
    color: "text-emerald-500 bg-emerald-50",
  },
];

// Individual graph renderers for the side panel
const IndiaMapGraph = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
    <h3 className="text-lg font-bold text-slate-800 mb-4">
      India coverage by region
    </h3>
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      <IndiaCoverageMap />
    </div>
  </div>
);

const YoYGrowthGraph = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
    <h3 className="text-lg font-bold text-slate-800 mb-4">
      YoY Growth by Region
    </h3>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            {
              name: "FY 2026",
              ...dummyYoYData.reduce(
                (acc, curr) => ({ ...acc, [curr.name]: curr.y2026 }),
                {},
              ),
            },
            {
              name: "FY 2025",
              ...dummyYoYData.reduce(
                (acc, curr) => ({ ...acc, [curr.name]: curr.y2025 }),
                {},
              ),
            },
          ]}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          barGap={0}
          barCategoryGap="20%"
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
            tickFormatter={(val) => `$${val}M`}
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
          />
          {dummyYoYData.slice(0, 10).map((region, index) => {
            const colors = [
              "#3b82f6",
              "#ef4444",
              "#0ea5e9",
              "#f97316",
              "#10b981",
              "#8b5cf6",
              "#f43f5e",
              "#06b6d4",
              "#84cc16",
              "#14b8a6",
            ];
            return (
              <Bar
                key={region.name}
                dataKey={region.name}
                fill={colors[index % colors.length]}
                radius={[2, 2, 0, 0]}
                barSize={4}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ZonePieGraph = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
    <h3 className="text-lg font-bold text-slate-800 mb-4">Sales by Zone</h3>
    <div className="flex-1 min-h-0 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dummyZoneData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
            labelLine={true}
            stroke="#ffffff"
            strokeWidth={3}
            paddingAngle={2}
          >
            {dummyZoneData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <RechartsTooltip
            wrapperStyle={{ zIndex: 1000 }}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const TyreSalesGraph = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
    <h3 className="text-lg font-bold text-slate-800 mb-4">
      Top 10 Tyre Types by Sales
    </h3>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dummyTyreData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 25 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e2e8f0"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `₹${val} Cr`}
          >
            <Label
              value="Sales (₹)"
              offset={5}
              position="bottom"
              style={{ fill: "#64748b", fontSize: 11 }}
            />
          </XAxis>
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={80}
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
            formatter={(val: number) => [`₹${val} Cr`, "Sales"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
            {dummyTyreData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Year Comparison needs its own state, so it's a proper component
const YearComparisonGraph = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYears, setSelectedYears] = useState<number[]>([2024, 2025]);
  const [chartType, setChartType] = useState<"column" | "line" | "area">(
    "column",
  );
  const availableYears = [2022, 2023, 2024, 2025, 2026];
  const yearColors: Record<number, string> = {
    2022: "#3b82f6",
    2023: "#10b981",
    2024: "#8b5cf6",
    2025: "#f59e0b",
    2026: "#ef4444",
  };

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year].sort(),
    );
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "year-comparison-chart.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download chart", err);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: dummyYearComparisonData,
      margin: { top: 20, right: 0, left: -5, bottom: 5 },
    };
    const commonAxes = (
      <>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `$${val} M`}
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
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
      </>
    );
    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          {commonAxes}
          {selectedYears.map((year) => (
            <Line
              key={year}
              type="monotone"
              dataKey={`y${year}`}
              stroke={yearColors[year]}
              name={`${year}`}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      );
    }
    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          {commonAxes}
          {selectedYears.map((year) => (
            <Area
              key={year}
              type="monotone"
              dataKey={`y${year}`}
              stroke={yearColors[year]}
              fill={yearColors[year]}
              name={`${year}`}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      );
    }
    return (
      <BarChart {...commonProps} barGap={2} barCategoryGap="25%">
        {commonAxes}
        {selectedYears.map((year) => (
          <Bar
            key={year}
            dataKey={`y${year}`}
            fill={yearColors[year]}
            name={`${year}`}
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
          />
        ))}
      </BarChart>
    );
  };

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]"
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-base font-bold text-slate-800 whitespace-nowrap">
          Year comparison
        </h3>
        <div
          className="flex items-center gap-1.5 flex-nowrap overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Years</span>
            <div className="flex items-center gap-1">
              {availableYears.map((year) => {
                const isSelected = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-bold rounded-lg transition-all border ${isSelected ? "border-yellow-200 bg-yellow-50 text-yellow-700 shadow-sm" : "border-transparent text-slate-500 hover:bg-slate-100"}`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-slate-300 text-xs">|</div>

          <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType("column")}
              className={`flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${chartType === "column" ? "bg-yellow-100 text-yellow-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <BarChart3 className="w-3 h-3" /> Column
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${chartType === "line" ? "bg-yellow-100 text-yellow-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LineChartIcon className="w-3 h-3" /> Line
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${chartType === "area" ? "bg-yellow-100 text-yellow-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <AreaChartIcon className="w-3.5 h-3.5" /> Area
            </button>
          </div>

          {/* <div className="text-slate-300 text-xs hidden sm:block">|</div> */}

          <button
            onClick={handleDownload}
            className="flex items-center justify-center p-1.5 md:p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Download Graph"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {selectedYears.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
            Please select at least one year.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const graphComponents: Record<string, React.FC> = {
  map: IndiaMapGraph,
  yoy: YoYGrowthGraph,
  yearcomp: YearComparisonGraph,
  zone: ZonePieGraph,
  tyre: TyreSalesGraph,
};

interface GraphSidePanelProps {
  activeGraphId: string | null;
  onClose: () => void;
  inline?: boolean;
}

export const GraphSidePanel: React.FC<GraphSidePanelProps> = ({
  activeGraphId,
  onClose,
  inline = false,
}) => {
  const GraphComponent = activeGraphId ? graphComponents[activeGraphId] : null;
  const activeItem = graphPanelItems.find((g) => g.id === activeGraphId);

  return (
    <AnimatePresence>
      {activeGraphId && GraphComponent && (
        <>
          {/* Backdrop */}
          {!inline && (
            <motion.div
              key="graph-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-transparent z-[60]"
            />
          )}
          {/* Panel */}
          <motion.div
            key="graph-panel"
            initial={inline ? { width: 0, opacity: 0 } : { x: "100%" }}
            animate={inline ? { width: 750, opacity: 1 } : { x: 0 }}
            exit={inline ? { width: 0, opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={
              inline
                ? "h-full shrink-0 border-l border-slate-200 bg-slate-50 flex flex-col relative z-[70] overflow-hidden"
                : "fixed top-0 right-0 h-full w-[750px] max-w-[90vw] bg-slate-50 shadow-2xl z-[70] flex flex-col"
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                {activeItem && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeItem.color}`}
                  >
                    <activeItem.icon className="w-4 h-4" />
                  </div>
                )}
                <h3 className="text-base font-bold text-slate-800">
                  {activeItem?.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <GraphComponent />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
