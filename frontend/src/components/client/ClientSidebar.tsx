"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, PawPrint, CalendarCheck, FileText, ShoppingBag, 
  Settings, ChevronLeft, ChevronRight, LogOut, MessageSquare, X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

const navGroups = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/client" },
      { icon: PawPrint, label: "My Pets", href: "/client/pets" },
      { icon: MessageSquare, label: "Messages", href: "/client/messages" },
    ],
  },
  {
    title: "Services",
    items: [
      { icon: CalendarCheck, label: "Appointments", href: "/client/appointments" },
      { icon: ShoppingBag, label: "Product Catalog", href: "/client/products" },
    ],
  },
  {
    title: "History",
    items: [
      { icon: FileText, label: "Billing", href: "/client/billing" },
    ],
  },
];

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function ClientSidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }: ClientSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("vcms_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) { }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vcms_token");
    localStorage.removeItem("vcms_user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: collapsed ? 72 : 240,
          x: typeof window !== "undefined" && window.innerWidth < 768 ? (mobileOpen ? 0 : -240) : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r shadow-2xl md:shadow-none"
        style={{
          background: "var(--sidebar-bg)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shrink-0">
              <PawPrint className="w-5 h-5 text-white" />
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
                  <div className="text-[9px] uppercase tracking-widest text-neutral-400 whitespace-nowrap">Client Portal</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
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
              const isActive = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
              
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
                    {(!collapsed || mobileOpen) && (
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
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: User + Collapse toggle */}
      <div className="border-t p-3 flex flex-col gap-2" style={{ borderColor: "var(--sidebar-border)" }}>
        <button
          onClick={onToggle}
          className={cn("sidebar-link w-full hidden md:flex", collapsed && "justify-center")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>

        <div className={cn("flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user ? getInitials(user.firstName || "", user.lastName || "") : "CL"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">
                {user && (user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Pet Owner"}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">{user ? user.email : "client@ljvetclinic.com"}</p>
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
    </>
  );
}
