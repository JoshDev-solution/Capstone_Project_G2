"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, X, AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  reorderLevel: number;
  unit: string;
  active: boolean;
  expiry?: string;
}

const mockProducts: Product[] = [
  { id: 1, name: "Amoxicillin 250mg", category: "Medicines", sku: "MED-001", price: 15, stock: 200, reorderLevel: 50, unit: "capsule", active: true, expiry: "2027-06-15" },
  { id: 2, name: "Anti-Rabies Vaccine", category: "Vaccines", sku: "VAC-001", price: 350, stock: 5, reorderLevel: 15, unit: "vial", active: true, expiry: "2027-03-15" },
  { id: 3, name: "5-in-1 Vaccine (Canine)", category: "Vaccines", sku: "VAC-002", price: 800, stock: 8, reorderLevel: 10, unit: "vial", active: true, expiry: "2027-04-20" },
  { id: 4, name: "Premium Dog Food 10kg", category: "Pet Food", sku: "FOOD-001", price: 1500, stock: 25, reorderLevel: 5, unit: "bag", active: true },
  { id: 5, name: "Anti-Tick Shampoo", category: "Grooming", sku: "GRM-001", price: 180, stock: 40, reorderLevel: 10, unit: "bottle", active: true },
  { id: 6, name: "Multivitamin Drops", category: "Supplements", sku: "SUP-001", price: 250, stock: 60, reorderLevel: 15, unit: "bottle", active: true, expiry: "2027-11-30" },
  { id: 7, name: "Premium Cat Food 5kg", category: "Pet Food", sku: "FOOD-002", price: 1200, stock: 30, reorderLevel: 5, unit: "bag", active: true },
  { id: 8, name: "Adjustable Dog Collar", category: "Accessories", sku: "ACC-001", price: 150, stock: 50, reorderLevel: 10, unit: "piece", active: true },
];

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

function ProductModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md card p-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Product Name</label>
            <input type="text" defaultValue={product?.name} className="input" placeholder="Product name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select defaultValue={product?.category} className="input appearance-none cursor-pointer">
                <option value="">Select...</option>
                {["Medicines", "Vaccines", "Pet Food", "Supplements", "Grooming", "Accessories", "Hygiene", "First Aid"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">SKU</label>
              <input type="text" defaultValue={product?.sku} className="input" placeholder="MED-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (₱)</label>
              <input type="number" defaultValue={product?.price} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Unit</label>
              <input type="text" defaultValue={product?.unit} className="input" placeholder="tablet, bottle..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Stock Qty</label>
              <input type="number" defaultValue={product?.stock} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Reorder Level</label>
              <input type="number" defaultValue={product?.reorderLevel} className="input" placeholder="10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Expiration Date (if applicable)</label>
            <input type="date" defaultValue={product?.expiry} className="input" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button className="btn btn-primary flex-1">{product ? "Save Changes" : "Add Product"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Product | undefined>();

  const filtered = mockProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const lowStock = mockProducts.filter((p) => p.stock <= p.reorderLevel).length;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Product Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {mockProducts.length} products · {lowStock > 0 && (
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input pl-9 pr-8 min-w-40 appearance-none cursor-pointer" style={{ paddingLeft: "2.25rem" }}>
              <option value="All">All Categories</option>
              {["Medicines", "Vaccines", "Pet Food", "Supplements", "Grooming", "Accessories"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="hidden sm:table-cell">SKU</th>
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
                      <td className="hidden sm:table-cell"><code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">{p.sku}</code></td>
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
                          <button className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger">
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
      </div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === "edit" ? selected : undefined}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
