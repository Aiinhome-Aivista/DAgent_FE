import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, HardDrive, Upload, Activity } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../services/api.config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UsageStats {
  company_name: string;
  plan_name: string;
  metrics: {
    storage: { used: number; total: number; unit: string };
    uploads: { used: number; total: number };
    queries: { used: number; total: number };
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsageStats();
    }
  }, [isOpen]);

  const fetchUsageStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('DAgent_user_id') || '1';
      const response = await apiService.get(`${API_ENDPOINTS.USER.USAGE_STATS}?user_id=${userId}`) as any;
      if (response && response.usage_stats) {
        setStats(response.usage_stats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (used: number, total: number, label: string, icon: React.ReactNode, unit: string = '') => {
    const isUnlimited = total === -1 || total === 0;
    const percent = isUnlimited ? 0 : Math.min((used / total) * 100, 100);

    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            {icon}
            {label}
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {isUnlimited ? (
              <>{used} {unit} Used / Unlimited</>
            ) : (
              <>{used} {unit} / {total} {unit}</>
            )}
          </span>
        </div>

        {!isUnlimited && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2.5 rounded-full ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
            ></motion.div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plan & Usage</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-4 rounded-lg border border-red-200 dark:border-red-500/20 text-center">
                  {error}
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                    <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-1">Current Plan</h3>
                    <div className="text-2xl font-bold mb-1">{stats.plan_name}</div>
                    <div className="text-sm text-blue-100 flex items-center gap-1.5">
                      <Database className="w-4 h-4" /> {stats.company_name}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {renderProgressBar(
                      stats.metrics.storage.used,
                      stats.metrics.storage.total,
                      "Data Storage",
                      <HardDrive className="w-4 h-4 text-blue-500" />,
                      stats.metrics.storage.unit
                    )}

                    {renderProgressBar(
                      stats.metrics.uploads.used,
                      stats.metrics.uploads.total,
                      "Daily Uploads",
                      <Upload className="w-4 h-4 text-green-500" />
                    )}

                    {renderProgressBar(
                      stats.metrics.queries.used,
                      stats.metrics.queries.total,
                      "Daily Queries",
                      <Activity className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};