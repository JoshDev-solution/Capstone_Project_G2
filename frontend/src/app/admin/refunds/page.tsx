"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Eye, CheckCircle, XCircle, RotateCcw, Filter,
  X, PhilippinePeso, CalendarDays, User, CreditCard, FileText,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

type RefundStatus = "Pending" | "Approved" | "Rejected" | "Processed";

interface Refund {
  id: number;
  code: string;
  clientName: string;
  billCode: string;
  paymentMethod: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
}

const statusConfig: Record<RefundStatus, string> = {
  Pending:   "badge-warning",
  Approved:  "badge-success",
  Rejected:  "badge-danger",
  Processed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

function DetailModal({ refund, onClose, onApprove, onReject, onProcess }: {
  refund: Refund;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onProcess: (id: number) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg card p-6 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{refund.code}</h2>
            <span className={cn("badge mt-1", statusConfig[refund.status])}>{refund.status}</span>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        <div className="gradient-primary rounded-2xl p-5 text-white text-center mb-6">
          <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Refund Amount</p>
          <p className="text-4xl font-bold">₱{refund.amount.toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">{refund.paymentMethod} · {refund.billCode}</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {[
            { icon: User,        label: "Client",        value: refund.clientName },
            { icon: FileText,    label: "Reason",        value: refund.reason },
            { icon: CalendarDays,label: "Requested",     value: refund.requestedAt },
            ...(refund.processedAt ? [{ icon: CheckCircle, label: "Processed", value: refund.processedAt }] : []),
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
              <row.icon className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {refund.status === "Pending" && (
          <div className="flex gap-3">
            <button onClick={() => { onReject(refund.id); onClose(); }} className="btn flex-1 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => { onApprove(refund.id); onClose(); }} className="btn btn-primary flex-1">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
        {refund.status === "Approved" && (
          <button onClick={() => { onProcess(refund.id); onClose(); }} className="btn btn-primary w-full">
            <RotateCcw className="w-4 h-4" /> Mark as Processed
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Refund | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; action: "approve" | "reject" | "process"; id: number | null }>({ open: false, action: "approve", id: null });
  const PER_PAGE = 8;

  const fetchRefunds = async () => {
    setLoading(true);
    setError("");
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/refunds`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch refunds.");
      const data = await res.json();
      setRefunds(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const updateStatus = async (id: number, newStatus: RefundStatus) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/refunds/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status.");
      await fetchRefunds();
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  const executeApprove = (id: number) => updateStatus(id, "Approved");
  const executeReject = (id: number) => updateStatus(id, "Rejected");
  const executeProcess = (id: number) => updateStatus(id, "Processed");

  const handleApproveClick = (id: number) => { setConfirmState({ open: true, action: "approve", id }); };
  const handleRejectClick = (id: number) => { setConfirmState({ open: true, action: "reject", id }); };
  const handleProcessClick = (id: number) => { setConfirmState({ open: true, action: "process", id }); };

  const filtered = refunds.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = r.clientName.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.billCode.toLowerCase().includes(q);
    const matchS = statusFilter === "All" || r.status === statusFilter;
    return matchQ && matchS;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const pending = refunds.filter((r) => r.status === "Pending").length;
  const totalAmt = refunds.filter((r) => r.status === "Processed").reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Refund Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{refunds.length} total refund requests</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending",   value: pending, color: "#F59E0B" },
            { label: "Approved",  value: refunds.filter((r) => r.status === "Approved").length, color: "#10B981" },
            { label: "Processed", value: refunds.filter((r) => r.status === "Processed").length, color: "#3B82F6" },
            { label: "Total Refunded", value: `₱${totalAmt.toLocaleString()}`, color: "#FF4FA3" },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by client, code, or bill..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input pl-9 pr-8 min-w-36 appearance-none cursor-pointer" style={{ paddingLeft: "2.25rem" }}>
              <option value="All">All Status</option>
              {["Pending", "Approved", "Rejected", "Processed"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-neutral-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Loading refunds...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm max-w-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Refund Code</th>
                    <th>Client</th>
                    <th className="hidden sm:table-cell">Bill</th>
                    <th>Amount</th>
                    <th className="hidden md:table-cell">Payment</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <td><code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">{r.code}</code></td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">{r.clientName.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-semibold">{r.clientName}</p>
                            <p className="text-xs text-neutral-400">{r.requestedAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell"><code className="text-xs text-neutral-400">{r.billCode}</code></td>
                      <td className="font-bold text-primary-600 dark:text-primary-400">₱{r.amount.toLocaleString()}</td>
                      <td className="hidden md:table-cell text-sm text-neutral-500">{r.paymentMethod}</td>
                      <td><span className={cn("badge", statusConfig[r.status])}>{r.status}</span></td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelected(r)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500">
                            <Eye className="w-4 h-4" />
                          </button>
                          {r.status === "Pending" && (
                            <>
                              <button onClick={() => handleApproveClick(r.id)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-success" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRejectClick(r.id)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {r.status === "Approved" && (
                            <button onClick={() => handleProcessClick(r.id)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-blue-500" title="Process">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-14 text-neutral-400">
                <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No refund requests found.</p>
              </div>
            )}
            <div className="px-4 py-3 border-t border-[var(--card-border)] flex items-center justify-between text-sm text-neutral-400">
              <span>Showing {Math.min((page-1)*PER_PAGE+1,filtered.length)}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page===totalPages} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <DetailModal refund={selected} onClose={() => setSelected(null)} onApprove={handleApproveClick} onReject={handleRejectClick} onProcess={handleProcessClick} />}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ ...confirmState, open: false })}
        onConfirm={() => {
          if (confirmState.id !== null) {
            if (confirmState.action === "approve") executeApprove(confirmState.id);
            else if (confirmState.action === "reject") executeReject(confirmState.id);
            else executeProcess(confirmState.id);
          }
          setConfirmState({ ...confirmState, open: false });
        }}
        title={`Confirm ${confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1)}`}
        message={`Are you sure you want to ${confirmState.action} this refund request?`}
        confirmText={`Yes, ${confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1)}`}
        cancelText="Cancel"
        type={confirmState.action === "approve" ? "success" : confirmState.action === "reject" ? "danger" : "info"}
      />
    </>
  );
}
