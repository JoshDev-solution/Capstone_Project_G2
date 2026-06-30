"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, X, AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  buyPrice?: number;
  stock: number;
  reorderLevel: number;
  unit: string;
  active: boolean;
  expiry?: string;
}

const catColors: Record<string, string> = {
  Medicines: "badge-danger",
  Vaccines: "badge-primary",
  "Pet Food": "badge-success",
  Supplements: "badge-warning",
  Grooming: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  Accessories: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

function getStockStatus(stock: number, reorder: number) {
  if (stock <= 0) return { label: "Out of Stock", cls: "badge-danger" };
  if (stock <= reorder * 0.5) return { label: "Critical", cls: "badge-danger" };
  if (stock <= reorder) return { label: "Low Stock", cls: "badge-warning" };
  return { label: "In Stock", cls: "badge-success" };
}

function ProductModal({ 
  product, 
  onClose,
  onSave
}: { 
  product?: Product; 
  onClose: () => void;
  onSave: (formData: Omit<Product, "id"> & { id?: number }) => void;
}) {
  const isEdit = !!product;
  const [name, setName] = useState(isEdit ? product.name : "");
  const [category, setCategory] = useState(isEdit ? product.category : "Medicines");
  const [price, setPrice] = useState(isEdit ? product.price : 0);
  const [buyPrice, setBuyPrice] = useState(isEdit ? product.buyPrice || 0 : 0);
  const [unit, setUnit] = useState(isEdit ? product.unit : "piece");
  const [stock, setStock] = useState(isEdit ? product.stock : 0);
  const [reorderLevel, setReorderLevel] = useState(isEdit ? product.reorderLevel : 10);
  const [expiry, setExpiry] = useState(isEdit ? product.expiry : "");
  const [active, setActive] = useState(isEdit ? product.active : true);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) {
      alert("Name and Category are required.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    onSave({
      id: product?.id,
      name,
      category,
      price: Number(price),
      buyPrice: Number(buyPrice),
      unit,
      stock: Number(stock),
      reorderLevel: Number(reorderLevel),
      expiry: expiry || undefined,
      active
    });
    setShowConfirm(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md card p-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h2>
            <button type="button" onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Product name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input appearance-none cursor-pointer">
                  {["Medicines", "Vaccines", "Pet Food", "Supplements", "Grooming", "Accessories", "Hygiene", "First Aid"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium mb-1.5">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input appearance-none cursor-pointer">
                  {["piece", "tablet", "bottle", "box", "kg", "grams", "liter", "ml", "pack", "can"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Retail Price (₱)</label>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input" placeholder="0.00" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Buy Price (₱)</label>
                <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(Number(e.target.value))} className="input" placeholder="0.00" min="0" step="0.01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Stock Qty</label>
                <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="input" placeholder="0" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Reorder Level</label>
                <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(Number(e.target.value))} className="input" placeholder="10" min="0" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Expiration Date (if applicable)</label>
              <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="input" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="checkbox" />
              <label htmlFor="active" className="text-sm font-medium cursor-pointer">Is Active</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{isEdit ? "Save Changes" : "Add Product"}</button>
          </div>
        </form>
      </motion.div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        title={isEdit ? "Confirm Updates" : "Confirm Addition"}
        message={isEdit ? "Are you sure you want to save these changes to the product?" : "Are you sure you want to add this new product?"}
        confirmText="Yes, Save"
        cancelText="Cancel"
        type="info"
      />
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Product | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/products`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch products.");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (formData: Omit<Product, "id"> & { id?: number }) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const isEdit = !!formData.id;
      const url = isEdit ? `${baseUrl}/api/products/${formData.id}` : `${baseUrl}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save product.");
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving.");
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete product.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting.");
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStock = products.filter((p) => p.stock <= p.reorderLevel).length;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Product Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {products.length} products · {lowStock > 0 && (
                <span className="text-warning font-medium">{lowStock} low/critical stock</span>
              )}
            </p>
          </div>
          <button onClick={() => { setSelected(undefined); setModal("create"); }} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {lowStock > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <p className="text-sm text-warning font-medium">{lowStock} products are at or below reorder level and need restocking.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input pl-9 pr-8 min-w-40 appearance-none cursor-pointer" style={{ paddingLeft: "2.25rem" }}>
              <option value="All">All Categories</option>
              {["Medicines", "Vaccines", "Pet Food", "Supplements", "Grooming", "Accessories", "Hygiene", "First Aid"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-neutral-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm max-w-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const stockStatus = getStockStatus(p.stock, p.reorderLevel);
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-primary-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{p.name}</p>
                              <p className="text-xs text-neutral-400">{p.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className={cn("badge", catColors[p.category] || "badge-primary")}>{p.category}</span></td>
                        <td className="font-semibold text-sm">₱{p.price.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${stockStatus.label === "In Stock" ? "bg-success" : stockStatus.label === "Low Stock" ? "bg-warning" : "bg-danger"}`}
                                style={{ width: `${Math.min((p.stock / (p.reorderLevel * 2)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{p.stock}</span>
                          </div>
                        </td>
                        <td><span className={cn("badge", stockStatus.cls)}>{stockStatus.label}</span></td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelected(p); setModal("edit"); }} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(p.id)}
                              className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === "edit" ? selected : undefined}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
