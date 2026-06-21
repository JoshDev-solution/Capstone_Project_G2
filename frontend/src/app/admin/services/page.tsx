"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Stethoscope, X, Clock, ClipboardList } from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  active: boolean;
}

const categoryColors: Record<string, string> = {
  Consultation: "badge-primary",
  Vaccination: "badge-success",
  Deworming: "badge-warning",
  Surgery: "badge-danger",
  Grooming: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  Laboratory: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

function ServiceModal({ 
  service, 
  onClose, 
  onSave 
}: { 
  service?: Service; 
  onClose: () => void;
  onSave: (formData: Omit<Service, "id"> & { id?: number }) => void;
}) {
  const isEdit = !!service;
  const [name, setName] = useState(isEdit ? service.name : "");
  const [category, setCategory] = useState(isEdit ? service.category : "Consultation");
  const [price, setPrice] = useState(isEdit ? service.price : 0);
  const [duration, setDuration] = useState(isEdit ? service.duration : 30);
  const [description, setDescription] = useState(isEdit ? service.description : "");
  const [active, setActive] = useState(isEdit ? service.active : true);
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
      id: service?.id,
      name,
      category,
      price: Number(price),
      duration: Number(duration),
      description,
      active
    });
    setShowConfirm(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md card p-6 z-10 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isEdit ? "Edit Service" : "Add Service"}</h2>
            <button type="button" onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Service Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g., General Consultation" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input appearance-none cursor-pointer">
                  {["Consultation", "Vaccination", "Deworming", "Surgery", "Grooming", "Laboratory", "Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Price (₱)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₱</span>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input pl-7" style={{ paddingLeft: "1.75rem" }} placeholder="0.00" min="0" required />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input pl-9" style={{ paddingLeft: "2.25rem" }} placeholder="30" min="1" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input resize-none" placeholder="Service description..." />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="checkbox" />
              <label htmlFor="active" className="text-sm font-medium cursor-pointer">Is Active</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{isEdit ? "Save Changes" : "Add Service"}</button>
          </div>
        </form>
      </motion.div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        title={isEdit ? "Confirm Updates" : "Confirm Addition"}
        message={isEdit ? "Are you sure you want to save these changes to the service?" : "Are you sure you want to add this new service?"}
        confirmText="Yes, Save"
        cancelText="Cancel"
        type="info"
      />
    </motion.div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Service | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/services`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch services.");
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (formData: Omit<Service, "id"> & { id?: number }) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const isEdit = !!formData.id;
      const url = isEdit ? `${baseUrl}/api/services/${formData.id}` : `${baseUrl}/api/services`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save service.");
      await fetchServices();
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
      const res = await fetch(`${baseUrl}/api/services/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete service.");
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting.");
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Service Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{services.length} services configured</p>
          </div>
          <button onClick={() => { setSelected(undefined); setModal("create"); }} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
        </div>

        {loading && (
          <div className="text-center py-12 text-neutral-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Loading services...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm max-w-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary-500" />
                  </div>
                  <span className={`badge ${categoryColors[service.category] || "badge-primary"}`}>
                    {service.category}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-1">{service.name}</h3>
                <p className="text-xs text-neutral-400 mb-4 line-clamp-2">{service.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-primary-500 text-lg">₱{service.price.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Clock className="w-3 h-3" /> {service.duration} min
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setSelected(service); setModal("edit"); }}
                      className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(service.id)}
                      className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-neutral-400 col-span-full">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No services found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <ServiceModal
            service={modal === "edit" ? selected : undefined}
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
        message="Are you sure you want to permanently delete this service? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
