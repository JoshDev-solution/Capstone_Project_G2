"use client";

import { useState, useEffect } from "react";
import ClientSidebar from "@/components/client/ClientSidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has Client role
    const token = localStorage.getItem("vcms_token");
    const userStr = localStorage.getItem("vcms_user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      // Wait, admin/manager might want to view this, but usually it's for Client
      if (user.role !== "Client" && user.role !== "Admin") {
        router.push("/login");
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#09090B]">
      <MobileHeader onMenuClick={() => setMobileOpen(true)} portalName="Client" />
      
      <ClientSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] md:min-h-screen",
          collapsed ? "md:ml-[72px]" : "md:ml-[240px]"
        )}
      >
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
