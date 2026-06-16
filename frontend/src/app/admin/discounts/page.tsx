"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, BadgePercent, Calendar, X, Tag, ToggleRight, ToggleLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

const mockDiscounts: Discount[] = [
  { id: 1, name: "Senior Pet Discount",   code: "SENIOR10",   type: "Percentage",  value: 10, minPurchase: 500,  startDate: "2026-01-01", endDate: "2026-12-31", usageCount: 48,  usageLimit: null, active: true },
  { id: 2, name: "New Client Welcome",    code: "WELCOME200", type: "FixedAmount", value: 200, minPurchase: 1000, startDate: "2026-01-01", endDate: "2026-12-31", usageCount: 32,  usageLimit: 100,  active: true },
  { id: 3, name: "Anniversary Sale 15%", code: "ANNIV15",    type: "Percentage",  value: 15, minPurchase: 800,  startDate: "2026-06-01", endDate: "2026-06-30", usageCount: 15,  usageLimit: 50,   active: true },
  { id: 4, name: "Loyalty Bonus",        code: "LOYAL500",   type: "FixedAmount", value: 500, minPurchase: 3000, startDate: "2026-03-01", endDate: "2026-09-30", usageCount: 8,   usageLimit: 20,   active: false },
  { id: 5, name: "Vaccination Promo",    code: "VACC20",     type: "Percentage",  value: 20, minPurchase: 0,    startDate: "2026-06-15", endDate: "2026-07-15", usageCount: 22,  usageLimit: 100,  active: true },
];

function DiscountModal({ discount, onClose }: { discount?: Discount; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md card p-6 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{discount ? "Edit Discount" : "Create Discount"}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Discount Name</label>
            <input type="text" defaultValue={discount?.name} className="input" placeholder="e.g., Senior Pet Discount" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Discount Code</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="text" defaultValue={discount?.code} className="input pl-9 uppercase" placeholder="PROMO2026" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select defaultValue={discount?.type ?? "Percentage"} className="input appearance-none cursor-pointer">
                <option value="Percentage">Percentage (%)</option>
                <option value="FixedAmount">Fixed Amount (₱)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Value</label>
              <input type="number" defaultValue={discount?.value} className="input" placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Min. Purchase (₱)</label>
              <input type="number" defaultValue={discount?.minPurchase} className="input" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date</label>
              <input type="date" defaultValue={discount?.startDate} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End Date</label>
              <input type="date" defaultValue={discount?.endDate} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Usage Limit (blank = unlimited)</label>
            <input type="number" defaultValue={discount?.usageLimit ?? ""} className="input" placeholder="Unlimited" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button className="btn btn-primary flex-1">{discount ? "Save Changes" : "Create Discount"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState(mockDiscounts);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Discount | undefined>();

  const filtered = discounts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) => setDiscounts((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));

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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..." className="input pl-10 w-full" />
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d, i) => {
            const usagePct = d.usageLimit ? Math.min((d.usageCount / d.usageLimit) * 100, 100) : null;
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={cn("card p-5 relative overflow-hidden group", !d.active && "opacity-60")}>
                {/* Gradient corner */}
                <div className="absolute top-0 right-0 w-20 h-20 gradient-primary opacity-5 rounded-bl-3xl" />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                    <BadgePercent className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("badge", d.active ? "badge-success" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800")}>
                      {d.active ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => toggle(d.id)} title={d.active ? "Deactivate" : "Activate"}
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

                {/* Usage bar */}
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
                  <button className="btn text-xs py-1.5 flex-1 bg-danger/10 text-danger hover:bg-danger/20">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {modal && <DiscountModal discount={modal === "edit" ? selected : undefined} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}
