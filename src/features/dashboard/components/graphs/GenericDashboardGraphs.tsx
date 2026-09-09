import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, ChevronUp, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuthContext } from "../../../../context/AuthContext";
import { chatHistoryService } from "../../../../services/chatHistory.service";
import { formatChatMessage } from "../../../../utils/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

const formatInlineMarkdown = (text: string) => {
  if (!text) return "";
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  escaped = escaped.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold text-[var(--text-primary)]">$1</strong>',
  );

  escaped = escaped.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  return escaped;
};

const cleanParagraphText = (text: string) => {
  if (!text) return "";
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^\*\*([\s\S]*?)\*\*\.?$/, "$1");
  cleaned = cleaned.replace(/^\*([\s\S]*?)\*\.?$/, "$1");
  if (text.trim().endsWith(".") && !cleaned.endsWith(".")) {
    cleaned += ".";
  }
  return cleaned.trim();
};

const parseSessionData = (session: any) => {
  try {
    const history = session.querySessionHistory;
    if (!Array.isArray(history) || history.length === 0) return null;

    const sessionName = session.querySessionName || "";
    const firstTurn = history.find((turn: any) => turn.answer);
    if (!firstTurn || !firstTurn.answer) return null;

    const rawAnswer = firstTurn.answer;
    const lines = rawAnswer.split("\n").map((l: string) => l.trim());

    let title = "";
    let titleIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      if (line.toLowerCase().startsWith("title:") || line.startsWith("#")) {
        title = line.replace(/^(#+\s*|title:\s*)/i, "").trim();
        titleIndex = i;
        break;
      }
    }

    if (!title && lines.length > 0) {
      const firstLineIdx = lines.findIndex((l) => l.length > 0);
      if (firstLineIdx !== -1) {
        title = lines[firstLineIdx].replace(/^(#+\s*|title:\s*)/i, "").trim();
        titleIndex = firstLineIdx;
      }
    }

    if (title) title = title.replace(/^\*\*|\*\*$/g, "").trim();
    else title = "Generic Data Analysis Summary";

    const sections: Record<string, string[]> = {
      "Executive Summary": [],
      "Key Insights": [],
      "Actionable Recommendations": [],
    };

    const sectionTitles: Record<string, string> = {
      "Executive Summary": "Executive Summary",
      "Key Insights": "Key Insights",
      "Actionable Recommendations": "Actionable Recommendations",
    };

    let currentSection = "Executive Summary";

    for (let i = 0; i < lines.length; i++) {
      if (i === titleIndex) continue;
      const line = lines[i];
      if (!line) continue;

      const summaryMatch = line.match(/^(?:\*\*|#+\s*)?((?:Executive\s+Summary|Summary))(?:\*\*)?:?\s*(.*)/i);
      const insightsMatch = line.match(/^(?:\*\*|#+\s*)?((?:Key\s+Business\s+Insights|Key\s+Insights|Business\s+Insights|Insights))(?:\*\*)?:?\s*(.*)/i);
      const recsMatch = line.match(/^(?:\*\*|#+\s*)?((?:Actionable\s+Recommendations|Actionable\s+Recommendation|Recommendations))(?:\*\*)?:?\s*(.*)/i);

      if (summaryMatch) {
        currentSection = "Executive Summary";
        if (summaryMatch[1].trim()) sectionTitles[currentSection] = summaryMatch[1].trim();
        if (summaryMatch[2].trim()) sections[currentSection].push(summaryMatch[2].trim());
        continue;
      }

      if (insightsMatch) {
        currentSection = "Key Insights";
        if (insightsMatch[1].trim()) sectionTitles[currentSection] = insightsMatch[1].trim();
        if (insightsMatch[2].trim()) sections[currentSection].push(insightsMatch[2].trim());
        continue;
      }

      if (recsMatch) {
        currentSection = "Actionable Recommendations";
        if (recsMatch[1].trim()) sectionTitles[currentSection] = recsMatch[1].trim();
        if (recsMatch[2].trim()) sections[currentSection].push(recsMatch[2].trim());
        continue;
      }

      sections[currentSection].push(line);
    }

    return { title, sections, sectionTitles };
  } catch (e) {
    console.error("Error parsing session data:", e);
    return null;
  }
};

const GenericSummaryCard = ({ parsedData }: { parsedData: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!parsedData) return null;

  const { title, sections, sectionTitles } = parsedData;
  const execSummary = sections["Executive Summary"] || [];
  const keyInsights = sections["Key Insights"] || [];
  const recommendations = sections["Actionable Recommendations"] || [];

  return (
    <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all duration-300 hover:shadow-md mb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-base leading-snug">
            {title}
          </h3>
        </div>
      </div>

      <div className="pl-12 -mt-1 z-10">
        <div className="flex flex-col gap-1.5">
          {!isExpanded ? (
            <div className="flex items-end justify-between gap-4">
              <div
                className="text-slate-600 text-sm leading-relaxed font-normal line-clamp-2 flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatChatMessage(execSummary.map(cleanParagraphText).join("\n\n"), true),
                }}
              />
              <button
                onClick={() => setIsExpanded(true)}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer focus:outline-none mb-0.5"
              >
                Read More
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div
                className="flex flex-col gap-2 text-slate-600 text-sm leading-relaxed font-normal"
                dangerouslySetInnerHTML={{
                  __html: formatChatMessage(execSummary.map(cleanParagraphText).join("\n\n"), true)
                }}
              />

              {keyInsights.length > 0 && (
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {sectionTitles["Key Insights"] || "Key Insights"}
                    </span>
                  </div>
                  <div
                    className="flex flex-col gap-2 mt-1.5 pl-1 text-slate-600 text-sm leading-relaxed font-normal"
                    dangerouslySetInnerHTML={{
                      __html: formatChatMessage(keyInsights.join("\n"), true)
                    }}
                  />
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Zap className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {sectionTitles["Actionable Recommendations"] || "Actionable Recommendations"}
                    </span>
                  </div>
                  <div
                    className="flex flex-col gap-2 mt-1.5 pl-1 text-slate-600 text-sm leading-relaxed font-normal"
                    dangerouslySetInnerHTML={{
                      __html: formatChatMessage(recommendations.join("\n"), true)
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors self-end mt-2 cursor-pointer focus:outline-none"
              >
                Show Less <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};

interface GenericDashboardGraphsProps {
  sessionId?: string;
}

export const GenericDashboardGraphs: React.FC<GenericDashboardGraphsProps> = ({ sessionId }) => {
  const { userId } = useAuthContext();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId || !userId) return;
      setIsLoading(true);
      try {
        const response = await chatHistoryService.getSessionChatHistory(sessionId, userId);
        setData(response);
      } catch (err) {
        console.error("Failed to fetch generic dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId, userId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 gap-4 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p>Loading generic dashboard visualizations...</p>
      </div>
    );
  }

  if (!data || !data.querySessions) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
        No dashboard data available. Select a session.
      </div>
    );
  }

  const defaultSession = data.querySessions.find((s: any) => s.querySessionName && s.querySessionName.toLowerCase().startsWith("default_"));
  const parsedSummary = defaultSession ? parseSessionData(defaultSession) : null;

  const visualizations: any[] = [];
  data.querySessions.forEach((session: any) => {
    session.querySessionHistory?.forEach((history: any) => {
      if (history.visualizations && Array.isArray(history.visualizations)) {
        visualizations.push(...history.visualizations);
      }
    });
  });

  const renderVisualization = (viz: any, index: number) => {
    let formattedData = viz.data;
    if (viz.type !== 'table' && viz.data) {
      formattedData = viz.data.map((item: any) => {
        const keys = Object.keys(item);
        if (keys.length === 1) {
          return { name: keys[0], value: item[keys[0]] };
        }
        return item;
      });
    }

    if (viz.type === 'table') {
      return (
        <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-base">{viz.title}</h3>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '350px' }}>
            {viz.columns && viz.data && (
              <table className="w-full text-[10px] border-collapse min-w-max bg-white">
                <tbody>
                  {/* Since we don't have merged cells logic, we just render normally but match the visual style */}
                  <tr className="sticky top-0 z-10 hover:bg-slate-50 transition-colors bg-[#f8fafc]">
                    {viz.columns.map((col: any, i: number) => (
                      <td key={i} className="border border-slate-300 px-2 py-1.5 whitespace-nowrap text-slate-700 font-bold text-left">
                        {col.label}
                      </td>
                    ))}
                  </tr>
                  {viz.data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors bg-white">
                      {viz.columns.map((col: any, j: number) => {
                        const val = String(row[col.key] || '');
                        const isNum = !isNaN(Number(val.replace(/,/g, ''))) && val !== '';
                        const isPct = val.includes('%');
                        let tdClass = "border border-slate-300 px-2 py-1.5 whitespace-nowrap text-slate-700 ";
                        if (isNum || isPct) tdClass += "text-right font-mono ";
                        else tdClass += "text-left ";
                        if (isPct) tdClass += "text-indigo-700 font-semibold ";

                        return (
                          <td key={j} className={tdClass.trim()}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 flex flex-col min-h-[400px] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-6">
          <h3 className="text-slate-800 font-bold text-lg text-left">
            {viz.title}
          </h3>
        </div>
        
        <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
          {viz.type === 'bar_chart' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 20, right: 20, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: "#CBD5E1" }} 
                  tickLine={false} 
                  tick={{ fill: "#64748B", fontSize: 10, dy: 10 }} 
                />
                <YAxis 
                  axisLine={{ stroke: "#0EA5E9" }} 
                  tickLine={{ stroke: "#0EA5E9" }} 
                  tick={{ fill: "#64748B", fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" fill="#0EA5E9" barSize={40} radius={[4, 4, 0, 0]}>
                  {formattedData.map((entry: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {viz.type === 'pie_chart' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={formattedData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={120} 
                  fill="#8884d8" 
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={true}
                  stroke="none"
                >
                  {formattedData.map((entry: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  wrapperStyle={{ zIndex: 1000 }}
                  contentStyle={{ backgroundColor: "#ffffff", borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col gap-3">
        {parsedSummary && <GenericSummaryCard parsedData={parsedSummary} />}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {visualizations.map((viz, i) => renderVisualization(viz, i))}
      </div>
      
      {visualizations.length === 0 && !parsedSummary && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 min-h-[300px]">
          <p>No visualizations available in this workspace yet.</p>
        </div>
      )}
    </div>
  );
};
