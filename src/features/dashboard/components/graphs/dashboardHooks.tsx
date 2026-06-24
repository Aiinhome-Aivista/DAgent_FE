import React, { useState, useEffect } from "react";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";

export const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  defaultLabel = "All",
}: {
  label: string;
  value: string | number;
  onChange: (e: any) => void;
  options: (string | number)[];
  defaultLabel?: string;
}) => (
  <div
    className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-colors focus-within:border-slate-300 focus-within:shadow-sm"
    style={{ minWidth: "130px", flexShrink: 0 }}
  >
    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
      {label}:
    </span>
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

export const useDashboardFilters = () => {
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

export const useAvailableYears = () => {
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
