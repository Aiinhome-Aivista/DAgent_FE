import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { defaultConfig } from "@/src/services/api.config";

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
