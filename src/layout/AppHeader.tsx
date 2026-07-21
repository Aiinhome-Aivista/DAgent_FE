import React, { useState, useEffect } from "react";
import { User, Search, Mic, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "../ui-kit";
import { AppHeaderProps } from "../types/layout";
import { useAuthContext } from "../context/AuthContext";
import { connectorService } from "../services/connector.service";

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  selectedConnector,
}) => {
  const { userName, userId } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastQuery, setToastQuery] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const displayUserName = userName || "aiinhome";
  const truncatedUserName =
    displayUserName.length > 6
      ? `${displayUserName.slice(0, 6)}...`
      : displayUserName;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    const q = searchQuery.trim();
    setIsSearching(true);

    try {
      const sessionId = localStorage.getItem("DAgent_session_id") || "";
      const response: any = await connectorService.sendSessionChat({
        session_id: sessionId,
        question: q,
        user_id: userId,
      });

      const badgeName = response?.query_session_name || q;
      setToastQuery(badgeName);

      // Dispatch search results event to SummaryCard and Dashboard
      window.dispatchEvent(
        new CustomEvent("dashboard-search-results", {
          detail: {
            question: q,
            answer: response?.answer || "",
            visualizations: response?.visualizations || [],
            query_session_name: badgeName,
            response,
          },
        })
      );

      // Dispatch event to update KPIs from /graph-metrics
      if (response?.answer) {
        window.dispatchEvent(
          new CustomEvent("chat-metrics-update", {
            detail: { question: q, answer: response.answer },
          })
        );
      }
    } catch (err) {
      console.error("Search query failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  if (activeTab === "chat") {
    return (
      <header className="bg-white/95 border-b border-slate-200/80 px-6 py-2.5 shrink-0 flex items-center justify-between shadow-2xs z-40 gap-4 relative backdrop-blur-md">
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black italic tracking-tighter text-slate-900 font-serif">
                JK<span className="tracking-normal font-sans font-extrabold ml-1 text-slate-800">TYRE</span>
              </span>
              <span className="text-[7px] font-bold tracking-widest text-slate-400 uppercase">
                TOTAL CONTROL
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">Revenue Analytics</h1>
            <p className="text-[11px] font-medium text-slate-500 italic leading-none">Sales Dashboard</p>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="bg-slate-50 hover:bg-white rounded-full p-1 pl-4 flex items-center shadow-inner border border-slate-200 focus-within:border-slate-400 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analytics..."
              className="flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
            {/* <button 
              type="button"
              className="w-7 h-7 rounded-full bg-black text-[#FFE600] flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer mr-1"
              title="Voice Search"
            >
              <Mic className="w-3.5 h-3.5" />
            </button> */}
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer disabled:opacity-80 flex items-center gap-1.5 min-w-[90px] justify-center shadow-xs"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Searching...</span>
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3 shrink-0 relative">
          {/* <div className="bg-[#D1FAE5] border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-[#065F46]">AI Online</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-black/90">
            <span className="flex items-center gap-1">
              <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">Ctrl</kbd> + <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">K</kbd>
              <span className="text-[9px] font-medium text-slate-800 ml-0.5">(search)</span>
            </span>
            <span className="flex items-center gap-1 ml-1">
              <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">Ctrl</kbd> + <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">⇧</kbd> + <kbd className="bg-black text-[#FFE600] px-1.5 py-0.5 rounded text-[9px] font-mono">M</kbd>
              <span className="text-[9px] font-medium text-slate-800 ml-0.5">(voice)</span>
            </span>
          </div> */}

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full pr-3 pl-1.5 h-8 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 transition-all cursor-pointer ml-1"
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold" title={displayUserName}>
              Welcome {truncatedUserName}
            </span>
          </Button>
        </div>
      </header>
    );
  }

  const getTabTitle = () => {
    switch (activeTab as string) {
      case "chat":
        return "Engagement Zone";
      case "new-connector":
        return "Add Connector";
      case "collection":
        return "Import";
      case "analysis":
        return "Process";
      case "admin":
        return "Admin Panel";
      default:
        return "Data source";
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab as string) {
      case "chat":
        return "";
      case "new-connector":
        return `Set up connection for ${selectedConnector?.name || "new server"} with DAgent Guide`;
      case "collection":
        return "Manage data ingestion and synchronization";
      case "analysis":
        return "Review statistical models and generated insights";
      case "admin":
        return "Manage user accounts and workspaces";
      default:
        return "Connect your data directly to run instant analysis";
    }
  };

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-tight">{getTabTitle()}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {getTabSubtitle()}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2.5 rounded-full pr-4 pl-1.5 h-9 border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium" title={displayUserName}>
            Welcome {truncatedUserName}
          </span>
        </Button>
      </div>
    </header>
  );
};

