"use client";

import { Menu, PawPrint, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  onMenuClick: () => void;
  portalName?: string;
}

export default function MobileHeader({ onMenuClick, portalName = "Portal" }: MobileHeaderProps) {
  return (
    <div className="md:hidden sticky top-0 z-40 w-full h-16 bg-white dark:bg-[#09090B] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight gradient-text">LJ Vet {portalName}</span>
        </div>
      </div>
      
      <button className="p-2 -mr-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger border-2 border-white dark:border-[#09090B]"></span>
      </button>
    </div>
  );
}
