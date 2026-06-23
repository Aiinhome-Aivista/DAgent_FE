import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";
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
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";

export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#E06666",
  "#93C47D",
];

const FilterSelect = ({ label, value, onChange, options, defaultLabel = "All" }: { label: string, value: string | number, onChange: (e: any) => void, options: (string | number)[], defaultLabel?: string }) => (
  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors focus-within:border-slate-300 focus-within:shadow-sm">
    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{label}:</span>
    <select
      value={value}
      onChange={onChange}
      className="text-xs font-medium text-slate-700 bg-transparent outline-none cursor-pointer w-full"
    >
      <option value="All">{defaultLabel}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export const DashboardKPIs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState({ question: "", answer: "" });
  const [metrics, setMetrics] = useState([
    {
      label: "Total Sales Revenue",
      value: "",
      subtext: "",
    },
    {
      label: "Top Performing Tyre",
      value: "",
      subtext: "",
    },
    {
      label: "Leading Region",

      value: "",
      subtext: "",
    },
    {
      label: "Year-Over-Year",
      value: "",
      subtext: "",
    },
  ]);

  const fetchMetrics = async (question: string, answer: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${defaultConfig.baseUrl}/graph-metrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer }),
      });
      const data = await response.json();
      if (data.status === "success" && data.data) {
        // Map either the new format (metric_1, metric_2) or the old format
        const newMetrics = Object.values(data.data).filter(Boolean) as Array<{
          label?: string;
          name?: string;
          value?: string;
          revenue?: string;
          change?: string;
          subtext?: string;
        }>;

        if (newMetrics.length > 0) {
          setMetrics((prev) => {
            const updated = [...prev];
            newMetrics.forEach((m, i) => {
              if (i < 4 && m) {
                updated[i] = {
                  label: m.label ?? updated[i].label,
                  value: m.value ?? m.revenue ?? m.change ?? updated[i].value,
                  subtext: m.subtext ?? m.name ?? updated[i].subtext,
                };
              }
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch graph metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultMetrics = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${defaultConfig.baseUrl}/default-dashboard-metrics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        },
      );
      const data = await response.json();
      if (data.status === "success" && data.data) {
        const newMetrics = Object.values(data.data).filter(Boolean) as Array<{
          label?: string;
          value?: string;
          subtext?: string;
        }>;

        if (newMetrics.length > 0) {
          setMetrics((prev) => {
            const updated = [...prev];
            newMetrics.forEach((m, i) => {
              if (i < 4 && m) {
                updated[i] = {
                  label: m.label ?? updated[i].label,
                  value: m.value ?? updated[i].value,
                  subtext: m.subtext ?? updated[i].subtext,
                };
              }
            });
            return updated;
          });
        }
      } else if (data.status === "error") {
        toast.error(
          data.message || data.details || "Failed to fetch default metrics",
        );
      }
    } catch (error) {
      console.error("Failed to fetch default metrics:", error);
      toast.error("Failed to fetch default metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const sessionId = localStorage.getItem("DAgent_session_id");
    if (sessionId) {
      fetchDefaultMetrics(sessionId);
    }

    const handleSessionIdUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.sessionId) {
        fetchDefaultMetrics(customEvent.detail.sessionId);
      }
    };

    window.addEventListener("session-id-updated", handleSessionIdUpdated);
    return () =>
      window.removeEventListener("session-id-updated", handleSessionIdUpdated);
  }, []);

  useEffect(() => {
    const handleChatMetricsUpdate = (event: CustomEvent) => {
      const { question, answer } = event.detail;
      setLastQuery({ question, answer });
      fetchMetrics(question, answer);
    };

    window.addEventListener(
      "chat-metrics-update",
      handleChatMetricsUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "chat-metrics-update",
        handleChatMetricsUpdate as EventListener,
      );
    };
  }, []);

  const handleRefresh = () => {
    const sessionId = localStorage.getItem("DAgent_session_id");
    if (sessionId) fetchDefaultMetrics(sessionId);
  };

  const renderSkeleton = () => (
    <div className="flex flex-col gap-3 w-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2"
        >
          <div className="h-2.5 bg-slate-200 rounded w-24 mt-1.5 animate-pulse"></div>
          <div className="min-w-0">
            <div className="h-5 bg-slate-200 rounded w-20 my-1 animate-pulse"></div>
            <div className="h-2 bg-slate-100 rounded w-28 mt-1.5 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex justify-between items-center px-1 shrink-0">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Key Metrics
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          title="Refresh Metrics"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <div className="flex flex-col gap-3 w-full flex-1 min-h-0">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-2 flex-1"
            >
              <p
                className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5"
                title={metric.label}
              >
                {metric.label}
              </p>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-700 leading-tight my-1 uppercase">
                  {(() => {
                    let formattedVal: React.ReactNode = "";
                    if (
                      typeof metric.value === "string" &&
                      /^\s*[\d,.]+/.test(metric.value) &&
                      !metric.value.includes("₹") &&
                      !metric.value.includes("%")
                    ) {
                      formattedVal = `₹${metric.value.replace(/\$/g, "").trim()}`;
                    } else if (typeof metric.value === "string") {
                      formattedVal = metric.value.replace(/\$/g, "₹");
                    } else if (typeof metric.value === "number") {
                      formattedVal = `₹${metric.value}`;
                    } else {
                      return metric.value as React.ReactNode;
                    }

                    if (typeof formattedVal === "string") {
                      const parts = formattedVal.split(/\b(CR|Cr|cr)\b/i);
                      return parts.map((part, index) => {
                        if (/^(CR|Cr|cr)$/i.test(part)) {
                          return (
                            <span key={index}>
                              C<span className="lowercase">r</span>
                            </span>
                          );
                        }
                        return (
                          <React.Fragment key={index}>{part}</React.Fragment>
                        );
                      });
                    }
                    return formattedVal;
                  })()}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {metric.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const coverageMarkers = [
  {
    name: "Delhi",
    coordinates: [77.1025, 28.7041],
    coverage: 85,
    color: "#0ea5e9",
    region: "North",
  },
  {
    name: "Jaipur",
    coordinates: [75.7873, 26.9124],
    coverage: 65,
    color: "#84cc16",
    region: "North",
  },
  {
    name: "Lucknow",
    coordinates: [80.9462, 26.8467],
    coverage: 45,
    color: "#3b82f6",
    region: "North",
  },
  {
    name: "Bhopal",
    coordinates: [77.4126, 23.2599],
    coverage: 55,
    color: "#6366f1",
    region: "Central",
  },
  {
    name: "Kolkata",
    coordinates: [88.3639, 22.5726],
    coverage: 90,
    color: "#06b6d4",
    region: "East",
  },
  {
    name: "Hyderabad",
    coordinates: [78.4867, 17.385],
    coverage: 75,
    color: "#ef4444",
    region: "South",
  },
  {
    name: "Bengaluru",
    coordinates: [77.5946, 12.9716],
    coverage: 95,
    color: "#ec4899",
    region: "South",
  },
  {
    name: "Chennai",
    coordinates: [80.2707, 13.0827],
    coverage: 80,
    color: "#f59e0b",
    region: "South",
  },
  {
    name: "Mumbai",
    coordinates: [72.8777, 19.076],
    coverage: 92,
    color: "#a855f7",
    region: "West",
  },
];

const IndiaCoverageMap = ({
  year,
  month,
  region,
}: {
  year?: string;
  month?: string;
  region?: string;
}) => {
  const [position, setPosition] = useState({ coordinates: [82, 23], zoom: 1 });
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
        projectionConfig={{
          scale: 850,
          center: [82, 23],
        }}
        width={500}
        height={580}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography="/india-states-combined.geojson">
            {({ geographies }) =>
              geographies.map((geo) => {
                const isOutline = geo.properties._isOutline === true;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isOutline ? "#f8fafc" : "#f8fafc"}
                    stroke={isOutline ? "#475569" : "#64748b"}
                    strokeWidth={isOutline ? 1 : 0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: isOutline ? "#f8fafc" : "#f1f5f9",
                        outline: "none",
                      },
                      pressed: {
                        fill: isOutline ? "#f8fafc" : "#e2e8f0",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
          {coverageMarkers
            .filter((m) => !region || region === "All" || m.region === region)
            .map(({ name, coordinates, coverage, color }) => (
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

const useDashboardFilters = () => {
  const [filters, setFilters] = useState<{
    categories: string[];
    constructions: string[];
    tyreTypes: string[];
    years: number[];
    months: string[];
  }>({
    categories: [],
    constructions: [],
    tyreTypes: [],
    years: [],
    months: [],
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(
          `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.FILTERS}?session_id=${sessionId}`,
        );
        const data = await response.json();
        if (data.status === "success") {
          setFilters({
            categories: data.categories || [],
            constructions: data.constructions || [],
            tyreTypes: data.tyreTypes || [],
            years: data.years || [],
            months: data.months || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard filters:", err);
      }
    };
    fetchFilters();
  }, []);

  return filters;
};

const useAvailableYears = () => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableZones, setAvailableZones] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [availableCustomerTypes, setAvailableCustomerTypes] = useState<
    string[]
  >([]);
  const [availableConstructionTypes, setAvailableConstructionTypes] = useState<
    string[]
  >([]);
  const [isAvailableYearsLoading, setIsAvailableYearsLoading] = useState(true);

  useEffect(() => {
    const fetchAvaliableYears = async () => {
      setIsAvailableYearsLoading(true);
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(
          `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.YEAR_FILTER}?session_id=${sessionId}`,
        );
        const data = await response.json();
        if (data.status === "success") {
          setAvailableYears(data.years || []);
          setAvailableZones(data.zones || []);
          setAvailableRegions(data.regions || []);
          setAvailableMonths(data.months || []);
          setAvailableCustomerTypes(data.customer_types || []);
          setAvailableConstructionTypes(data.construction_types || []);
        }
      } catch (err) {
        console.error("Failed to fetch available years and filters:", err);
      } finally {
        setIsAvailableYearsLoading(false);
      }
    };
    fetchAvaliableYears();
  }, []);

  return {
    availableYears,
    availableZones,
    availableRegions,
    availableMonths,
    availableCustomerTypes,
    availableConstructionTypes,
    isAvailableYearsLoading,
  };
};

export const DashboardGraphs = () => {
  const filters = useDashboardFilters();
  const {
    availableYears: apiAvailableYears,
    availableZones,
    availableRegions,
    availableMonths,
    availableCustomerTypes,
    availableConstructionTypes,
    isAvailableYearsLoading,
  } = useAvailableYears();
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  useEffect(() => {
    if (apiAvailableYears.length > 0 && selectedYears.length === 0) {
      setSelectedYears([apiAvailableYears[0]]);
    }
  }, [apiAvailableYears]);
  const [tyreData, setTyreData] = useState<any[]>([]);
  const [isTyreLoading, setIsTyreLoading] = useState(true);
  const [tyreAxisLabels, setTyreAxisLabels] = useState({
    x: "Sales (₹)",
    y: "Tyre Type",
  });
  const [tyreChartTitle, setTyreChartTitle] = useState(
    "Top 10 Tyre Types by Sales",
  );

  const [tyreYear, setTyreYear] = useState("All");
  const [tyreCustomerCategory, setTyreCustomerCategory] = useState("All");
  const [tyreZone, setTyreZone] = useState("All");
  const [tyreRegion, setTyreRegion] = useState("All");
  const [tyreConstructionType, setTyreConstructionType] = useState("All");

  useEffect(() => {
    const fetchTyreData = async () => {
      setIsTyreLoading(true);
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        const userId = localStorage.getItem("DAgent_user_id");
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(
          `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.TYRE_SALES_DATA}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              question: "Top 10 Tyre Types by Sales ",
              user_id: userId,
              year: tyreYear === "All" ? ["All"] : [Number(tyreYear)],
              customer_category: [tyreCustomerCategory],
              zone: [tyreZone],
              region: [tyreRegion],
              construction_type: [tyreConstructionType],
            }),
          },
        );
        const data = await response.json();
        if (
          data.status === "success" &&
          data.visualizations &&
          data.visualizations[0] &&
          data.visualizations[0].data
        ) {
          const mappedData = data.visualizations[0].data.map((item: any) => {
            let val = Number(item.sales_value);
            let plotValue = val;
            if (val >= 100000) {
              plotValue = val / 10000000;
            }
            return {
              name: item.category,
              value: plotValue,
              sales_value: item.sales_value,
            };
          });

          const viz = data.visualizations[0];
          const formatLabel = (key: string) => {
            if (!key) return "";
            return key
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(" ");
          };
          let xLabel = formatLabel(viz.xKey) || "Sales Value";
          if (xLabel === "Sales Value") xLabel += " (₹)";
          let yLabel = formatLabel(viz.yKey) || "Tyre Type";
          setTyreAxisLabels({ x: xLabel, y: yLabel });
          if (viz.title) setTyreChartTitle(viz.title);

          setTyreData(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch tyre sales data:", err);
      } finally {
        setIsTyreLoading(false);
      }
    };
    fetchTyreData();
  }, [
    tyreYear,
    tyreCustomerCategory,
    tyreZone,
    tyreRegion,
    tyreConstructionType,
  ]);

  const [chartType, setChartType] = useState<"column" | "line" | "area">(
    "column",
  );
  const [zoneProductType, setZoneProductType] = useState("All");
  const [zoneConstructionType, setZoneConstructionType] = useState("All");
  const [zoneTyreType, setZoneTyreType] = useState("All");
  const [zoneYear, setZoneYear] = useState("All");
  const [zoneMonth, setZoneMonth] = useState("All");
  const [zoneData, setZoneData] = useState<any[]>([]);
  const [isZoneLoading, setIsZoneLoading] = useState(true);
  const [zoneAxisLabels, setZoneAxisLabels] = useState({
    x: "Name",
    y: "Sales Value (₹)",
  });
  const [zoneChartTitle, setZoneChartTitle] = useState("Sales by Zone");

  useEffect(() => {
    const fetchZoneData = async () => {
      setIsZoneLoading(true);
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(
          `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.SALES_BY_ZONE}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              product_type: zoneProductType,
              construction_type: zoneConstructionType,
              tyre_type: zoneTyreType,
              years: zoneYear === "All" ? "All" : [Number(zoneYear)],
              months: zoneMonth,
            }),
          },
        );
        const data = await response.json();
        if (
          data.status === "success" &&
          data.visualizations &&
          data.visualizations[0] &&
          data.visualizations[0].data
        ) {
          const viz = data.visualizations[0];
          const formatLabel = (key: string) => {
            if (!key) return "";
            return key
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(" ");
          };
          let xLabel = formatLabel(viz.xKey) || "Name";
          let yLabel = formatLabel(viz.yKey) || "Sales Value";
          if (yLabel === "Sales Value") yLabel += " (₹)";
          // Pie chart doesn't have axes, but we'll use yLabel for tooltip value.
          setZoneAxisLabels({ x: xLabel, y: yLabel });
          if (viz.title) setZoneChartTitle(viz.title);

          const mappedData = data.visualizations[0].data.map((item: any) => ({
            name: item.name || item.zone,
            value: Number(item.percentage || item.value),
            sales_value: item.sales_value,
          }));
          setZoneData(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch zone sales data:", err);
      } finally {
        setIsZoneLoading(false);
      }
    };
    fetchZoneData();
  }, [
    zoneProductType,
    zoneConstructionType,
    zoneTyreType,
    zoneYear,
    zoneMonth,
  ]);

  const [yearComparisonData, setYearComparisonData] = useState<any[]>([]);
  const [isYearComparisonLoading, setIsYearComparisonLoading] = useState(true);
  const [yearComparisonAxisLabels, setYearComparisonAxisLabels] = useState({
    x: "Month",
    y: "Sales Value (₹)",
  });
  const [yearComparisonTitle, setYearComparisonTitle] = useState("");
  const [yearComparisonZone, setYearComparisonZone] = useState("All");
  const [yearComparisonRegion, setYearComparisonRegion] = useState("All");
  const [yearComparisonMonth, setYearComparisonMonth] = useState("All");
  const [yearComparisonCustomerType, setYearComparisonCustomerType] =
    useState("All");
  const [yearComparisonConstructionType, setYearComparisonConstructionType] =
    useState("All");

  useEffect(() => {
    const fetchYearComparisonData = async () => {
      if (selectedYears.length === 0) return;
      setIsYearComparisonLoading(true);
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        const userId = localStorage.getItem("DAgent_user_id");
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(
          `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.YEAR_WISE_FILTER}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              selected_years: selectedYears,
              selected_zones:
                yearComparisonZone.toLowerCase() === "all"
                  ? ["all"]
                  : [yearComparisonZone],
              selected_regions:
                yearComparisonRegion.toLowerCase() === "all"
                  ? ["all"]
                  : [yearComparisonRegion],
              selected_months:
                yearComparisonMonth.toLowerCase() === "all"
                  ? ["all"]
                  : [yearComparisonMonth],
              selected_customer_types:
                yearComparisonCustomerType.toLowerCase() === "all"
                  ? ["all"]
                  : [yearComparisonCustomerType],
              selected_construction_types:
                yearComparisonConstructionType.toLowerCase() === "all"
                  ? ["all"]
                  : [yearComparisonConstructionType],
            }),
          },
        );
        const data = await response.json();
        if (data && data.visualization) {
          const formatLabel = (key: string) => {
            if (!key) return "";
            return key
              .split("_")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(" ");
          };
          let xLabel = formatLabel(data.xKey) || "Month";
          let yLabel = formatLabel(data.yKey) || "Sales Value";
          if (yLabel === "Sales Value") yLabel += " (₹)";
          setYearComparisonAxisLabels({ x: xLabel, y: yLabel });
          if (data.title) setYearComparisonTitle(data.title);

          const map: any = {};
          data.visualization.forEach((item: any) => {
            let month = item.month
              ? item.month.substring(0, 3).toUpperCase()
              : "";
            if (!map[month]) map[month] = { month };
            map[month][`y${item.year}`] = item.sales_value / 10000000;
            map[month][`sales_value_${item.year}`] = item.sales_value;
          });
          const MONTH_ORDER = [
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC",
          ];
          const pivoted = Object.values(map).sort(
            (a: any, b: any) =>
              MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month),
          );
          setYearComparisonData(pivoted);
        }
      } catch (err) {
        console.error("Failed to fetch year comparison data:", err);
      } finally {
        setIsYearComparisonLoading(false);
      }
    };
    fetchYearComparisonData();
  }, [
    selectedYears,
    yearComparisonZone,
    yearComparisonRegion,
    yearComparisonMonth,
    yearComparisonCustomerType,
    yearComparisonConstructionType,
  ]);

  const [mapYear, setMapYear] = useState("All");
  const [mapMonth, setMapMonth] = useState("All");
  const [mapRegion, setMapRegion] = useState("All");

  const availableYears = apiAvailableYears;

  // Dynamic colors for different years to ensure they are visually distinct
  const yearColors: Record<number, string> = {
    2022: "#3b82f6", // Blue
    2023: "#10b981", // Emerald
    2024: "#8b5cf6", // Violet
    2025: "#f59e0b", // Amber
    2026: "#ef4444", // Red
  };

  const getYearColor = (year: number) => {
    if (yearColors[year]) return yearColors[year];
    const colors = ["#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#a855f7"];
    return colors[year % colors.length];
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
      data: yearComparisonData,
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
          tickFormatter={(val) => `₹${val} Cr`}
        >
          <Label
            value={yearComparisonAxisLabels.y}
            angle={-90}
            position="insideLeft"
            style={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            offset={-10}
          />
        </YAxis>
        <RechartsTooltip
          wrapperStyle={{ zIndex: 1000 }}
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value: any, name: any, props: any) => {
            const yearStr = String(name);
            const originalVal = props.payload[`sales_value_${yearStr}`];
            if (originalVal) {
              return [
                `₹${(Number(originalVal) / 10000000).toFixed(2)} Cr`,
                name,
              ];
            }
            return [`₹${Number(value).toFixed(2)} Cr`, name];
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
              stroke={getYearColor(year)}
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
              stroke={getYearColor(year)}
              fill={getYearColor(year)}
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
            fill={getYearColor(year)}
            name={`${year}`}
            radius={[4, 4, 0, 0]}
            barSize={8}
          />
        ))}
      </BarChart>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        Map Placeholder
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px]">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-4 gap-4">
            <h3 className="text-lg font-bold text-slate-800 whitespace-nowrap">
              India coverage by region
            </h3>
            <div className="flex items-center gap-2 flex-wrap xl:justify-end">
              <select
                value={mapYear}
                onChange={(e) => setMapYear(e.target.value)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer"
              >
                <option value="All">Year: All</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <select
                value={mapMonth}
                onChange={(e) => setMapMonth(e.target.value)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer"
              >
                <option value="All">Month: All</option>
                <option value="Jan">Jan</option>
                <option value="Feb">Feb</option>
                <option value="Mar">Mar</option>
                <option value="Apr">Apr</option>
                <option value="May">May</option>
                <option value="Jun">Jun</option>
                <option value="Jul">Jul</option>
                <option value="Aug">Aug</option>
                <option value="Sep">Sep</option>
                <option value="Oct">Oct</option>
                <option value="Nov">Nov</option>
                <option value="Dec">Dec</option>
              </select>
              <select
                value={mapRegion}
                onChange={(e) => setMapRegion(e.target.value)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer"
              >
                <option value="All">Region: All</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <IndiaCoverageMap
              year={mapYear}
              month={mapMonth}
              region={mapRegion}
            />
          </div>
        </div>
        */}

      {/* YoY Growth Bar Chart 
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
      </div>
      */}

      {/* Year-wise Comparison Filterable Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-slate-800">
            {yearComparisonTitle}
          </h3>

          <div className="flex flex-nowrap items-center gap-3 md:gap-4 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            <FilterSelect label="Zone" value={yearComparisonZone} onChange={(e) => setYearComparisonZone(e.target.value)} options={availableZones} />
            <FilterSelect label="Region" value={yearComparisonRegion} onChange={(e) => setYearComparisonRegion(e.target.value)} options={availableRegions} />
            <FilterSelect label="Month" value={yearComparisonMonth} onChange={(e) => setYearComparisonMonth(e.target.value)} options={availableMonths} />
            <FilterSelect label="Customer Type" value={yearComparisonCustomerType} onChange={(e) => setYearComparisonCustomerType(e.target.value)} options={availableCustomerTypes} />


            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">Years</span>
              <div className="flex items-center gap-1.5 min-h-[32px]">
                {isAvailableYearsLoading ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin mx-2" />
                ) : availableYears.length === 0 ? (
                  <span className="text-xs text-slate-400 mx-2">
                    No years available
                  </span>
                ) : (
                  availableYears.map((year) => {
                    const isSelected = selectedYears.includes(year);
                    return (
                      <button
                        key={year}
                        onClick={() => toggleYear(year)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${isSelected
                          ? "border-yellow-200 bg-yellow-50 text-yellow-700 shadow-sm"
                          : "border-transparent text-slate-500 hover:bg-slate-100"
                          }`}
                      >
                        {year}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setChartType("column")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === "column"
                  ? "bg-yellow-100 text-yellow-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Column
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === "line"
                  ? "bg-yellow-100 text-yellow-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                Line
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === "area"
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
          {isYearComparisonLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : selectedYears.length === 0 ? (
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

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-4 gap-4">
            <h3 className="text-lg font-bold text-slate-800 whitespace-nowrap">
              {zoneChartTitle}
            </h3>
            <div className="flex items-center gap-2 flex-wrap xl:justify-end">
              <FilterSelect label="Year" value={zoneYear} onChange={(e) => setZoneYear(e.target.value)} options={filters.years} />
              <FilterSelect label="Month" value={zoneMonth} onChange={(e) => setZoneMonth(e.target.value)} options={filters.months} />

              <FilterSelect label="Product Type" value={zoneProductType} onChange={(e) => setZoneProductType(e.target.value)} options={filters.categories} />
              <FilterSelect label="Construction Type" value={zoneConstructionType} onChange={(e) => setZoneConstructionType(e.target.value)} options={filters.constructions} />
              <FilterSelect label="Tyre Type" value={zoneTyreType} onChange={(e) => setZoneTyreType(e.target.value)} options={filters.tyreTypes} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {isZoneLoading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneData}
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
                    {zoneData.map((entry, index) => (
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
                    formatter={(value: any, name: any, props: any) => {
                      const salesValue = props.payload.sales_value;
                      if (salesValue) {
                        let val = Number(salesValue);
                        let formatted = `₹${(val / 10000000).toFixed(2)} Cr`;
                        return [
                          `${value}% | ${zoneAxisLabels.y.replace(" (₹)", "")}: ${formatted}`,
                          name,
                        ];
                      }
                      return [`${value}%`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-4 gap-4">
            <h3 className="text-lg font-bold text-slate-800 whitespace-nowrap">
              {tyreChartTitle}
            </h3>
            <div className="flex items-center gap-2 flex-wrap xl:justify-end">
              <FilterSelect label="Year" value={tyreYear} onChange={(e) => setTyreYear(e.target.value)} options={availableYears} />

              <FilterSelect label="Zone" value={tyreZone} onChange={(e) => setTyreZone(e.target.value)} options={availableZones} />
              <FilterSelect label="Region" value={tyreRegion} onChange={(e) => setTyreRegion(e.target.value)} options={availableRegions} />

              <FilterSelect label="Customer Category" value={tyreCustomerCategory} onChange={(e) => setTyreCustomerCategory(e.target.value)} options={availableCustomerTypes} />

              <FilterSelect label="Construction Type" value={tyreConstructionType} onChange={(e) => setTyreConstructionType(e.target.value)} options={availableConstructionTypes} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {isTyreLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tyreData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 20 }}
                >
                  <CartesianGrid
                    vertical={true}
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    padding={{ left: 1 }}
                    tick={{ fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => (val === 0 ? "₹0" : `₹${val} Cr`)}
                  >
                    <Label
                      value={tyreAxisLabels.x}
                      offset={5}
                      position="bottom"
                      style={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                    />
                  </XAxis>
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#334155", fontWeight: 700 }}
                    axisLine={{ stroke: "#475569", strokeWidth: 1 }}
                    tickLine={false}
                    tickMargin={10}
                    width={100}
                  >
                    <Label
                      value={tyreAxisLabels.y}
                      angle={-90}
                      position="insideLeft"
                      style={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                      offset={-10}
                    />
                  </YAxis>
                  <RechartsTooltip
                    wrapperStyle={{ zIndex: 1000 }}
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any, name: any, props: any) => {
                      const salesValue = props.payload.sales_value;
                      if (salesValue) {
                        let val = Number(salesValue);
                        let formatted = `₹${(val / 10000000).toFixed(2)} Cr`;
                        return [
                          formatted,
                          tyreAxisLabels.x.replace(" (₹)", ""),
                        ];
                      }
                      return [
                        `₹${Number(value).toFixed(2)} Cr`,
                        tyreAxisLabels.x.replace(" (₹)", ""),
                      ];
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                    {tyreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
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
    name: "Year-wise Comparison",
    icon: BarChart3,
    color: "text-violet-500 bg-violet-50",
  },
  {
    id: "zone",
    name: "Sales by Zone",
    icon: PieChartIcon,
    color: "text-amber-500 bg-amber-50",
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
    id: "tyre",
    name: "Tyre Sales",
    icon: BarChart2,
    color: "text-emerald-500 bg-emerald-50",
  },
];

// Individual graph renderers for the side panel
const IndiaMapGraph = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState("All");
  const [month, setMonth] = useState("All");
  const [region, setRegion] = useState("All");

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "india-coverage-map.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download chart", err);
    }
  };

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full"
    >
      <div className="flex flex-col mb-4 gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-800">
            India coverage by region
          </h3>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center p-1.5 md:p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
            title="Download Graph"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="All">Year: All</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="All">Month: All</option>
            <option value="Jan">Jan</option>
            <option value="Feb">Feb</option>
            <option value="Mar">Mar</option>
            <option value="Apr">Apr</option>
            <option value="May">May</option>
            <option value="Jun">Jun</option>
            <option value="Jul">Jul</option>
            <option value="Aug">Aug</option>
            <option value="Sep">Sep</option>
            <option value="Oct">Oct</option>
            <option value="Nov">Nov</option>
            <option value="Dec">Dec</option>
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="All">Region: All</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <IndiaCoverageMap year={year} month={month} region={region} />
      </div>
    </div>
  );
};

const YoYGrowthGraph = () => {
  const chartRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]"
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
};

const ZonePieGraph = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [productType, setProductType] = useState("All");
  const [constructionType, setConstructionType] = useState("All");
  const [tyreType, setTyreType] = useState("All");

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "zone-sales-graph.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download chart", err);
    }
  };

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]"
    >
      <div className="flex flex-col mb-4 gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-800">Sales by Zone</h3>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center p-1.5 md:p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
            title="Download Graph"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="All">Product Type: All</option>
            <option value="Type A">Type A</option>
            <option value="Type B">Type B</option>
          </select>
          <select
            value={constructionType}
            onChange={(e) => setConstructionType(e.target.value)}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="All">Construction Type: All</option>
            <option value="Radial">Radial</option>
            <option value="Bias">Bias</option>
          </select>
          <select
            value={tyreType}
            onChange={(e) => setTyreType(e.target.value)}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="All">Tyre Type: All</option>
            <option value="TRUCK">TRUCK</option>
            <option value="CAR">CAR</option>
            <option value="LCV">LCV</option>
            <option value="Motor Cycle">Motor Cycle</option>
            <option value="SCV">SCV</option>
            <option value="TRACTOR REAR">TRACTOR REAR</option>
            <option value="OTR">OTR</option>
            <option value="SCOOTER">SCOOTER</option>
          </select>
        </div>
      </div>
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
};

const TyreSalesGraph = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tyreData, setTyreData] = useState(dummyTyreData);

  useEffect(() => {
    const fetchTyreData = async () => {
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        const userId = localStorage.getItem("DAgent_user_id");
        const response = await fetch(
          `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.TYRE_SALES_DATA}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              question: "Top 10 Tyre Types by Sales ",
              user_id: userId,
            }),
          },
        );
        const data = await response.json();
        if (
          data.status === "success" &&
          data.visualizations &&
          data.visualizations[0] &&
          data.visualizations[0].data
        ) {
          const mappedData = data.visualizations[0].data.map((item: any) => ({
            name: item.category,
            value: Number(item.sales_value),
          }));
          setTyreData(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch tyre sales data:", err);
      }
    };
    fetchTyreData();
  }, []);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "tyre-sales-graph.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download chart", err);
    }
  };

  return (
    <div
      ref={chartRef}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]"
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-bold text-slate-800">
          Top 10 Tyre Types by Sales
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center p-1.5 md:p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          title="Download Graph"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={tyreData}
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
              tickFormatter={(val) => val}
            >
              <Label
                value="Sales Value"
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
            >
              <Label
                value="Tyre Type"
                angle={-90}
                position="insideLeft"
                style={{ fill: "#64748b", fontSize: 11 }}
              />
            </YAxis>
            <RechartsTooltip
              wrapperStyle={{ zIndex: 1000 }}
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(val: number) => [val, "Sales"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
              {tyreData.map((entry, index) => (
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
};

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
        {/* <h3 className="text-base font-bold text-slate-800 whitespace-nowrap">
          Year-wise comparison
        </h3> */}
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

          <div className="text-slate-300 text-xs hidden sm:block">|</div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center p-1.5 md:p-2 rounded-lg transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
          title="Download Graph"
        >
          <Download className="w-5 h-5" />
        </button>
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
