import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Save,
  Loader2,
  RefreshCw,
  Plus,
  Edit2,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Workspace } from "../../../services/workspace.service";
import { promptService } from "../../../services/prompt.service";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
interface CustomPromptsProps {
  workspaces: Workspace[];
  searchQuery: string;
}

interface DeleteTarget {
  workspace_id: number;
  prompt_type: string;
  workspace_name: string;
  prompt_type_label: string;
}

export const CustomPrompts: React.FC<CustomPromptsProps> = ({
  workspaces,
  searchQuery,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  const [allPrompts, setAllPrompts] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | "">(
    "",
  );
  const [selectedPromptType, setSelectedPromptType] =
    useState<string>("analysis");
  const [promptText, setPromptText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [promptTypes, setPromptTypes] = useState<
    { value: string; label: string }[]
  >([]);

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
    if (viewMode === "list") {
      fetchAllPrompts();
    }
  }, [viewMode]);

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedWorkspaceId("");
    if (promptTypes.length > 0) {
      setSelectedPromptType(promptTypes[0].value);
    }
    setPromptText("");
    setViewMode("form");
  };

  const handleEditClick = (prompt: any) => {
    setIsEditMode(true);
    setSelectedWorkspaceId(prompt.workspace_id);
    setSelectedPromptType(prompt.prompt_type);
    setPromptText(prompt.custom_prompt);
    setViewMode("form");
  };

  const handleSave = async () => {
    if (selectedWorkspaceId === "") {
      toast.error("Please select a workspace");
      return;
    }
    if (!promptText.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      const response = await promptService.setWorkspacePrompt(
        selectedWorkspaceId as number,
        selectedPromptType,
        promptText,
      );
      if (response?.success) {
        toast.success(
          isEditMode
            ? "Custom prompt updated successfully!"
            : "Custom prompt added successfully!",
        );
        setViewMode("list");
      } else {
        toast.error(response?.message || "Failed to save prompt");
      }
    } catch (error) {
      console.error("Failed to save prompt", error);
      toast.error("Failed to save custom prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (p: any) => {
    setDeleteTarget({
      workspace_id: p.workspace_id,
      prompt_type: p.prompt_type,
      workspace_name:
        p.workspace_id === 0
          ? "Global Fallback"
          : p.workspace_name || `Workspace #${p.workspace_id}`,
      prompt_type_label: p.prompt_type_label || p.prompt_type,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await promptService.deleteWorkspacePrompt(
        deleteTarget.workspace_id,
        deleteTarget.prompt_type,
      );
      if (response?.success) {
        toast.success("Custom prompt deleted successfully!");
        setDeleteTarget(null);
        await fetchAllPrompts();
      } else {
        toast.error(response?.message || "Failed to delete prompt");
      }
    } catch (error) {
      console.error("Failed to delete prompt", error);
      toast.error("Failed to delete custom prompt");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPrompts = allPrompts.filter(
    (p) =>
      (p.workspace_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (p.prompt_type_label?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (p.custom_prompt?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ),
  );

  return (
    <div className="w-full h-full flex flex-col space-y-4 min-h-0">
      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Delete Custom Prompt
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-[var(--bg)]/60 border border-[var(--border)] rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Workspace</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {deleteTarget.workspace_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">
                  Prompt Type
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {deleteTarget.prompt_type_label}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg)] transition-all disabled:opacity-50"
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-sm font-medium text-white hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col flex-1 min-h-0">
          <div className="shrink-0 p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-semibold">Custom Prompts</span>
            </div>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Prompt
            </button>
          </div>

          {isLoadingList ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 border-t border-[var(--border)]">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-secondary)]">
                Loading prompts...
              </span>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <DataTable
                value={filteredPrompts}
                scrollable
                scrollHeight="flex"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage={
                  <div className="p-8 text-center text-[var(--text-secondary)]">
                    {searchQuery
                      ? "No prompts match your search."
                      : "No custom prompts found."}
                  </div>
                }
                className="w-full"
                pt={{
                  wrapper: { className: "custom-scrollbar" },
                  thead: { className: "!bg-[var(--surface)] !z-10" },
                  tbody: { className: "bg-[var(--surface)]" },
                  bodyRow: {
                    className:
                      "hover:bg-[var(--surface-hover)] transition-colors",
                  },
                  paginator: {
                    root: {
                      className:
                        "!bg-[var(--surface)] !border-t !border-[var(--border)] !py-3 !px-4 !flex !items-center !justify-center !gap-1",
                    },
                    pages: {
                      className: "!flex !items-center !gap-1",
                    },
                    firstPageButton: {
                      className:
                        "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center",
                    },
                    prevPageButton: {
                      className:
                        "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center",
                    },
                    nextPageButton: {
                      className:
                        "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center",
                    },
                    lastPageButton: {
                      className:
                        "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !flex !items-center !justify-center",
                    },
                    pageButton: ({ context }: any) => ({
                      className: `!w-9 !h-9 !rounded-lg !transition-colors !flex !items-center !justify-center text-sm ${
                        context.active
                          ? "!bg-[var(--accent)] !text-white !font-semibold"
                          : "hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] hover:!border-[var(--border)] !border !border-transparent"
                      }`,
                    }),
                    RPPDropdown: {
                      root: {
                        className:
                          "!bg-[var(--surface)] !border !border-[var(--border)] hover:!border-[var(--accent)] !rounded-lg !px-2 !py-1 text-sm !text-[var(--text-primary)] !flex !items-center !gap-1.5 !cursor-pointer !outline-none !transition-colors",
                      },
                      input: { className: "!px-1 !font-medium" },
                      trigger: {
                        className:
                          "!w-5 !text-[var(--text-secondary)] !flex !items-center !justify-center",
                      },
                      panel: {
                        className:
                          "!bg-[var(--surface)] !border border-[var(--border)] !rounded-lg !shadow-lg !py-1 !mt-1 !z-50",
                      },
                      item: ({ context }: any) => ({
                        className: `!px-4 !py-2 text-sm !cursor-pointer !transition-colors ${
                          context.selected
                            ? "!bg-[var(--accent)] !text-white !font-semibold"
                            : "hover:!bg-[var(--surface-hover)] !text-[var(--text-primary)]"
                        }`,
                      }),
                    },
                  },
                }}
              >
                <Column
                  header="Workspace"
                  headerClassName="!bg-[var(--bg)] !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-4 !py-4 !border-t !border-b !border-[var(--border)] text-left"
                  className="!px-4 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-primary)] font-medium truncate"
                  style={{ width: "25%" }}
                  body={(p: any) => (
                    <div className="truncate" title={p.workspace_name}>
                      {p.workspace_id === 0
                        ? "[ GLOBAL FALLBACK ]"
                        : p.workspace_name || `Workspace #${p.workspace_id}`}
                    </div>
                  )}
                />
                <Column
                  header="Prompt Type"
                  headerClassName="!bg-[var(--bg)] !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-4 !py-4 !border-t !border-b !border-[var(--border)] text-left"
                  className="!px-4 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] truncate"
                  style={{ width: "25%" }}
                  body={(p: any) => (
                    <div className="truncate">
                      {p.prompt_type_label || p.prompt_type}
                    </div>
                  )}
                />
                <Column
                  header="Prompt"
                  headerClassName="!bg-[var(--bg)] !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-4 !py-4 !border-t !border-b !border-[var(--border)] text-left"
                  className="!px-4 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] truncate"
                  style={{ width: "35%" }}
                  body={(p: any) => (
                    <div className="truncate" title={p.custom_prompt}>
                      {p.custom_prompt?.length > 80
                        ? `${p.custom_prompt.substring(0, 80)}...`
                        : p.custom_prompt}
                    </div>
                  )}
                />
                <Column
                  header="Actions"
                  headerClassName="!bg-[var(--bg)] !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-4 !py-4 !border-t !border-b !border-[var(--border)] text-right"
                  className="!px-4 !py-4 !border-b !border-[var(--border)] text-right"
                  style={{ width: "15%" }}
                  body={(p: any) => (
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all cursor-pointer"
                        title="View / Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                />
              </DataTable>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 pr-2 mb-0">
          <div className="shrink-0 flex items-center gap-4 mb-3 pb-3 border-b border-[var(--border)]">
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:bg-[var(--bg)]/80 hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {isEditMode ? "Edit Custom Prompt" : "Add Custom Prompt"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {isEditMode
                  ? "Update the existing system instructions."
                  : "Set global behavior and context for a workspace."}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-4 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Select Workspace
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) =>
                  setSelectedWorkspaceId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                disabled={isEditMode}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-auto"
              >
                <option value="">-- Choose a workspace --</option>
                <option value={0}>Global Fallback Prompts</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.workspace_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Select Prompt Type
              </label>
              <select
                value={selectedPromptType}
                onChange={(e) => setSelectedPromptType(e.target.value)}
                disabled={isEditMode}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-auto"
              >
                {promptTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 space-y-4 pb-2">
            <div className="relative flex-1 min-h-0">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full h-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] resize-none font-mono text-sm custom-scrollbar transition-all"
                placeholder="Enter system instructions here..."
              />
            </div>

            <div className="shrink-0 flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <RefreshCw className="w-4 h-4" />
                <span>Changes apply immediately to new sessions.</span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isEditMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl p-3">
          <h3 className="font-semibold text-[var(--accent)] mb-2">Pro Tips</h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc list-inside">
            <li>
              Define clear rules about how the AI should interpret columns.
            </li>
            <li>Explicitly forbid the AI from hallucinating data.</li>
            <li>
              If your data is healthcare-related, instruct it to act as a
              medical analyst.
            </li>
          </ul>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <h3 className="font-semibold text-amber-500 mb-2">
            Note on Structured Queries
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            The strict database querying rules (SQL/AQL syntax guidelines)
            remain intact in the background to ensure stability. Your custom
            prompt focuses entirely on business logic, tone, and analysis
            context.
          </p>
        </div>
      </div>
    </div>
  );
};
