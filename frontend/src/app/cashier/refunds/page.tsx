"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Eye, RefreshCcw, Filter, AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";

interface Refund {
  id: number;
  paymentId: string;
  clientName: string;
  amount: number;
  date: string;
  reason: string;
  status: string;
}

export default function CashierRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  // New Refund Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    fetchRefunds();
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
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
    }
  };

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");

      const res = await fetch(`${baseUrl}/api/refunds`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch refunds");
      const data = await res.json();
      setRefunds(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not load refunds.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelect = (pid: string) => {
    setPaymentId(pid);
    setSelectedItems([]);
    setAmount("");
  };

  const handleItemToggle = (item: any, checked: boolean) => {
    let newItems = [...selectedItems];
    if (checked) {
      newItems.push(item);
    } else {
      newItems = newItems.filter(i => i.id !== item.id);
    }
    setSelectedItems(newItems);
    
    const total = newItems.reduce((sum, i) => sum + Number(i.total), 0);
    setAmount(total > 0 ? total : "");
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId || !amount || !reason) return;

    setSubmitLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const itemNames = selectedItems.map(i => i.name).join(", ");
      const finalReason = itemNames ? `Refund for: ${itemNames}. Reason: ${reason}` : reason;

      const res = await fetch(`${baseUrl}/api/refunds`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ paymentId, amount: Number(amount), reason: finalReason })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create refund");
      }
      
      Swal.fire("Success", "Refund request submitted successfully.", "success");
      setIsModalOpen(false);
      setPaymentId("");
      setAmount("");
      setReason("");
      fetchRefunds();
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Could not submit refund request.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredRefunds = refunds.filter(r => {
    const matchesSearch = r.paymentId.toLowerCase().includes(search.toLowerCase()) || 
                          r.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === "Completed" || status === "Approved") return "badge-success";
    if (status === "Pending") return "badge-warning";
    if (status === "Rejected") return "badge-danger";
    return "bg-neutral-100 text-neutral-500";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Refunds</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage and submit client refund requests.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary shadow-lg shadow-primary-500/20">
          <Plus className="w-5 h-5 mr-2" /> New Refund Request
        </button>
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input pr-10 cursor-pointer min-w-[150px]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Date</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Reason</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Amount</th>
                <th className="p-4 font-semibold text-sm text-neutral-500 dark:text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-500" />
                    Loading refunds...
                  </td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    <div className="bg-neutral-100 dark:bg-neutral-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-neutral-400" />
                    </div>
                    No refund requests found.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4 font-mono text-sm">{r.paymentId}</td>
                    <td className="p-4 font-medium">{r.clientName}</td>
                    <td className="p-4 text-sm text-neutral-500">{r.date}</td>
                    <td className="p-4 text-sm text-neutral-500 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                    <td className="p-4 font-mono font-bold">₱{r.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={cn("badge", getStatusBadge(r.status))}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Refund Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="card w-full max-w-lg bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center">
              <h2 className="text-xl font-bold">Submit Refund Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateRefund} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Transaction</label>
                  <select 
                    required 
                    value={paymentId}
                    onChange={(e) => handlePaymentSelect(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">-- Choose Transaction --</option>
                    {payments.map((p: any) => (
                      <option key={p.id} value={p.paymentCode}>
                        {p.paymentCode} - {p.clientName} (₱{Number(p.amount).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                
                {paymentId && payments.find(p => p.paymentCode === paymentId)?.items?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Items to Refund</label>
                    <div className="space-y-2 border border-[var(--card-border)] rounded-xl p-3 bg-neutral-50 dark:bg-neutral-900/50 max-h-40 overflow-y-auto">
                      {payments.find(p => p.paymentCode === paymentId)?.items.map((item: any) => (
                        <label key={item.id} className="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-500"
                            checked={selectedItems.some(i => i.id === item.id)}
                            onChange={(e) => handleItemToggle(item, e.target.checked)}
                          />
                          <div className="flex-1 text-sm font-medium">{item.name} <span className="text-neutral-500 font-normal">x{item.qty}</span></div>
                          <div className="text-sm font-bold">₱{Number(item.total).toLocaleString()}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Refund Amount (₱)</label>
                  <input 
                    type="number" 
                    required 
                    min="0.01" 
                    step="0.01"
                    placeholder="0.00" 
                    value={amount}
                    disabled={true}
                    className="input w-full bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Amount is automatically calculated based on selected items.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason for Refund</label>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="Explain why this refund is being requested..." 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input w-full resize-none"
                  ></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitLoading} className="btn btn-primary flex-1">
                    {submitLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
