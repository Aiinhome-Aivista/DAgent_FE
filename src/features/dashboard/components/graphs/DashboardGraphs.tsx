import React, { useState, useEffect } from "react";
import { chatHistoryService } from "../../../../services/chatHistory.service";
import { formatMarkdownWithTables } from "../../../../utils/format";
import { ChatVisualization } from "../../../chat/components/ChatVisualization";
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
  const [rawAnswer, setRawAnswer] = useState<string>("");
  const [visualizations, setVisualizations] = useState<any[]>([]);
  const [activeQuery, setActiveQuery] = useState<string>("");

  useEffect(() => {
    const handleSearchResult = (e: any) => {
      const { question, answer, visualizations, query_session_name } = e.detail || {};
      if (answer || (visualizations && visualizations.length > 0)) {
        const data = parseSessionData({
          querySessionHistory: [{ answer: answer || "" }],
          querySessionName: query_session_name || question,
        });
        setParsedData(data);
        setRawAnswer(answer || "");
        setVisualizations(visualizations || []);
        setActiveQuery(query_session_name || question || "");
      }
    };

    window.addEventListener("dashboard-search-results", handleSearchResult);

    return () => {
      window.removeEventListener("dashboard-search-results", handleSearchResult);
    };
  }, []);

  if (!rawAnswer && !parsedData && !activeQuery) {
    return null;
  }

  const title = parsedData?.title || activeQuery || "Search Analytics Results";
  const execSummary = parsedData?.sections?.["Executive Summary"] || [];
  const keyInsights = parsedData?.sections?.["Key Insights"] || [];
  const recommendations = parsedData?.sections?.["Actionable Recommendations"] || [];

  return (
    <div className="bg-[#FFFDF0] border border-[#FEF08A] rounded-2xl p-5 shadow-2xs flex items-start gap-4 relative overflow-hidden transition-all duration-300">
      <div className="w-8 h-8 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-[#A16207]" />
      </div>

      <div className="flex-1 text-xs text-slate-700 leading-relaxed space-y-1">
        <h3 className="font-extrabold text-slate-900 text-sm mb-1 leading-snug">
          {title}
        </h3>

        {/* Dynamic formatted output with markdown table & brief details support */}
        {rawAnswer ? (
          <div className="space-y-2">
            <div
              className="prose-chat text-slate-800 text-xs leading-relaxed overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: formatMarkdownWithTables(rawAnswer) }}
            />
            {visualizations && visualizations.length > 0 && (
              <div className="mt-3 space-y-3">
                {visualizations.map((viz: any, idx: number) => (
                  <ChatVisualization key={idx} visualization={viz} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {!isExpanded ? (
              <div className="flex flex-col gap-1.5">
                {execSummary.length > 0 ? (
                  execSummary.map((para: string, idx: number) => (
                    <p
                      key={idx}
                      className="leading-relaxed text-slate-700"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(cleanParagraphText(para)),
                      }}
                    />
                  ))
                ) : (
                  <p className="text-slate-600 leading-relaxed italic">
                    Data summary for {title} loaded successfully.
                  </p>
                )}
                {(keyInsights.length > 0 || recommendations.length > 0) && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors cursor-pointer focus:outline-none mt-1"
                  >
                    Read Details
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 pt-1"
              >
                {execSummary.map((para: string, idx: number) => (
                  <p
                    key={idx}
                    className="text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatInlineMarkdown(cleanParagraphText(para)),
                    }}
                  />
                ))}

                {keyInsights.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-200/60">
                    <span className="font-bold text-slate-900">
                      {parsedData?.sectionTitles?.["Key Insights"] || "Key Insights"}
                    </span>
                    {renderSectionItems(keyInsights)}
                  </div>
                )}

                {recommendations.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-200/60">
                    <span className="font-bold text-slate-900">
                      {parsedData?.sectionTitles?.["Actionable Recommendations"] ||
                        "Actionable Recommendations"}
                    </span>
                    {renderSectionItems(recommendations)}
                  </div>
                )}

                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors self-end mt-1 cursor-pointer focus:outline-none"
                >
                  Show Less <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import { 
  Calendar, 
  Filter, 
  DollarSign, 
  Package, 
  MapPin, 
  RefreshCw 
} from "lucide-react";

export const DashboardGraphs = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Today' | 'Monthly' | '3M' | '6M' | 'YTD' | 'FY'>('FY');
  const [recordCount, setRecordCount] = useState<string | null>(null);

  useEffect(() => {
    const handleSearchResult = (e: any) => {
      const resp = e.detail?.response;
      const count = resp?.total_records || resp?.records || resp?.total_rows;
      if (count) {
        setRecordCount(count.toString());
      }
    };
    window.addEventListener("dashboard-search-results", handleSearchResult);
    return () => window.removeEventListener("dashboard-search-results", handleSearchResult);
  }, []);

  const quickFilterOptions: Array<'ALL' | 'Today' | 'Monthly' | '3M' | '6M' | 'YTD' | 'FY'> = [
    'ALL', 'Today', 'Monthly', '3M', '6M', 'YTD', 'FY'
  ];

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
    <div className="flex flex-col gap-6 overflow-x-hidden p-6 bg-[#F8FAFC]">
      {/* 1. Quick Filters Bar (Commented out as per user request) */}
      {/* <div className="bg-white border border-slate-200 rounded-2xl p-3 px-4 flex items-center justify-between overflow-x-auto shadow-2xs gap-4 -mt-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick filters</span>
          {quickFilterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === option
                  ? 'bg-[#FFF8D6] text-[#713F12] border border-[#FEF08A] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>1 Apr 2026 – 31 Mar 2027</span>
          </div>
          <button className="flex items-center gap-1.5 bg-[#FFFDF0] hover:bg-[#FFF8D6] border border-[#FEF08A] px-3 py-1.5 rounded-lg text-xs font-bold text-[#713F12] transition-colors cursor-pointer shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#A16207]" />
            <span>Custom range</span>
          </button>
          <button className="flex items-center gap-1.5 bg-[#FFFDF0] hover:bg-[#FFF8D6] border border-[#FEF08A] px-3 py-1.5 rounded-lg text-xs font-bold text-[#713F12] transition-colors cursor-pointer shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#A16207]" />
            <span>More filters</span>
          </button>
        </div>
      </div> */}

      {selectedZone && (
        <div className="flex items-center justify-center relative py-2 bg-white rounded-2xl border border-slate-200 px-4">
          <h2 className="text-xl font-bold text-slate-800 font-serif">
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

      {/* 2. Executive AI Prompt Summary Card */}
      <SummaryCard />

      {/* 3. Section Title & 4 Metric KPI Cards (Snapshot 1) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Sales Dashboard</h2>
            {recordCount && <p className="text-xs text-slate-500">{recordCount} records</p>}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FFF8D6] hover:bg-yellow-200 border border-[#FEF08A] text-[#713F12] font-bold rounded-xl transition-all text-xs active:scale-95 cursor-pointer shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
              <svg className="w-16 h-8 text-blue-400 stroke-current fill-none stroke-2" viewBox="0 0 50 25">
                <path d="M 0 20 Q 12 5 25 15 T 50 5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SALES REVENUE</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">₹368.11 Cr</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">6.71 Lac units sold</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">- 0.0% vs last year</span>
              <span>vs same period last year</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOP PERFORMING TYRE</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">TRUCK</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">₹231.31 Cr</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>vs same period last year</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LEADING REGION</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">JAIPUR</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">₹32.19 Cr</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>vs same period last year</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <svg className="w-16 h-8 text-amber-400 stroke-current fill-none stroke-2" viewBox="0 0 50 25">
                <path d="M 0 22 Q 15 20 25 10 T 50 3" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">YEAR-OVER-YEAR</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">+0.0%</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">vs same period last year</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">- 0.0% vs last year</span>
              <span>vs same period last year</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Top 5 Regions / Tyre Types Chart (Snapshot 2) */}
      <TyreSalesChartDynamic zone={selectedZone} />

      {/* 5. 2-Column Section: India Map & YoY Growth Graph (Snapshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full">
          <IndiaMapGraph />
        </div>
        <div className="h-full">
          <YoYGrowthGraph />
        </div>
      </div>

      {/* 6. Multi-Year Comparison Filterable Chart (Snapshot 4) */}
      <YearComparisonChartDynamic zone={selectedZone} />

      {/* 7. Additional Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZonePieChartDynamic zone={selectedZone} />
        <PlanVsSaleChartDynamic onZoneClick={(zone) => setSelectedZone(zone)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategorySalesCardDynamic zone={selectedZone} />
        <AccountCategorySalesCardDynamic zone={selectedZone} />
        <NonBilledAccountsCardDynamic zone={selectedZone} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <OverduePieChartDynamic zone={selectedZone} />
        <ExposureCardDynamic zone={selectedZone} />
      </div>
    </div>
  );
};

