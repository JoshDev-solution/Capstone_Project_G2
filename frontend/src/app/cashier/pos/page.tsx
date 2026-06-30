"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Banknote, CreditCard, Smartphone, User, FileText, Tag, Printer, RefreshCcw, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function CashierPOSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [cart, setCart] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | "">("");
  const [attachedBillId, setAttachedBillId] = useState<number | "">("");
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState<number | string>("");
  
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const token = localStorage.getItem("vcms_token") || "";
      const headers = { "Authorization": `Bearer ${token}` };

      const [prodRes, clientRes, billRes, discRes] = await Promise.all([
        fetch(`${baseUrl}/api/products`, { headers }),
        fetch(`${baseUrl}/api/clients`, { headers }),
        fetch(`${baseUrl}/api/bills`, { headers }),
        fetch(`${baseUrl}/api/discounts`, { headers })
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
        const cats = Array.from(new Set(prodData.map((p: any) => p.category?.name || "Retail"))) as string[];
        setCategories(["All", ...cats]);
      }
      if (clientRes.ok) {
        setClients(await clientRes.json());
      }
      if (billRes.ok) {
        const allBills = await billRes.json();
        setBills(allBills.filter((b: any) => b.status === "Draft" || b.status === "Unpaid"));
      }
      if (discRes.ok) {
        const allDisc = await discRes.json();
        setDiscounts(allDisc.filter((d: any) => d.active || d.isActive !== false));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const attachedBill = attachedBillId ? bills.find(b => b.id === attachedBillId) : null;
  const selectedDiscount = selectedDiscountId ? discounts.find(d => d.id === selectedDiscountId) : null;

  // Auto-select client if bill is attached
  useEffect(() => {
    if (attachedBill) {
      setSelectedClient(attachedBill.clientId);
    }
  }, [attachedBill]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || (p.category?.name || "Retail") === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: any) => {
    // Optional check for inventory limit
    const inventoryCount = product.inventory?.quantity || 0;
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= inventoryCount) {
         Swal.fire("Out of Stock", `Only ${inventoryCount} units available.`, "warning");
         return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (inventoryCount <= 0) {
        Swal.fire("Out of Stock", "This product is currently out of stock.", "warning");
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const limit = item.inventory?.quantity || 0;
        if (newQty > limit) {
          Swal.fire("Out of Stock", `Only ${limit} units available.`, "warning");
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const attachedItemsSubtotal = attachedBill 
    ? attachedBill.items.reduce((sum: number, item: any) => sum + Number(item.totalPrice), 0)
    : 0;
  
  const cartSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const rawSubtotal = cartSubtotal + attachedItemsSubtotal;

  let discountAmount = 0;
  if (selectedDiscount) {
    if (selectedDiscount.type === "Percentage") {
      discountAmount = rawSubtotal * (Number(selectedDiscount.value) / 100);
      if (selectedDiscount.maxDiscount && discountAmount > Number(selectedDiscount.maxDiscount)) {
        discountAmount = Number(selectedDiscount.maxDiscount);
      }
    } else {
      discountAmount = Number(selectedDiscount.value);
    }
  }

  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const tax = taxableAmount * 0.12; 
  const totalDue = taxableAmount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0 && !attachedBill) {
      Swal.fire("Cart Empty", "Please add items or attach a bill before checkout.", "warning");
      return;
    }

    const tendered = Number(amountTendered) || totalDue;
    if (paymentMethod === "Cash" && tendered < totalDue) {
      Swal.fire("Insufficient Amount", "The amount tendered is less than the total due.", "error");
      return;
    }

    setLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token") || "";

      let activeBillId = attachedBillId;

      if (attachedBillId) {
        // Update existing bill with new items
        const updatePayload = {
          subtotal: rawSubtotal,
          taxAmount: tax,
          discountAmount: discountAmount,
          discountId: selectedDiscountId || null,
          totalAmount: totalDue,
          status: "Paid",
          ...(cart.length > 0 && {
            items: {
              create: cart.map(item => ({
                itemType: "Product",
                productId: item.id,
                description: item.name,
                quantity: item.quantity,
                unitPrice: Number(item.price),
                totalPrice: Number(item.price) * item.quantity
              }))
            }
          })
        };

        const updateRes = await fetch(`${baseUrl}/api/bills/${attachedBillId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(updatePayload)
        });
        if (!updateRes.ok) throw new Error("Failed to update attached bill");
      } else {
        // Create new bill
        const billPayload = {
          billCode: `POS-${Date.now()}`,
          clientId: selectedClient || 1, // 1 is typically Walk-in fallback
          discountId: selectedDiscountId || null,
          subtotal: rawSubtotal,
          taxAmount: tax,
          discountAmount: discountAmount,
          totalAmount: totalDue,
          status: "Paid",
          items: {
            create: cart.map(item => ({
              itemType: "Product",
              productId: item.id,
              description: item.name,
              quantity: item.quantity,
              unitPrice: Number(item.price),
              totalPrice: Number(item.price) * item.quantity
            }))
          }
        };

        const billRes = await fetch(`${baseUrl}/api/bills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(billPayload)
        });
        
        if (!billRes.ok) throw new Error("Failed to create retail bill");
        const createdBill = await billRes.json();
        activeBillId = createdBill.id;
      }

      // Create payment
      const payPayload = {
        billId: activeBillId,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod,
        amount: totalDue,
        referenceNumber: paymentMethod !== "Cash" ? `POS-REF-${Date.now()}` : undefined
      };

      const payRes = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payPayload)
      });

      if (payRes.ok) {
        const change = paymentMethod === "Cash" ? tendered - totalDue : 0;
        
        // Prepare receipt data
        const finalReceiptData = {
          billCode: attachedBill ? attachedBill.billCode : `POS-${Date.now()}`,
          clientName: clients.find(c => c.id === selectedClient)?.user?.firstName || "Walk-in Customer",
          date: new Date().toLocaleString(),
          items: [
            ...(attachedBill?.items || []).map((i: any) => ({
              name: i.description || i.service?.name || i.product?.name,
              qty: i.quantity,
              price: Number(i.unitPrice),
              total: Number(i.totalPrice)
            })),
            ...cart.map(i => ({
              name: i.name,
              qty: i.quantity,
              price: Number(i.price),
              total: Number(i.price) * i.quantity
            }))
          ],
          subtotal: rawSubtotal,
          discountName: selectedDiscount?.name,
          discountAmount: discountAmount,
          tax: tax,
          totalDue: totalDue,
          paymentMethod: paymentMethod,
          tendered: tendered,
          change: change
        };

        setReceiptData(finalReceiptData);
      } else {
        throw new Error("Failed to create payment record");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Checkout Failed", "An error occurred during checkout.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    setCart([]);
    setSelectedClient("");
    setAttachedBillId("");
    setSelectedDiscountId("");
    setAmountTendered("");
    setPaymentMethod("Cash");
    setReceiptData(null);
    fetchData(); // Refresh data to update inventory and unpaid bills
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] hide-on-print">
      
      {/* Dynamic Style for Printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .hide-on-print { display: none !important; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; max-width: 400px; padding: 20px; font-family: monospace; color: black; background: white; margin: 0 auto; box-shadow: none; }
        }
      `}} />

      {/* Left Area: Products Grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-[var(--card-border)] shadow-sm">
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="text-primary-500" /> POS System</h1>
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="input pl-10 w-full rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" 
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-[var(--card-border)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const stock = product.stock || 0;
              return (
                <div 
                  key={product.id} 
                  onClick={() => stock > 0 && addToCart(product)}
                  className={cn(
                    "card p-4 flex flex-col justify-between cursor-pointer transition-all group h-44",
                    stock > 0 
                      ? "hover:border-primary-500 hover:ring-2 hover:ring-primary-500/20" 
                      : "opacity-50 cursor-not-allowed grayscale"
                  )}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded mb-2 inline-block">
                        {product.category || "Retail"}
                      </span>
                      {stock <= 0 && <span className="badge bg-danger/10 text-danger text-[10px]">Out of Stock</span>}
                      {stock > 0 && stock <= (product.reorderLevel || 5) && <span className="badge bg-warning/10 text-warning text-[10px]">Low Stock</span>}
                    </div>
                    <h3 className={cn("font-bold text-sm leading-tight transition-colors line-clamp-2", stock > 0 && "group-hover:text-primary-600")}>
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-lg font-black text-neutral-900 dark:text-white">₱{Number(product.price).toLocaleString()}</span>
                    {stock > 0 && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className="w-full lg:w-[420px] flex flex-col card overflow-hidden shadow-xl border-primary-100 dark:border-neutral-800">
        
        {/* Configuration Section */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--card-border)] space-y-3 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1"><User className="w-3 h-3"/> Client</label>
              <select className="input py-2 text-sm" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Walk-in Customer</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.user?.firstName} {c.user?.lastName} ({c.clientCode})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1"><FileText className="w-3 h-3"/> Attach Bill</label>
              <select className="input py-2 text-sm" value={attachedBillId} onChange={(e) => setAttachedBillId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">None</option>
                {bills.map(b => (
                  <option key={b.id} value={b.id}>{b.billCode} - ₱{Number(b.totalAmount).toLocaleString()}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1"><Tag className="w-3 h-3"/> Discount</label>
            <select className="input py-2 text-sm" value={selectedDiscountId} onChange={(e) => setSelectedDiscountId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">No Discount</option>
              {discounts.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.type === 'Percentage' ? `${d.value}%` : `₱${d.value}`})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-black">
          {attachedBill && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1"><FileText className="w-3 h-3"/> From Attached Bill</h3>
              <div className="space-y-2">
                {attachedBill.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-lg border border-[var(--card-border)]">
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-bold truncate pr-2 opacity-80">{item.description || item.service?.name || item.product?.name}</h4>
                      <p className="text-xs text-neutral-500">Qty: {item.quantity} × ₱{Number(item.unitPrice).toLocaleString()}</p>
                    </div>
                    <div className="text-sm font-bold opacity-80">₱{Number(item.totalPrice).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1"><ShoppingCart className="w-3 h-3"/> New Retail Items</h3>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-[var(--card-border)] shadow-sm">
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-bold truncate pr-2">{item.name}</h4>
                      <p className="text-xs text-neutral-500">₱{Number(item.price).toLocaleString()} / ea</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary-600"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary-600"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-danger hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cart.length === 0 && !attachedBill && (
            <div className="h-full flex flex-col items-center justify-center text-neutral-300 dark:text-neutral-700 pb-10">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p>No items added yet</p>
            </div>
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-[var(--card-border)] shrink-0 space-y-4 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>₱{rawSubtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({selectedDiscount?.name})</span>
                <span>-₱{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Tax (12%)</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-3 border-t border-[var(--card-border)] mt-2">
              <span className="font-bold text-lg">Total Due</span>
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tight">₱{totalDue.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { id: "Cash", icon: Banknote },
              { id: "GCash", icon: Smartphone },
              { id: "Maya", icon: Smartphone },
              { id: "Card", icon: CreditCard }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all",
                  paymentMethod === method.id 
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400" 
                    : "border-transparent bg-white dark:bg-neutral-800 text-neutral-500 shadow-sm"
                )}
              >
                <method.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase">{method.id}</span>
              </button>
            ))}
          </div>

          {paymentMethod === "Cash" && (
            <div className="pt-2">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Amount Tendered (₱)</label>
              <input 
                type="number" 
                className="input w-full mt-1 text-center font-bold text-lg focus:border-primary-500 focus:ring-primary-500"
                placeholder={totalDue.toFixed(2)}
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
              />
            </div>
          )}

          <button 
            className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-primary-500/25 mt-2"
            onClick={handleCheckout}
            disabled={loading || (cart.length === 0 && !attachedBill) || (paymentMethod === "Cash" && Number(amountTendered) < totalDue && amountTendered !== "")}
          >
            {loading ? "Processing..." : "Process Payment"}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-sm">
          <div className="card w-full max-w-md bg-white text-black overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 bg-neutral-100 border-b flex justify-between items-center shrink-0">
              <h2 className="font-bold flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Payment Successful</h2>
              <button onClick={handleNewTransaction} className="btn-icon btn-ghost w-8 h-8 rounded-full"><X className="w-4 h-4"/></button>
            </div>

            <div id="printable-receipt" className="p-6 overflow-y-auto flex-1 text-sm bg-white text-black">
              <div className="text-center mb-6">
                <h1 className="font-black text-xl mb-1">VET CLINIC SYSTEM</h1>
                <p className="text-xs text-neutral-500">123 Pet Avenue, City<br/>Tel: (123) 456-7890</p>
                <div className="mt-4 pt-4 border-t border-dashed">
                  <p className="font-mono text-xs">Receipt #: {receiptData.billCode}</p>
                  <p className="font-mono text-xs">Date: {receiptData.date}</p>
                  <p className="font-mono text-xs mt-2 font-semibold">Client: {receiptData.clientName}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-bold text-xs uppercase border-b border-dashed pb-2">
                  <span className="flex-1">Item</span>
                  <span className="w-12 text-center">Qty</span>
                  <span className="w-20 text-right">Amount</span>
                </div>
                {receiptData.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex-1 pr-2 truncate">{item.name} <span className="text-neutral-400">(@₱{item.price.toFixed(2)})</span></span>
                    <span className="w-12 text-center">{item.qty}</span>
                    <span className="w-20 text-right font-mono">₱{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed pt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₱{receiptData.subtotal.toFixed(2)}</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount ({receiptData.discountName})</span>
                    <span className="font-mono">-₱{receiptData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (12%)</span>
                  <span className="font-mono">₱{receiptData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-base mt-2 pt-2 border-t border-dashed">
                  <span>TOTAL DUE</span>
                  <span className="font-mono">₱{receiptData.totalDue.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-bold">{receiptData.paymentMethod}</span>
                </div>
                {receiptData.paymentMethod === "Cash" && (
                  <>
                    <div className="flex justify-between">
                      <span>Amount Tendered</span>
                      <span className="font-mono">₱{receiptData.tendered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Change</span>
                      <span className="font-mono">₱{receiptData.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-8 text-center text-xs text-neutral-500 pb-4">
                <p>Thank you for your business!</p>
                <p>Please come again.</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t shrink-0 flex gap-3">
              <button onClick={printReceipt} className="btn bg-white border border-[var(--card-border)] text-black hover:bg-neutral-100 flex-1">
                <Printer className="w-4 h-4 mr-2" /> Print
              </button>
              <button onClick={handleNewTransaction} className="btn btn-primary flex-1">
                <RefreshCcw className="w-4 h-4 mr-2" /> New Transaction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
