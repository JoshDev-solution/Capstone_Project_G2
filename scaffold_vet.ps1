$routes = @(
    "scheduling/today",
    "scheduling/walk-ins",
    "scheduling/follow-ups",
    "scheduling/emergency",
    "consultation/queue",
    "consultation/form",
    "consultation/vitals",
    "consultation/notes",
    "diagnosis-prescription/diagnosis",
    "diagnosis-prescription/treatment-plans",
    "diagnosis-prescription/prescriptions",
    "diagnosis-prescription/history",
    "medical-records/history",
    "medical-records/vaccinations",
    "medical-records/deworming",
    "medical-records/surgeries",
    "medical-records/treatments",
    "messaging/requests",
    "messaging/escalations",
    "messaging/conversations",
    "messaging/reminders",
    "follow-ups/vaccinations",
    "follow-ups/deworming",
    "follow-ups/appointments",
    "profile/settings",
    "profile/password"
)

$basePath = "d:\Capstone_Project_VCMS\frontend\src\app\vet"

foreach ($route in $routes) {
    $dirPath = Join-Path $basePath $route
    if (!(Test-Path $dirPath)) {
        New-Item -ItemType Directory -Force -Path $dirPath | Out-Null
    }
    
    $filePath = Join-Path $dirPath "page.tsx"
    
    $parts = $route -split "/"
    $title = ($parts[-1] -replace "-", " ").ToUpper()
    
    $content = @"
"use client";

import { Construction } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-primary-500" />
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white capitalize mb-4">
        $title
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
        This module is currently being built based on the thesis objectives. 
        Check back soon for the fully functional interface.
      </p>
    </div>
  );
}
"@

    Set-Content -Path $filePath -Value $content
}

Write-Host "Scaffolding complete!"
