"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Banknote, Smartphone } from "lucide-react";
import Swal from 'sweetalert2';
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CashierPayInvoicePage(props: PageProps) {
  const router = useRouter();
  const params = use(props.params);
  const billId = params.id;

  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState<number | string>("");

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/bills/${billId}`);
      if (res.ok) {
        const data = await res.json();
        setBill(data);
        if (data.status === "Paid") {
          Swal.fire("Already Paid", "This invoice has already been paid.", "info").then(() => router.back());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!bill) return;
    
    const totalDue = Number(bill.totalAmount);
    const tendered = Number(amountTendered) || totalDue; // Default to exact amount if GCash/Card

    if (paymentMethod === "Cash" && tendered < totalDue) {
      Swal.fire("Insufficient Amount", "The amount tendered is less than the total due.", "error");
      return;
    }

    setProcessing(true);
    
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const payload = {
        billId: bill.id,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod,
        amount: totalDue,
        referenceNumber: paymentMethod !== "Cash" ? `REF-${Date.now()}` : undefined
      };

      const res = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const change = paymentMethod === "Cash" ? tendered - totalDue : 0;
        
        Swal.fire({
          title: "Payment Successful!",
          html: `The invoice has been marked as Paid.<br/>${paymentMethod === "Cash" && change > 0 ? `<br/><b class="text-emerald-600 text-xl">Change Due: ₱${change.toFixed(2)}</b>` : ""}`,
          icon: "success",
          confirmButtonColor: "#10B981",
          confirmButtonText: "Done"
        }).then(() => {
          router.push('/cashier/invoices');
        });
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not process payment. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-neutral-500">Loading invoice data...</div>;
  if (!bill) return <div className="p-10 text-center text-red-500">Invoice not found.</div>;

  const totalDue = Number(bill.totalAmount);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Process Payment
            <span className="badge bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              {bill.billCode}
            </span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Client: <span className="font-medium text-neutral-900 dark:text-white">{bill.client?.user?.firstName} {bill.client?.user?.lastName}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Col: Invoice Summary */}
        <div className="card p-6 space-y-6">
          <h3 className="font-bold flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
             Invoice Details
          </h3>
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-500 uppercase">Items</h4>
            <ul className="space-y-2 text-sm bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
              {bill.items?.map((item: any) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>
                    {item.quantity}x <span className="font-medium">{item.service?.name || item.product?.name || "Item"}</span>
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">₱{Number(item.totalPrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 pt-4 border-t border-[var(--card-border)]">
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>Subtotal</span>
              <span>₱{Number(bill.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>Tax (VAT)</span>
              <span>₱{Number(bill.taxAmount).toFixed(2)}</span>
            </div>
            {Number(bill.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-500">
                <span>Discount</span>
                <span>-₱{Number(bill.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white pt-2 border-t border-[var(--card-border)] mt-2">
              <span>Total Due</span>
              <span className="text-emerald-600 dark:text-emerald-400">₱{totalDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Payment Processor */}
        <div className="card p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-neutral-900 border-emerald-100 dark:border-emerald-900/30 space-y-6">
          <h3 className="font-bold flex items-center gap-2 border-b border-[var(--card-border)] border-emerald-200 dark:border-emerald-900/50 pb-3 text-emerald-900 dark:text-emerald-400">
             Payment Method
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "Cash", icon: Banknote },
              { id: "GCash", icon: Smartphone },
              { id: "Credit Card", icon: CreditCard }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                  paymentMethod === method.id 
                    ? "border-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                    : "border-[var(--card-border)] bg-white dark:bg-neutral-800 text-neutral-500 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                )}
              >
                <method.icon className="w-6 h-6 mb-2" />
                <span className="text-xs font-semibold">{method.id}</span>
                {paymentMethod === method.id && (
                  <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-emerald-500" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
            {paymentMethod === "Cash" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-emerald-900 dark:text-emerald-400">Amount Tendered (₱)</label>
                <input 
                  type="number" 
                  className="input h-12 text-xl font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-neutral-900 border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 focus:ring-emerald-500" 
                  placeholder="e.g. 1000"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                />
                {Number(amountTendered) > 0 && Number(amountTendered) >= totalDue && (
                  <p className="text-sm font-bold text-emerald-600 mt-2">
                    Change: ₱{(Number(amountTendered) - totalDue).toFixed(2)}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg text-center">
                <p className="text-sm text-emerald-800 dark:text-emerald-400 mb-2">
                  Waiting for {paymentMethod} authorization...
                </p>
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button 
              className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/30 w-full py-4 text-lg" 
              onClick={handleProcessPayment}
              disabled={processing || (paymentMethod === "Cash" && (Number(amountTendered) < totalDue || !amountTendered))}
            >
              {processing ? "Processing..." : `Complete Payment of ₱${totalDue.toFixed(2)}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
