"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Topbar from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vcms_token");
    const userStr = localStorage.getItem("vcms_user");
    
    if (!token || !userStr) {
      window.location.href = "/login";
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const role = user?.role?.toLowerCase() || "";
      if (role === "admin" || role === "manager" || role === "veterinarian" || role === "vet") {
        setIsAuthorized(true);
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Topbar 
        sidebarCollapsed={collapsed} 
        onMenuClick={() => setMobileOpen(true)}
        title="Admin Dashboard"
        roleName="Admin"
        roleBadgeColorClass="badge-primary"
        settingsPath="/admin/settings"
      />

      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          collapsed ? "md:pl-[72px]" : "md:pl-[240px]"
        )}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
