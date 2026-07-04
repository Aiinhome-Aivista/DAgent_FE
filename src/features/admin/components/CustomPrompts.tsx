import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { MessageSquare, Save, Loader2, RefreshCw } from 'lucide-react';

// For now, this is a mockup UI until the backend API is ready.
export const CustomPrompts: React.FC = () => {
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Mock fetch initial prompt
        setIsLoading(true);
        setTimeout(() => {
            setPromptText('You are an expert business analyst and strategist...\n\n(Current system prompt will load here when API is ready)');
            setIsLoading(false);
        }, 800);
    }, []);

    const handleSave = async () => {
        if (!promptText.trim()) {
            toast.error('Prompt cannot be empty');
            return;
        }
        setIsSaving(true);
        // Mock API call
        setTimeout(() => {
            toast.success('Custom prompt saved successfully! The agent will now use this context.');
            setIsSaving(false);
        }, 1000);
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
                            Set the global behavior and knowledge context for the AI agent. This prompt will replace the default analysis and communication rules, allowing the agent to adapt dynamically to your newly uploaded domain data.
                        </p>
                    </div>
                </div>

                {isLoading ? (
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
                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-50">
                                {/* Optional toolbar inside text area can go here */}
                            </div>
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
