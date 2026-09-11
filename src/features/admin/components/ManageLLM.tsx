import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Edit2, Trash2, X, Save, Eye, EyeOff, Key,
  Cpu, Globe, Brain, Check, ChevronDown, ChevronUp,
  Network, MessageSquare, BarChart2, Layers, Zap,
  Search, Activity, FileSearch
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LLMProvider {
  id: number;
  name: string;
  provider: string;
  api_key: string;
  model_name: string;
  base_url: string;
  is_active: boolean;
}

interface ScenarioAssignment {
  scenario: string;
  provider_id: number | null;
  temperature: number;
  max_tokens: number;
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS = [
  { key: 'rag_chat',       label: 'RAG Chat',      icon: <MessageSquare className="w-3 h-3" /> },
  { key: 'analysis',       label: 'Analysis',       icon: <BarChart2     className="w-3 h-3" /> },
  { key: 'visualization',  label: 'Visualisation',  icon: <Layers        className="w-3 h-3" /> },
  { key: 'intent_routing', label: 'Intent Routing', icon: <Network       className="w-3 h-3" /> },
  { key: 'chat',           label: 'Direct Chat',    icon: <Brain         className="w-3 h-3" /> },
  { key: 'insights',       label: 'Insights',       icon: <Zap           className="w-3 h-3" /> },
  { key: 'query_branch',   label: 'Query Branch',   icon: <Activity      className="w-3 h-3" /> },
  { key: 'web_search',     label: 'Web Search',     icon: <Search        className="w-3 h-3" /> },
  { key: 'agent_planner',  label: 'Agent Planner',  icon: <FileSearch    className="w-3 h-3" /> },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_PROVIDERS: LLMProvider[] = [
  { id: 1, name: 'Gemini Flash',  provider: 'gemini',        api_key: 'AIzaSy••••••••••', model_name: 'gemini-2.5-flash',     base_url: '',                            is_active: true  },
  { id: 2, name: 'Mistral Cloud', provider: 'mistral_cloud', api_key: 'jYzxDQ••••••••••', model_name: 'mistral-small-latest', base_url: 'https://api.mistral.ai/v1',   is_active: true  },
  { id: 3, name: 'Mistral Local', provider: 'mistral_local', api_key: '',                 model_name: 'mistral:latest',       base_url: 'http://122.163.121.176:3041',  is_active: false },
];

const SEED_ASSIGNMENTS: ScenarioAssignment[] = [
  { scenario: 'rag_chat',       provider_id: 1, temperature: 0.3, max_tokens: 4096 },
  { scenario: 'analysis',       provider_id: 2, temperature: 0.2, max_tokens: 4096 },
  { scenario: 'visualization',  provider_id: 2, temperature: 0.1, max_tokens: 2048 },
  { scenario: 'intent_routing', provider_id: 2, temperature: 0.0, max_tokens: 256  },
  { scenario: 'chat',           provider_id: 1, temperature: 0.3, max_tokens: 4096 },
  { scenario: 'insights',       provider_id: 1, temperature: 0.3, max_tokens: 4096 },
  { scenario: 'query_branch',   provider_id: 2, temperature: 0.2, max_tokens: 1024 },
  { scenario: 'web_search',     provider_id: 1, temperature: 0.3, max_tokens: 2048 },
  { scenario: 'agent_planner',  provider_id: 1, temperature: 0.2, max_tokens: 8192 },
];

const BLANK: Omit<LLMProvider, 'id'> = {
  name: '', provider: '', api_key: '', model_name: '', base_url: '', is_active: true,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ManageLLMProps {
  searchQuery: string;
  isCreatingLLM: boolean;
  setIsCreatingLLM: (val: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ManageLLM: React.FC<ManageLLMProps> = ({ searchQuery, isCreatingLLM, setIsCreatingLLM }) => {
  const [providers, setProviders]     = useState<LLMProvider[]>(SEED_PROVIDERS);
  const [assignments, setAssignments] = useState<ScenarioAssignment[]>(SEED_ASSIGNMENTS);

  // modal
  const [form, setForm]     = useState<Omit<LLMProvider, 'id'>>(BLANK);
  const [editId, setEditId] = useState<number | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<number | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const closeModal = () => { setForm(BLANK); setEditId(null); setShowKey(false); setIsCreatingLLM(false); };

  const openEdit = (p: LLMProvider) => {
    setForm({ name: p.name, provider: p.provider, api_key: p.api_key, model_name: p.model_name, base_url: p.base_url, is_active: p.is_active });
    setEditId(p.id); setShowKey(false); setIsCreatingLLM(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.provider.trim() || !form.model_name.trim()) {
      toast.error('Name, Provider & Model are required.'); return;
    }
    if (editId !== null) {
      setProviders(prev => prev.map(p => p.id === editId ? { ...form, id: editId } : p));
      toast.success('Provider updated!');
    } else {
      setProviders(prev => [...prev, { ...form, id: Date.now() }]);
      toast.success('Provider added!');
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    setAssignments(prev => prev.map(a => a.provider_id === id ? { ...a, provider_id: null } : a));
    setDeleteId(null);
    toast.success('Provider removed.');
  };

  const patchAssignment = (scenario: string, patch: Partial<ScenarioAssignment>) =>
    setAssignments(prev => prev.map(a => a.scenario === scenario ? { ...a, ...patch } : a));

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.model_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inp = 'w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[var(--text-secondary)]/40 transition-colors';
  const lbl = 'block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wide';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Providers Table ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">

        {/* Header row */}
        <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
          {['Provider', 'Type', 'Model', 'Status', 'Actions'].map(h => (
            <span key={h} className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">
            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-25" />
            <p className="text-sm">No providers found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((p, idx) => {
              const isExpanded = expandedProvider === p.id;
              const scenariosForProvider = assignments.filter(a => a.provider_id === p.id);

              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>

                  {/* Main row */}
                  <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-[var(--surface-hover)] transition-colors">

                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                        {p.base_url && <p className="text-xs text-[var(--text-secondary)] truncate font-mono">{p.base_url}</p>}
                      </div>
                    </div>

                    {/* Provider type */}
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] w-fit">
                      {p.provider}
                    </span>

                    {/* Model */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Brain className="w-3.5 h-3.5 shrink-0 text-[var(--text-secondary)]" />
                      <span className="font-mono text-xs text-[var(--text-secondary)] truncate">{p.model_name}</span>
                    </div>

                    {/* Status */}
                    <button
                      onClick={() => setProviders(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer w-fit ${
                        p.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-[var(--border)]/60 text-[var(--text-secondary)] hover:bg-[var(--border)]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-[var(--text-secondary)]/40'}`} />
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button title="Scenario routing" onClick={() => setExpandedProvider(isExpanded ? null : p.id)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded scenario routing */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--accent)]/[0.02]">
                          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                            Scenarios using <span className="text-[var(--accent)]">{p.name}</span> — click to toggle
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {SCENARIOS.map(s => {
                              const a    = assignments.find(x => x.scenario === s.key)!;
                              const mine = a.provider_id === p.id;
                              return (
                                <button key={s.key}
                                  onClick={() => patchAssignment(s.key, { provider_id: mine ? null : p.id })}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                    mine
                                      ? 'bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]'
                                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]'
                                  }`}>
                                  {s.icon} {s.label}
                                  {mine && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Temp / tokens for assigned scenarios */}
                          {scenariosForProvider.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {scenariosForProvider.map(a => {
                                const s = SCENARIOS.find(x => x.key === a.scenario)!;
                                return (
                                  <div key={a.scenario} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                                      {s.icon} {s.label}
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-[var(--text-secondary)] font-medium uppercase">
                                        Temp <span className="text-[var(--accent)] font-bold">{a.temperature}</span>
                                      </label>
                                      <input type="range" min={0} max={1} step={0.05} value={a.temperature}
                                        onChange={e => patchAssignment(a.scenario, { temperature: parseFloat(e.target.value) })}
                                        className="w-full accent-[var(--accent)] cursor-pointer h-1.5 mt-1" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-[var(--text-secondary)] font-medium uppercase">Max Tokens</label>
                                      <input type="number" min={128} max={32768} step={128} value={a.max_tokens}
                                        onChange={e => patchAssignment(a.scenario, { max_tokens: parseInt(e.target.value) || 4096 })}
                                        className={inp + ' mt-1 py-1 text-xs'} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Scenario Overview Grid ───────────────────────────────────────────── */}
      <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Scenario Routing Overview</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-px bg-[var(--border)]">
          {SCENARIOS.map(s => {
            const a    = assignments.find(x => x.scenario === s.key)!;
            const prov = providers.find(p => p.id === a.provider_id);
            return (
              <div key={s.key} className="bg-[var(--surface)] px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1">{s.icon} {s.label}</div>
                <p className={`text-xs font-semibold truncate ${prov ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]/40'}`}>
                  {prov ? prov.name : 'Unassigned'}
                </p>
                {prov && (
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-mono">t={a.temperature} · {a.max_tokens} tok</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCreatingLLM && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={closeModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-lg bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl pointer-events-auto overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {editId !== null ? 'Edit Provider' : 'Add LLM Provider'}
                    </h3>
                  </div>
                  <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Display Name *</label>
                      <input className={inp} placeholder="e.g. Gemini Flash" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className={lbl}>Provider Type *</label>
                      <input className={inp} placeholder="gemini / mistral_cloud / ollama" value={form.provider}
                        onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Model Name *</label>
                      <div className="relative">
                        <Brain className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <input className={inp + ' pl-8'} placeholder="gemini-2.5-flash" value={form.model_name}
                          onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Base URL <span className="text-[var(--text-secondary)] normal-case font-normal">(optional)</span></label>
                      <div className="relative">
                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <input className={inp + ' pl-8'} placeholder="http://localhost:11434" value={form.base_url}
                          onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={lbl}>API Key <span className="text-[var(--text-secondary)] normal-case font-normal">(blank for local)</span></label>
                    <div className="relative">
                      <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <input
                        className={inp + ' pl-8 pr-9 font-mono'}
                        type={showKey ? 'text' : 'password'}
                        placeholder="••••••••••••••••"
                        value={form.api_key}
                        onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                      />
                      <button type="button" onClick={() => setShowKey(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={form.is_active}
                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                      <div className="w-10 h-5 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                    <span className="text-sm text-[var(--text-secondary)]">Active</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--bg)]">
                  <button onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer font-medium">
                    Cancel
                  </button>
                  <button onClick={handleSave}
                    className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 cursor-pointer">
                    <Save className="w-3.5 h-3.5" />
                    {editId !== null ? 'Update' : 'Save Provider'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
