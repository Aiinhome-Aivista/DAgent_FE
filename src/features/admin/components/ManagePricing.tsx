import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  UploadCloud,
  HelpCircle,
  Users,
  Mail,
  Sliders,
  Download,
  AlertTriangle,
} from "lucide-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { PricingPlan } from "../types";
import { pricingService } from "../../../services/pricing.service";

interface ManagePricingProps {
  searchQuery: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const initialFormData = {
  plan_name: "",
  data_storage: "",
  uploads: "",
  insights_queries: "",
  basic_features: "",
  download_allowed: "Yes",
  number_of_users: "1",
  custom_kpi: "Yes",
  scheduled_email: "Yes",
};

export const ManagePricing: React.FC<ManagePricingProps> = ({
  searchQuery,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await pricingService.getPlans();
      if (response && response.pricing) {
        setPlans(response.pricing);
      } else {
        setPlans([]);
      }
    } catch (err: any) {
      console.error("Failed to load pricing plans:", err);
      toast.error(err.message || "Failed to load pricing plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (isModalOpen && !editingPlan) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [isModalOpen, editingPlan]);

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name || "",
      data_storage: plan.data_storage || "",
      uploads: plan.uploads || "",
      insights_queries: plan.insights_queries || "",
      basic_features: plan.basic_features || "",
      download_allowed: plan.download_allowed || "Yes",
      number_of_users: plan.number_of_users || "1",
      custom_kpi: plan.custom_kpi || "Yes",
      scheduled_email: plan.scheduled_email || "Yes",
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData(initialFormData);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plan_name.trim()) {
      setError("Plan Name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingPlan) {
        await pricingService.updatePlan(editingPlan.id, formData);
        toast.success("Pricing plan updated successfully");
      } else {
        await pricingService.createPlan(formData);
        toast.success("Pricing plan created successfully");
      }
      handleCloseModal();
      fetchPlans();
    } catch (err: any) {
      console.error("Error saving pricing plan:", err);
      setError(err.message || "Failed to save pricing plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await pricingService.deletePlan(planToDelete.id);
      toast.success("Pricing plan deleted successfully");
      setPlanToDelete(null);
      fetchPlans();
    } catch (err: any) {
      console.error("Failed to delete pricing plan:", err);
      toast.error(err.message || "Failed to delete pricing plan");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.plan_name?.toLowerCase().includes(q) ||
      p.basic_features?.toLowerCase().includes(q) ||
      p.data_storage?.toLowerCase().includes(q) ||
      p.number_of_users?.toLowerCase().includes(q)
    );
  });

  const renderBadge = (value: string) => {
    const isYes =
      value?.trim().toLowerCase() === "yes" ||
      value?.trim().toLowerCase() === "true";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isYes
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        }`}
      >
        {isYes ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {value || "No"}
      </span>
    );
  };

  const actionBodyTemplate = (rowData: PricingPlan) => {
    return (
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => handleOpenEdit(rowData)}
          title="Edit Plan"
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPlanToDelete(rowData)}
          title="Delete Plan"
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <DataTable
        value={filteredPlans}
        loading={isLoading}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "60rem" }}
        emptyMessage={
          <div className="p-8 text-center text-[var(--text-secondary)]">
            No pricing plans found.
          </div>
        }
        className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface)] shadow-sm"
        pt={{
          thead: { className: "bg-[var(--bg)]/50" },
          tbody: { className: "bg-[var(--surface)]" },
          bodyRow: {
            className: "hover:bg-[var(--surface-hover)] transition-colors",
          },
          paginator: {
            root: {
              className:
                "!bg-[var(--surface)] !border-t !border-[var(--border)] !py-3 !px-4 !flex !items-center !justify-center !gap-1",
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
          field="plan_name"
          header="Plan Name"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-primary)] font-semibold"
          body={(row: PricingPlan) => (
            <span className="font-semibold text-[var(--text-primary)]">
              {row.plan_name}
            </span>
          )}
        />
        <Column
          field="data_storage"
          header="Storage"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
        />
        <Column
          field="uploads"
          header="Uploads"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
        />
        <Column
          field="insights_queries"
          header="Queries"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
        />
        <Column
          field="number_of_users"
          header="Users"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
        />
        <Column
          field="basic_features"
          header="Basic Features"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
          body={(row: PricingPlan) => (
            <span className="truncate block max-w-xs" title={row.basic_features}>
              {row.basic_features || "—"}
            </span>
          )}
        />
        <Column
          field="download_allowed"
          header="Download"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm"
          body={(row: PricingPlan) => renderBadge(row.download_allowed)}
        />
        <Column
          field="custom_kpi"
          header="Custom KPI"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm"
          body={(row: PricingPlan) => renderBadge(row.custom_kpi)}
        />
        <Column
          field="scheduled_email"
          header="Scheduled Email"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-left"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm"
          body={(row: PricingPlan) => renderBadge(row.scheduled_email)}
        />
        <Column
          body={actionBodyTemplate}
          header="Actions"
          headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider !px-6 !py-4 !border-b !border-[var(--border)] text-right"
          className="!px-6 !py-4 !border-b !border-[var(--border)] text-right"
          style={{ width: "100px" }}
        />
      </DataTable>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {editingPlan ? "Edit Pricing Plan" : "Create Pricing Plan"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2">
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Plan Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starter, Pro, Enterprise"
                    value={formData.plan_name}
                    onChange={(e) =>
                      setFormData({ ...formData, plan_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Data Storage */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Data Storage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 GB, Unlimited"
                    value={formData.data_storage}
                    onChange={(e) =>
                      setFormData({ ...formData, data_storage: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Uploads */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Uploads
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50 files, Unlimited"
                    value={formData.uploads}
                    onChange={(e) =>
                      setFormData({ ...formData, uploads: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Insights Queries */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Insights Queries
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1,000 Queries, Unlimited"
                    value={formData.insights_queries}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insights_queries: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Number of Users */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Number of Users
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 users, Unlimited"
                    value={formData.number_of_users}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        number_of_users: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* Basic Features */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Basic Features
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Basic Analytics, Document RAG, Graph view"
                    value={formData.basic_features}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basic_features: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                  />
                </div>

                {/* Download Allowed */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Download Allowed
                  </label>
                  <select
                    value={formData.download_allowed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        download_allowed: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Custom KPI */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Custom KPI
                  </label>
                  <select
                    value={formData.custom_kpi}
                    onChange={(e) =>
                      setFormData({ ...formData, custom_kpi: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Scheduled Email */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Scheduled Email
                  </label>
                  <select
                    value={formData.scheduled_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduled_email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-2.5 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingPlan ? (
                    <Edit2 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Delete Pricing Plan
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete the plan{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                "{planToDelete.plan_name}"
              </span>
              ?
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
