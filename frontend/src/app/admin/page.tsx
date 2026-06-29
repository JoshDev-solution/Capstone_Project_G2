"use client";

import { motion } from "framer-motion";
import {
  PawPrint, RotateCcw,
  AlertTriangle, ArrowUp, ArrowDown, PhilippinePeso,
  ClipboardList,
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const kpiCards = [
  {
    label: "Gross Sales (This Month)",
    value: "₱284,500",
    change: "+18.3%",
    positive: true,
    icon: PhilippinePeso,
    color: "#FF4FA3",
    bg: "from-primary-500 to-primary-700",
  },
  {
    label: "Active Patients",
    value: "1,248",
    change: "+12.1%",
    positive: true,
    icon: PawPrint,
    color: "#D98CFF",
    bg: "from-accent-400 to-accent-600",
  },
  {
    label: "Pending Refunds",
    value: "4",
    change: "+1 new today",
    positive: false,
    icon: RotateCcw,
    color: "#10B981",
    bg: "from-emerald-400 to-emerald-600",
  },
  {
    label: "Pending Registrations",
    value: "7",
    change: "+3 new today",
    positive: false,
    icon: ClipboardList,
    color: "#F59E0B",
    bg: "from-amber-400 to-amber-600",
  },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const revenueData = {
  labels: months,
  datasets: [
    {
      label: "Gross Revenue",
      data: [145000, 162000, 178000, 155000, 200000, 225000, 210000, 240000, 258000, 275000, 284500, 0],
      borderColor: "#FF4FA3",
      backgroundColor: "rgba(255, 79, 163, 0.08)",
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#FF4FA3",
      borderWidth: 2.5,
    },
    {
      label: "Net Income",
      data: [89000, 98000, 112000, 95000, 130000, 148000, 138000, 162000, 170000, 185000, 195000, 0],
      borderColor: "#D98CFF",
      backgroundColor: "rgba(217, 140, 255, 0.05)",
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#D98CFF",
      borderWidth: 2.5,
    },
  ],
};

const salesData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Products Sold",
      data: [42, 58, 45, 65, 70, 85, 30],
      backgroundColor: "rgba(255, 79, 163, 0.7)",
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
};

const servicesData = {
  labels: ["Consultation", "Vaccination", "Grooming", "Surgery", "Deworming", "Lab Tests"],
  datasets: [
    {
      data: [35, 25, 15, 10, 10, 5],
      backgroundColor: ["#FF4FA3", "#D98CFF", "#B84DFF", "#E63590", "#FF7DC0", "#ECC8FF"],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: { font: { size: 11 }, color: "#A3A3A3" },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: { font: { size: 11 }, color: "#A3A3A3" },
    },
  },
};

const lowStockItems = [
  { name: "Anti-Rabies Vaccine", stock: 5, reorder: 15, status: "Critical" },
  { name: "5-in-1 Vaccine (Canine)", stock: 8, reorder: 10, status: "Low" },
  { name: "Amoxicillin 250mg", stock: 12, reorder: 50, status: "Low" },
];

const recentActivity = [
  { action: "New registration", user: "Sarah Mendoza", time: "2 min ago", type: "info" },
  { action: "Payment received", user: "Carlo Reyes — ₱2,500", time: "15 min ago", type: "success" },
  { action: "Product sale", user: "Dog Food 5kg", time: "1 hr ago", type: "success" },
  { action: "Refund request", user: "Ana Cruz — ₱800", time: "2 hr ago", type: "warning" },
  { action: "Low stock alert", user: "Anti-Rabies Vaccine", time: "3 hr ago", type: "danger" },
];

const activityColors: Record<string, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="text-sm text-neutral-400">
          {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6 overflow-hidden relative"
          >
            {/* Gradient blob */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-xl"
              style={{ background: card.color }}
            />
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  card.positive
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {card.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {card.change}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-xs text-neutral-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Chart — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Revenue Overview</h3>
              <p className="text-xs text-neutral-400">Gross revenue vs. net income (2026)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-primary-500 rounded inline-block" />
                Gross
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-accent-400 rounded inline-block" />
                Net
              </span>
            </div>
          </div>
          <div className="h-64">
            <Line data={revenueData} options={chartOptions as never} />
          </div>
        </motion.div>

        {/* Top Services Doughnut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="font-bold text-lg mb-1">Top Services</h3>
          <p className="text-xs text-neutral-400 mb-6">By service revenue</p>
          <div className="h-48">
            <Doughnut
              data={servicesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { font: { size: 10 }, padding: 10, boxWidth: 10 },
                  },
                  tooltip: { backgroundColor: "rgba(0,0,0,0.8)", cornerRadius: 8 },
                },
                cutout: "68%",
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Appointments Bar + Low Stock + Activity */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Weekly Product Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card p-6"
        >
          <h3 className="font-bold text-lg mb-1">Weekly Sales</h3>
          <p className="text-xs text-neutral-400 mb-6">This week&apos;s product sales volume</p>
          <div className="h-48">
            <Bar
              data={salesData}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
              } as never}
            />
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Low Stock Alerts</h3>
              <p className="text-xs text-neutral-400">Products needing reorder</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex flex-col gap-4">
            {lowStockItems.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <span className={`badge text-xs ${item.status === "Critical" ? "badge-danger" : "badge-warning"}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.status === "Critical" ? "bg-danger" : "bg-warning"}`}
                      style={{ width: `${Math.min((item.stock / item.reorder) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    {item.stock}/{item.reorder}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost w-full mt-5 text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10">
            View Full Inventory →
          </button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="card p-6"
        >
          <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${activityColors[act.type]}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{act.action}</p>
                  <p className="text-xs text-neutral-400 truncate">{act.user}</p>
                  <p className="text-[10px] text-neutral-300 dark:text-neutral-600">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
