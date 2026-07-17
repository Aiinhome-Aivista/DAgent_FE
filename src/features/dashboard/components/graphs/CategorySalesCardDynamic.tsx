import React, { useState, useEffect } from "react";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";
import { useSessionId } from "./dashboardHooks";

export const CategorySalesCardDynamic = () => {
  const [data, setData] = useState<any[]>([]);
  const sessionId = useSessionId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(`${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.CATEGORY_SALES}?session_id=${sessionId}`);
        const json = await response.json();
        
        if (json.status === "success" && json.data) {
          const formattedData = json.data.map((item: any) => ({
            title: item.category,
            value: `${item.total_sales_cr} Cr`
          }));
          setData(formattedData);
        }
      } catch (e) {
        console.error("Error fetching category sales", e);
      }
    };
    fetchData();
  }, [sessionId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Category Sales
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="bg-slate-100 rounded-md p-4 flex flex-col items-center justify-center gap-2">
              <span className="font-bold text-slate-800">{item.title}</span>
              <div className="bg-white rounded-md w-full px-3 py-1 border border-slate-200 text-center">
                <span className="text-slate-600 text-sm font-medium">{item.value}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-slate-500 py-8">
            No category sales data available.
          </div>
        )}
      </div>
    </div>
  );
};
