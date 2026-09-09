import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../../context/AuthContext";
import { chatHistoryService } from "../../../../services/chatHistory.service";
import { RefreshCw } from "lucide-react";

interface GenericDashboardKPIsProps {
  sessionId?: string;
}

export const GenericDashboardKPIs: React.FC<GenericDashboardKPIsProps> = ({ sessionId }) => {
  const { userId } = useAuthContext();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!sessionId || !userId) return;
    setIsLoading(true);
    try {
      const response = await chatHistoryService.getSessionChatHistory(sessionId, userId);
      setData(response);
    } catch (err) {
      console.error("Failed to fetch generic KPIs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sessionId, userId]);

  const handleRefresh = () => {
    fetchData();
  };

  const renderSkeleton = () => (
    <div className="flex flex-col gap-2 w-full flex-1 min-h-0 overflow-y-auto pr-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-[14px] rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 shrink-0"
        >
          <div className="h-2.5 bg-slate-200 rounded w-24 mt-1 animate-pulse"></div>
          <div className="min-w-0">
            <div className="h-5 bg-slate-200 rounded w-20 my-1 animate-pulse"></div>
            <div className="h-2 bg-slate-100 rounded w-28 mt-1 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  let metrics = [];
  if (data && data.querySessions) {
    let totalVisualizations = 0;
    let totalQuestions = 0;
    
    data.querySessions.forEach((session: any) => {
      totalQuestions += session.querySessionHistory?.length || 0;
      session.querySessionHistory?.forEach((history: any) => {
        if (history.visualizations) {
          totalVisualizations += history.visualizations.length;
        }
      });
    });

    metrics = [
      {
        label: "Visualizations",
        value: totalVisualizations.toString(),
        subtext: "Charts and tables generated"
      },
      {
        label: "Questions Analyzed",
        value: totalQuestions.toString(),
        subtext: "Total queries processed"
      }
    ];
  }

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
      ) : !data || !data.querySessions ? (
        <div className="flex flex-col gap-2 w-full flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="text-center text-xs text-slate-400 py-4">
            No metrics available
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white p-[14px] rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center gap-1.5 shrink-0"
            >
              <p
                className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 truncate"
                title={metric.label}
              >
                {metric.label}
              </p>
              <div className="min-w-0">
                <h3 className="text-[1.1rem] font-black text-slate-700 leading-tight my-0.5 uppercase truncate">
                  {metric.value}
                </h3>
                <p className="text-[9px] text-slate-400 mt-0.5 truncate" title={metric.subtext}>
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
