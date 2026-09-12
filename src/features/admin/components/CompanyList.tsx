import React, { useState, useEffect } from "react";
import { Building2, Loader2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Captcha } from "../../../ui-kit";
import { companyService } from "../../../services/company.service";
import { pricingService } from "../../../services/pricing.service";
import { PricingPlan } from "../types";
import toast from "react-hot-toast";

export type PlanType = string;

export interface CompanyItem {
  id: number;
  company_name: string;
  company_type: string;
  address: string;
  phone_number: string;
  plan_type: PlanType;
}

interface CompanyListProps {
  searchQuery: string;
  isCreatingCompany?: boolean;
  setIsCreatingCompany?: (val: boolean) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  searchQuery,
  isCreatingCompany: externalIsCreating,
  setIsCreatingCompany: externalSetIsCreating,
}) => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [internalIsCreating, setInternalIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await pricingService.getPlans();
      if (response && response.pricing) {
        setAvailablePlans(response.pricing);
      }
    } catch (error) {
      console.error("Failed to load plans:", error);
    }
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await companyService.getCompanies();
      if (response && response.data && response.data.data) {
        setCompanies(response.data.data);
      } else if (response && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const isCreating = externalIsCreating ?? internalIsCreating;
  const setIsCreating = externalSetIsCreating ?? setInternalIsCreating;

  const [newCompany, setNewCompany] = useState<{
    company_name: string;
    company_type: string;
    address: string;
    phone_number: string;
    plan_type: PlanType;
  }>({
    company_name: "",
    company_type: "Technology",
    address: "",
    phone_number: "+91 ",
    plan_type: "Bronze",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    company_name: "",
    company_type: "Technology",
    address: "",
    phone_number: "+91 ",
    plan_type: "Bronze" as PlanType,
  });

  const [companyToDelete, setCompanyToDelete] = useState<CompanyItem | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const resetForm = () => {
    setNewCompany({
      company_name: "",
      company_type: "Technology",
      address: "",
      phone_number: "+91 ",
      plan_type: "Bronze",
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    let val = e.target.value;
    if (!val.startsWith("+91 ")) {
      val = "+91 " + val.replace(/\+91\s?/g, "");
    }
    const digits = val.slice(4).replace(/\D/g, "").slice(0, 10);
    val = "+91 " + digits;

    if (isEdit) {
      setEditFormData({ ...editFormData, phone_number: val });
    } else {
      setNewCompany({ ...newCompany, phone_number: val });
    }
  };


  const handleCreateCompany = async () => {
    if (!newCompany.company_name.trim()) return;

    try {
      setIsLoading(true);
      const data = {
        company_name: newCompany.company_name.trim(),
        company_type: newCompany.company_type.trim() || "General",
        address: newCompany.address.trim() || "N/A",
        phone_number: newCompany.phone_number.trim() || "N/A",
        plan_type: newCompany.plan_type,
      };
      await companyService.createCompany(data);
      toast.success("Company created successfully");
      setIsCreating(false);
      resetForm();
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to create company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (comp: CompanyItem) => {
    setEditingCompany(comp);
    setEditFormData({
      company_name: comp.company_name,
      company_type: comp.company_type,
      address: comp.address,
      phone_number: comp.phone_number,
      plan_type: comp.plan_type,
    });
    setIsEditModalOpen(true);
  };

  const handleEditCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !editFormData.company_name.trim()) return;

    try {
      setIsLoading(true);
      const data = {
        company_name: editFormData.company_name.trim(),
        company_type: editFormData.company_type.trim() || "General",
        address: editFormData.address.trim() || "N/A",
        phone_number: editFormData.phone_number.trim() || "N/A",
        plan_type: editFormData.plan_type,
      };
      await companyService.updateCompany(editingCompany.id, data);
      toast.success("Company updated successfully");
      setIsEditModalOpen(false);
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to update company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    try {
      setIsLoading(true);
      await companyService.deleteCompany(companyId);
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to delete company");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = async (companyId: number, newPlan: PlanType) => {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return;
    try {
      setIsLoading(true);
      await companyService.updateCompany(companyId, { ...comp, plan_type: newPlan });
      toast.success("Plan updated successfully");
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to update plan");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    return (
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">


      {/* Main Table Card */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        <DataTable
          value={filteredCompanies}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage={
            <div className="p-8 text-center text-[var(--text-secondary)]">
              {searchQuery
                ? "No companies match your search."
                : "No companies found."}
            </div>
          }
          loading={isLoading}
          loadingIcon={
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          }
          className="border-t border-[var(--border)] bg-[var(--surface)]"
          pt={{
            thead: { className: "bg-[var(--bg)]/50" },
            tbody: { className: "bg-[var(--surface)]" },
            bodyRow: {
              className: "hover:bg-[var(--surface-hover)] transition-colors",
            },
            paginator: {
              root: {
                className:
                  "!bg-[var(--surface)] !border-t !border-[var(--border)] !py-3 !px-4 !flex !flex-row !flex-nowrap !items-center !justify-center !gap-1.5",
              },
              pages: {
                className: "!flex !flex-row !items-center !gap-1",
              },
              firstPageButton: {
                className:
                  "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !inline-flex !items-center !justify-center",
              },
              prevPageButton: {
                className:
                  "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !inline-flex !items-center !justify-center",
              },
              nextPageButton: {
                className:
                  "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !inline-flex !items-center !justify-center",
              },
              lastPageButton: {
                className:
                  "!w-9 !h-9 !rounded-lg hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] !border !border-transparent hover:!border-[var(--border)] !transition-colors !inline-flex !items-center !justify-center",
              },
              pageButton: ({ context }: any) => ({
                className: `!w-9 !h-9 !rounded-lg !transition-colors !inline-flex !items-center !justify-center text-sm ${context.active
                  ? "!bg-[var(--accent)] !text-white !font-semibold"
                  : "hover:!bg-[var(--surface-hover)] hover:!text-[var(--text-primary)] !text-[var(--text-secondary)] hover:!border-[var(--border)] !border !border-transparent"
                  }`,
              }),
              RPPDropdown: {
                root: {
                  className:
                    "!bg-[var(--surface)] !border !border-[var(--border)] hover:!border-[var(--accent)] !rounded-lg !px-2 !py-1 text-sm !text-[var(--text-primary)] !inline-flex !flex-row !items-center !gap-1.5 !cursor-pointer !outline-none !transition-colors",
                },
                input: { className: "!px-1 !font-medium !inline-block" },
                trigger: {
                  className:
                    "!w-5 !text-[var(--text-secondary)] !inline-flex !items-center !justify-center",
                },
                panel: {
                  className:
                    "!bg-[var(--surface)] !border border-[var(--border)] !rounded-lg !shadow-lg !py-1 !mt-1 !z-50",
                },
                list: {
                  className: "!py-1 !m-0 !list-none !flex !flex-col",
                },
                item: ({ context }: any) => ({
                  className: `!px-4 !py-2 text-sm !cursor-pointer !transition-colors ${context.selected
                    ? "!bg-[var(--accent)] !text-white !font-semibold"
                    : "hover:!bg-[var(--surface-hover)] !text-[var(--text-primary)]"
                    }`,
                }),
              },
            },
          }}
        >
          <Column
            header="SL"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
            style={{ width: "6%" }}
            body={(_: any, options: { rowIndex: number }) => options.rowIndex + 1}
          />
          <Column
            field="company_name"
            header="Company Name"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-primary)] font-semibold truncate"
            style={{ width: "18%" }}
            body={(comp: CompanyItem) => comp.company_name}
          />
          <Column
            field="company_type"
            header="Company Type"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] truncate"
            style={{ width: "16%" }}
            body={(comp: CompanyItem) => (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)]">
                {comp.company_type}
              </span>
            )}
          />
          <Column
            field="address"
            header="Address"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] truncate max-w-[200px]"
            style={{ width: "24%" }}
            body={(comp: CompanyItem) => (
              <span title={comp.address} className="truncate block">
                {comp.address}
              </span>
            )}
          />
          <Column
            field="phone_number"
            header="Ph. Number"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-mono"
            style={{ width: "16%" }}
            body={(comp: CompanyItem) => comp.phone_number}
          />
          <Column
            field="plan_type"
            header="Plan Type"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm"
            style={{ width: "20%" }}
            body={(comp: CompanyItem) => (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-xs">
                {comp.plan_type || "N/A"}
              </span>
            )}
          />
          <Column
            header="Actions"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-center"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-center"
            style={{ width: "10%" }}
            body={(comp: CompanyItem) => (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(comp)}
                  className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                  title="Edit Company"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                <button
                  onClick={() => {
                    setCompanyToDelete(comp);
                    setDeleteConfirmationText("");
                  }}
                  className="p-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Company"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Edit Company Modal */}
      {isEditModalOpen && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--accent)]" />
                Edit Company
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCompanySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter company name..."
                    value={editFormData.company_name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, company_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Company Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technology, Healthcare"
                    value={editFormData.company_type}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, company_type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Ph. Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={editFormData.phone_number}
                    onChange={(e) => handlePhoneChange(e, true)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Plan Type
                  </label>
                  <select
                    value={editFormData.plan_type}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        plan_type: e.target.value as PlanType,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.plan_name}>
                        {plan.plan_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="Enter full office address..."
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editFormData.company_name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-xs font-medium text-white hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--accent)]" />
                Create New Company
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateCompany(); }} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Company Name *
                  </label>
                  <input
                    autoFocus
                    type="text"
                    required
                    placeholder="Enter company name..."
                    value={newCompany.company_name}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, company_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Company Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technology, Healthcare"
                    value={newCompany.company_type}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, company_type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Ph. Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newCompany.phone_number}
                    onChange={(e) => handlePhoneChange(e, false)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Plan Type
                  </label>
                  <select
                    value={newCompany.plan_type}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        plan_type: e.target.value as PlanType,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.plan_name}>
                        {plan.plan_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="Enter full office address..."
                  value={newCompany.address}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCompany.company_name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-xs font-medium text-white hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {companyToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Company</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                Are you sure you want to delete this company? This action cannot be undone. Please type <span className="font-bold text-[var(--text-primary)] select-all">{companyToDelete.company_name}</span> to confirm.
              </p>
              <input
                autoFocus
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] mb-4"
                placeholder={`Type '${companyToDelete.company_name}' here...`}
              />
              
              <div className="mb-6">
                <Captcha onValidate={setIsCaptchaValid} expireTimeMs={60000} />
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setCompanyToDelete(null);
                    setDeleteConfirmationText("");
                    setIsCaptchaValid(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteCompany(companyToDelete.id);
                    setCompanyToDelete(null);
                    setDeleteConfirmationText("");
                    setIsCaptchaValid(false);
                  }}
                  disabled={deleteConfirmationText !== companyToDelete.company_name || !isCaptchaValid}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
