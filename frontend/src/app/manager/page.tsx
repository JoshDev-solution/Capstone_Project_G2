"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, PawPrint, CalendarCheck, FileText, 
  TrendingUp, AlertTriangle, ArrowUpRight, DollarSign, Package
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Dummy data for charts
const revenueData = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 5000 },
  { name: "Thu", revenue: 4500 },
  { name: "Fri", revenue: 6000 },
  { name: "Sat", revenue: 8000 },
  { name: "Sun", revenue: 7500 },
];

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const [aptRes, stockRes] = await Promise.all([
        fetch(`${baseUrl}/api/appointments`),
        fetch(`${baseUrl}/api/inventory/low-stock`)
      ]);
      
      if (aptRes.ok) {
        const apts = await aptRes.json();
        // Filter for today
        const todayStr = new Date().toISOString().split("T")[0];
        setAppointments(apts.filter((a: any) => a.date === todayStr || new Date(a.appointmentDate).toISOString().split("T")[0] === todayStr));
      }

      if (stockRes.ok) {
        setLowStockAlerts(await stockRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Today's Appointments", value: appointments.length.toString(), icon: CalendarCheck, color: "text-primary-500", bg: "bg-primary-500/10", trend: "+12%" },
    { title: "Walk-in Patients", value: appointments.filter(a => a.type === "Walk-In").length.toString(), icon: Users, color: "text-amber-500", bg: "bg-amber-500/10", trend: "+5%" },
    { title: "Low Stock Items", value: lowStockAlerts.length.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", trend: "Needs attention", isAlert: true },
    { title: "Today's Revenue", value: "₱12,450", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+18%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Operations Overview</h1>
          <p className="text-sm text-neutral-500 mt-1">Here's what's happening at the clinic today.</p>
        </div>
        <Link href="/manager/billing/generate" className="btn btn-primary shadow-lg shadow-primary-500/20">
          <FileText className="w-4 h-4 mr-2" /> Generate Bill
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("card p-5 relative overflow-hidden", stat.isAlert ? "border-red-200 dark:border-red-900/50" : "")}
          >
            {stat.isAlert && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className={cn("font-medium flex items-center gap-1", stat.isAlert ? "text-red-500" : "text-emerald-500")}>
                {!stat.isAlert && <TrendingUp className="w-3 h-3" />}
                {stat.trend}
              </span>
              <span className="text-neutral-400 ml-2">{stat.isAlert ? "Restock immediately" : "vs last week"}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold">Weekly Revenue Trend</h3>
              <p className="text-sm text-neutral-500">Gross sales over the last 7 days</p>
            </div>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Detailed Report <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} tickFormatter={(value) => `₱${value}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--card-border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [`₱${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        <div className="card flex flex-col">
          <div className="p-5 border-b border-[var(--card-border)] flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Low Stock Alerts
              </h3>
            </div>
            <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{lowStockAlerts.length}</span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto max-h-[300px]">
            {loading ? (
              <p className="text-sm text-neutral-500 text-center py-4">Checking inventory...</p>
            ) : lowStockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Inventory levels are healthy.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockAlerts.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">{item.product?.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">SKU: {item.product?.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{item.quantity}</p>
                      <p className="text-[10px] uppercase font-bold text-red-500/70">Left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl">
            <Link href="/manager/inventory" className="text-sm font-medium text-primary-600 hover:text-primary-700 w-full text-center block">
              Manage Inventory
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
