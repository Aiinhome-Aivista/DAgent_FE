import React, { useState } from "react";
import { Building2, Loader2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export const PLAN_OPTIONS = ["Bronze", "Silver", "Gold"] as const;
export type PlanType = (typeof PLAN_OPTIONS)[number];

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

const DEFAULT_COMPANIES: CompanyItem[] = [
  {
    id: 1,
    company_name: "Acme Corporation",
    company_type: "Technology",
    address: "Building 10, DLF Cyber City, Phase 2, Gurugram, Haryana 122002",
    phone_number: "+91 98765 43210",
    plan_type: "Bronze",
  },
  {
    id: 2,
    company_name: "Global Tech Logistics",
    company_type: "Logistics & Supply",
    address: "C-20, G Block, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051",
    phone_number: "+91 91234 56789",
    plan_type: "Silver",
  },
  {
    id: 3,
    company_name: "Apex Financial Solutions",
    company_type: "Finance & Banking",
    address: "Prestige Tech Park, Marathahalli-Sarjapur Outer Ring Rd, Bengaluru, Karnataka 560103",
    phone_number: "+91 98100 12345",
    plan_type: "Gold",
  },
  {
    id: 4,
    company_name: "Starlight Healthcare",
    company_type: "Healthcare",
    address: "Cyber Towers, HITEC City, Madhapur, Hyderabad, Telangana 500081",
    phone_number: "+91 97112 33445",
    plan_type: "Silver",
  },
  {
    id: 5,
    company_name: "Horizon Media Works",
    company_type: "Digital Media",
    address: "Inner Circle, Connaught Place, New Delhi, Delhi 110001",
    phone_number: "+91 99580 67890",
    plan_type: "Bronze",
  },
  {
    id: 6,
    company_name: "OmniRetail Outlets",
    company_type: "Retail & E-commerce",
    address: "Godrej Genesis, Sector V, Salt Lake, Kolkata, West Bengal 700091",
    phone_number: "+91 98991 22334",
    plan_type: "Gold",
  },
  {
    id: 7,
    company_name: "Vanguard Infra Projects",
    company_type: "Infrastructure",
    address: "Anna Salai, Guindy, Chennai, Tamil Nadu 600032",
    phone_number: "+91 94440 11223",
    plan_type: "Silver",
  },
  {
    id: 8,
    company_name: "Zeneith Pharma Labs",
    company_type: "Pharmaceuticals",
    address: "SG Highway, Prahlad Nagar, Ahmedabad, Gujarat 380015",
    phone_number: "+91 98250 99887",
    plan_type: "Gold",
  },
];

export const CompanyList: React.FC<CompanyListProps> = ({
  searchQuery,
  isCreatingCompany: externalIsCreating,
  setIsCreatingCompany: externalSetIsCreating,
}) => {
  const [companies, setCompanies] = useState<CompanyItem[]>(DEFAULT_COMPANIES);
  const [internalIsCreating, setInternalIsCreating] = useState(false);
  const [isLoading] = useState(false);

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

  const resetForm = () => {
    setNewCompany({
      company_name: "",
      company_type: "Technology",
      address: "",
      phone_number: "+91 ",
      plan_type: "Bronze",
    });
  };

  const handleCreateCompany = () => {
    if (!newCompany.company_name.trim()) return;

    const createdItem: CompanyItem = {
      id: companies.length > 0 ? Math.max(...companies.map((c) => c.id)) + 1 : 1,
      company_name: newCompany.company_name.trim(),
      company_type: newCompany.company_type.trim() || "General",
      address: newCompany.address.trim() || "N/A",
      phone_number: newCompany.phone_number.trim() || "N/A",
      plan_type: newCompany.plan_type,
    };

    setCompanies((prev) => [createdItem, ...prev]);
    setIsCreating(false);
    resetForm();
  };

  const handlePlanChange = (companyId: number, newPlan: PlanType) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, plan_type: newPlan } : c))
    );
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
      {/* Create Company Form Inline */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 border border-[var(--border)] rounded-2xl bg-[var(--surface)] mb-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--accent)]" />
                  Add New Company
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">
                    Company Name *
                  </label>
                  <input
                    autoFocus
                    type="text"
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
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, phone_number: e.target.value })
                    }
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
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCompany}
                  disabled={!newCompany.company_name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-xs font-medium text-white hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Create Company
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            field="id"
            header="ID"
            headerClassName="!bg-[var(--bg)]/50 !text-[var(--text-secondary)] font-bold text-xs uppercase tracking-tight !px-6 !py-4 !border-b !border-[var(--border)] text-left"
            className="!px-6 !py-4 !border-b !border-[var(--border)] text-sm !text-[var(--text-secondary)] font-medium"
            style={{ width: "6%" }}
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
              <div className="flex items-center gap-2 flex-wrap">
                {PLAN_OPTIONS.map((plan) => {
                  const isSelected = comp.plan_type === plan;
                  return (
                    <label
                      key={plan}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all border ${isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-xs font-semibold"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`plan-${comp.id}`}
                        value={plan}
                        checked={isSelected}
                        onChange={() => handlePlanChange(comp.id, plan)}
                        className="w-3.5 h-3.5 accent-[var(--accent)] cursor-pointer"
                      />
                      <span>{plan}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};
