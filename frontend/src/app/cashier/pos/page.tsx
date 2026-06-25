"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Banknote, CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from 'sweetalert2';

export default function CashierPOSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState<number | string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/products`);
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const tax = (subtotal - discountAmount) * 0.12; // 12% VAT
  const totalDue = subtotal - discountAmount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Swal.fire("Cart Empty", "Please add items to the cart before checkout.", "warning");
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
      
      // For retail POS, we create a Bill (status Paid) and a Payment in one go.
      // We will hit the bills endpoint, then the payments endpoint.
      const billPayload = {
        billCode: `POS-${Date.now()}`,
        // POS usually has a walk-in client fallback. Assuming Client ID 1 is Walk-in for prototype
        clientId: 1, 
        subtotal: subtotal,
        taxAmount: tax,
        discountAmount: discountAmount,
        totalAmount: totalDue,
        status: "Paid", // Instantly paid
        items: {
          create: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: Number(item.price),
            totalPrice: Number(item.price) * item.quantity
          }))
        }
      };

      const billRes = await fetch(`${baseUrl}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload)
      });
      
      if (!billRes.ok) throw new Error("Failed to create retail bill");
      const createdBill = await billRes.json();

      // Now create payment
      const payPayload = {
        billId: createdBill.id,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod,
        amount: totalDue,
        referenceNumber: paymentMethod !== "Cash" ? `POS-REF-${Date.now()}` : undefined
      };

      const payRes = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payPayload)
      });

      if (payRes.ok) {
        const change = paymentMethod === "Cash" ? tendered - totalDue : 0;
        Swal.fire({
          title: "Checkout Successful!",
          html: `${paymentMethod === "Cash" && change > 0 ? `<br/><b class="text-emerald-600 text-xl">Change Due: ₱${change.toFixed(2)}</b>` : ""}`,
          icon: "success",
          confirmButtonColor: "#10B981",
        }).then(() => {
          setCart([]);
          setAmountTendered("");
          setDiscountPercent(0);
        });
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      
      {/* Left Area: Products Grid */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Retail POS</h1>
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
        
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all group h-40"
              >
                <div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md mb-2 inline-block">
                    {product.category?.name || "Retail"}
                  </span>
                  <h3 className="font-bold text-sm leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-lg font-black text-neutral-900 dark:text-white">₱{Number(product.price).toLocaleString()}</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area: Cart & Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col card overflow-hidden shadow-xl border-emerald-100 dark:border-neutral-800">
        <div className="p-4 bg-neutral-900 dark:bg-black text-white flex justify-between items-center shrink-0">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" /> Current Cart
          </h2>
          <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {cart.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white dark:bg-neutral-900 p-3 rounded-xl border border-[var(--card-border)] shadow-sm">
                <div className="flex-1">
                  <h4 className="text-sm font-bold truncate pr-2">{item.name}</h4>
                  <p className="text-xs text-neutral-500">₱{Number(item.price).toLocaleString()} / ea</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-emerald-600"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-emerald-600"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white dark:bg-neutral-950 border-t border-[var(--card-border)] shrink-0 space-y-4">
          
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-500">
              <span>Discount (%)</span>
              <input 
                type="number" 
                min="0" max="100"
                className="input px-2 py-1 h-7 text-right w-16" 
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Tax (12%)</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-[var(--card-border)] mt-2">
              <span className="font-bold text-lg">Total Due</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₱{totalDue.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Cash", icon: Banknote },
              { id: "GCash", icon: Smartphone },
              { id: "Card", icon: CreditCard }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all",
                  paymentMethod === method.id 
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                    : "border-transparent bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                )}
              >
                <method.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase">{method.id}</span>
              </button>
            ))}
          </div>

          {paymentMethod === "Cash" && (
            <div className="pt-2 border-t border-[var(--card-border)]">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Tendered (₱)</label>
              <input 
                type="number" 
                className="input w-full mt-1 text-center font-bold text-lg border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder={totalDue.toFixed(2)}
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
              />
            </div>
          )}

          <button 
            className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 border-0 w-full py-4 text-lg shadow-lg shadow-emerald-500/20"
            onClick={handleCheckout}
            disabled={loading || cart.length === 0 || (paymentMethod === "Cash" && Number(amountTendered) < totalDue && amountTendered !== "")}
          >
            {loading ? "Processing..." : "Checkout"}
          </button>
        </div>
      </div>
      
    </div>
  );
}
