import React, { useState, useEffect } from "react";
import { chatHistoryService } from "../../../../services/chatHistory.service";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { YearComparisonChartDynamic } from "./YearComparisonChartDynamic";
import { ZonePieChartDynamic } from "./ZonePieChartDynamic";
import { TyreSalesChartDynamic } from "./TyreSalesChartDynamic";
import { YoYGrowthGraph } from "./YoYGrowthGraph";
import { IndiaMapGraph } from "./IndiaCoverageMap";
import { PlanVsSaleChartDynamic } from "./PlanVsSaleChartDynamic";
import { CategorySalesCardDynamic } from "./CategorySalesCardDynamic";
import { AccountCategorySalesCardDynamic } from "./AccountCategorySalesCardDynamic";
import { NonBilledAccountsCardDynamic } from "./NonBilledAccountsCardDynamic";
import { OverduePieChartDynamic } from "./OverduePieChartDynamic";
import { ExposureCardDynamic } from "./ExposureCardDynamic";

const formatInlineMarkdown = (text: string) => {
  if (!text) return "";
  // Escape HTML tags to prevent custom injected script tags, but allow our bolding
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Replace **text** with a bold tag matching theme primary text
  escaped = escaped.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold text-[var(--text-primary)]">$1</strong>',
  );

  // Replace *text* with an italic tag
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  return escaped;
};

const cleanParagraphText = (text: string) => {
  if (!text) return "";
  let cleaned = text.trim();

  // Strip outer double asterisks, allowing an optional trailing period
  cleaned = cleaned.replace(/^\*\*([\s\S]*?)\*\*\.?$/, "$1");
  // Also strip outer single asterisks
  cleaned = cleaned.replace(/^\*([\s\S]*?)\*\.?$/, "$1");

  // If the original text ended with a period, ensure we keep a period at the end
  if (text.trim().endsWith(".") && !cleaned.endsWith(".")) {
    cleaned += ".";
  }
  return cleaned.trim();
};

