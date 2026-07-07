import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Save, Loader2, RefreshCw } from 'lucide-react';
import { Workspace } from '../../../services/workspace.service';
import { promptService } from '../../../services/prompt.service';

interface CustomPromptsProps {
    workspaces: Workspace[];
}

export const CustomPrompts: React.FC<CustomPromptsProps> = ({ workspaces }) => {
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | ''>('');
    const [selectedPromptType, setSelectedPromptType] = useState<string>('analysis');
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [promptTypes, setPromptTypes] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const loadPromptTypes = async () => {
            try {
                const response = await promptService.getPromptTypes();
                if (response?.success && response?.prompt_types) {
                    setPromptTypes(response.prompt_types);
                    if (response.prompt_types.length > 0) {
                        setSelectedPromptType(response.prompt_types[0].value);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch prompt types", error);
                toast.error("Failed to load prompt types");
            }
        };
        loadPromptTypes();
    }, []);

    useEffect(() => {
        if (!selectedWorkspaceId || !selectedPromptType) {
            setPromptText('');
            return;
        }

        const fetchPrompt = async () => {
            setIsLoading(true);
            try {
                const response = await promptService.getWorkspacePromptByType(selectedWorkspaceId as number, selectedPromptType);
                if (response?.success) {
                    setPromptText(response.custom_prompt || '');
                } else {
                    setPromptText('');
                }
            } catch (error) {
                console.error("Failed to fetch custom prompt", error);
                setPromptText('');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrompt();
    }, [selectedWorkspaceId, selectedPromptType]);

    const handleSave = async () => {
        if (!selectedWorkspaceId) {
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
                toast.success('Custom prompt saved successfully!');
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">System Context Prompt</h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Set the global behavior and knowledge context for the AI agent per workspace. This prompt will replace the default analysis and communication rules, allowing the agent to adapt dynamically to your newly uploaded domain data.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Select Workspace</label>
                        <select
                            value={selectedWorkspaceId}
                            onChange={(e) => setSelectedWorkspaceId(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all"
                        >
                            <option value="">-- Choose a workspace --</option>
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
                            className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all"
                        >
                            {promptTypes.map(pt => (
                                <option key={pt.value} value={pt.value}>{pt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!selectedWorkspaceId ? (
                    <div className="flex items-center justify-center h-48 bg-[var(--bg)]/30 rounded-xl border border-[var(--border)] border-dashed">
                        <p className="text-[var(--text-secondary)]">Please select a workspace to view or edit prompts.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center h-48 bg-[var(--bg)]/30 rounded-xl border border-[var(--border)] border-dashed">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                    </div>
                ) : (
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
                                <span>Changes apply immediately to new sessions in this workspace.</span>
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
                                Save Prompt
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
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
