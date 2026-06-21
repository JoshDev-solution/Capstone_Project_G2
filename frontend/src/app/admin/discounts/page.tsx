"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, BadgePercent, Calendar, X, Tag, ToggleRight, ToggleLeft, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface Discount {
  id: number;
  name: string;
  code: string;
  type: "Percentage" | "FixedAmount";
  value: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  usageCount: number;
  usageLimit: number | null;
  active: boolean;
}

function DiscountModal({ 
  discount, 
  onClose,
  onSave
}: { 
  discount?: Discount; 
  onClose: () => void;
  onSave: (formData: Omit<Discount, "id" | "usageCount"> & { id?: number }) => void;
}) {
  const isEdit = !!discount;
  const [name, setName] = useState(isEdit ? discount.name : "");
  const [code, setCode] = useState(isEdit ? discount.code : "");
  const [type, setType] = useState<"Percentage" | "FixedAmount">(isEdit ? discount.type : "Percentage");
  const [value, setValue] = useState(isEdit ? discount.value : 0);
  const [minPurchase, setMinPurchase] = useState(isEdit ? discount.minPurchase : 0);
  const [startDate, setStartDate] = useState(isEdit ? discount.startDate : "");
  const [endDate, setEndDate] = useState(isEdit ? discount.endDate : "");
  const [usageLimit, setUsageLimit] = useState<number | string>(isEdit ? (discount.usageLimit ?? "") : "");
  const [active, setActive] = useState(isEdit ? discount.active : true);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !type) {
      alert("Name, Code, and Type are required.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    onSave({
      id: discount?.id,
      name,
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minPurchase: Number(minPurchase),
      startDate,
      endDate,
      usageLimit: usageLimit === "" ? null : Number(usageLimit),
      active
    });
    setShowConfirm(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md card p-6 z-10 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isEdit ? "Edit Discount" : "Create Discount"}</h2>
            <button type="button" onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Discount Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g., Senior Pet Discount" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Discount Code</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="input pl-9 uppercase" style={{ paddingLeft: "2.25rem" }} placeholder="PROMO2026" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="input appearance-none cursor-pointer">
                  <option value="Percentage">Percentage (%)</option>
                  <option value="FixedAmount">Fixed Amount (₱)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Value</label>
                <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="input" placeholder="10" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Min. Purchase (₱)</label>
                <input type="number" value={minPurchase} onChange={(e) => setMinPurchase(Number(e.target.value))} className="input" placeholder="0" min="0" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Usage Limit (blank = unlimited)</label>
              <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="input" placeholder="Unlimited" min="1" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="checkbox" />
              <label htmlFor="active" className="text-sm font-medium cursor-pointer">Is Active</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{isEdit ? "Save Changes" : "Create Discount"}</button>
          </div>
        </form>
      </motion.div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        title={isEdit ? "Confirm Updates" : "Confirm Addition"}
        message={isEdit ? "Are you sure you want to save these changes to the discount?" : "Are you sure you want to create this new discount?"}
        confirmText="Yes, Save"
        cancelText="Cancel"
        type="info"
      />
    </motion.div>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Discount | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDiscounts = async () => {
    setLoading(true);
    setError("");
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/discounts`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch discounts.");
      const data = await res.json();
      setDiscounts(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSave = async (formData: Omit<Discount, "id" | "usageCount"> & { id?: number }) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const isEdit = !!formData.id;
      const url = isEdit ? `${baseUrl}/api/discounts/${formData.id}` : `${baseUrl}/api/discounts`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save discount.");
      await fetchDiscounts();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving.");
    }
  };

  const toggle = async (id: number, currentActive: boolean) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const discount = discounts.find((d) => d.id === id);
      if (!discount) return;

      const res = await fetch(`${baseUrl}/api/discounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...discount,
          active: !currentActive
        })
      });

      if (!res.ok) throw new Error("Failed to toggle state.");
      setDiscounts((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/discounts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete discount.");
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting.");
    }
  };

  const filtered = discounts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Discount Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {discounts.filter((d) => d.active).length} active discounts
            </p>
          </div>
          <button onClick={() => { setSelected(undefined); setModal("create"); }} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Create Discount
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
        </div>

        {loading && (
          <div className="text-center py-12 text-neutral-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Loading discounts...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm max-w-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((d, i) => {
              const usagePct = d.usageLimit ? Math.min((d.usageCount / d.usageLimit) * 100, 100) : null;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={cn("card p-5 relative overflow-hidden group", !d.active && "opacity-60")}>
                  <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-5 rounded-bl-3xl" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                      <BadgePercent className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("badge", d.active ? "badge-success" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800")}>
                        {d.active ? "Active" : "Inactive"}
                      </span>
                      <button onClick={() => toggle(d.id, d.active)} title={d.active ? "Deactivate" : "Activate"}
                        className={cn("text-xl", d.active ? "text-success" : "text-neutral-300 dark:text-neutral-700")}>
                        {d.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base mb-1">{d.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono tracking-wider">{d.code}</code>
                    <span className="badge badge-primary text-xs">
                      {d.type === "Percentage" ? `${d.value}% OFF` : `₱${d.value} OFF`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-neutral-400 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{d.startDate} → {d.endDate}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mb-3">Min. purchase: ₱{d.minPurchase.toLocaleString()}</p>

                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Usage</span>
                      <span>{d.usageCount}{d.usageLimit ? `/${d.usageLimit}` : " used"}</span>
                    </div>
                    {usagePct !== null ? (
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", usagePct >= 90 ? "bg-danger" : usagePct >= 60 ? "bg-warning" : "bg-success")} style={{ width: `${usagePct}%` }} />
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-300 dark:text-neutral-600">Unlimited uses</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelected(d); setModal("edit"); }} className="btn btn-ghost text-xs flex-1 py-1.5">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(d.id)}
                      className="btn text-xs py-1.5 flex-1 bg-danger/10 text-danger hover:bg-danger/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-neutral-400 col-span-full">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No discounts found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && <DiscountModal discount={modal === "edit" ? selected : undefined} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this discount? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
