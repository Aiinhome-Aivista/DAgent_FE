import React, { useState, useEffect } from 'react';
import {
  Network, Search, X, Loader2, ExternalLink,
  Database, RotateCcw, Trash2, Plus, CheckCircle2,
  Clock, Layers, ShieldCheck, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/api.service';
import { defaultConfig, API_ENDPOINTS } from '../../../services/api.config';

interface KGraph {
  id: number;
  session_name: string;
  graph_url: string;
  created_at: string;
}

interface KGraphBackup {
  _key?: string;
  backup_name: string;
  nodes_collection?: string;
  edges_collection?: string;
  nodes_count?: number;
  edges_count?: number;
  created_at?: string;
  created_date?: string;
  workspace_arango_db?: string;
  description?: string;
}

export const AdminKGraphReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backups' | 'visualizer'>('backups');

  // Backups State
  const [backups, setBackups] = useState<KGraphBackup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(true);
  const [creatingBackup, setCreatingBackup] = useState<boolean>(false);
  const [restoringBackupName, setRestoringBackupName] = useState<string | null>(null);
  const [deletingBackupName, setDeletingBackupName] = useState<string | null>(null);
  const [confirmRestoreName, setConfirmRestoreName] = useState<string | null>(null);
  const [workspaceDb, setWorkspaceDb] = useState<string>('');

  // Graph Visualizer State
  const [graphs, setGraphs] = useState<KGraph[]>([]);
  const [loadingGraphs, setLoadingGraphs] = useState<boolean>(false);
  const [errorGraphs, setErrorGraphs] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGraph, setSelectedGraph] = useState<KGraph | null>(null);

  useEffect(() => {
    fetchBackups();
    fetchGraphs();
  }, []);

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const response = await apiService.get(API_ENDPOINTS.KGRAPH.BACKUPS) as any;
      if (response && response.status === 'success') {
        setBackups(response.backups || []);
        if (response.workspace_arango_db) {
          setWorkspaceDb(response.workspace_arango_db);
        }
      }
    } catch (err: any) {
      console.error('Failed to load backups:', err);
      toast.error('Failed to load K-Graph backups');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const response = await apiService.post(API_ENDPOINTS.KGRAPH.BACKUP, {}) as any;
      if (response && response.status === 'success') {
        const bName = response.backup?.backup_name || 'backup';
        toast.success(`K-Graph backup '${bName}' created successfully!`);
        await fetchBackups();
      } else {
        throw new Error(response.message || 'Failed to create backup');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupName: string) => {
    setRestoringBackupName(backupName);
    try {
      const response = await apiService.post(API_ENDPOINTS.KGRAPH.RESTORE, { backup_name: backupName }) as any;
      if (response && response.status === 'success') {
        toast.success(`K-Graph restored from '${backupName}' successfully! (${response.restored_nodes} nodes, ${response.restored_edges} edges)`);
        setConfirmRestoreName(null);
        await fetchBackups();
      } else {
        throw new Error(response.message || 'Failed to restore backup');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore backup');
    } finally {
      setRestoringBackupName(null);
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    if (!window.confirm(`Are you sure you want to delete backup '${backupName}'?`)) return;
    setDeletingBackupName(backupName);
    try {
      const response = await apiService.post(API_ENDPOINTS.KGRAPH.DELETE_BACKUP, { backup_name: backupName }) as any;
      if (response && response.status === 'success') {
        toast.success(`Backup '${backupName}' deleted successfully.`);
        await fetchBackups();
      } else {
        throw new Error(response.message || 'Failed to delete backup');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete backup');
    } finally {
      setDeletingBackupName(null);
    }
  };

  const fetchGraphs = async () => {
    setLoadingGraphs(true);
    setErrorGraphs(null);
    try {
      const response = await apiService.get(API_ENDPOINTS.KGRAPH.GET_ALL) as any;
      if (response && response.status === 'success') {
        setGraphs(response.graphs || []);
      } else {
        throw new Error(response.message || 'Failed to fetch graphs');
      }
    } catch (err: any) {
      setErrorGraphs(err.message || 'Failed to load visual graphs');
    } finally {
      setLoadingGraphs(false);
    }
  };

  const filteredGraphs = graphs.filter(g =>
    g.session_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  const getFullGraphUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = (defaultConfig.baseUrl || '').replace(/\/+$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Header & Tab Navigation */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Network className="w-5 h-5 text-[var(--accent)]" />
            Knowledge Graph Management
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Create snapshot backups of live ArangoDB knowledge graphs, restore previous versions, or review visual graphs.
            {workspaceDb && <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-mono text-[11px]">DB: {workspaceDb}</span>}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => setActiveTab('backups')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'backups'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
          >
            <Database className="w-3.5 h-3.5" />
            Backups & Restore ({backups.length})
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'visualizer'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
          >
            <Network className="w-3.5 h-3.5" />
            Visual Explorer
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Restore */}
      {confirmRestoreName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Restore Knowledge Graph?</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Restoring from <strong className="text-[var(--text-primary)] font-mono">{confirmRestoreName}</strong> will replace the current active knowledge graph in ArangoDB with this snapshot.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmRestoreName(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestoreBackup(confirmRestoreName)}
                disabled={restoringBackupName === confirmRestoreName}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {restoringBackupName === confirmRestoreName ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Confirm Restore
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: BACKUPS & RESTORE */}
      {activeTab === 'backups' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Action Row */}
          <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Snapshot Backups
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Backups store nodes and edges directly into ArangoDB with format: <span className="font-mono text-[var(--text-primary)]">kg-DDMMYY-OK</span>
              </p>
            </div>
            <button
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {creatingBackup ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Backup
                </>
              )}
            </button>
          </div>

          {/* Backups Table / List */}
          <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col shadow-xs">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_auto] gap-4 p-3 border-b border-[var(--border)] bg-[var(--bg)]/50 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              <div>Backup Name</div>
              <div>Nodes</div>
              <div>Edges</div>
              <div>Created Date</div>
              <div className="text-right pr-2">Actions</div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]/50 custom-scrollbar">
              {loadingBackups ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-[var(--text-secondary)]">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                  <span className="text-xs">Loading backups...</span>
                </div>
              ) : backups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[var(--text-secondary)] space-y-2">
                  <Database className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium">No backups found.</p>
                  <p className="text-xs opacity-75">Click "Create Backup" above to create your first snapshot.</p>
                </div>
              ) : (
                backups.map((bkp, idx) => (
                  <div
                    key={bkp._key || bkp.backup_name || idx}
                    className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_auto] gap-4 p-3.5 items-center hover:bg-[var(--bg)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                          {bkp.backup_name}
                        </span>
                        {bkp.description && (
                          <p className="text-[11px] text-[var(--text-secondary)] truncate opacity-75">
                            {bkp.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--text-primary)]">
                      <Layers className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-70" />
                      <span className="font-semibold">{bkp.nodes_count ?? 0}</span>
                      <span className="text-[var(--text-secondary)] text-[10px]">nodes</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--text-primary)]">
                      <Network className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-70" />
                      <span className="font-semibold">{bkp.edges_count ?? 0}</span>
                      <span className="text-[var(--text-secondary)] text-[10px]">edges</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      <span>{bkp.created_date || (bkp.created_at ? formatDate(bkp.created_at) : 'N/A')}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setConfirmRestoreName(bkp.backup_name)}
                        disabled={restoringBackupName === bkp.backup_name}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                        title="Restore live graph from this backup"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>

                      <button
                        onClick={() => handleDeleteBackup(bkp.backup_name)}
                        disabled={deletingBackupName === bkp.backup_name}
                        className="p-1.5 text-xs font-semibold rounded-lg hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 transition-all cursor-pointer"
                        title="Delete this backup"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL EXPLORER */}
      {activeTab === 'visualizer' && (
        <div className="flex-1 min-h-0 flex gap-4">
          {/* List of Graphs */}
          <div className="w-1/3 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 border-b border-[var(--border)] bg-[var(--bg)]/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Session Graphs</h3>
              <div className="relative w-36">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {loadingGraphs ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--text-secondary)]">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
                  <span className="text-xs">Loading...</span>
                </div>
              ) : errorGraphs ? (
                <div className="p-3 text-xs text-red-500 bg-red-500/10 rounded-lg text-center">
                  {errorGraphs}
                </div>
              ) : filteredGraphs.length === 0 ? (
                <div className="text-center p-4 text-xs text-[var(--text-secondary)]">
                  No visual session graphs found.
                </div>
              ) : (
                filteredGraphs.map(graph => (
                  <div
                    key={graph.id}
                    onClick={() => setSelectedGraph(graph)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedGraph?.id === graph.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-xs'
                        : 'border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg)]'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Network className={`w-4 h-4 ${selectedGraph?.id === graph.id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate" title={graph.session_name}>
                        {graph.session_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[11px] text-[var(--text-secondary)]">
                      <span>{graph.created_at ? formatDate(graph.created_at) : 'N/A'}</span>
                      {graph.graph_url && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">Ready</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Graph Viewer iframe */}
          <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex flex-col overflow-hidden relative shadow-xs">
            {selectedGraph ? (
              <>
                <div className="p-3 border-b border-[var(--border)] bg-[var(--bg)]/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {selectedGraph.session_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={getFullGraphUrl(selectedGraph.graph_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setSelectedGraph(null)}
                      className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white relative">
                  {selectedGraph.graph_url ? (
                    <iframe
                      src={getFullGraphUrl(selectedGraph.graph_url)}
                      className="w-full h-full border-0 absolute inset-0"
                      title={`K-Graph for ${selectedGraph.session_name}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-[var(--text-secondary)] bg-[var(--bg)]">
                      <Network className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-xs">Graph URL not available</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] bg-[var(--bg)]/30 space-y-2">
                <Network className="w-12 h-12 opacity-20" />
                <p className="text-xs font-medium">Select a session on the left to preview its visual K-Graph</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
