"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, Stethoscope, X, Clock, PhilippinePeso } from "lucide-react";

interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
  active: boolean;
}

const mockServices: Service[] = [
  { id: 1, name: "General Consultation", category: "Consultation", price: 500, duration: 30, description: "Complete physical examination and health assessment", active: true },
  { id: 2, name: "Anti-Rabies Vaccination", category: "Vaccination", price: 350, duration: 15, description: "Anti-rabies vaccine for dogs and cats", active: true },
  { id: 3, name: "5-in-1 Vaccine", category: "Vaccination", price: 800, duration: 15, description: "DHPP+L combination vaccine for dogs", active: true },
  { id: 4, name: "Deworming", category: "Deworming", price: 300, duration: 15, description: "Internal and external parasite treatment", active: true },
  { id: 5, name: "Minor Surgery", category: "Surgery", price: 3000, duration: 60, description: "Minor surgical procedures", active: true },
  { id: 6, name: "Grooming - Basic", category: "Grooming", price: 500, duration: 60, description: "Bath, nail trim, ear cleaning", active: true },
  { id: 7, name: "Laboratory - Blood Test", category: "Laboratory", price: 1500, duration: 30, description: "Complete blood count and chemistry panel", active: true },
  { id: 8, name: "Emergency Consultation", category: "Consultation", price: 1000, duration: 45, description: "Emergency and after-hours consultation", active: true },
];

const categoryColors: Record<string, string> = {
  Consultation: "badge-primary",
  Vaccination: "badge-success",
  Deworming: "badge-warning",
  Surgery: "badge-danger",
  Grooming: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  Laboratory: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
};

function ServiceModal({ service, onClose }: { service?: Service; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md card p-6 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{service ? "Edit Service" : "Add Service"}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Service Name</label>
            <input type="text" defaultValue={service?.name} className="input" placeholder="e.g., General Consultation" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select defaultValue={service?.category} className="input appearance-none cursor-pointer">
                <option value="">Select...</option>
                {["Consultation", "Vaccination", "Deworming", "Surgery", "Grooming", "Laboratory"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Price (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₱</span>
                <input type="number" defaultValue={service?.price} className="input pl-7" placeholder="0.00" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="number" defaultValue={service?.duration} className="input pl-9" placeholder="30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea defaultValue={service?.description} rows={3} className="input resize-none" placeholder="Service description..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button className="btn btn-primary flex-1">{service ? "Save Changes" : "Add Service"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Service | undefined>();
  const [services] = useState(mockServices);

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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="input pl-10 w-full" />
        </div>

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
                  <button className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ServiceModal
            service={modal === "edit" ? selected : undefined}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
