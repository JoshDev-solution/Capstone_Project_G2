"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Eye, Search, Clock, User, PawPrint, Mail, Phone, X } from "lucide-react";

interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  pets?: string[];
}

const mock: Registration[] = [
  { id: 1, name: "Elena Villanueva", email: "elena.v@gmail.com", phone: "+63-922-111-2222", address: "456 Mayon St., Pasig City", submittedAt: "2026-06-16 02:14 AM", status: "Pending", pets: [] },
  { id: 2, name: "Marco Reyes", email: "marco.r@gmail.com", phone: "+63-933-222-3333", address: "789 Katipunan Ave., Quezon City", submittedAt: "2026-06-15 10:30 PM", status: "Pending", pets: [] },
  { id: 3, name: "Sofia Lim", email: "sofia.lim@yahoo.com", phone: "+63-944-333-4444", address: "123 Taft Ave., Manila", submittedAt: "2026-06-15 08:55 PM", status: "Pending", pets: [] },
  { id: 4, name: "David Garcia", email: "david.g@gmail.com", phone: "+63-955-444-5555", address: "321 Buendia Ave., Makati", submittedAt: "2026-06-14 04:00 PM", status: "Approved", pets: [] },
  { id: 5, name: "Rachel Torres", email: "rachel.t@gmail.com", phone: "+63-966-555-6666", address: "654 Kalayaan Ave., Quezon City", submittedAt: "2026-06-13 11:20 AM", status: "Rejected", pets: [] },
];

function DetailModal({ reg, onClose, onApprove, onReject }: {
  reg: Registration;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg card p-6 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Registration Details</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {reg.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold">{reg.name}</h3>
            <span className={`badge ${reg.status === "Pending" ? "badge-warning" : reg.status === "Approved" ? "badge-success" : "badge-danger"}`}>
              {reg.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {[
            { icon: Mail, label: "Email", value: reg.email },
            { icon: Phone, label: "Phone", value: reg.phone },
            { icon: User, label: "Address", value: reg.address },
            { icon: Clock, label: "Submitted", value: reg.submittedAt },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
              <item.icon className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {reg.status === "Pending" && (
          <div className="flex gap-3">
            <button onClick={() => { onReject(reg.id); onClose(); }} className="btn flex-1 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => { onApprove(reg.id); onClose(); }} className="btn btn-primary flex-1">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function RegistrationsPage() {
  const [regs, setRegs] = useState(mock);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);

  const filtered = regs.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const approve = (id: number) => setRegs((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
  const reject = (id: number) => setRegs((prev) => prev.map((r) => r.id === id ? { ...r, status: "Rejected" } : r));

  const pending = regs.filter((r) => r.status === "Pending").length;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Registration Approvals</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {pending} pending registration{pending !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 border border-warning/20">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">{pending} pending</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registrations..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold shadow-md">
                    {reg.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{reg.name}</p>
                    <p className="text-xs text-neutral-400">{reg.email}</p>
                  </div>
                </div>
                <span className={`badge ${reg.status === "Pending" ? "badge-warning" : reg.status === "Approved" ? "badge-success" : "badge-danger"}`}>
                  {reg.status}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Phone className="w-3 h-3" /> {reg.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3 h-3" /> {reg.submittedAt}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(reg)}
                  className="btn btn-ghost text-xs flex-1 py-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                {reg.status === "Pending" && (
                  <>
                    <button onClick={() => reject(reg.id)} className="btn text-xs py-1.5 flex-1 bg-danger/10 text-danger hover:bg-danger/20">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button onClick={() => approve(reg.id)} className="btn btn-primary text-xs py-1.5 flex-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-neutral-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No registrations found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal reg={selected} onClose={() => setSelected(null)} onApprove={approve} onReject={reject} />
        )}
      </AnimatePresence>
    </>
  );
}

function ClipboardList(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}
