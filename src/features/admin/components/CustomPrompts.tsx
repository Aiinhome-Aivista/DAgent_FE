import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Save, Loader2, RefreshCw, Plus, Edit2, ArrowLeft } from 'lucide-react';
import { Workspace } from '../../../services/workspace.service';
import { promptService } from '../../../services/prompt.service';

interface CustomPromptsProps {
    workspaces: Workspace[];
    searchQuery: string;
}

export const CustomPrompts: React.FC<CustomPromptsProps> = ({ workspaces, searchQuery }) => {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

    const [allPrompts, setAllPrompts] = useState<any[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | ''>('');
    const [selectedPromptType, setSelectedPromptType] = useState<string>('analysis');
    const [promptText, setPromptText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [promptTypes, setPromptTypes] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const loadPromptTypes = async () => {
            try {
                const response = await promptService.getPromptTypes();
                if (response?.success && response?.prompt_types) {
                    setPromptTypes(response.prompt_types);
                }
            } catch (error) {
                console.error("Failed to fetch prompt types", error);
            }
        };
        loadPromptTypes();
    }, []);

    const fetchAllPrompts = async () => {
        setIsLoadingList(true);
        try {
            const response = await promptService.getAllWorkspacePrompts();
            if (response?.success && response?.prompts) {
                setAllPrompts(response.prompts);
            }
        } catch (error) {
            console.error("Failed to fetch all prompts", error);
            toast.error("Failed to load custom prompts");
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'list') {
            fetchAllPrompts();
        }
    }, [viewMode]);

    const handleAddClick = () => {
        setIsEditMode(false);
        setSelectedWorkspaceId('');
        if (promptTypes.length > 0) {
            setSelectedPromptType(promptTypes[0].value);
        }
        setPromptText('');
        setViewMode('form');
    };

    const handleEditClick = (prompt: any) => {
        setIsEditMode(true);
        setSelectedWorkspaceId(prompt.workspace_id);
        setSelectedPromptType(prompt.prompt_type);
        setPromptText(prompt.custom_prompt);
        setViewMode('form');
    };

    const handleSave = async () => {
        if (selectedWorkspaceId === '') {
            toast.error('Please select a workspace');
            return;
        }
        if (!promptText.trim()) {
            toast.error('Prompt cannot be empty');
            return;
        }
        setIsSaving(true);
        try {
            const response = await promptService.setWorkspacePrompt(selectedWorkspaceId as number, selectedPromptType, promptText);
            if (response?.success) {
                toast.success(isEditMode ? 'Custom prompt updated successfully!' : 'Custom prompt added successfully!');
                setViewMode('list');
            } else {
                toast.error(response?.message || 'Failed to save prompt');
            }
        } catch (error) {
            console.error("Failed to save prompt", error);
            toast.error("Failed to save custom prompt");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {viewMode === 'list' ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--accent)]">
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm font-semibold">Custom Prompts</span>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Prompt
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--bg)]/10 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">
                        <div className="col-span-3">Workspace</div>
                        <div className="col-span-3">Prompt Type</div>
                        <div className="col-span-5">Prompt</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-[var(--border)] min-h-[100px] bg-[var(--surface)]">
                        {isLoadingList ? (
                            <div className="p-12 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                                <span className="text-sm text-[var(--text-secondary)]">Loading prompts...</span>
                            </div>
                        ) : (() => {
                            const filteredPrompts = allPrompts.filter(p =>
                                (p.workspace_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                                (p.prompt_type_label?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                                (p.custom_prompt?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                            );

                            if (filteredPrompts.length === 0) {
                                return (
                                    <div className="p-12 text-center text-[var(--text-secondary)]">
                                        {searchQuery ? 'No prompts match your search.' : 'No custom prompts found.'}
                                    </div>
                                );
                            }

                            return filteredPrompts.map((p, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--surface-hover)] transition-colors text-sm">
                                    <div className="col-span-3 font-medium text-[var(--text-primary)] truncate" title={p.workspace_name}>
                                        {p.workspace_id === 0 ? '[ GLOBAL FALLBACK ]' : (p.workspace_name || `Workspace #${p.workspace_id}`)}
                                    </div>
                                    <div className="col-span-3 text-[var(--text-secondary)] truncate">
                                        {p.prompt_type_label || p.prompt_type}
                                    </div>
                                    <div className="col-span-5 text-[var(--text-secondary)] truncate" title={p.custom_prompt}>
                                        {p.custom_prompt?.length > 80 ? `${p.custom_prompt.substring(0, 80)}...` : p.custom_prompt}
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            onClick={() => handleEditClick(p)}
                                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all"
                                            title="View / Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                        <button
                            onClick={() => setViewMode('list')}
                            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:bg-[var(--bg)]/80 hover:text-[var(--text-primary)] transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                                {isEditMode ? 'Edit Custom Prompt' : 'Add Custom Prompt'}
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                {isEditMode ? 'Update the existing system instructions.' : 'Set global behavior and context for a workspace.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Select Workspace</label>
                            <select
                                value={selectedWorkspaceId}
                                onChange={(e) => setSelectedWorkspaceId(e.target.value === '' ? '' : Number(e.target.value))}
                                disabled={isEditMode}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all disabled:opacity-50"
                            >
                                <option value="">-- Choose a workspace --</option>
                                <option value={0}>Global Fallback Prompts</option>
                                {workspaces.map(ws => (
                                    <option key={ws.id} value={ws.id}>{ws.workspace_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Select Prompt Type</label>
                            <select
                                value={selectedPromptType}
                                onChange={(e) => setSelectedPromptType(e.target.value)}
                                disabled={isEditMode}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all disabled:opacity-50"
                            >
                                {promptTypes.map(pt => (
                                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                className="w-full h-80 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] resize-none font-mono text-sm custom-scrollbar transition-all"
                                placeholder="Enter system instructions here..."
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <RefreshCw className="w-4 h-4" />
                                <span>Changes apply immediately to new sessions.</span>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isEditMode ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl p-5">
                    <h3 className="font-semibold text-[var(--accent)] mb-2">Pro Tips</h3>
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc list-inside">
                        <li>Define clear rules about how the AI should interpret columns.</li>
                        <li>Explicitly forbid the AI from hallucinating data.</li>
                        <li>If your data is healthcare-related, instruct it to act as a medical analyst.</li>
                    </ul>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                    <h3 className="font-semibold text-amber-500 mb-2">Note on Structured Queries</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                        The strict database querying rules (SQL/AQL syntax guidelines) remain intact in the background to ensure stability. Your custom prompt focuses entirely on business logic, tone, and analysis context.
                    </p>
                </div>
            </div>
        </div>
    );
};
