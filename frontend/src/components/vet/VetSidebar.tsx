"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Activity,
  Syringe,
  Pill,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  AlertCircle,
  Users,
  FileText,
  FileEdit,
  ClipboardList,
  History,
  ClipboardType,
  FileClock,
  Bug,
  Scissors,
  MessageSquare,
  MessageCircle,
  Bot,
  MessagesSquare,
  Bell,
  BellRing,
  CalendarClock,
  User,
  Settings,
  Key,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const navGroups = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/vet" },
    ],
  },
  {
    title: "Clinical",
    items: [
      { 
        icon: Calendar, 
        label: "Scheduling", 
        href: "/vet/scheduling",
        subItems: [
          { icon: CalendarCheck, label: "Today's Appointments", href: "/vet/scheduling/today" },
          { icon: Users, label: "Walk-ins", href: "/vet/scheduling/walk-ins" },
          { icon: CalendarClock, label: "Follow-ups", href: "/vet/scheduling/follow-ups" },
          { icon: AlertCircle, label: "Emergency Cases", href: "/vet/scheduling/emergency" },
        ]
      },
      { 
        icon: Stethoscope, 
        label: "Consultation", 
        href: "/vet/consultation",
        subItems: [
          { icon: Users, label: "Patient Queue", href: "/vet/consultation/queue" },
          { icon: FileText, label: "Consultation Form", href: "/vet/consultation/form" },
          { icon: Activity, label: "Vital Signs", href: "/vet/consultation/vitals" },
          { icon: FileEdit, label: "Examination Notes", href: "/vet/consultation/notes" },
        ]
      },
      { 
        icon: Pill, 
        label: "Diagnosis & Rx", 
        href: "/vet/diagnosis-prescription",
        subItems: [
          { icon: FileText, label: "Diagnosis", href: "/vet/diagnosis-prescription/diagnosis" },
          { icon: ClipboardList, label: "Treatment Plans", href: "/vet/diagnosis-prescription/treatment-plans" },
          { icon: Pill, label: "Prescriptions", href: "/vet/diagnosis-prescription/prescriptions" },
          { icon: History, label: "Prescription History", href: "/vet/diagnosis-prescription/history" },
        ]
      },
      { 
        icon: ClipboardType, 
        label: "Medical Records", 
        href: "/vet/medical-records",
        subItems: [
          { icon: FileClock, label: "Medical History", href: "/vet/medical-records/history" },
          { icon: Syringe, label: "Vaccinations", href: "/vet/medical-records/vaccinations" },
          { icon: Bug, label: "Deworming", href: "/vet/medical-records/deworming" },
          { icon: Scissors, label: "Surgeries", href: "/vet/medical-records/surgeries" },
          { icon: Activity, label: "Treatments", href: "/vet/medical-records/treatments" },
        ]
      },
    ],
  },
  {
    title: "Client Relations",
    items: [
      { 
        icon: MessageSquare, 
        label: "Client Messaging", 
        href: "/vet/messaging",
        subItems: [
          { icon: MessageCircle, label: "Chat Requests", href: "/vet/messaging/requests" },
          { icon: Bot, label: "Chatbot Escalations", href: "/vet/messaging/escalations" },
          { icon: MessagesSquare, label: "Conversations", href: "/vet/messaging/conversations" },
          { icon: Bell, label: "Reminders", href: "/vet/messaging/reminders" },
        ]
      },
      { 
        icon: BellRing, 
        label: "Follow-ups", 
        href: "/vet/follow-ups",
        subItems: [
          { icon: Syringe, label: "Vaccination Due", href: "/vet/follow-ups/vaccinations" },
          { icon: Bug, label: "Deworming Due", href: "/vet/follow-ups/deworming" },
          { icon: CalendarClock, label: "Appointments", href: "/vet/follow-ups/appointments" },
        ]
      },
    ],
  },
  {
    title: "System",
    items: [
      { 
        icon: User, 
        label: "Profile", 
        href: "/vet/profile",
        subItems: [
          { icon: Settings, label: "Account Settings", href: "/vet/profile/settings" },
          { icon: Key, label: "Change Password", href: "/vet/profile/password" },
        ]
      },
    ],
  },
];

interface VetSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function VetSidebar({ collapsed, onToggle }: VetSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

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

  const toggleSubmenu = (href: string) => {
    if (collapsed) onToggle(); // expand sidebar if trying to open a submenu while collapsed
    setExpandedMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  // Automatically expand parent menus if a child is active
  useEffect(() => {
    const newExpanded = { ...expandedMenus };
    let changed = false;
    navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems) {
          const isChildActive = item.subItems.some(sub => pathname.startsWith(sub.href));
          if (isChildActive && !newExpanded[item.href]) {
            newExpanded[item.href] = true;
            changed = true;
          }
        }
      });
    });
    if (changed) setExpandedMenus(newExpanded);
  }, [pathname]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r bg-white dark:bg-neutral-900"
      style={{ borderColor: "var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-neutral-200 dark:border-neutral-800">
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
              <div className="text-[9px] uppercase tracking-widest text-neutral-400 whitespace-nowrap">Vet Portal</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 px-3 mb-2">
                {group.title}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isExactActive = pathname === item.href;
                const isChildActive = item.subItems?.some(sub => pathname.startsWith(sub.href));
                const isActive = isExactActive || isChildActive;
                const isExpanded = expandedMenus[item.href];

                return (
                  <div key={item.href}>
                    {item.subItems ? (
                      <button
                        onClick={() => toggleSubmenu(item.href)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                          isActive 
                            ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" 
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white",
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <item.icon className="w-5 h-5 shrink-0" />
                          {!collapsed && <span className="whitespace-nowrap truncate">{item.label}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                          isActive 
                            ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" 
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white",
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="whitespace-nowrap truncate">{item.label}</span>}
                      </Link>
                    )}

                    {/* Sub-items */}
                    {!collapsed && item.subItems && (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-800 mt-1 flex flex-col gap-1"
                          >
                            {item.subItems.map(sub => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors group",
                                  pathname === sub.href
                                    ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" 
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400"
                                )}
                              >
                                <sub.icon className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap truncate">{sub.label}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: User + Collapse toggle */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 flex flex-col gap-2">
        {/* Collapse button */}
        <button
          onClick={onToggle}
          className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full", collapsed && "justify-center")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>

        {/* User row */}
        <div className={cn("flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user ? getInitials(user.firstName || "", user.lastName || "") : "DR"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user ? `Dr. ${user.lastName}` : "Veterinarian"}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user ? user.email : "vet@ljvetclinic.com"}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={handleLogout} 
              className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 shrink-0 transition-colors" 
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
