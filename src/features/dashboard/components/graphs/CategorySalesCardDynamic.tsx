import React, { useState, useEffect } from "react";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";
import { useSessionId } from "./dashboardHooks";

import { Loader2 } from "lucide-react";

export const CategorySalesCardDynamic = ({ zone }: { zone?: string | null }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sessionId = useSessionId();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!sessionId || sessionId === "null") {
          setIsLoading(false);
          return;
        }
        const url = `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.CATEGORY_SALES}?session_id=${sessionId}${zone ? `&zone=${encodeURIComponent(zone)}` : ''}`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.status === "success" && json.data) {
          const formattedData = json.data.map((item: any) => ({
            title: item.category,
            value: `${item.total_sales_cr} Cr`
          }));
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (e) {
        console.error("Error fetching category sales", e);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [sessionId, zone]);

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-6 flex flex-col h-full min-h-[280px] justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 font-extrabold text-base tracking-tight">
          Category Sales
        </h3>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        ) : data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 w-full">
            {data.map((item, index) => (
              <div
                key={index}
                className="bg-indigo-50/70 border border-indigo-100/60 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 transition-all hover:bg-indigo-50"
              >
                <span className="text-slate-500 text-xs font-bold text-center">
                  {item.title}
                </span>
                <span className="text-slate-900 font-black text-base tracking-tight">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-slate-400 font-medium text-sm">
            No category sales data available.
          </span>
        )}
      </div>
    </div>
  );
};
