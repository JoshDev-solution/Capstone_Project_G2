"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, PawPrint, CalendarCheck, Activity,
  Stethoscope, Clock, CheckCircle2, AlertCircle 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { cn } from "@/lib/utils";

// Dummy data for charts
const appointmentData = [
  { day: "Mon", appointments: 12 },
  { day: "Tue", appointments: 15 },
  { day: "Wed", appointments: 10 },
  { day: "Thu", appointments: 18 },
  { day: "Fri", appointments: 14 },
  { day: "Sat", appointments: 22 },
  { day: "Sun", appointments: 8 },
];

const diseaseData = [
  { name: "Parvovirus", value: 12 },
  { name: "Rabies", value: 5 },
  { name: "Distemper", value: 8 },
  { name: "Heartworm", value: 15 },
  { name: "Other", value: 25 },
];
const COLORS = ["#FF4FA3", "#FF99C8", "#FFD166", "#06D6A0", "#118AB2"];

export default function VetDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const token = localStorage.getItem("vcms_token");
      if (!token) return;

      const res = await fetch(`${baseUrl}/api/appointments/vet/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const pendingAppointments = todayAppointments.filter(a => a.status === "Scheduled");
  const completedAppointments = todayAppointments.filter(a => a.status === "Completed");

  const statCards = [
    { title: "Today's Appointments", value: todayAppointments.length, icon: CalendarCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pending Consultations", value: pendingAppointments.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Patients Treated", value: completedAppointments.length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Critical Cases", value: "2", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Doctor!</h1>
          <p className="text-sm text-neutral-500 mt-1">Here is what's happening at the clinic today.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            <p className="text-xs text-neutral-500">Clinic Hours: 9:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5 flex items-center gap-4"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm text-neutral-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold">Weekly Appointment Load</h3>
              <p className="text-sm text-neutral-500">Number of appointments over the last 7 days</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                  <Tooltip 
                    cursor={{ fill: "var(--primary-50)" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--card-border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="appointments" fill="var(--primary-500)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Cases by Disease</h3>
              <p className="text-sm text-neutral-500">Most diagnosed cases this month</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {diseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Today's Schedule</h3>
            <p className="text-sm text-neutral-500">Your assigned patients for today</p>
          </div>
          <button className="btn btn-outline text-sm py-1.5 h-auto">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">Loading schedule...</td></tr>
              ) : todayAppointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">No appointments scheduled for today.</td></tr>
              ) : (
                todayAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-5 py-3 font-medium whitespace-nowrap">{apt.time}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600">
                          <PawPrint className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{apt.petName}</p>
                          <p className="text-xs text-neutral-500">{apt.petType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{apt.clientName}</td>
                    <td className="px-5 py-3">{apt.reason || apt.service}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "badge",
                        apt.status === "Completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                        apt.status === "Scheduled" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                        apt.status === "Cancelled" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      )}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        className="btn btn-primary text-xs py-1.5 h-auto px-3"
                        disabled={apt.status !== "Scheduled"}
                      >
                        Start Consultation
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
