"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Package, ArrowLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ExpiredProductsPage() {
  const [expiredItems, setExpiredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
        if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
        const token = localStorage.getItem("vcms_token");
        const headers = { "Authorization": `Bearer ${token}` };

        const invRes = await fetch(`${baseUrl}/api/inventory`, { headers });

        if (invRes.ok) {
          const invData = await invRes.json();
          const today = new Date();
          const expired = invData.filter((item: any) => {
            if (!item.expirationDate) return false;
            return new Date(item.expirationDate) < today;
          });
          setExpiredItems(expired);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/inventory" className="btn-icon btn-ghost w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Expired Products</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Products that have passed their expiration date and need to be disposed of.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">Loading expired items...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-danger" />
            <h2 className="font-bold text-lg text-danger">Expired Inventory ({expiredItems.length})</h2>
          </div>
          
          {expiredItems.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-bold">All Good!</h3>
              <p className="text-neutral-400 mt-1 max-w-sm">There are no expired products in your inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Stock Value</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredItems.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-danger/5"
                    >
                      <td>
                        <p className="text-sm font-medium">{item.product?.name || "Unknown Product"}</p>
                      </td>
                      <td><span className="badge badge-primary">{item.product?.category || "Uncategorized"}</span></td>
                      <td className="font-bold">{item.quantity}</td>
                      <td className="text-sm">₱{(item.quantity * (item.product?.price || 0)).toLocaleString()}</td>
                      <td className="font-medium text-danger">
                        {new Date(item.expirationDate).toISOString().split('T')[0]}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-danger text-xs font-bold bg-danger/10 px-2.5 py-1 rounded-full w-fit">
                          <AlertCircle className="w-3 h-3" /> Expired
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
