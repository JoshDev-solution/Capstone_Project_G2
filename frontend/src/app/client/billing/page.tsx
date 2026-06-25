"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientBillingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/clients/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-neutral-500">Loading billing history...</div>;

  const bills = profile?.bills || [];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-500" /> Billing History
        </h1>
        <p className="text-sm text-neutral-500 mt-1">View your past invoices and payment history.</p>
      </div>

      <div className="card overflow-hidden">
        {bills.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center text-neutral-500">
            <FileText className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-semibold text-lg text-neutral-900 dark:text-white">No Billing History</p>
            <p className="text-sm">You have no invoices on record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4 font-bold">Invoice #</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {bills.map((bill: any) => (
                  <tr key={bill.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="p-4 font-bold">{bill.billCode}</td>
                    <td className="p-4 text-neutral-500">{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-right">₱{Number(bill.totalAmount).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "badge text-[10px]",
                        bill.status === "Paid" ? "badge-success" :
                        bill.status === "Unpaid" ? "badge-danger" : "badge-warning"
                      )}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {bill.status === "Unpaid" ? (
                        <button className="btn btn-primary btn-sm" onClick={() => alert("Online payments are currently disabled. Please pay at the clinic.")}>
                          Pay Now
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-icon" title="Download Receipt">
                          <Download className="w-4 h-4 text-primary-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
