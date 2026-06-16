"use client";

import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingDown, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const inventory = [
  { id: 1, name: "Amoxicillin 250mg", sku: "MED-001", qty: 200, reorder: 50, max: 500, expiry: "2027-06-15", category: "Medicines" },
  { id: 2, name: "Anti-Rabies Vaccine", sku: "VAC-001", qty: 5, reorder: 15, max: 100, expiry: "2027-03-15", category: "Vaccines" },
  { id: 3, name: "5-in-1 Vaccine (Canine)", sku: "VAC-002", qty: 8, reorder: 10, max: 80, expiry: "2027-04-20", category: "Vaccines" },
  { id: 4, name: "Premium Dog Food 10kg", sku: "FOOD-001", qty: 25, reorder: 5, max: 50, expiry: undefined, category: "Pet Food" },
  { id: 5, name: "Multivitamin Drops", sku: "SUP-001", qty: 60, reorder: 15, max: 120, expiry: "2027-11-30", category: "Supplements" },
  { id: 6, name: "Anti-Tick Shampoo", sku: "GRM-001", qty: 40, reorder: 10, max: 80, expiry: "2028-06-30", category: "Grooming" },
  { id: 7, name: "Metronidazole 500mg", sku: "MED-002", qty: 12, reorder: 30, max: 300, expiry: "2027-08-20", category: "Medicines" },
  { id: 8, name: "Calcium Supplement", sku: "SUP-002", qty: 45, reorder: 10, max: 100, expiry: "2028-01-15", category: "Supplements" },
];

const transactions = [
  { id: 1, product: "Amoxicillin 250mg", type: "StockIn", qty: 100, date: "Jun 15, 2026 10:30 AM", by: "Manager" },
  { id: 2, product: "Anti-Rabies Vaccine", type: "StockOut", qty: 3, date: "Jun 15, 2026 09:15 AM", by: "Cashier" },
  { id: 3, product: "Premium Dog Food 10kg", type: "StockIn", qty: 20, date: "Jun 14, 2026 02:00 PM", by: "Manager" },
  { id: 4, product: "5-in-1 Vaccine (Canine)", type: "StockOut", qty: 2, date: "Jun 14, 2026 11:45 AM", by: "Cashier" },
  { id: 5, product: "Multivitamin Drops", type: "StockIn", qty: 50, date: "Jun 13, 2026 03:30 PM", by: "Manager" },
];

function getLevel(qty: number, reorder: number, max: number) {
  const pct = (qty / max) * 100;
  if (qty <= 0) return { label: "Out of Stock", color: "bg-danger", badge: "badge-danger" };
  if (qty <= reorder * 0.5) return { label: "Critical", color: "bg-danger", badge: "badge-danger" };
  if (qty <= reorder) return { label: "Low Stock", color: "bg-warning", badge: "badge-warning" };
  if (pct >= 80) return { label: "Well Stocked", color: "bg-success", badge: "badge-success" };
  return { label: "Normal", color: "bg-info", badge: "bg-info/10 text-info" };
}

const summaryCards = [
  { label: "Total Products", value: inventory.length, icon: Package, color: "#FF4FA3" },
  { label: "Low Stock Items", value: inventory.filter((i) => i.qty <= i.reorder).length, icon: AlertTriangle, color: "#F59E0B" },
  { label: "Critical Items", value: inventory.filter((i) => i.qty <= i.reorder * 0.5).length, icon: TrendingDown, color: "#EF4444" },
  { label: "Expiring Soon", value: inventory.filter((i) => i.expiry && new Date(i.expiry) < new Date("2027-01-01")).length, icon: RefreshCw, color: "#D98CFF" },
];

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Monitor stock levels, reorder alerts, and expiration dates.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-neutral-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Stock Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
          <h2 className="font-bold text-lg">Stock Levels</h2>
          <button className="btn btn-primary text-sm">
            <ArrowUpCircle className="w-4 h-4" /> Stock In
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Stock Level</th>
                <th className="hidden md:table-cell">Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => {
                const level = getLevel(item.qty, item.reorder, item.max);
                const pct = Math.min((item.qty / item.max) * 100, 100);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td>
                      <p className="text-sm font-medium">{item.name}</p>
                      <code className="text-xs text-neutral-400">{item.sku}</code>
                    </td>
                    <td className="text-sm text-neutral-500">{item.category}</td>
                    <td className="font-bold">{item.qty}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-32">
                        <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${level.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-neutral-400 shrink-0">{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-sm text-neutral-500">
                      {item.expiry
                        ? <span className={new Date(item.expiry) < new Date("2027-01-01") ? "text-warning font-medium" : ""}>{item.expiry}</span>
                        : <span className="text-neutral-300">N/A</span>
                      }
                    </td>
                    <td><span className={cn("badge", level.badge)}>{level.label}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--card-border)]">
          <h2 className="font-bold text-lg">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  tx.type === "StockIn" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}>
                  {tx.type === "StockIn"
                    ? <ArrowUpCircle className="w-4 h-4" />
                    : <ArrowDownCircle className="w-4 h-4" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.product}</p>
                  <p className="text-xs text-neutral-400">{tx.date} · by {tx.by}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn("font-bold text-base", tx.type === "StockIn" ? "text-success" : "text-danger")}>
                  {tx.type === "StockIn" ? "+" : "-"}{tx.qty}
                </span>
                <p className="text-xs text-neutral-400">{tx.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
