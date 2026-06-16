"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Lock, Bell, Mail, Shield, Palette, Database, Save,
  Eye, EyeOff, CheckCircle, PawPrint,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

const sections = [
  { id: "clinic",      label: "Clinic Info",     icon: PawPrint },
  { id: "security",   label: "Security",         icon: Lock },
  { id: "email",      label: "Email / Alerts",   icon: Mail },
  { id: "appearance", label: "Appearance",       icon: Palette },
  { id: "system",     label: "System",           icon: Database },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("clinic");
  const [saved, setSaved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Configure clinic preferences, security, and system options.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="card p-2 flex flex-col gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "sidebar-link w-full",
                  activeSection === s.id && "active"
                )}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="lg:col-span-3">
          {/* Clinic Info */}
          {activeSection === "clinic" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex flex-col gap-5">
              <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">Clinic Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Clinic Name</label>
                  <input type="text" defaultValue="LJ Veterinary Clinic" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Contact Number</label>
                  <input type="tel" defaultValue="+63-909-152-3519" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email Address</label>
                  <input type="email" defaultValue="eguialovely@gmail.com" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Website URL</label>
                  <input type="url" defaultValue="https://ljvetclinic.com" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Address</label>
                <textarea defaultValue="Surallah, South Cotabato" rows={2} className="input resize-none" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Mon–Fri Open",   value: "08:00" },
                  { label: "Mon–Fri Close",  value: "18:00" },
                  { label: "Weekend Close",  value: "18:00" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                    <input type="time" defaultValue={f.value} className="input" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">About / Description</label>
                <textarea rows={4} className="input resize-none" defaultValue="LJ Veterinary Clinic provides compassionate and professional veterinary care for all pets in Surallah, South Cotabato." />
              </div>
            </motion.div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              <div className="card p-6 flex flex-col gap-5">
                <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">Change Password</h2>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showOld ? "text" : "password"} className="input pr-10" placeholder="Current password" />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showNew ? "text" : "password"} className="input pr-10" placeholder="Min. 8 characters" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                    <input type="password" className="input" placeholder="Confirm password" />
                  </div>
                </div>
              </div>
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">Security Settings</h2>
                {[
                  { label: "Two-Factor Authentication", desc: "Require OTP on every login for admin accounts", defaultChecked: false },
                  { label: "Login Activity Alerts",     desc: "Send email alert when a new device logs in",    defaultChecked: true },
                  { label: "Session Auto-Logout",       desc: "Automatically log out after 30 minutes of inactivity", defaultChecked: true },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.defaultChecked} className="mt-1 accent-primary-500 w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-neutral-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Email / Alerts */}
          {activeSection === "email" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              <div className="card p-6 flex flex-col gap-5">
                <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">SMTP Configuration</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">SMTP Host</label>
                    <input type="text" defaultValue="smtp.gmail.com" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">SMTP Port</label>
                    <input type="number" defaultValue={587} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Sender Email</label>
                    <input type="email" defaultValue="eguialovely@gmail.com" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">App Password</label>
                    <input type="password" defaultValue="••••••••••••••••" className="input" />
                  </div>
                </div>
              </div>
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">Email Notifications</h2>
                {[
                  { label: "Appointment Reminders",    desc: "Send reminder emails 24h before appointment",     on: true  },
                  { label: "Vaccination Due Alerts",   desc: "Alert clients when pet vaccination is due",        on: true  },
                  { label: "Deworming Reminders",      desc: "Send monthly deworming reminder to pet owners",    on: true  },
                  { label: "Registration Approved",    desc: "Notify client when account is approved by admin",  on: true  },
                  { label: "Low Stock Alerts (Admin)", desc: "Email admin when product stock is below reorder",  on: true  },
                  { label: "Payment Receipts",         desc: "Send e-receipt to client on successful payment",   on: true  },
                  { label: "Refund Updates",           desc: "Notify client when refund status changes",         on: true  },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={opt.on} className="mt-1 accent-primary-500 w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-neutral-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex flex-col gap-6">
              <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">Appearance</h2>
              <div>
                <p className="text-sm font-medium mb-3">Color Theme</p>
                <div className="flex gap-3">
                  {[
                    { label: "Light", value: "light" as const },
                    { label: "Dark",  value: "dark"  as const },
                  ].map((t) => (
                    <button key={t.value} onClick={() => setTheme(t.value)}
                      className={cn("flex-1 py-4 rounded-2xl border-2 transition-all font-medium text-sm", theme === t.value ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300")}>
                      {t.value === "light" ? "☀️" : "🌙"} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Primary Color</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { color: "#FF4FA3", label: "Pink (Default)" },
                    { color: "#6366F1", label: "Indigo" },
                    { color: "#14B8A6", label: "Teal" },
                    { color: "#F59E0B", label: "Amber" },
                    { color: "#EF4444", label: "Red" },
                  ].map((c) => (
                    <button key={c.color} title={c.label}
                      className={cn("w-10 h-10 rounded-xl border-2 transition-transform hover:scale-110", c.color === "#FF4FA3" ? "border-neutral-400 ring-2 ring-offset-2 ring-neutral-300 dark:ring-neutral-700" : "border-transparent")}
                      style={{ background: c.color }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Sidebar Default State</p>
                <select className="input max-w-xs appearance-none cursor-pointer">
                  <option>Expanded</option>
                  <option>Collapsed</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* System */}
          {activeSection === "system" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">Backup & Data</h2>
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  <div>
                    <p className="text-sm font-medium">Automatic Daily Backup</p>
                    <p className="text-xs text-neutral-400">Last backup: Today at 3:00 AM</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary-500 w-5 h-5 cursor-pointer" />
                </div>
                <div className="flex gap-3">
                  <button className="btn btn-secondary flex-1">Export Database</button>
                  <button className="btn btn-secondary flex-1">Import Backup</button>
                </div>
              </div>
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold border-b border-[var(--card-border)] pb-4">System Info</h2>
                {[
                  { label: "Version",        value: "v1.0.0" },
                  { label: "Environment",    value: "Development" },
                  { label: "Database",       value: "MySQL 8.0" },
                  { label: "Timezone",       value: "Asia/Manila (UTC+8)" },
                  { label: "Last Migration", value: "2026-06-16" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-[var(--card-border)] last:border-0">
                    <span className="text-sm text-neutral-500">{row.label}</span>
                    <span className="text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.97 }}
              className={cn("btn flex items-center gap-2 transition-all", saved ? "bg-success text-white" : "btn-primary")}
            >
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
