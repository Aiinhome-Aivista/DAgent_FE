import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileSpreadsheet } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { API_ENDPOINTS } from '../../services/api.config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('summary_revised');
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const sessionId = localStorage.getItem('chatSessionId') || localStorage.getItem('DAgent_session_id') || '7b4c93ae-3d87-4696-92c2-f8119c0c923a'; // fallback for demo

      const payload = {
        session_id: sessionId
      };

      const now = new Date();
      const filename = `Summary_Revised_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}.xlsx`;

      await apiService.download(API_ENDPOINTS.REPORTS.EXPORT_DOMESTIC_SALES, payload, filename);


      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Reports</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1.5">
                      Available Report
                    </label>
                    <div className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                      <span className="text-gray-900 dark:text-white text-sm font-medium">Summary Revised.xlsx</span>
                      <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
                  >
                    {isDownloading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Downloading...
                      </span>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
