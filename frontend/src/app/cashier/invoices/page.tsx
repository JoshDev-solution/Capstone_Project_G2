"use client";

import { useState, useEffect } from "react";
import { Search, Filter, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CashierInvoicesPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/bills`);
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(b => 
    b.billCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.client?.user?.firstName && b.client.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Paid": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Unpaid": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Partially Paid": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Invoices & Billing</h1>
          <p className="text-sm text-neutral-500 mt-1">Process payments for clinic bills.</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by invoice ID or client name..." 
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-outline flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-5 py-3">Invoice ID</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">Loading invoices...</td></tr>
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">No invoices found.</td></tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {bill.billCode}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold">{bill.client?.user?.firstName} {bill.client?.user?.lastName}</p>
                      <p className="text-xs text-neutral-500">{bill.client?.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-bold">
                      ₱{Number(bill.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("badge", getStatusBadge(bill.status))}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {bill.status === "Unpaid" ? (
                        <Link href={`/cashier/invoices/${bill.id}/pay`} className="btn btn-primary text-xs py-1.5 h-auto px-3 bg-emerald-500 hover:bg-emerald-600 border-0">
                          Process Payment
                        </Link>
                      ) : (
                        <button className="btn btn-outline text-xs py-1.5 h-auto px-3 inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" /> View Receipt
                        </button>
                      )}
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
