"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const res = await fetch(`${baseUrl}/api/products`);
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary-500" /> Product Catalog
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Browse our clinic's selection of premium pet food, accessories, and medicines.</p>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            className="input pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-500">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 card bg-transparent border-dashed">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-semibold">No products found</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="card p-4 flex flex-col justify-between hover:border-primary-300 transition-colors group h-48">
                <div>
                  <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md mb-2 inline-block">
                    {product.category?.name || "Retail"}
                  </span>
                  <h3 className="font-bold text-sm leading-tight group-hover:text-primary-600 transition-colors line-clamp-3">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-lg font-black text-neutral-900 dark:text-white">₱{Number(product.price).toLocaleString()}</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-1 rounded-full",
                    product.stockQuantity > 0 ? "bg-emerald-100 text-emerald-700" : "bg-danger/10 text-danger"
                  )}>
                    {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Notice */}
      <div className="card p-4 bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30 text-sm text-primary-700 dark:text-primary-400">
        <strong>Notice:</strong> Online ordering is currently unavailable. Please visit our clinic to purchase these items.
      </div>
    </div>
  );
}
