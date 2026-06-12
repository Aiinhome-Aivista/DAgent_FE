import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DashboardKPIs, DashboardGraphs } from './DashboardCharts';

interface DashboardProps {
  onBack: () => void;
}
export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">


      <main className="p-6 max-w-[1600px] mx-auto space-y-6">

        {/* Dashboard Title & Actions */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Revenue Sales Dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">1,000 records</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* KPIs */}
        <DashboardKPIs />

        {/* Charts */}
        <DashboardGraphs />
      </main>
    </div>
  );
};