const parseSessionData = (session: any) => {
  try {
    const history = session.querySessionHistory;
    if (!Array.isArray(history) || history.length === 0) {
      return null;
    }

    const sessionName = session.querySessionName || "";

    // Find the first turn with an assistant answer
    const firstTurn = history.find((turn: any) => turn.answer);
    if (!firstTurn || !firstTurn.answer) {
      return null;
    }

    const rawAnswer = firstTurn.answer;
    const lines = rawAnswer.split("\n").map((l: string) => l.trim());
    
    let title = "";
    let titleIndex = -1;

    // Try to find a title line
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
        const line = lines[firstLineIdx];
        const lower = line.toLowerCase();
        if (
          !lower.includes("executive summary") &&
          !lower.includes("insight") &&
          !lower.includes("recommendation")
        ) {
          title = line.replace(/^(#+\s*|title:\s*)/i, "").trim();
          titleIndex = firstLineIdx;
        }
      }
    }

    if (title) {
      title = title.replace(/^\*\*|\*\*$/g, "").trim();
    } else {
      title = "Regional Tyre and Tube Sales Performance Analysis";
    }

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

      const summaryMatch = line.match(
        /^(?:\*\*|#+\s*)?((?:Executive\s+Summary|Summary))(?:\*\*)?:?\s*(.*)/i,
      );
      const insightsMatch = line.match(
        /^(?:\*\*|#+\s*)?((?:Key\s+Business\s+Insights|Key\s+Insights|Business\s+Insights|Insights))(?:\*\*)?:?\s*(.*)/i,
      );
      const recsMatch = line.match(
        /^(?:\*\*|#+\s*)?((?:Actionable\s+Recommendations|Actionable\s+Recommendation|Recommendations))(?:\*\*)?:?\s*(.*)/i,
      );

      if (summaryMatch) {
        currentSection = "Executive Summary";
        const titleText = summaryMatch[1].trim();
        const content = summaryMatch[2].trim();
        if (titleText) {
          sectionTitles[currentSection] = titleText;
        }
        if (content) {
          sections[currentSection].push(content);
        }
        continue;
      }

      if (insightsMatch) {
        currentSection = "Key Insights";
        const titleText = insightsMatch[1].trim();
        const content = insightsMatch[2].trim();
        if (titleText) {
          sectionTitles[currentSection] = titleText;
        }
        if (content) {
          sections[currentSection].push(content);
        }
        continue;
      }

      if (recsMatch) {
        currentSection = "Actionable Recommendations";
        const titleText = recsMatch[1].trim();
        const content = recsMatch[2].trim();
        if (titleText) {
          sectionTitles[currentSection] = titleText;
        }
        if (content) {
          sections[currentSection].push(content);
        }
        continue;
      }

      sections[currentSection].push(line);
    }

    // Try to extract a quarter badge if it exists in the title (e.g. Q2 2026)
    const quarterMatch =
      title.match(/(Q\d\s+\d{4})/i) ||
      title.match(/(Q\d-\d{4})/i) ||
      title.match(/(Q\d\s+FY\d{2,4})/i);
    const timeBadge = quarterMatch ? quarterMatch[0] : "Q2 2026";

    let displayBadge = "Summary Report";
    if (sessionName) {
      if (sessionName.startsWith("default_")) {
        displayBadge = "Default Summary";
      } else {
        displayBadge = sessionName;
      }
    }

    return {
      title,
      sections,
      sectionTitles,
      badge: displayBadge,
      timeBadge,
    };
  } catch (e) {
    console.error("Error parsing query session data:", e);
    return null;
  }
};

const renderSectionItems = (items: string[]) => {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-1.5 pl-1">
      {items.map((item, idx) => {
        let text = item.trim();
        if (!text) return null;

        // Match bullet lists (- or * or •)
        const isBullet =
          text.startsWith("-") || text.startsWith("*") || text.startsWith("•");
        // Match numbered lists (1. or 2.)
        const isNumbered = /^\d+\.\s/.test(text);

        if (isBullet) {
          const content = text.replace(/^[-*•]\s+/, "").trim();
          return (
            <div
              key={idx}
              className="flex items-start gap-1.5 pl-4 text-slate-600 text-sm leading-relaxed"
            >
              <span className="mr-1 select-none text-slate-800 font-bold">
                •
              </span>
              <p
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(content),
                }}
              />
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = text.match(/^(\d+)\.\s+/);
          const num = numMatch ? numMatch[1] : (idx + 1).toString();
          const content = text.replace(/^\d+\.\s+/, "").trim();
          return (
            <div
              key={idx}
              className="flex items-start gap-1.5 pl-4 text-slate-600 text-sm leading-relaxed"
            >
              <span className="mr-1 font-semibold text-indigo-500 w-4 text-right shrink-0">
                {num}.
              </span>
              <p
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(content),
                }}
              />
            </div>
          );
        }

        // Standard paragraph
        return (
          <p
            key={idx}
            className="text-slate-600 text-sm leading-relaxed pl-6"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }}
          />
        );
      })}
    </div>
  );
};

const SummaryCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchDefaultSession = async () => {
      setLoading(true);
      try {
        const sessionId = localStorage.getItem("DAgent_session_id");
        const userIdStr = localStorage.getItem("DAgent_user_id");
        if (!sessionId || !userIdStr) {
          if (active) {
            setParsedData(null);
            setLoading(false);
          }
          return;
        }
        const userId = parseInt(userIdStr, 10);
        
        const response = await chatHistoryService.getSessionChatHistory(sessionId, userId);
        if (response && response.status === "success" && response.querySessions) {
          // Find the default session (name starts with "default_")
          const defaultSession = response.querySessions.find(
            (s: any) => s.querySessionName && s.querySessionName.toLowerCase().startsWith("default_")
          );
          
          if (defaultSession) {
            const data = parseSessionData(defaultSession);
            if (active) {
              setParsedData(data);
            }
          } else {
            if (active) setParsedData(null);
          }
        } else {
          if (active) setParsedData(null);
        }
      } catch (err) {
        console.error("Failed to load default query session:", err);
        if (active) setParsedData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDefaultSession();

    const handleSessionUpdate = () => {
      fetchDefaultSession();
    };

    window.addEventListener("session-id-updated", handleSessionUpdate);
    window.addEventListener("storage", handleSessionUpdate);

    return () => {
      active = false;
      window.removeEventListener("session-id-updated", handleSessionUpdate);
      window.removeEventListener("storage", handleSessionUpdate);
    };
  }, []);

  if (loading && !parsedData) {
    return null;
  }

  if (!parsedData) return null;

  const { title, sections, sectionTitles, badge, timeBadge } = parsedData;
  const execSummary = sections["Executive Summary"] || [];
  const keyInsights = sections["Key Insights"] || [];
  const recommendations = sections["Actionable Recommendations"] || [];

  return (
    <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all duration-300 hover:shadow-md">
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

      <div className="pl-12 -mt-1">
        <div className="flex flex-col gap-1.5">
          {!isExpanded ? (
            <div className="flex items-end justify-between gap-4">
              <p
                className="text-slate-600 text-sm leading-relaxed font-normal line-clamp-2 flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineMarkdown(
                    execSummary
                      .map((para) => cleanParagraphText(para))
                      .join(" "),
                  ),
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
              {/* Executive Summary Paragraphs */}
              <div className="flex flex-col gap-2">
                {execSummary.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-slate-600 text-sm leading-relaxed font-normal"
                    dangerouslySetInnerHTML={{
                      __html: formatInlineMarkdown(cleanParagraphText(para)),
                    }}
                  />
                ))}
              </div>

              {/* Key Insights Section */}
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
                  {renderSectionItems(keyInsights)}
                </div>
              )}

              {/* Actionable Recommendations Section */}
              {recommendations.length > 0 && (
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Zap className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {sectionTitles["Actionable Recommendations"] ||
                        "Actionable Recommendations"}
                    </span>
                  </div>
                  {renderSectionItems(recommendations)}
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

      {/* Subtle decorative glow in the background */}
      <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};

export const DashboardGraphs = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const getZoneFullName = (zone: string) => {
    const map: Record<string, string> = {
      'WZ': 'West Zone',
      'EZ': 'East Zone',
      'NZ': 'North Zone',
      'SZ': 'South Zone',
      'CZ': 'Central Zone'
    };
    return map[zone.toUpperCase()] || zone;
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("zone-changed", { detail: selectedZone }));
  }, [selectedZone]);

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden">
      {selectedZone && (
        <div className="flex items-center justify-center relative py-2">
          <h2 className="text-2xl font-bold text-slate-700 font-serif">
            Sales Dashboard - {getZoneFullName(selectedZone)}
          </h2>
          <button 
            onClick={() => setSelectedZone(null)}
            className="absolute right-4 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear Filter"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Executive Summary Card */}
        <SummaryCard />

        {/* Plan vs Sale & Achievement */}
        <PlanVsSaleChartDynamic onZoneClick={(zone) => setSelectedZone(zone)} />

        {/* Year-wise Comparison Filterable Chart */}
        <YearComparisonChartDynamic zone={selectedZone} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Sales by Zone */}
        <ZonePieChartDynamic zone={selectedZone} />

        {/* Top 10 Tyre Types by Sales */}
        <TyreSalesChartDynamic zone={selectedZone} />
        
        {/* Category Sales */}
        <CategorySalesCardDynamic zone={selectedZone} />

        {/* Actual Sales by Account Category */}
        <AccountCategorySalesCardDynamic zone={selectedZone} />

        {/* Non Billed Accounts % */}
        <NonBilledAccountsCardDynamic zone={selectedZone} />

        {/* Overdue% (as on Date) */}
        <OverduePieChartDynamic zone={selectedZone} />

        {/* Exposure % */}
        <ExposureCardDynamic zone={selectedZone} />
      </div>
    </div>
  );
};
