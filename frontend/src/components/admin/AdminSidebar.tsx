"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, PawPrint, CalendarCheck, Stethoscope,
  ShoppingBag, Package, BarChart3, Settings, ChevronLeft,
  ChevronRight, PawPrint as Paw, ClipboardList, BadgePercent,
  RotateCcw, Bell, LogOut, PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

const navGroups = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Bell, label: "Notifications", href: "/admin/notifications", badge: 5 },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: ClipboardList, label: "Registrations", href: "/admin/registrations", badge: 3 },
      { icon: PawPrint, label: "Pets", href: "/admin/pets" },
      { icon: CalendarCheck, label: "Appointments", href: "/admin/appointments" },
    ],
  },
  {
    title: "Clinic",
    items: [
      { icon: Stethoscope, label: "Services", href: "/admin/services" },
      { icon: ShoppingBag, label: "Products", href: "/admin/products" },
      { icon: Package, label: "Inventory", href: "/admin/inventory" },
      { icon: BadgePercent, label: "Discounts", href: "/admin/discounts" },
      { icon: RotateCcw, label: "Refunds", href: "/admin/refunds" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { icon: BarChart3, label: "Reports", href: "/admin/reports" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ registrationsCount: 0, notificationsCount: 0 });
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("vcms_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) { }
  }, []);

  const fetchCounts = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      if (!token) return;

      const res = await fetch(`${baseUrl}/api/users/counts`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCounts({
          registrationsCount: data.registrationsCount,
          notificationsCount: data.notificationsCount
        });
      }
    } catch (err) {
      console.error("Failed to fetch sidebar counts:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vcms_token");
    localStorage.removeItem("vcms_user");
    window.location.href = "/login";
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shrink-0">
          <Paw className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <div className="text-sm font-bold gradient-text whitespace-nowrap">LJ Veterinary</div>
              <div className="text-[9px] uppercase tracking-widest text-neutral-400 whitespace-nowrap">Admin Panel</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-2">
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 px-3 mb-1.5">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              let badgeVal = 0;
              if (item.label === "Notifications") {
                badgeVal = counts.notificationsCount;
              } else if (item.label === "Registrations") {
                badgeVal = counts.registrationsCount;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "sidebar-link relative",
                    isActive && "active",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && badgeVal > 0 && (
                    <span className="ml-auto badge badge-primary text-[10px] px-1.5 py-0.5">
                      {badgeVal}
                    </span>
                  )}
                  {collapsed && badgeVal > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: User + Collapse toggle */}
      <div className="border-t p-3 flex flex-col gap-2" style={{ borderColor: "var(--sidebar-border)" }}>
        {/* Collapse button */}
        <button
          onClick={onToggle}
          className={cn("sidebar-link w-full", collapsed && "justify-center")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>

        {/* User row */}
        <div className={cn("flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user ? getInitials(user.firstName || "", user.lastName || "") : "SA"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user ? `${user.firstName} ${user.lastName}` : "System Admin"}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user ? user.email : "admin@ljvetclinic.com"}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={handleLogout} 
              className="p-1 rounded-lg hover:bg-danger/10 text-neutral-400 hover:text-danger shrink-0 transition-colors" 
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
