"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Calendar, FileText, 
  Settings, LogOut, Menu, X, PawPrint, ShoppingCart, Activity, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { name: "Pets & Clients", href: "/manager/pets", icon: PawPrint },
    { name: "Appointments", href: "/manager/appointments", icon: Calendar },
    { name: "Billing", href: "/manager/billing", icon: FileText },
    { name: "Inventory (Alerts)", href: "/manager/inventory", icon: ShoppingCart },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF4FA3",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out"
    }).then((result) => {
      if (result.isConfirmed) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("vcms_token");
          router.push("/login");
        }
      }
    });
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm text-neutral-600 dark:text-neutral-300"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed lg:sticky top-0 h-screen w-[280px] bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-40 transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6">
          <Link href="/manager" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-500/20">
              <PawPrint className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600 truncate">
              LJ Clinic
            </span>
          </Link>
          <div className="mt-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider pl-10">Manager Portal</div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/manager");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" 
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-500" : "text-neutral-400")} />
                {item.name}
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden w-full">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden font-bold text-neutral-800 dark:text-neutral-200">Manager Dashboard</div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border border-white dark:border-neutral-950"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200 dark:border-neutral-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Manager</p>
                <p className="text-xs text-neutral-500">Clinic Operations</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-400 to-primary-400 text-white flex items-center justify-center font-bold shadow-md">
                M
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
