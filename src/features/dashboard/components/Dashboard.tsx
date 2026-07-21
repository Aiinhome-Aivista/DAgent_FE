import React, { useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  Mic, 
  Calendar, 
  Filter, 
  ArrowLeft, 
  DollarSign, 
  Package, 
  MapPin, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

import { IndiaMapGraph } from './graphs/IndiaCoverageMap';
import { YoYGrowthGraph } from './graphs/YoYGrowthGraph';
import { YearComparisonChartDynamic } from './graphs/YearComparisonChartDynamic';
import { ZonePieChartDynamic } from './graphs/ZonePieChartDynamic';
import { TyreSalesChartDynamic } from './graphs/TyreSalesChartDynamic';
import { PlanVsSaleChartDynamic } from './graphs/PlanVsSaleChartDynamic';
import { CategorySalesCardDynamic } from './graphs/CategorySalesCardDynamic';
import { AccountCategorySalesCardDynamic } from './graphs/AccountCategorySalesCardDynamic';
import { NonBilledAccountsCardDynamic } from './graphs/NonBilledAccountsCardDynamic';
import { OverduePieChartDynamic } from './graphs/OverduePieChartDynamic';
import { ExposureCardDynamic } from './graphs/ExposureCardDynamic';

interface DashboardProps {
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Today' | 'Monthly' | '3M' | '6M' | 'YTD' | 'FY'>('FY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState<string | null>(null);

  React.useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
      {/* ── Top Yellow Header Bar (Snapshot 1) ────────────────────────────────── */}
      <header className="bg-[#FFE600] border-b border-yellow-400 px-6 py-2.5 shrink-0 flex items-center justify-between shadow-sm z-30 gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-black/10 text-slate-900 transition-colors cursor-pointer flex items-center justify-center mr-1"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* JK Tyre Logo Graphic */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black italic tracking-tighter text-black font-serif">
                JK<span className="tracking-normal font-sans font-extrabold ml-1">TYRE</span>
              </span>
              <span className="text-[7px] font-bold tracking-widest text-black/80 uppercase">
                TOTAL CONTROL
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-black/20 mx-1" />

          <div>
            <h1 className="text-base font-extrabold text-black leading-tight">Revenue Analytics</h1>
            <p className="text-[11px] font-medium text-slate-800 italic leading-none">Sales Dashboard</p>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="bg-white rounded-full p-1 pl-4 flex items-center shadow-inner border border-yellow-300">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analytics..."
              className="flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button 
              className="w-7 h-7 rounded-full bg-black text-[#FFE600] flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer mr-1"
              title="Voice Search"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button className="bg-black hover:bg-slate-900 text-[#FFE600] text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer">
              Search
            </button>
          </div>
        </div>

        {/* Right Status & Keyboard Shortcuts */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#D1FAE5] border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-[#065F46]">AI Online</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-black/90">
            <span className="flex items-center gap-1">
              <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">Ctrl</kbd> + <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">K</kbd>
              <span className="text-[9px] font-medium text-slate-800 ml-0.5">(search)</span>
            </span>
            <span className="flex items-center gap-1 ml-1">
              <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">Ctrl</kbd> + <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">⇧</kbd> + <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">M</kbd>
              <span className="text-[9px] font-medium text-slate-800 ml-0.5">(voice)</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Quick Filters Bar (Snapshot 1) ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between overflow-x-auto shadow-2xs gap-4">
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
      </div>

      {/* ── Main Dashboard Body ─────────────────────────────────────────────── */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-6 overflow-y-auto">
        {/* 1. AI Prompt / Summary Banner (Snapshot 1) */}
        <div className="bg-[#FFFDF0] border border-[#FEF08A] rounded-2xl p-5 shadow-2xs flex items-start gap-4 relative">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs text-slate-700 leading-relaxed space-y-1">
            <p>
              <span className="font-bold text-slate-900">You asked:</span> "{searchQuery}"
            </p>
            <p>
              <span className="font-bold text-slate-900">Period:</span> FY 2026
            </p>
            <p className="leading-snug">
              <span className="font-bold text-slate-900">Top 10 regions:</span> JAIPUR (₹32.19 Cr); FARIDABAD (₹21.63 Cr); JODHPUR (₹21.09 Cr); CHENNAI (₹17.51 Cr); CUTTAK (₹17.18 Cr); GUWAHATI (₹15 Cr); SALEM (₹14.23 Cr); CHANDIGARH (₹14.1 Cr); INDORE (₹13.86 Cr); DELHI (₹13.84 Cr)
            </p>
            <div className="flex items-center gap-4 pt-1 text-slate-900 font-semibold">
              <span>Total sales: <strong className="font-bold">₹368.11 Cr</strong></span>
              <span>•</span>
              <span>Records: <strong className="font-bold">1,000 rows</strong></span>
            </div>
          </div>
        </div>

        {/* 2. Sub-Header Title & Refresh Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Sales Dashboard</h2>
            {recordCount && <p className="text-xs text-slate-500">{recordCount} records</p>}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FFF8D6] hover:bg-yellow-200 border border-[#FEF08A] text-[#713F12] font-bold rounded-xl transition-all text-xs active:scale-95 cursor-pointer shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* 3. Four Horizontal KPI Metric Cards (Snapshot 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
              {/* Top Right Mini Sparkline */}
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
              {/* Top Right Mini Sparkline */}
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

        {/* 4. Top 5 Regions / Tyre Sales Bar Chart Section (Snapshot 2) */}
        <div className="flex flex-col gap-6">
          <TyreSalesChartDynamic zone={selectedZone} />
        </div>

        {/* 5. 2-Column Layout: India Map & YoY Growth Graph (Snapshot 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="h-full">
            <IndiaMapGraph />
          </div>
          <div className="h-full">
            <YoYGrowthGraph />
          </div>
        </div>

        {/* 6. Multi-Year Comparison Filterable Chart (Snapshot 4) */}
        <div className="flex flex-col gap-6">
          <YearComparisonChartDynamic zone={selectedZone} />
        </div>

        {/* 7. Additional Key Analytics Grid */}
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
      </main>
    </div>
  );
};


