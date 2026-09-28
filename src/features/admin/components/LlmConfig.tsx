import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Bot, Plus, Pencil, Trash2, Play, ChevronDown, ChevronUp,
  Loader2, X, Check, Zap, Globe, Server, Cpu,
  Activity, Search, RefreshCw, Settings2
} from 'lucide-react';
import { defaultConfig } from '../../../services/api.config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LlmProvider {
  id: number;
  name: string;
  provider_type: 'gemini' | 'mistral_cloud' | 'mistral_local' | 'openai';
  model_name: string;
  api_key_masked: string;
  base_url?: string;
  is_active: boolean;
  created_at?: string;
}

interface ScenarioAssignment {
  scenario: string;
  provider_id: number | null;
  provider_name: string | null;
  provider_type: string | null;
  temperature: number;
  max_tokens: number;
  timeout: number;
}

interface ProviderFormData {
  name: string;
  provider_type: string;
  model_name: string;
  api_key: string;
  base_url: string;
  is_active: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDER_TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  gemini: { label: 'Gemini', color: '#4285F4', icon: <Zap className="w-3.5 h-3.5" /> },
  mistral_cloud: { label: 'Mistral Cloud', color: '#FF7000', icon: <Globe className="w-3.5 h-3.5" /> },
  mistral_local: { label: 'Mistral Local', color: '#22c55e', icon: <Server className="w-3.5 h-3.5" /> },
  openai: { label: 'OpenAI', color: '#10a37f', icon: <Cpu className="w-3.5 h-3.5" /> },
};

const SCENARIO_META: Record<string, { label: string; icon: string }> = {
  rag_chat: { label: 'RAG Chat', icon: '💬' },
  analysis: { label: 'Analysis', icon: '📊' },
  visualization: { label: 'Visualisation', icon: '📈' },
  intent_routing: { label: 'Intent Routing', icon: '🔀' },
  insights: { label: 'Insights', icon: '⚡' },
  query_branch: { label: 'Query Branch', icon: '🌿' },
  web_search: { label: 'Web Search', icon: '🔍' },
  agent_planner: { label: 'Agent Planner', icon: '🤖' },
  knowledge: { label: 'Knowledge', icon: '📚' },
  sheet_processing: { label: 'Sheet Processing', icon: '📋' },
};

const EMPTY_FORM: ProviderFormData = {
  name: '', provider_type: 'gemini', model_name: '',
  api_key: '', base_url: '', is_active: true,
};

const BASE = defaultConfig.baseUrl.replace(/\/$/, '');

// ─── API helpers ──────────────────────────────────────────────────────────────

const api = {
  getProviders: () => fetch(`${BASE}/api/llm/providers`).then(r => r.json()),
  createProvider: (d: ProviderFormData) =>
    fetch(`${BASE}/api/llm/providers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
  updateProvider: (id: number, d: ProviderFormData) =>
    fetch(`${BASE}/api/llm/providers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(r => r.json()),
  deleteProvider: (id: number) =>
    fetch(`${BASE}/api/llm/providers/${id}`, { method: 'DELETE' }).then(r => r.json()),
  testProvider: (id: number) =>
    fetch(`${BASE}/api/llm/providers/${id}/test`, { method: 'POST' }).then(r => r.json()),
  getAssignments: () => fetch(`${BASE}/api/llm/assignments`).then(r => r.json()),
  updateAssignments: (assignments: any[]) =>
    fetch(`${BASE}/api/llm/assignments`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignments }) }).then(r => r.json()),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProviderIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 32 }) => {
  const meta = PROVIDER_TYPE_META[type];
  return (
    <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: size, height: size, background: `${meta?.color || '#6366f1'}22` }}>
      <span style={{ color: meta?.color || '#6366f1' }}>{meta?.icon}</span>
    </div>
  );
};

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const TypePill: React.FC<{ type: string }> = ({ type }) => {
  const meta = PROVIDER_TYPE_META[type];
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-mono border" style={{ color: meta?.color || '#a78bfa', borderColor: `${meta?.color || '#a78bfa'}33`, background: `${meta?.color || '#a78bfa'}11` }}>
      {type}
    </span>
  );
};

