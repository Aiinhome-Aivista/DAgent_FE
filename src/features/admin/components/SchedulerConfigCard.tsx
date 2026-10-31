import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Clock, Play, Save, Loader2, CheckCircle2, AlertCircle, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { adminService } from "../../../services/admin.service";

export const SchedulerConfigCard = () => {
  const [scheduleTime, setScheduleTime] = useState("19:00");
  const [frequency, setFrequency] = useState("daily");
  const [isActive, setIsActive] = useState(true);
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getSchedulerConfig();
      if (res?.status === "success" && res?.data) {
        const d = res.data;
        setScheduleTime(d.schedule_time || "19:00");
        setFrequency(d.frequency || "daily");
        setIsActive(d.is_active ?? true);
        setStatusInfo(d);
      }
    } catch (err) {
      console.error("Failed to load scheduler config", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!scheduleTime.trim()) {
      toast.error("Please enter a valid schedule time (HH:MM)");
      return;
    }
    setIsSaving(true);
    try {
      const res = await adminService.updateSchedulerConfig({
        schedule_time: scheduleTime,
        frequency,
        is_active: isActive
      });
      if (res?.status === "success") {
        toast.success("Scheduler configuration saved!");
        fetchConfig();
      } else {
        toast.error(res?.message || "Failed to update scheduler");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save scheduler settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunNow = async () => {
    setIsRunningNow(true);
    const toastId = toast.loading("Triggering background analytics sync...");
    try {
      const res = await adminService.runSchedulerNow();
      if (res?.status === "success") {
        toast.success("Background sync started! Updating cache in background.", { id: toastId });
        setTimeout(() => fetchConfig(), 3000);
      } else {
        toast.error(res?.message || "Failed to trigger sync", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error triggering sync", { id: toastId });
    } finally {
      setIsRunningNow(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Card */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Key Metrics & Analytics Scheduler
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Automatically calculates heavy SAP HANA analytical views in the background and stores results in MySQL. Dashboard loads instantly (&lt;5ms) for all users without hitting live HANA on page mount.
              </p>
            </div>
          </div>

          <button
            onClick={fetchConfig}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Schedule Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Daily Scheduled Time (24h)
            </label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
            />
            <span className="text-[11px] text-[var(--text-secondary)]">
              Default: <b>19:00</b> (Evening 7:00 PM IST)
            </span>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Execution Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none cursor-pointer"
            >
              <option value="daily">Once a day (At Scheduled Time)</option>
              <option value="twice_daily">Twice a day (Every 12 Hours)</option>
              <option value="thrice_daily">3 times a day (Every 8 Hours)</option>
              <option value="hourly">Hourly (Every 60 Minutes)</option>
            </select>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Controls how many times calculations run in background.
            </span>
          </div>

          {/* Active Switch */}
          <div className="flex flex-col gap-1.5 justify-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Scheduler Status
            </label>
            <div className="flex items-center gap-3 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className={`text-xs font-semibold ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
                {isActive ? "Active (Running)" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunNow}
              disabled={isRunningNow}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRunningNow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              Sync Now (Run Immediately)
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Schedule
          </button>
        </div>
      </div>

      {/* Live Status Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Job Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${statusInfo?.last_run_status === "success" ? "bg-emerald-500" : statusInfo?.last_run_status === "failed" ? "bg-red-500" : "bg-amber-400"}`}></span>
            <span className="text-sm font-bold text-[var(--text-primary)] capitalize">
              {statusInfo?.last_run_status || "Idle"}
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Last Synced At
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)] mt-1">
            {statusInfo?.last_run_at || "Never synced"}
          </span>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Execution Duration
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)] mt-1">
            {statusInfo?.last_run_duration_sec ? `${statusInfo.last_run_duration_sec}s` : "0.0s"}
          </span>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Next Scheduled Run
          </span>
          <span className="text-sm font-medium text-[var(--accent)] mt-1">
            {statusInfo?.next_run_at || `Today at ${scheduleTime}`}
          </span>
        </div>
      </div>
    </div>
  );
};

