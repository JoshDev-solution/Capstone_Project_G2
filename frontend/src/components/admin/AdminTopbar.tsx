"use client";

import { Bell, Search, Sun, Moon, PawPrint, ChevronDown, Settings, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface AdminTopbarProps {
  sidebarCollapsed: boolean;
  title?: string;
}

export default function AdminTopbar({ sidebarCollapsed, title = "Dashboard" }: AdminTopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userName, setUserName] = useState<{first: string, last: string, role: string} | null>(null);

  const fetchProfile = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      if (!token) return;
      const res = await fetch(`${baseUrl}/api/users/profile`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUserName({ first: data.firstName || "", last: data.lastName || "", role: data.role || "" });
        if (data.profileImageUrl && !data.profileImageUrl.includes('uploads')) {
          setProfilePic(data.profileImageUrl.startsWith('http') || data.profileImageUrl.startsWith('data:') ? data.profileImageUrl : `${baseUrl}${data.profileImageUrl}`);
        } else {
          setProfilePic(null);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vcms_token");
    localStorage.removeItem("vcms_user");
    window.location.href = "/login";
  };

  const notifications = [
    { id: 1, text: "New client registration pending approval", time: "2m ago", unread: true },
    { id: 2, text: "Low stock alert: Anti-Rabies Vaccine (5 left)", time: "15m ago", unread: true },
    { id: 3, text: "Appointment #APT-00123 completed", time: "1h ago", unread: true },
    { id: 4, text: "Payment received from Carlo Reyes ₱1,200", time: "2h ago", unread: false },
    { id: 5, text: "Refund request #RFD-00045 pending", time: "3h ago", unread: false },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 z-20 flex items-center justify-between px-6 border-b transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[240px]"
      )}
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">{title}</h1>
        <span className="hidden sm:flex badge badge-primary text-xs">Admin</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm w-56">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input placeholder="Search..." className="bg-transparent outline-none flex-1 text-sm placeholder:text-neutral-400" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon btn-ghost w-9 h-9 rounded-xl flex items-center justify-center"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="btn-icon btn-ghost w-9 h-9 rounded-xl flex items-center justify-center relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 card shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
                <span className="font-semibold text-sm">Notifications</span>
                <span className="badge badge-primary">3 new</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 border-b border-[var(--card-border)] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer",
                      n.unread && "bg-primary-50/50 dark:bg-primary-500/5"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                      <div className={cn(!n.unread && "ml-3.5")}>
                        <p className="text-xs leading-snug font-medium">{n.text}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center">
                <button className="text-xs text-primary-500 font-medium hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700" />
            ) : (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {userName ? `${userName.first.charAt(0)}${userName.last.charAt(0)}`.toUpperCase() : "SA"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{userName ? `${userName.first} ${userName.last}` : "System Admin"}</p>
              <p className="text-[10px] text-neutral-400 leading-tight">{userName ? userName.role : "Administrator"}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 card shadow-xl z-50 overflow-hidden py-1">
              {[
                { icon: User, label: "My Profile", href: "/admin/settings" },
                { icon: Settings, label: "Settings", href: "/admin/settings" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-neutral-400" />
                  {item.label}
                </a>
              ))}
              <div className="border-t border-[var(--card-border)] mt-1 pt-1">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
