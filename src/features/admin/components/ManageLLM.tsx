import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Cpu, Link2, MessageSquare, Database, Settings2, Trash2 } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import toast from 'react-hot-toast';

interface ManageLLMProps {
  searchQuery: string;
  isCreatingLLM: boolean;
  setIsCreatingLLM: (val: boolean) => void;
}

export const ManageLLM: React.FC<ManageLLMProps> = ({ searchQuery, isCreatingLLM, setIsCreatingLLM }) => {
  const [activeProvider, setActiveProvider] = useState('openai');
  const [chatModel, setChatModel] = useState('');
  const [analysisModel, setAnalysisModel] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [payloadConfig, setPayloadConfig] = useState('{\n  "temperature": 0.2,\n  "max_tokens": 4096\n}');

  // Mocked state for configurations
  const [configs, setConfigs] = useState([
    { id: 1, provider: 'openai', chatModel: 'gpt-4o', analysisModel: 'gpt-4o-mini', apiUrl: 'https://api.openai.com/v1', status: 'Active' },
    { id: 2, provider: 'anthropic', chatModel: 'claude-3.5-sonnet', analysisModel: 'claude-3-haiku', apiUrl: 'https://api.anthropic.com/v1', status: 'Inactive' }
  ]);

  const handleCreate = () => {
    if (!chatModel || !analysisModel || !apiUrl) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    setConfigs(prev => [
      {
        id: Date.now(),
        provider: activeProvider,
        chatModel,
        analysisModel,
        apiUrl,
        status: 'Inactive'
      },
      ...prev
    ]);

    toast.success('LLM Configuration created successfully');
    
    // Reset form
    setChatModel('');
    setAnalysisModel('');
    setApiUrl('');
    setPayloadConfig('{\n  "temperature": 0.2,\n  "max_tokens": 4096\n}');
    setIsCreatingLLM(false);
  };

  const handleDelete = (id: number) => {
    setConfigs(prev => prev.filter(c => c.id !== id));
    toast.success('Configuration deleted');
  };

  const actionTemplate = (rowData: any) => {
    return (
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">
          <Settings2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDelete(rowData.id)}
          className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const statusTemplate = (rowData: any) => {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        rowData.status === 'Active' 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-[var(--text-secondary)]/10 text-[var(--text-secondary)]'
      }`}>
        {rowData.status}
      </span>
    );
  };

  const filteredConfigs = configs.filter(c => 
    c.provider.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.chatModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.apiUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Create Form Inline */}
      <AnimatePresence>
        {isCreatingLLM && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 border border-[var(--border)] rounded-2xl bg-[var(--surface)] mb-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Add New LLM Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Provider</label>
                  <select 
                    value={activeProvider}
                    onChange={(e) => setActiveProvider(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google Gemini</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="ollama">Local (Ollama)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Base URL / Endpoint</label>
                  <input 
                    type="text"
                    placeholder="e.g. https://api.openai.com/v1"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">RAG Chat Model</label>
                  <input 
                    type="text"
                    placeholder="e.g. gpt-4o"
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Session Analysis Model</label>
                  <input 
                    type="text"
                    placeholder="e.g. gpt-4o-mini"
                    value={analysisModel}
                    onChange={(e) => setAnalysisModel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsCreatingLLM(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DataTable
        value={filteredConfigs}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: '50rem' }}
        emptyMessage={
          <div className="p-8 text-center text-[var(--text-secondary)]">
            No LLM configurations found.
          </div>
        }
        className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)] shadow-sm"
        pt={{
          thead: { className: 'bg-[var(--bg)]/50' },
          tbody: { className: 'bg-[var(--surface)]' },
          bodyRow: { className: 'hover:bg-[var(--surface-hover)] transition-colors' },
          paginator: {
            root: { className: '!bg-[var(--surface)] !border-t !border-[var(--border)] !py-3 !px-4 !flex !items-center !justify-center !gap-1' },
            firstPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
            prevPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
            nextPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
            lastPageButton: { className: '!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center' },
            pageButton: ({ context }: any) => ({
              className: `!w-9 !h-9 !rounded-lg !transition-colors !flex !items-center !justify-center text-sm ${
                context.active 
                  ? '!bg-[var(--accent)] !text-white !font-semibold' 
                  : 'hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] hover:!border-[var(--border)] !border !border-transparent'
              }`
            }),
            RPPDropdown: {
              root: { className: '!bg-[var(--surface)] !border !border-[var(--border)] hover:!border-[var(--accent)] !rounded-lg !px-2 !py-1 text-sm !text-[var(--text-primary)] !flex !items-center !gap-1.5 !cursor-pointer !outline-none !transition-colors' },
              input: { className: '!px-1 !font-medium' },
              trigger: { className: '!w-5 !text-[var(--text-secondary)] !flex !items-center !justify-center' },
              panel: { className: '!bg-[var(--surface)] !border border-[var(--border)] !rounded-lg !shadow-lg !py-1 !mt-1 !z-50' },
              item: ({ context }: any) => ({
                className: `!px-4 !py-2 text-sm !cursor-pointer !transition-colors ${
                  context.selected 
                    ? '!bg-[var(--accent)] !text-white !font-semibold' 
                    : 'hover:!bg-[var(--surface-hover)] !text-[var(--text-primary)]'
                }`
              })
            }
          }
        }}
      >
        <Column 
          field="provider" 
          header="Provider" 
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-primary)] font-medium"
          body={(rowData) => <span className="font-medium text-[var(--text-primary)] capitalize">{rowData.provider}</span>}
        />
        <Column 
          field="apiUrl" 
          header="API URL" 
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)]" 
        />
        <Column 
          field="chatModel" 
          header="RAG Model" 
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-mono" 
        />
        <Column 
          field="analysisModel" 
          header="K-Graph Model" 
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-mono" 
        />
        <Column 
          field="status" 
          header="Status" 
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)]"
          body={statusTemplate} 
        />
        <Column 
          header="Actions"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-center"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-center"
          body={actionTemplate} 
          style={{ width: '100px' }} 
        />
      </DataTable>
    </div>
  );
};
