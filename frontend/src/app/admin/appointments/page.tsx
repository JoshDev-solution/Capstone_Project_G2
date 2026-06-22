/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, CalendarCheck, Clock, PawPrint,
  User, Stethoscope, X, Eye, ChevronLeft, ChevronRight,
  Plus, CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "Pending" | "Approved" | "Scheduled" | "InProgress" | "Completed" | "Cancelled" | "NoShow";
type AppType = "WalkIn" | "Scheduled" | "Emergency" | "FollowUp";

interface Appointment {
  id: number;
  code: string;
  clientName: string;
  petName: string;
  petType: string;
  vetName: string;
  service: string;
  date: string;
  time: string;
  status: Status;
  type: AppType;
  reason: string;
}

const statusConfig: Record<Status, { label: string; cls: string; dot: string }> = {
  Pending:    { label: "Pending",     cls: "badge-warning",  dot: "bg-warning" },
  Approved:   { label: "Approved",    cls: "badge-success",  dot: "bg-success" },
  Scheduled:  { label: "Scheduled",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300", dot: "bg-blue-500" },
  InProgress: { label: "In Progress", cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300", dot: "bg-purple-500" },
  Completed:  { label: "Completed",  cls: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300", dot: "bg-neutral-400" },
  Cancelled:  { label: "Cancelled",  cls: "badge-danger",   dot: "bg-danger" },
  NoShow:     { label: "No Show",    cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300", dot: "bg-orange-500" },
};

const typeConfig: Record<AppType, string> = {
  WalkIn:    "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  Scheduled: "badge-primary",
  Emergency: "badge-danger",
  FollowUp:  "badge-warning",
};

const kpiData = [
  { label: "Today's Total", value: 7, color: "#FF4FA3" },
  { label: "Completed",     value: 1, color: "#10B981" },
  { label: "In Progress",   value: 1, color: "#D98CFF" },
  { label: "Pending",       value: 2, color: "#F59E0B" },
];

function DetailModal({ apt, onClose, onStatusChange }: {
  apt: Appointment;
  onClose: () => void;
  onStatusChange: (id: number, status: Status) => void;
}) {
  const cfg = statusConfig[apt.status];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg card p-6 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{apt.code}</h2>
            <span className={cn("badge mt-1", cfg.cls)}>{cfg.label}</span>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: User, label: "Client", value: apt.clientName },
            { icon: PawPrint, label: "Pet", value: `${apt.petName} (${apt.petType})` },
            { icon: Stethoscope, label: "Veterinarian", value: apt.vetName },
            { icon: CalendarCheck, label: "Service", value: apt.service },
            { icon: Clock, label: "Date & Time", value: `${apt.date} at ${apt.time}` },
            { icon: AlertCircle, label: "Reason", value: apt.reason },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
              <row.icon className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Actions */}
        {apt.status === "Pending" && (
          <div className="flex gap-3">
            <button onClick={() => { onStatusChange(apt.id, "Cancelled"); onClose(); }}
              className="btn flex-1 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
            <button onClick={() => { onStatusChange(apt.id, "Approved"); onClose(); }}
              className="btn btn-primary flex-1">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
        {apt.status === "Approved" && (
          <button onClick={() => { onStatusChange(apt.id, "Scheduled"); onClose(); }}
            className="btn btn-primary w-full">
            <CalendarCheck className="w-4 h-4" /> Mark as Scheduled
          </button>
        )}
        {apt.status === "Scheduled" && (
          <button onClick={() => { onStatusChange(apt.id, "Completed"); onClose(); }}
            className="btn btn-primary w-full">
            <CheckCircle className="w-4 h-4" /> Mark as Completed
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AppointmentsPage() {
  const [apts, setApts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "", petId: "", vetId: "", serviceId: "", date: "", time: "", type: "Scheduled", reason: ""
  });
  const [options, setOptions] = useState({ clients: [] as any[], pets: [] as any[], services: [] as any[], vets: [] as any[] });

  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem("vcms_token");
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const [clientsRes, petsRes, servicesRes, vetsRes] = await Promise.all([
        fetch(`${baseUrl}/api/users/clients`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/pets`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/services`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/users/vets`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (clientsRes.ok && petsRes.ok && servicesRes.ok && vetsRes.ok) {
        setOptions({
          clients: await clientsRes.json(),
          pets: await petsRes.json(),
          services: await servicesRes.json(),
          vets: await vetsRes.json()
        });
      }
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("vcms_token");
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const res = await fetch(`${baseUrl}/api/appointments`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApts(data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchOptions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem("vcms_token");
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const payload = {
        ...formData,
        clientId: Number(formData.clientId),
        petId: Number(formData.petId),
        vetId: formData.vetId ? Number(formData.vetId) : null,
        serviceId: Number(formData.serviceId)
      };

      const res = await fetch(`${baseUrl}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await fetchAppointments();
        setShowNewModal(false);
        setFormData({ clientId: "", petId: "", vetId: "", serviceId: "", date: "", time: "", type: "Scheduled", reason: "" });
      } else {
        const errData = await res.json();
        alert(`Failed to create appointment: ${errData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setCreating(false);
    }
  };

  const selectedClient = options.clients.find(c => c.id.toString() === formData.clientId);
  const clientPets = options.pets.filter(p => p.ownerEmail === selectedClient?.email);

  const filtered = apts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = a.clientName.toLowerCase().includes(q) || a.petName.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const changeStatus = async (id: number, status: Status) => {
    try {
      const token = localStorage.getItem("vcms_token");
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const res = await fetch(`${baseUrl}/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Appointment Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{loading ? "Loading..." : `${apts.length} total appointments`}</p>
          </div>
          <button className="btn btn-primary shrink-0" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiData.map((k) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${k.color}15` }}>
                <span className="text-lg font-bold" style={{ color: k.color }}>{k.value}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-tight">{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by code, client, or pet name..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input pl-9 pr-8 min-w-40 appearance-none cursor-pointer" style={{ paddingLeft: "2.25rem" }}>
              <option value="All">All Status</option>
              {Object.keys(statusConfig).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Client / Pet</th>
                  <th className="hidden md:table-cell">Service</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((a, i) => {
                  const cfg = statusConfig[a.status];
                  return (
                    <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <td><code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">{a.code}</code></td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {a.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{a.clientName}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1"><PawPrint className="w-2.5 h-2.5" />{a.petName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell text-sm text-neutral-500 max-w-40">
                        <p className="truncate">{a.service}</p>
                      </td>
                      <td>
                        <p className="text-sm font-medium">{a.date}</p>
                        <p className="text-xs text-neutral-400">{a.time}</p>
                      </td>
                      <td><span className={cn("badge text-[10px]", typeConfig[a.type])}>{a.type}</span></td>
                      <td>
                        <span className={cn("badge flex items-center gap-1 w-fit", cfg.cls)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelected(a)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          {a.status === "Pending" && (
                            <>
                              <button onClick={() => changeStatus(a.id, "Approved")} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-success" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => changeStatus(a.id, "Cancelled")} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger" title="Cancel">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-14 text-neutral-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No appointments found.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[var(--card-border)] flex items-center justify-between text-sm text-neutral-400">
            <span>Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-colors", page === i + 1 ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-800")}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <DetailModal apt={selected} onClose={() => setSelected(null)} onStatusChange={changeStatus} />}

        {showNewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg card p-6 z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">New Appointment</h2>
                <button onClick={() => setShowNewModal(false)} className="btn-icon btn-ghost rounded-xl w-9 h-9"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Client</label>
                    <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value, petId: "" })} className="input w-full">
                      <option value="">Select Client</option>
                      {options.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Pet</label>
                    <select required value={formData.petId} onChange={(e) => setFormData({ ...formData, petId: e.target.value })} className="input w-full" disabled={!formData.clientId}>
                      <option value="">Select Pet</option>
                      {clientPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Service</label>
                    <select required value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} className="input w-full">
                      <option value="">Select Service</option>
                      {options.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Veterinarian (Optional)</label>
                    <select value={formData.vetId} onChange={(e) => setFormData({ ...formData, vetId: e.target.value })} className="input w-full">
                      <option value="">Any Available Vet</option>
                      {options.vets.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Date</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Time</label>
                    <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="input w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 mb-1 block">Reason / Notes</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input w-full h-20 resize-none" placeholder="Reason for appointment..." />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setShowNewModal(false)} className="btn bg-neutral-100 hover:bg-neutral-200 text-neutral-700">Cancel</button>
                  <button type="submit" disabled={creating} className="btn btn-primary min-w-[120px]">{creating ? "Creating..." : "Create Appointment"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
