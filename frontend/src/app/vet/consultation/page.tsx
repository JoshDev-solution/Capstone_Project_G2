"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Clock, Users, ArrowRight, PawPrint, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function VetConsultationPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // For consultation queue, we want to see Arrived, In Progress, or Scheduled for today
  const queue = appointments.filter(apt => {
    const isToday = new Date(apt.appointmentDate).toDateString() === new Date().toDateString();
    const isCorrectStatus = apt.status === "Arrived" || apt.status === "Scheduled" || apt.status === "In Progress";
    
    // Search filter
    const matchesSearch = apt.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          apt.client?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.client?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return isToday && isCorrectStatus && (!searchQuery || matchesSearch);
  }).sort((a, b) => {
    // Prioritize Arrived and In Progress over Scheduled
    const statusOrder = { "In Progress": 1, "Arrived": 2, "Scheduled": 3 };
    const orderA = statusOrder[a.status as keyof typeof statusOrder] || 99;
    const orderB = statusOrder[b.status as keyof typeof statusOrder] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime();
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary-500" /> Waiting Room / Queue
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Start and manage active consultations for checked-in patients.</p>
        </div>
        
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search patient or owner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-sm h-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--card-border)] flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {queue.filter(q => q.status === "In Progress").length} In Progress
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {queue.filter(q => q.status === "Arrived").length} Waiting
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-[var(--card-border)]">
          {loading ? (
            <div className="p-10 text-center text-neutral-500">Loading queue...</div>
          ) : queue.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-center">
              <Users className="w-12 h-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-bold">{searchQuery ? "No patients found" : "Waiting Room Empty"}</h3>
              <p className="text-sm text-neutral-500 max-w-sm mt-2">
                {searchQuery ? "Try a different search term." : "There are no patients currently checked in for consultation."}
              </p>
            </div>
          ) : (
            queue.map(apt => (
              <div key={apt.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                
                <div className="shrink-0 text-center w-24">
                  <div className="font-bold text-lg text-neutral-900 dark:text-white">
                    {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mt-1 block",
                    apt.status === "In Progress" ? "text-purple-600" :
                    apt.status === "Arrived" ? "text-amber-600" : "text-blue-500"
                  )}>
                    {apt.status}
                  </span>
                </div>

                <div className="flex-1 flex gap-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 shrink-0">
                    <PawPrint className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{apt.pet?.name || "Unknown"}</h3>
                    <p className="text-sm text-neutral-500">
                      Owner: {apt.client?.user?.firstName} {apt.client?.user?.lastName} • {apt.pet?.breed?.name}
                    </p>
                    <div className="mt-2 text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md inline-block">
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">Reason:</span> {apt.reason}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                  <Link 
                    href={`/vet/consultation/${apt.id}`}
                    className={cn(
                      "btn btn-primary w-full sm:w-auto border-0 shadow-lg",
                      apt.status === "In Progress" ? "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20" : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
                    )}
                  >
                    {apt.status === "In Progress" ? "Resume Consult" : "Start Consult"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
