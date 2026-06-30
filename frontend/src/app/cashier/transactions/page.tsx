"use client";

import { useState, useEffect } from "react";
import { Search, Filter, RefreshCcw, AlertTriangle, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CashierTransactions() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");

      const res = await fetch(`${baseUrl}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.paymentCode?.toLowerCase().includes(search.toLowerCase()) || 
                          p.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = filterMethod === "All" || p.paymentMethod === filterMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Transactions History</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">View all completed POS transactions and payments.</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by Transaction ID or Client Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-neutral-400" />
            <select 
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="input pr-10 cursor-pointer min-w-[150px]"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-[var(--card-border)]">
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Transaction ID</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Client Name</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Date & Time</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Items</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Method</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    <div className="bg-neutral-100 dark:bg-neutral-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Receipt className="w-6 h-6 text-neutral-400" />
                    </div>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4 font-mono text-sm font-bold text-primary-600 dark:text-primary-400">{p.paymentCode}</td>
                    <td className="p-4 font-medium">{p.clientName}</td>
                    <td className="p-4 text-sm text-neutral-500">
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(p.paymentDate))}
                    </td>
                    <td className="p-4 text-sm text-neutral-500 max-w-xs truncate" title={p.items?.map((i: any) => i.name).join(', ')}>
                      {p.items?.length > 0 ? (
                        <span>{p.items.length} items ({p.items[0].name}{p.items.length > 1 ? ', ...' : ''})</span>
                      ) : (
                        <span className="opacity-50">No items</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "badge",
                        p.paymentMethod === "Cash" && "bg-emerald-500/10 text-emerald-600",
                        p.paymentMethod === "GCash" && "bg-blue-500/10 text-blue-600",
                        p.paymentMethod === "Maya" && "bg-violet-500/10 text-violet-600",
                        p.paymentMethod === "Card" && "bg-orange-500/10 text-orange-600",
                      )}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-black text-lg">₱{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
