"use client";

import { Construction } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-primary-500" />
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white capitalize mb-4">
        TREATMENT PLANS
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
        This module is currently being built based on the thesis objectives. 
        Check back soon for the fully functional interface.
      </p>
    </div>
  );
}
