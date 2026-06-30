"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Banknote, Receipt, AlertCircle, ShoppingCart, 
  TrendingUp, ArrowRight, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CashierDashboard() {
  const [loading, setLoading] = useState(true);
  const [dailySales, setDailySales] = useState({ totalSales: 0, count: 0 });
  const [unpaidBills, setUnpaidBills] = useState<any[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    fetchDashboardData();
    // Poll every 10 seconds for real-time updates
    intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const [salesRes, billsRes] = await Promise.all([
        fetch(`${baseUrl}/api/payments/daily`),
        fetch(`${baseUrl}/api/bills`)
      ]);
      
      if (salesRes.ok) {
        setDailySales(await salesRes.json());
      }

      if (billsRes.ok) {
        const allBills = await billsRes.json();
        setUnpaidBills(allBills.filter((b: any) => b.status === "Unpaid"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Today's Sales", value: `₱${dailySales.totalSales.toLocaleString()}`, icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+12%" },
    { title: "Transactions Today", value: dailySales.count.toString(), icon: Receipt, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+5%" },
    { title: "Pending Invoices", value: unpaidBills.length.toString(), icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Requires action", isAlert: unpaidBills.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cashier Overview</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage today's transactions and pending payments.</p>
        </div>
        <Link href="/cashier/pos" className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 border-0 shadow-lg shadow-emerald-500/20">
          <ShoppingCart className="w-4 h-4 mr-2" /> Open POS
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("card p-5 relative overflow-hidden", stat.isAlert ? "border-amber-200 dark:border-amber-900/50" : "")}
          >
            {stat.isAlert && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>}
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
              <span className={cn("font-medium flex items-center gap-1", stat.isAlert ? "text-amber-500" : "text-emerald-500")}>
                {!stat.isAlert && <TrendingUp className="w-3 h-3" />}
                {stat.trend}
              </span>
              <span className="text-neutral-400 ml-2">{stat.isAlert ? "Check Invoices tab" : "vs yesterday"}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unpaid Invoices */}
        <div className="card flex flex-col">
          <div className="p-5 border-b border-[var(--card-border)] flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Invoices
              </h3>
              <p className="text-xs text-neutral-500 mt-1">Bills waiting for payment</p>
            </div>
            <Link href="/cashier/invoices" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[400px]">
            {loading ? (
              <p className="text-sm text-neutral-500 text-center py-8">Loading invoices...</p>
            ) : unpaidBills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-neutral-500">No pending invoices at the moment.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <tbody>
                  {unpaidBills.slice(0, 5).map((bill: any) => (
                    <tr key={bill.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{bill.billCode}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{bill.client?.user?.firstName} {bill.client?.user?.lastName}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-right">
                        ₱{Number(bill.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/cashier/invoices/${bill.id}/pay`} className="btn btn-primary text-xs py-1.5 h-auto px-3 bg-emerald-500 hover:bg-emerald-600 border-0">
                          Process Payment
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions placeholder */}
        <div className="card flex flex-col">
          <div className="p-5 border-b border-[var(--card-border)] flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-500" /> Recent Transactions
              </h3>
            </div>
            <Link href="/cashier/transactions" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 p-5 flex items-center justify-center text-neutral-500 text-sm">
            Transaction history will appear here.
          </div>
        </div>
      </div>

    </div>
  );
}

// Temporary mock icon for CheckCircle2
function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
