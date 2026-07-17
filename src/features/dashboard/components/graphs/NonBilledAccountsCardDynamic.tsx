import React, { useState, useEffect } from "react";
import { defaultConfig, API_ENDPOINTS } from "@/src/services/api.config";
import { useSessionId } from "./dashboardHooks";

const fallbackData = [
  { title: "Dealer", value: "22%" },
  { title: "Fleets", value: "44%" },
  { title: "Distribution", value: "18%" },
  { title: "Brand Shops", value: "7%" },
];

export const NonBilledAccountsCardDynamic = () => {
  const [data, setData] = useState<any[]>(fallbackData);
  const sessionId = useSessionId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!sessionId || sessionId === "null") return;
        const response = await fetch(`${defaultConfig.baseUrl}${API_ENDPOINTS.DASHBOARD.NON_BILLED_ACCOUNTS}?session_id=${sessionId}`);
        const json = await response.json();
        
        if (json.status === "success" && json.data) {
          const mappedData = json.data.map((item: any) => ({
            title: item.category_name,
            value: `${parseFloat(item.nonBilledPct).toFixed(0)}%`
          }));
          
          if (mappedData.length > 0) {
            setData(mappedData);
          }
        }
      } catch (e) {
        console.error("Error fetching non billed accounts", e);
      }
    };
    fetchData();
  }, [sessionId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
        <h3 className="text-slate-800 font-bold text-lg text-left">
          Non Billed Accounts %
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-yellow-400 rounded-xl p-6 flex flex-col items-center justify-center gap-4"
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
