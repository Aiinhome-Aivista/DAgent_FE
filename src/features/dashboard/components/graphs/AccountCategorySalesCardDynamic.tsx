import React, { useState, useEffect } from "react";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";
import { useSessionId } from "./dashboardHooks";

import { Loader2 } from "lucide-react";

export const AccountCategorySalesCardDynamic = ({ zone }: { zone?: string | null }) => {
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
        const url = `${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.SALES_BY_ACCOUNT_CATEGORY}?session_id=${sessionId}${zone ? `&zone=${encodeURIComponent(zone)}` : ''}`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.status === "success" && json.data) {
          const mappedData = json.data.map((item: any) => ({
            title: item.title,
            value: item.value
          }));
          if (mappedData.length > 0) {
            setData(mappedData);
          } else {
            setData([]);
          }
        } else {
          setData([]);
        }
      } catch (e) {
        console.error("Error fetching account category sales", e);
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
          Actual Sales by Account Category (Cr)
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
                className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 transition-all hover:bg-amber-100/50"
              >
                <span className="text-amber-900 text-xs font-bold text-center">
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
            No account category sales data available.
          </span>
        )}
      </div>
    </div>
  );
};