// ─── Provider Form Modal ──────────────────────────────────────────────────────

interface ProviderModalProps {
  isOpen: boolean;
  editTarget: LlmProvider | null;
  onClose: () => void;
  onSaved: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, editTarget, onClose, onSaved }) => {
  const [form, setForm] = useState<ProviderFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editTarget) {
      setForm({
        name: editTarget.name,
        provider_type: editTarget.provider_type,
        model_name: editTarget.model_name,
        api_key: editTarget.api_key_masked, // show masked
        base_url: editTarget.base_url || '',
        is_active: editTarget.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editTarget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editTarget
        ? await api.updateProvider(editTarget.id, form)
        : await api.createProvider(form);
      if (res.status) {
        toast.success(editTarget ? 'Provider updated!' : 'Provider created!');
        onSaved();
        onClose();
      } else {
        toast.error(res.msg || 'Failed');
      }
    } catch {
      toast.error('Request failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof ProviderFormData, v: any) => setForm(f => ({ ...f, [k]: v }));
  const needsKey = ['gemini', 'mistral_cloud', 'openai'].includes(form.provider_type);
  const needsUrl = ['mistral_local', 'openai'].includes(form.provider_type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              {editTarget ? 'Edit Provider' : 'Add LLM Provider'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Provider Type */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Provider Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PROVIDER_TYPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('provider_type', key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.provider_type === key
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                    }`}
                >
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Display Name *</label>
            <input
              required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Gemini Pro (Production)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Model Name *</label>
            <input
              required value={form.model_name} onChange={e => set('model_name', e.target.value)}
              placeholder={
                form.provider_type === 'gemini' ? 'gemini-1.5-pro' :
                  form.provider_type === 'openai' ? 'gpt-4o' :
                    form.provider_type === 'mistral_cloud' ? 'mistral-small-latest' :
                      'mistral:latest'
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* API Key */}
          {needsKey && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                API Key {editTarget ? '(leave unchanged to keep existing)' : '*'}
              </label>
              <input
                value={form.api_key} onChange={e => set('api_key', e.target.value)}
                type="password"
                placeholder={editTarget ? '••••••••••• (unchanged)' : 'Enter API Key'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono"
              />
            </div>
          )}

          {/* Base URL */}
          {needsUrl && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Base URL {form.provider_type === 'mistral_local' ? '*' : '(optional)'}
              </label>
              <input
                value={form.base_url} onChange={e => set('base_url', e.target.value)}
                placeholder={form.provider_type === 'mistral_local' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[var(--text-primary)]">Active</span>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Inline Provider Assignments Editor ───────────────────────────────────────

const ProviderAssignmentsEditor: React.FC<{
  provider: LlmProvider;
  assignments: ScenarioAssignment[];
  onSave: (newAssignments: ScenarioAssignment[], silent?: boolean) => Promise<void>;
}> = ({ provider, assignments, onSave }) => {
  const [local, setLocal] = useState<ScenarioAssignment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal(assignments.map(a => ({ ...a })));
  }, [assignments, provider.id]);

  // Auto-save debounce for sliders and inputs
  useEffect(() => {
    if (JSON.stringify(local) === JSON.stringify(assignments)) return;

    const handler = setTimeout(() => {
      setSaving(true);
      onSave(local, true).finally(() => setSaving(false));
    }, 800);

    return () => clearTimeout(handler);
  }, [local, assignments, onSave]);

  const toggleScenario = (scenario: string) => {
    setLocal(prev => prev.map(a =>
      a.scenario === scenario
        ? { ...a, provider_id: a.provider_id === provider.id ? null : provider.id }
        : a
    ));
    // The useEffect will pick up this change and auto-save after 800ms,
    // but we can also let the debounce handle it perfectly.
  };

  const updateScenario = (scenario: string, key: keyof ScenarioAssignment, val: any) => {
    setLocal(prev => prev.map(a => a.scenario === scenario ? { ...a, [key]: val } : a));
  };

  const activeScenarios = local.filter(a => a.provider_id === provider.id);

  return (
    <div className="p-5 bg-[var(--bg)]/40 border-b border-[var(--border)]/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Scenarios Using <span style={{ color: PROVIDER_TYPE_META[provider.provider_type]?.color }}>{provider.name}</span> — Click to Toggle
        </h3>
        {saving && (
          <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
          </span>
        )}
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        {local.map(a => {
          const meta = SCENARIO_META[a.scenario];
          const isActive = a.provider_id === provider.id;
          return (
            <button
              key={a.scenario}
              onClick={() => toggleScenario(a.scenario)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${isActive
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                }`}
            >
              <span className="text-sm">{meta?.icon}</span>
              {meta?.label || a.scenario}
              {isActive && <Check className="w-3.5 h-3.5 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Cards for active scenarios */}
      {activeScenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
          {activeScenarios.map(a => {
            const meta = SCENARIO_META[a.scenario];
            return (
              <div key={a.scenario} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                  <span className="text-base">{meta?.icon}</span>
                  {meta?.label || a.scenario}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--accent)] mb-2 uppercase">
                    <span>Temp {a.temperature}</span>
                  </div>
                  <input
                    type="range" min="0" max="2" step="0.1"
                    value={a.temperature}
                    onChange={e => updateScenario(a.scenario, 'temperature', parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Max Tokens</label>
                    <input
                      type="number" min={256} max={32768} step={256}
                      value={a.max_tokens}
                      onChange={e => updateScenario(a.scenario, 'max_tokens', parseInt(e.target.value) || 256)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Timeout</label>
                    <input
                      type="number" min={5} max={3600} step={1}
                      value={a.timeout || 90}
                      onChange={e => updateScenario(a.scenario, 'timeout', parseInt(e.target.value) || 90)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────

export const LlmConfig: React.FC = () => {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [assignments, setAssignments] = useState<ScenarioAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [testingId, setTestingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modals
  const [providerModal, setProviderModal] = useState(false);
  const [editTarget, setEditTarget] = useState<LlmProvider | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([api.getProviders(), api.getAssignments()]);
      if (pRes.status) setProviders(pRes.providers || []);
      if (aRes.status) setAssignments(aRes.assignments || []);
    } catch {
      toast.error('Failed to load LLM configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleTest = async (p: LlmProvider) => {
    setTestingId(p.id);
    try {
      const res = await api.testProvider(p.id);
      if (res.status) {
        toast.success(`✅ ${p.name}: Connection OK`);
      } else {
        toast.error(`❌ ${p.name}: ${res.msg}`);
      }
    } catch {
      toast.error('Test request failed');
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (p: LlmProvider) => {
    if (!confirm(`Delete "${p.name}"? All scenario assignments using this provider will revert to .env default.`)) return;
    setDeletingId(p.id);
    try {
      const res = await api.deleteProvider(p.id);
      if (res.status) {
        toast.success('Provider deleted');
        loadAll();
      } else {
        toast.error(res.msg || 'Delete failed');
      }
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => { setEditTarget(null); setProviderModal(true); };
  const openEdit = (p: LlmProvider) => { setEditTarget(p); setProviderModal(true); };

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.model_name.toLowerCase().includes(search.toLowerCase()) ||
    p.provider_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveAssignments = async (newAssignments: ScenarioAssignment[], silent = false) => {
    try {
      const res = await api.updateAssignments(newAssignments.map(a => ({
        scenario: a.scenario,
        provider_id: a.provider_id || null,
        temperature: a.temperature,
        max_tokens: a.max_tokens,
        timeout: a.timeout || 90,
      })));
      if (res.status) {
        if (!silent) toast.success('Assignments saved!');
        await loadAll();
      } else {
        toast.error(res.msg || 'Failed to save');
      }
    } catch {
      toast.error('Request failed');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">LLM Configuration</h2>
            <p className="text-sm text-[var(--text-secondary)]">Configure AI providers and model assignments.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text" placeholder="Search here"
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] w-48"
            />
          </div>
          {/* Refresh */}
          <button onClick={loadAll} className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {/* Add Config */}
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Config
          </button>
        </div>
      </div>

      {/* ── Providers Table ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[60px_1fr_160px_160px_120px_140px] gap-4 px-5 py-3 bg-[var(--bg)]/50 border-b border-[var(--border)]">
          {['SL NO', 'PROVIDER', 'TYPE', 'MODEL', 'STATUS', 'ACTIONS'].map(h => (
            <span key={h} className="text-xs font-semibold text-[var(--text-secondary)] tracking-wider uppercase">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No providers match your search.' : 'No providers yet. Click "Add Config" to get started.'}</p>
          </div>
        ) : (
          filtered.map((p, idx) => (
            <div key={p.id}>
              {/* Row */}
              <div className={`grid grid-cols-[60px_1fr_160px_160px_120px_140px] gap-4 items-center px-5 py-4 hover:bg-[var(--accent)]/3 transition-colors border-b border-[var(--border)]/50`}>
                {/* SL NO */}
                <span className="text-sm text-[var(--text-secondary)] font-mono">{idx + 1}</span>

                {/* Provider */}
                <div className="flex items-center gap-3 min-w-0">
                  <ProviderIcon type={p.provider_type} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate font-mono">
                      {p.base_url || (p.provider_type === 'gemini' ? 'https://generativelanguage.googleapis.com' : p.provider_type === 'mistral_cloud' ? 'https://api.mistral.ai/v...' : 'https://api.openai.com/v...')}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <TypePill type={p.provider_type} />

                {/* Model */}
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] font-mono min-w-0">
                  <Cpu className="w-3.5 h-3.5 shrink-0 text-[var(--text-secondary)]" />
                  <span className="truncate">{p.model_name}</span>
                </div>

                {/* Status */}
                <StatusBadge active={p.is_active} />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Test */}
                  <button
                    onClick={() => handleTest(p)}
                    disabled={testingId === p.id}
                    title="Test connection"
                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors disabled:opacity-50"
                  >
                    {testingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  </button>
                  {/* Expand */}
                  <button
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    title="View details"
                    className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors"
                  >
                    {expandedId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => openEdit(p)}
                    title="Edit provider"
                    className="p-1.5 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    title="Delete provider"
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-400 transition-colors disabled:opacity-50"
                  >
                    {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded row detail */}
              {expandedId === p.id && (
                <ProviderAssignmentsEditor
                  provider={p}
                  assignments={assignments}
                  onSave={handleSaveAssignments}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Scenario Routing Overview ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg)]/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            Scenario Routing Overview
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="py-10 text-center text-[var(--text-secondary)] text-sm">
            No scenario assignments found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 divide-x divide-y divide-[var(--border)]/40">
            {assignments
              .filter(a => SCENARIO_META[a.scenario])
              .map(a => {
                const meta = SCENARIO_META[a.scenario];
                const provType = a.provider_type || '';
                const provColor = PROVIDER_TYPE_META[provType]?.color || 'var(--accent)';
                return (
                  <div key={a.scenario} className="p-4 hover:bg-[var(--accent)]/3 transition-colors group">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">{meta?.icon}</span>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">{meta?.label}</span>
                    </div>
                    {a.provider_name ? (
                      <p className="text-sm font-semibold truncate" style={{ color: provColor }}>{a.provider_name}</p>
                    ) : (
                      <p className="text-sm font-semibold text-[var(--text-secondary)] italic">.env default</p>
                    )}
                    <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                      t={a.temperature} · {(a.max_tokens / 1000).toFixed(a.max_tokens % 1000 === 0 ? 0 : 1)}k tok
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ProviderModal
        isOpen={providerModal}
        editTarget={editTarget}
        onClose={() => { setProviderModal(false); setEditTarget(null); }}
        onSaved={loadAll}
      />
    </div>
  );
};
