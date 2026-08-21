import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';

export interface ChartConfig {
  chart_type: 'bar' | 'line' | 'pie';
  title: string;
  description?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface DynamicChartProps {
  config: ChartConfig;
  index: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const DynamicChart = ({ config, index }: DynamicChartProps) => {
  // Transform data for recharts
  const data = config.labels.map((label, i) => {
    const dataPoint: any = { name: label };
    config.datasets.forEach(dataset => {
      dataPoint[dataset.label] = dataset.data[i];
    });
    return dataPoint;
  });

  const formatYAxis = (val: number) => {
    if (val === 0) return '0';
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 10000000) return `${sign}${(absVal / 10000000).toFixed(1)}Cr`;
    if (absVal >= 100000) return `${sign}${(absVal / 100000).toFixed(1)}L`;
    if (absVal >= 1000) return `${sign}${(absVal / 1000).toFixed(1)}K`;
    return `${sign}${absVal}`;
  };

  const renderChart = () => {
    switch (config.chart_type) {
      default:
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={formatYAxis} width={40} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {config.datasets.map((ds, i) => (
                <Bar key={ds.label} dataKey={ds.label} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={formatYAxis} width={40} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {config.datasets.map((ds, i) => (
                <Line 
                  key={ds.label} 
                  type="monotone" 
                  dataKey={ds.label} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        // For pie chart, usually we just use the first dataset
        const pieData = config.labels.map((label, i) => ({
          name: label,
          value: config.datasets[0]?.data[i] || 0
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        );

    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
    >
      <div className="mb-4">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">{config.title}</h4>
        {config.description && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{config.description}</p>
        )}
      </div>
      <div className="h-48 w-full">
        {renderChart()}
      </div>
    </motion.div>
  );
};
