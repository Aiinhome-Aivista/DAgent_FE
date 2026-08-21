import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, BarChart3, Target, Activity } from 'lucide-react';

export interface KPI {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface KPICardProps {
  kpi: KPI;
  index: number;
}

export const KPICard = ({ kpi, index }: KPICardProps) => {
  // Select a random icon based on index or title keywords
  const getIcon = () => {
    const title = kpi.title.toLowerCase();
    if (title.includes('revenue') || title.includes('sales') || title.includes('profit')) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (title.includes('target') || title.includes('goal')) return <Target className="w-4 h-4 text-blue-500" />;
    if (title.includes('user') || title.includes('active')) return <Activity className="w-4 h-4 text-purple-500" />;
    return <BarChart3 className="w-4 h-4 text-[var(--accent)]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 p-8 bg-gradient-to-bl from-[var(--accent)]/5 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
      
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{kpi.title}</h4>
        <div className="p-1.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border)]">
          {getIcon()}
        </div>
      </div>
      
      <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-1">
        {kpi.value}
      </div>
      
    </motion.div>
  );
};
