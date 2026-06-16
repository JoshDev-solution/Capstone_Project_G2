"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, CheckCheck, PawPrint, CalendarCheck, Package, UserPlus, CreditCard, MessageSquare, Filter, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type NType = "Appointment" | "Vaccination" | "LowStock" | "Registration" | "Payment" | "Message" | "System";

interface Notif {
  id: number;
  type: NType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const typeIcon: Record<NType, React.ElementType> = {
  Appointment:  CalendarCheck,
  Vaccination:  PawPrint,
  LowStock:     Package,
  Registration: UserPlus,
  Payment:      CreditCard,
  Message:      MessageSquare,
  System:       Bell,
};

const typeColor: Record<NType, string> = {
  Appointment:  "#FF4FA3",
  Vaccination:  "#D98CFF",
  LowStock:     "#F59E0B",
  Registration: "#10B981",
  Payment:      "#3B82F6",
  Message:      "#B84DFF",
  System:       "#6B7280",
};

const mockNotifs: Notif[] = [
  { id: 1,  type: "Registration",  title: "New Client Registration",         message: "Elena Villanueva has submitted a registration request awaiting approval.",      time: "2 min ago",  read: false },
  { id: 2,  type: "LowStock",      title: "Low Stock Alert",                 message: "Anti-Rabies Vaccine is critically low (5 units remaining). Reorder required.", time: "15 min ago", read: false },
  { id: 3,  type: "Appointment",   title: "Appointment Request",             message: "Carlo Reyes has booked an appointment for Buddy on June 17.",                   time: "1 hr ago",   read: false },
  { id: 4,  type: "Payment",       title: "Payment Received",                message: "₱2,500 received from Ana Lopez via GCash. Bill BILL-00015 paid.",              time: "2 hr ago",   read: true },
  { id: 5,  type: "Message",       title: "New Client Message",              message: "Maria Santos sent a message about Whiskers' medication dosage.",                time: "3 hr ago",   read: true },
  { id: 6,  type: "Vaccination",   title: "Vaccination Due Reminder",        message: "Buddy (Carlo Reyes) is due for annual anti-rabies vaccination next week.",     time: "4 hr ago",   read: true },
  { id: 7,  type: "LowStock",      title: "Low Stock Alert",                 message: "5-in-1 Vaccine (Canine) is below reorder level (8 remaining, min: 10).",       time: "5 hr ago",   read: true },
  { id: 8,  type: "Appointment",   title: "Appointment Completed",           message: "APT-00005 for Rocky (Ramon Diaz) was marked as completed by Dr. Lovely.",      time: "6 hr ago",   read: true },
  { id: 9,  type: "Registration",  title: "Registration Approved",           message: "David Garcia's client account has been successfully approved.",                 time: "Yesterday",  read: true },
  { id: 10, type: "System",        title: "System Backup Complete",          message: "Daily database backup completed successfully at 3:00 AM.",                     time: "Yesterday",  read: true },
  { id: 11, type: "Payment",       title: "Refund Processed",                message: "Refund of ₱800 to Carlo Reyes has been processed via GCash.",                 time: "2 days ago", read: true },
  { id: 12, type: "Vaccination",   title: "Deworming Reminder",              message: "Luna (Ana Lopez) is overdue for deworming treatment.",                         time: "2 days ago", read: true },
];

const filters: (NType | "All")[] = ["All", "Appointment", "Registration", "LowStock", "Payment", "Message", "System"];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(mockNotifs);
  const [filter, setFilter] = useState<NType | "All">("All");

  const displayed = filter === "All" ? notifs : notifs.filter((n) => n.type === filter);
  const unread = notifs.filter((n) => !n.read).length;

  const markRead = (id: number) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const remove = (id: number) => setNotifs((p) => p.filter((n) => n.id !== id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {unread > 0
              ? <span>{unread} unread notification{unread > 1 ? "s" : ""}</span>
              : <span>All caught up!</span>}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary shrink-0 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
              filter === f
                ? "gradient-primary text-white shadow-md"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1.5 text-xs opacity-70">
                {notifs.filter((n) => n.type === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="card overflow-hidden divide-y divide-[var(--card-border)]">
        {displayed.length === 0 && (
          <div className="text-center py-14 text-neutral-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No notifications.</p>
          </div>
        )}
        {displayed.map((notif, i) => {
          const Icon = typeIcon[notif.type];
          const color = typeColor[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-start gap-4 px-5 py-4 group transition-colors cursor-pointer",
                notif.read
                  ? "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  : "bg-primary-50/40 dark:bg-primary-500/5 hover:bg-primary-50/70 dark:hover:bg-primary-500/10"
              )}
              onClick={() => markRead(notif.id)}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-semibold", !notif.read && "text-foreground")}>{notif.title}</p>
                  <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0">{notif.time}</span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">{notif.message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                    className="btn-icon btn-ghost rounded-lg w-7 h-7 flex items-center justify-center text-success"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                  className="btn-icon btn-ghost rounded-lg w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-danger"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Unread dot */}
              {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
