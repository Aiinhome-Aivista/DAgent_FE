import React from 'react';

export const KPICard = ({ kpi, index }: { kpi: any, index: number }) => {
  return (
    <div className="border border-[var(--border)] shadow-sm bg-[var(--surface)] rounded-xl overflow-hidden">
      <div className="p-4 flex flex-col gap-1">
        <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">{kpi.title}</span>
        <span className="text-2xl font-bold text-[var(--text-primary)]">{kpi.value}</span>
        {kpi.description && <span className="text-xs text-[var(--text-secondary)]">{kpi.description}</span>}
      </div>
    </div>
  );
};
