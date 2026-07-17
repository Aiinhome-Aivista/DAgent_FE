import React, { useState, useEffect } from "react";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";
import { useSessionId } from "./dashboardHooks";

const fallbackData = [
  { title: "Dealer", value: "192.57 (58 %)" },
  { title: "Fleets", value: "29.45 (9 %)" },
  { title: "Distribution", value: "10.97 (3 %)" },
  { title: "Brand Shops", value: "79.48 (24 %)" },
];

export const AccountCategorySalesCardDynamic = () => {
  const [data, setData] = useState<any[]>(fallbackData);
  const sessionId = useSessionId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(`${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.SALES_BY_ACCOUNT_CATEGORY}?session_id=${sessionId}`);
        const json = await response.json();
        
        if (json.status === "success" && json.data) {
          // Calculate total for percentage
          const totalSales = json.data.reduce((sum: number, item: any) => sum + (parseFloat(item.saleValueCr) || 0), 0);
          
          const mappedData = json.data.map((item: any) => {
            const val = parseFloat(item.saleValueCr) || 0;
            const pct = totalSales > 0 ? ((val / totalSales) * 100).toFixed(0) : 0;
            return {
              title: item.category_name,
              value: `${val.toFixed(2)} (${pct} %)`
            };
          });
          
          if (mappedData.length > 0) {
            setData(mappedData);
          }
        }
      } catch (e) {
        console.error("Error fetching account category sales", e);
      }
    };
    fetchData();
  }, [sessionId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Actual Sales by Account Category (Cr)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-orange-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4"
          >
            <span className="font-bold text-slate-800">{item.title}</span>
            <span className="text-slate-800 text-2xl font-normal text-center">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
