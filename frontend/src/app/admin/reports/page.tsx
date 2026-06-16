"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, FileText, FileSpreadsheet, Download,
  Calendar, TrendingUp, Users, PawPrint, Stethoscope,
} from "lucide-react";

const reportTypes = [
  { id: "sales", label: "Sales Report", icon: TrendingUp, color: "#FF4FA3", desc: "Revenue, transactions, and payment breakdown" },
  { id: "inventory", label: "Inventory Usage", icon: BarChart3, color: "#D98CFF", desc: "Stock movement, consumption, and reorder analysis" },
  { id: "patient", label: "Patient Visit", icon: PawPrint, color: "#B84DFF", desc: "Visit frequency, new vs returning patients" },
  { id: "disease", label: "Disease Frequency", icon: Stethoscope, color: "#E63590", desc: "Common diagnoses and health trend analysis" },
  { id: "appointment", label: "Appointment Report", icon: Calendar, color: "#F59E0B", desc: "Booking rates, cancellations, and no-shows" },
  { id: "staff", label: "Staff Performance", icon: Users, color: "#10B981", desc: "Vet consultations, patient load, and service summary" },
];

const recentReports = [
  { name: "Monthly Sales Report - May 2026", type: "Sales", format: "PDF", size: "2.4 MB", generated: "Jun 1, 2026", by: "System Admin" },
  { name: "Inventory Usage - Q1 2026", type: "Inventory", format: "Excel", size: "1.1 MB", generated: "Apr 5, 2026", by: "Manager" },
  { name: "Patient Visit Summary - Apr 2026", type: "Patient Visit", format: "PDF", size: "1.8 MB", generated: "May 2, 2026", by: "System Admin" },
  { name: "Disease Frequency - 2026 H1", type: "Disease", format: "CSV", size: "512 KB", generated: "Jun 15, 2026", by: "Veterinarian" },
];

const formatColors: Record<string, string> = {
  PDF: "badge-danger",
  Excel: "badge-success",
  CSV: "badge-warning",
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateFrom, setDateFrom] = useState("2026-06-01");
  const [dateTo, setDateTo] = useState("2026-06-30");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (format: string) => {
    setError("");
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (to < from) {
      setError("Error: The 'To' date cannot be earlier than the 'From' date.");
      return;
    }

    setGenerating(true);
    // TODO: Wire to backend report generation endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(false);
    // In production: trigger download
    alert(`Report generated as ${format}! (Connecting to backend...)`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Generate, download, and analyze clinic data reports.</p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Report Type Selection */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Select Report Type</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r.id)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    selectedReport === r.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                      : "border-transparent bg-neutral-50 dark:bg-neutral-800/50 hover:border-neutral-200 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: `${r.color}15` }}>
                    <r.icon className="w-4 h-4" style={{ color: r.color }} />
                  </div>
                  <p className="text-sm font-semibold mb-0.5">{r.label}</p>
                  <p className="text-xs text-neutral-400 leading-snug">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Date Range</h2>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {["This Week", "This Month", "Last Month", "Last 3 Months", "This Year"].map((preset) => (
                <button key={preset} className="btn btn-ghost text-xs py-1.5 px-3 rounded-lg">
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Buttons */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Export Format</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { format: "PDF", icon: FileText, color: "#EF4444" },
                { format: "Excel", icon: FileSpreadsheet, color: "#10B981" },
                { format: "CSV", icon: BarChart3, color: "#F59E0B" },
              ].map(({ format, icon: Icon, color }) => (
                <motion.button
                  key={format}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleGenerate(format)}
                  disabled={generating}
                  className="btn btn-secondary gap-2 flex-1 justify-center min-w-28"
                >
                  {generating ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <Icon className="w-4 h-4" style={{ color }} />
                  )}
                  <span>Download {format}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">Recent Reports</h2>
          <div className="flex flex-col gap-3">
            {recentReports.map((rep, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug mb-1 line-clamp-2">{rep.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`badge text-[10px] px-1.5 ${formatColors[rep.format]}`}>{rep.format}</span>
                      <span className="text-[10px] text-neutral-400">{rep.size}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{rep.generated}</p>
                  </div>
                </div>
                <button className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Download className="w-4 h-4 text-primary-500" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
