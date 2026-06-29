"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingDown, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function getLevel(qty: number, reorder: number, max: number) {
  const pct = max ? (qty / max) * 100 : 0;
  if (qty <= 0) return { label: "Out of Stock", color: "bg-danger", badge: "badge-danger" };
  if (qty <= reorder * 0.5) return { label: "Critical", color: "bg-danger", badge: "badge-danger" };
  if (qty <= reorder) return { label: "Low Stock", color: "bg-warning", badge: "badge-warning" };
  if (pct >= 80) return { label: "Well Stocked", color: "bg-success", badge: "badge-success" };
  return { label: "Normal", color: "bg-info", badge: "bg-info/10 text-info" };
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
        if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
        const token = localStorage.getItem("vcms_token");
        const headers = { "Authorization": `Bearer ${token}` };

        const [invRes, txRes] = await Promise.all([
          fetch(`${baseUrl}/api/inventory`, { headers }),
          fetch(`${baseUrl}/api/inventory-transactions`, { headers })
        ]);

        if (invRes.ok) {
          const invData = await invRes.json();
          setInventory(invData);
        }
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summaryCards = [
    { label: "Total Products", value: inventory.length, icon: Package, color: "#FF4FA3" },
    { label: "Low Stock Items", value: inventory.filter((i) => i.quantity <= i.reorderLevel).length, icon: AlertTriangle, color: "#F59E0B" },
    { label: "Critical Items", value: inventory.filter((i) => i.quantity <= i.reorderLevel * 0.5).length, icon: TrendingDown, color: "#EF4444" },
    { label: "Expiring Soon", value: inventory.filter((i) => i.expirationDate && new Date(i.expirationDate) < new Date("2027-01-01")).length, icon: RefreshCw, color: "#D98CFF" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Monitor stock levels, reorder alerts, and expiration dates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary text-danger border-danger/20 hover:bg-danger/10 text-sm whitespace-nowrap" onClick={() => window.location.href="/admin/inventory/expired"}>
            <AlertTriangle className="w-4 h-4 mr-2" /> Expired Items
          </button>
          <button className="btn btn-primary text-sm whitespace-nowrap" onClick={() => window.location.href="/admin/products"}>
            Manage Products
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Loading inventory data...</div>
      ) : (
        <>
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
              <button className="btn btn-primary text-sm" onClick={() => window.location.href="/admin/products"}>
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
                  {inventory.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-neutral-400">No inventory found.</td></tr>}
                  {inventory.map((item, i) => {
                    const maxStock = item.maxStock || (item.reorderLevel * 5) || 100;
                    const level = getLevel(item.quantity, item.reorderLevel, maxStock);
                    const pct = Math.min((item.quantity / maxStock) * 100, 100);
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td>
                          <p className="text-sm font-medium">{item.product?.name || "Unknown Product"}</p>
                          <code className="text-xs text-neutral-400">{item.product?.sku || "N/A"}</code>
                        </td>
                        <td className="text-sm text-neutral-500">Products</td>
                        <td className="font-bold">{item.quantity}</td>
                        <td>
                          <div className="flex items-center gap-2 min-w-32">
                            <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${level.color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-neutral-400 shrink-0">{Math.round(pct)}%</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell text-sm text-neutral-500">
                          {item.expirationDate
                            ? <span className={new Date(item.expirationDate) < new Date() ? "text-warning font-medium" : ""}>{new Date(item.expirationDate).toISOString().split('T')[0]}</span>
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
              {transactions.length === 0 && <div className="text-center py-8 text-neutral-400">No recent transactions.</div>}
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
                      tx.transactionType === "StockIn" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                      {tx.transactionType === "StockIn"
                        ? <ArrowUpCircle className="w-4 h-4" />
                        : <ArrowDownCircle className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.product?.name || `Product ID ${tx.productId}`}</p>
                      <p className="text-xs text-neutral-400">{new Date(tx.transactionDate).toLocaleString()} · by {tx.performedBy || "System"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("font-bold text-base", tx.transactionType === "StockIn" ? "text-success" : "text-danger")}>
                      {tx.transactionType === "StockIn" ? "+" : "-"}{tx.quantity}
                    </span>
                    <p className="text-xs text-neutral-400">{tx.transactionType}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
