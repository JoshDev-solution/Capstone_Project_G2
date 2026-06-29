"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, User, Stethoscope, Package, Calculator } from "lucide-react";
import Swal from 'sweetalert2';
import { cn } from "@/lib/utils";

export default function GenerateInvoicePage() {
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const [aptRes, svcRes, prodRes] = await Promise.all([
        fetch(`${baseUrl}/api/appointments`), // Fetch appointments that need billing (e.g. Completed but unpaid)
        fetch(`${baseUrl}/api/services`),
        fetch(`${baseUrl}/api/products`)
      ]);

      if (aptRes.ok) {
        const apts = await aptRes.json();
        // Ideally filter appointments that are 'Completed'
        setAppointments(apts);
      }
      if (svcRes.ok) setServices(await svcRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const selectedAppointment = appointments.find(a => a.id.toString() === selectedAppointmentId);

  const handleAddItem = (type: "Service" | "Product", itemId: string) => {
    if (!itemId) return;
    
    let details: any = null;
    if (type === "Service") {
      const svc = services.find(s => s.id.toString() === itemId);
      if (svc) details = { type: "Service", serviceId: svc.id, name: svc.name, unitPrice: Number(svc.price || 0), quantity: 1 };
    } else {
      const prod = products.find(p => p.id.toString() === itemId);
      if (prod) details = { type: "Product", productId: prod.id, name: prod.name, unitPrice: Number(prod.price || 0), quantity: 1 };
    }

    if (details) {
      setItems([...items, { ...details, uniqueId: Date.now().toString() }]);
    }
  };

  const updateItemQuantity = (uniqueId: string, qty: number) => {
    setItems(items.map(item => item.uniqueId === uniqueId ? { ...item, quantity: qty } : item));
  };

  const removeItem = (uniqueId: string) => {
    setItems(items.filter(item => item.uniqueId !== uniqueId));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * 0.12; // 12% VAT example
  const totalAmount = subtotal + tax - discountAmount;

  const handleSaveInvoice = async () => {
    if (!selectedAppointment) {
      Swal.fire("Error", "Please select an appointment/client first.", "error");
      return;
    }
    if (items.length === 0) {
      Swal.fire("Error", "Please add at least one service or product.", "error");
      return;
    }

    setLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;

      // In real scenario, a client mapping exists on appointment
      // We assume selectedAppointment has client ID
      
      const payload = {
        billCode: `INV-${Date.now()}`,
        clientId: selectedAppointment.clientId || 1,
        petId: selectedAppointment.petId || 1,
        appointmentId: selectedAppointment.id,
        subtotal: subtotal,
        taxAmount: tax,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        status: "Unpaid",
        items: {
          create: items.map(item => ({
            serviceId: item.type === "Service" ? item.serviceId : undefined,
            productId: item.type === "Product" ? item.productId : undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      };

      const res = await fetch(`${baseUrl}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire("Success", "Invoice generated successfully!", "success").then(() => {
          router.push('/manager/billing');
        });
      } else {
        throw new Error("Failed to generate invoice");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to generate invoice. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">Generate Invoice</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Selections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4 border-b border-[var(--card-border)] pb-3">
              <User className="w-5 h-5 text-primary-500" /> Link to Appointment
            </h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Appointment</label>
              <select className="input" value={selectedAppointmentId} onChange={(e) => setSelectedAppointmentId(e.target.value)}>
                <option value="">-- Select Appointment --</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code || `APT-${a.id}`} - {a.clientName || (a.client?.user?.firstName + ' ' + a.client?.user?.lastName)} (Pet: {a.petName || a.pet?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4 border-b border-[var(--card-border)] pb-3">
              <Plus className="w-5 h-5 text-primary-500" /> Add Items
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase block mb-1">Add Service</label>
                <div className="flex gap-2">
                  <select className="input flex-1" id="serviceSelect">
                    <option value="">-- Choose Service --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (₱{s.price})</option>)}
                  </select>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      const sel = document.getElementById('serviceSelect') as HTMLSelectElement;
                      handleAddItem("Service", sel.value);
                      sel.value = "";
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase block mb-1">Add Product</label>
                <div className="flex gap-2">
                  <select className="input flex-1" id="productSelect">
                    <option value="">-- Choose Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (₱{p.price})</option>)}
                  </select>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      const sel = document.getElementById('productSelect') as HTMLSelectElement;
                      handleAddItem("Product", sel.value);
                      sel.value = "";
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--card-border)] bg-neutral-50 dark:bg-neutral-800/50">
              <h3 className="font-bold">Invoice Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-neutral-500 border-b border-[var(--card-border)]">
                  <tr>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 w-32">Unit Price</th>
                    <th className="px-5 py-3 w-32">Qty</th>
                    <th className="px-5 py-3 w-32">Total</th>
                    <th className="px-5 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No items added to invoice.</td></tr>
                  ) : items.map((item) => (
                    <tr key={item.uniqueId} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {item.type === "Service" ? <Stethoscope className="w-4 h-4 text-primary-500" /> : <Package className="w-4 h-4 text-emerald-500" />}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">₱{item.unitPrice.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <input 
                          type="number" 
                          min="1" 
                          className="input px-2 py-1 h-8" 
                          value={item.quantity} 
                          onChange={(e) => updateItemQuantity(item.uniqueId, Number(e.target.value))}
                        />
                      </td>
                      <td className="px-5 py-3 font-semibold">₱{(item.unitPrice * item.quantity).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => removeItem(item.uniqueId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
            <h3 className="font-bold flex items-center gap-2 mb-6 border-b border-[var(--card-border)] pb-3">
              <Calculator className="w-5 h-5 text-primary-500" /> Payment Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-900 dark:text-white">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>VAT (12%)</span>
                <span className="font-medium text-neutral-900 dark:text-white">₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                <span>Discount</span>
                <div className="flex items-center gap-1 w-24">
                  <span className="text-neutral-500">-₱</span>
                  <input 
                    type="number" 
                    className="input px-2 py-1 h-7 text-right w-full" 
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex justify-between items-end">
              <span className="font-bold text-neutral-500 uppercase tracking-wider text-xs">Total Due</span>
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">₱{totalAmount.toFixed(2)}</span>
            </div>

            <div className="mt-8">
              <button 
                className="btn btn-primary w-full shadow-lg shadow-primary-500/20 py-3"
                onClick={handleSaveInvoice}
                disabled={loading || items.length === 0 || !selectedAppointment}
              >
                {loading ? "Generating..." : <><Save className="w-4 h-4 mr-2" /> Save Invoice</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
