"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Filter, Clock, User, PawPrint, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VetSchedulingPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/appointments`);
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    // Search filter
    const matchesSearch = (apt.pet?.name || apt.petName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (apt.client?.user?.firstName + ' ' + apt.client?.user?.lastName || apt.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !matchesSearch) return false;

    if (filter === "All") return true;
    if (filter === "Today") {
      // "date" is like "Jun 24, 2026" from API
      return new Date(apt.date).toDateString() === new Date().toDateString();
    }
    if (filter === "Emergency") return apt.type === "Emergency";
    return apt.status === filter;
  }).sort((a, b) => {
    if (a.type === "Emergency" && b.type !== "Emergency") return -1;
    if (b.type === "Emergency" && a.type !== "Emergency") return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" /> My Schedule
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your upcoming consultations and surgeries.</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["All", "Today", "Scheduled", "Arrived", "In Progress", "Completed", "Emergency"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                filter === f 
                  ? f === "Emergency" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "bg-primary-500 text-white shadow-md shadow-primary-500/20" 
                  : f === "Emergency" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/30" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              )}
            >
              {f === "Emergency" && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search patient..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-sm h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-neutral-500">Loading schedule...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-400">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">No appointments found</p>
            <p className="text-sm text-neutral-500">Try changing your filters.</p>
          </div>
        ) : (
          filteredAppointments.map(apt => (
            <div key={apt.id} className={cn("card p-5 hover:border-primary-400 transition-colors group flex flex-col relative overflow-hidden", apt.type === "Emergency" && "border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10")}>
              {/* Status strip */}
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                apt.type === "Emergency" ? "bg-red-500" :
                apt.status === "Scheduled" ? "bg-blue-500" :
                apt.status === "Arrived" ? "bg-amber-500" :
                apt.status === "In Progress" ? "bg-purple-500" :
                "bg-emerald-500"
              )} />
              
              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <span className={cn(
                    "badge text-xs mb-2",
                    apt.type === "Emergency" ? "bg-red-100 text-red-700 border border-red-300 shadow-sm shadow-red-500/20" :
                    apt.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
                    apt.status === "Arrived" ? "bg-amber-100 text-amber-700" :
                    apt.status === "In Progress" ? "bg-purple-100 text-purple-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {apt.type === "Emergency" ? (
                      <span className="flex items-center gap-1 font-bold animate-pulse"><AlertTriangle className="w-3 h-3" /> {apt.status} - EMERGENCY</span>
                    ) : (
                      apt.status
                    )}
                  </span>
                  <h3 className={cn("font-bold text-lg leading-tight group-hover:text-primary-600 transition-colors", apt.type === "Emergency" && "text-red-700 dark:text-red-400 group-hover:text-red-800 dark:group-hover:text-red-300")}>
                    {apt.petName || "Unknown Pet"}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                    <PawPrint className="w-3 h-3" /> {apt.petType || "Pet"}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={cn("font-bold text-lg", apt.type === "Emergency" ? "text-red-600 dark:text-red-400" : "text-primary-600 dark:text-primary-400")}>
                    {apt.time}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {apt.date}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 text-sm space-y-2 mb-4 pl-3">
                <p className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
                  <User className="w-4 h-4 shrink-0 mt-0.5 text-neutral-400" />
                  <span>
                    <span className="text-xs text-neutral-500 block">Owner</span>
                    {apt.client?.user?.firstName ? `${apt.client.user.firstName} ${apt.client.user.lastName}` : (apt.clientName || "Unknown Owner")}
                  </span>
                </p>
                <p className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
                  <Filter className="w-4 h-4 shrink-0 mt-0.5 text-neutral-400" />
                  <span>
                    <span className="text-xs text-neutral-500 block">Reason</span>
                    {apt.reason || "General Consultation"}
                  </span>
                </p>
              </div>

              <div className="pl-2">
                {apt.status === "Completed" ? (
                  <button className="btn btn-outline w-full text-sm py-2">View Summary</button>
                ) : (
                  <Link href={`/vet/consultation/${apt.id}`} className={cn("btn w-full text-sm py-2 border-0", apt.type === "Emergency" ? "bg-red-600 hover:bg-red-700 text-white" : "btn-primary bg-primary-500 hover:bg-primary-600")}>
                    {apt.status === "In Progress" ? "Resume Consult" : "Start Consult"}
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
