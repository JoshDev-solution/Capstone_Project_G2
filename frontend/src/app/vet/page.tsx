"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, PawPrint, FileText, CheckCircle2, ChevronRight, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function VetDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("vcms_user");
    if (userStr) setUser(JSON.parse(userStr));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/appointments`);
      if (res.ok) {
        const data = await res.json();
        // Just show today's or all upcoming for demo
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = appointments.filter(a => {
    const aptDate = new Date(a.appointmentDate);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const pendingConsults = appointments.filter(a => a.status === "Arrived" || a.status === "In Progress");
  
  const emergencyCases = appointments.filter(a => 
    a.type === "Emergency" && 
    (a.status === "Pending" || a.status === "Scheduled" || a.status === "Arrived" || a.status === "In Progress")
  );

  const statCards = [
    { title: "Appointments Today", value: todayAppointments.length.toString(), icon: Calendar, color: "text-primary-500", bg: "bg-primary-500/10", border: "border-primary-100 dark:border-primary-900/30" },
    { title: "Pending Consultations", value: pendingConsults.length.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-100 dark:border-amber-900/30" },
    { title: "Patients Seen", value: appointments.filter(a => a.status === "Completed").length.toString(), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-900/30" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-purple-600 text-white p-8 sm:p-10 shadow-xl shadow-primary-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, Dr. {user?.lastName || "Smith"}!
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              You have {todayAppointments.length} appointments scheduled for today. Let's make sure every pet gets the best care!
            </p>
          </div>
          <Link href="/vet/consultation" className="shrink-0 bg-white text-primary-600 hover:bg-neutral-50 font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <PawPrint className="w-5 h-5" /> Start Consultations
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("bg-white dark:bg-neutral-900 border rounded-2xl p-6 shadow-sm", stat.border)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2 text-neutral-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Cases */}
      {emergencyCases.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
            <h3 className="font-bold text-lg text-red-700 dark:text-red-400">Emergency & Urgent Cases ({emergencyCases.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyCases.map((apt) => (
              <div key={apt.id} className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-red-100 dark:border-red-900/50 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-neutral-900 dark:text-white">{apt.pet?.name || "Unknown Pet"}</h4>
                  <span className="badge bg-red-100 text-red-700 text-[10px] uppercase font-bold">{apt.status}</span>
                </div>
                <p className="text-sm text-neutral-500 mb-1">Owner: {apt.client?.user?.firstName} {apt.client?.user?.lastName}</p>
                <p className="text-xs text-neutral-400 flex-1 line-clamp-2 mb-3">Reason: {apt.reason || "Emergency"}</p>
                <Link href={`/vet/consultation/${apt.id}`} className="btn btn-primary bg-red-600 hover:bg-red-700 border-0 w-full py-2 text-xs">
                  Respond Now
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" /> Today's Schedule
            </h3>
            <Link href="/vet/scheduling" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View Calendar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-neutral-500 py-10">Loading schedule...</p>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="font-medium text-lg">No appointments today</p>
                <p className="text-sm text-neutral-500 mt-1">Enjoy your free time or check follow-ups!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl">
                      <span className="text-sm font-bold">
                        {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        {apt.pet?.name || "Unknown Pet"} 
                        <span className="badge bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-[10px]">
                          {apt.pet?.petType?.name || "Pet"}
                        </span>
                      </h4>
                      <p className="text-sm text-neutral-500 mt-1">
                        Client: {apt.client?.user?.firstName} {apt.client?.user?.lastName}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{apt.reason || "General Checkup"}</p>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className={cn(
                        "badge text-xs",
                        apt.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
                        apt.status === "Arrived" ? "bg-amber-100 text-amber-700" :
                        apt.status === "In Progress" ? "bg-purple-100 text-purple-700" :
                        "bg-emerald-100 text-emerald-700"
                      )}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/vet/consultation" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 transition-colors text-center">
                <FileText className="w-6 h-6" />
                <span className="text-xs font-semibold">New Consult</span>
              </Link>
              <Link href="/vet/medical-records" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-colors text-center">
                <PawPrint className="w-6 h-6" />
                <span className="text-xs font-semibold">Records</span>
              </Link>
              <Link href="/vet/messaging" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 transition-colors text-center">
                <Users className="w-6 h-6" />
                <span className="text-xs font-semibold">Clients</span>
              </Link>
              <Link href="/vet/scheduling" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-colors text-center">
                <Calendar className="w-6 h-6" />
                <span className="text-xs font-semibold">Schedule</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
