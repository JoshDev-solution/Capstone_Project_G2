"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit, Trash2, PawPrint, X, AlertTriangle, Filter,
  User, Shield, ChevronLeft, ChevronRight, Eye, ClipboardList
} from "lucide-react";
import { cn, calculateAge } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  sex: string;
  color: string;
  dob: string;
  weight: number;
  ownerName: string;
  ownerEmail: string;
  status: string;
  vaccinationStatus: string;
  lastVisit: string;
  microchip: string;
  profileImageUrl?: string;
}

const speciesEmoji: Record<string, string> = {
  Dog: "🐕", Cat: "🐈", Bird: "生物", Rabbit: "🐰", Hamster: "🐹", Reptile: "🦎", Other: "🐾"
};

const speciesColor: Record<string, string> = {
  Dog: "#FF4FA3", Cat: "#D98CFF", Bird: "#F59E0B", Rabbit: "#10B981", Hamster: "#F97316", Reptile: "#14B8A6", Other: "#6B7280"
};

const vaccStatusConfig: Record<string, { cls: string; dot: string }> = {
  "Up to Date": { cls: "badge-success",  dot: "bg-success" },
  "Due Soon":   { cls: "badge-warning",  dot: "bg-warning" },
  "Overdue":    { cls: "badge-danger",   dot: "bg-danger"  },
  "Unknown":    { cls: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400", dot: "bg-neutral-400" },
};

function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
  const emoji = speciesEmoji[pet.species] || speciesEmoji.Other;
  const color = speciesColor[pet.species] || speciesColor.Other;
  const vsCfg = vaccStatusConfig[pet.vaccinationStatus] || vaccStatusConfig.Unknown;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="card p-5 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {pet.profileImageUrl && !pet.profileImageUrl.includes('null') ? (
            <img src={pet.profileImageUrl.startsWith('http') ? pet.profileImageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${pet.profileImageUrl}`} alt={pet.name} className="w-12 h-12 rounded-2xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${color}15` }}>
              {emoji}
            </div>
          )}
          <div>
            <h3 className="font-bold text-base">{pet.name}</h3>
            <p className="text-xs text-neutral-400">{pet.breed}</p>
          </div>
        </div>
        <span className={cn("badge flex items-center gap-1 text-[10px]", vsCfg.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", vsCfg.dot)} />
          {pet.vaccinationStatus}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-neutral-400" />
          <span>{pet.ownerName}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 text-[10px] mt-2 border-t border-neutral-100 dark:border-neutral-800 pt-2">
          <span>Last visit: {pet.lastVisit}</span>
          <span>{pet.weight} kg</span>
        </div>
      </div>
    </motion.div>
  );
}

function PetDetailModal({ pet, onClose, onEdit }: { pet: Pet; onClose: () => void; onEdit: () => void }) {
  const vsCfg = vaccStatusConfig[pet.vaccinationStatus] || vaccStatusConfig.Unknown;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-xl card z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex items-start gap-4 p-6 border-b border-[var(--card-border)]">
          {pet.profileImageUrl && !pet.profileImageUrl.includes('null') ? (
            <img src={pet.profileImageUrl.startsWith('http') ? pet.profileImageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${pet.profileImageUrl}`} alt={pet.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${speciesColor[pet.species]}15` }}>
              {speciesEmoji[pet.species] || speciesEmoji.Other}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{pet.name}</h2>
              <span className={cn("badge flex items-center gap-1 text-[10px]", vsCfg.cls)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", vsCfg.dot)} />
                {pet.vaccinationStatus}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{pet.breed} · {pet.species} · {pet.sex}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-400">
              <User className="w-3 h-3" />
              <span>Owner: <strong>{pet.ownerName}</strong> ({pet.ownerEmail})</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onEdit} className="btn btn-secondary text-xs py-1.5 px-3">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name",          value: pet.name },
              { label: "Species",            value: pet.species },
              { label: "Breed",              value: pet.breed },
              { label: "Sex",                value: pet.sex },
              { label: "Age",                value: calculateAge(pet.dob) },
              { label: "Weight",             value: `${pet.weight} kg` },
              { label: "Color / Markings",   value: pet.color || "None" },
              { label: "Status",             value: pet.status },
              { label: "Last Visit",         value: pet.lastVisit },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{row.label}</span>
                <span className="text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PetFormModal({ 
  pet, 
  onClose,
  onSave,
  clients
}: { 
  pet?: Pet; 
  onClose: () => void;
  onSave: (formData: Omit<Pet, "id" | "lastVisit" | "vaccinationStatus"> & { id?: number }, file: File | null) => void;
  clients?: {id: number, name: string, email: string}[];
}) {
  const isEdit = !!pet;
  const [name, setName] = useState(isEdit ? pet.name : "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [species, setSpecies] = useState(isEdit ? pet.species : "Dog");
  const [breed, setBreed] = useState(isEdit ? pet.breed : "");
  const [sex, setSex] = useState(isEdit ? pet.sex : "Male");
  const [dob, setDob] = useState(isEdit ? pet.dob : "");
  const [weight, setWeight] = useState(isEdit ? pet.weight : 0);
  const [color, setColor] = useState(isEdit ? pet.color : "");
  const [ownerName, setOwnerName] = useState(isEdit ? pet.ownerName : "");
  const [ownerEmail, setOwnerEmail] = useState(isEdit ? pet.ownerEmail : "");
  
  const handleOwnerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOwnerName(val);
    
    if (clients) {
      const matchedClient = clients.find(c => c.name === val);
      if (matchedClient) {
        setOwnerEmail(matchedClient.email);
      }
    }
  };
  const [status, setStatus] = useState(isEdit ? pet.status : "Active");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species || !ownerName.trim() || !ownerEmail.trim()) {
      alert("Name, Species, Owner Name, and Owner Email are required.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    onSave({
      id: pet?.id,
      name,
      species,
      breed,
      sex,
      dob,
      weight: Number(weight),
      color,
      microchip: pet?.microchip || "",
      ownerName,
      ownerEmail,
      status
    }, profileImage);
    setShowConfirm(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-xl card z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className={cn(
            "flex items-center justify-between p-6 border-b", 
            isEdit ? "bg-primary-500/10 border-primary-500/20" : "border-[var(--card-border)]"
          )}>
            <h2 className="text-xl font-bold">{isEdit ? `Edit ${pet.name}` : "Register New Pet"}</h2>
            <button type="button" onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Pet Information</p>
            
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1.5">Profile Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} className="input w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Pet Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g., Buddy" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Species *</label>
                <select value={species} onChange={(e) => setSpecies(e.target.value)} className="input appearance-none cursor-pointer">
                  {["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Reptile", "Other"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Breed</label>
                <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} className="input" placeholder="e.g., Labrador" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sex *</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className="input appearance-none cursor-pointer">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="input" placeholder="0.0" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Color / Markings</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="input" placeholder="e.g., Golden" />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-2">Owner Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Owner Name *</label>
                <input 
                  type="text" 
                  list="clientsList"
                  value={ownerName} 
                  onChange={handleOwnerNameChange} 
                  className="input" 
                  placeholder="e.g., Carlo Reyes" 
                  required 
                  autoComplete="off"
                />
                <datalist id="clientsList">
                  {clients?.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Owner Email *</label>
                <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="input" placeholder="e.g., owner@gmail.com" required />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-2">Status</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Pet Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input appearance-none cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-[var(--card-border)]">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">{isEdit ? "Save Changes" : "Register Pet"}</button>
          </div>
        </form>
      </motion.div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        title={isEdit ? "Confirm Updates" : "Confirm Registration"}
        message={isEdit ? "Are you sure you want to save these changes to the pet's profile?" : "Are you sure you want to register this new pet?"}
        confirmText="Yes, Save"
        cancelText="Cancel"
        type="info"
      />
    </motion.div>
  );
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [vaccFilter, setVaccFilter] = useState("All");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [formPet, setFormPet] = useState<Pet | undefined | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<{id: number, name: string, email: string}[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const PER_PAGE = 8;

  const fetchPets = async () => {
    setLoading(true);
    setError("");
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const [petsRes, clientsRes] = await Promise.all([
        fetch(`${baseUrl}/api/pets`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/users/clients`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      if (!petsRes.ok) throw new Error("Failed to fetch pets.");
      const petsData = await petsRes.json();
      setPets(petsData);
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
    } catch (err: any) {
      console.error("Fetch error in PetsPage:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleSave = async (formData: Omit<Pet, "id" | "lastVisit" | "vaccinationStatus"> & { id?: number }, file: File | null) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const isEdit = !!formData.id;
      const url = isEdit ? `${baseUrl}/api/pets/${formData.id}` : `${baseUrl}/api/pets`;
      const method = isEdit ? "PUT" : "POST";

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });
      if (file) {
        formDataToSend.append("profileImage", file);
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!res.ok) throw new Error("Failed to save pet.");
      await fetchPets();
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
      const res = await fetch(`${baseUrl}/api/pets/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete pet.");
      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting.");
    }
  };

  const filtered = pets.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
    const matchSp = speciesFilter === "All" || p.species === speciesFilter;
    const matchVacc = vaccFilter === "All" || p.vaccinationStatus === vaccFilter;
    return matchQ && matchSp && matchVacc;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const overdue  = pets.filter((p) => p.vaccinationStatus === "Overdue").length;
  const dueSoon  = pets.filter((p) => p.vaccinationStatus === "Due Soon").length;
  const upToDate = pets.filter((p) => p.vaccinationStatus === "Up to Date").length;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pet Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{pets.length} registered pets in the system</p>
          </div>
          <button onClick={() => { setFormPet(undefined); setShowForm(true); }} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Register Pet
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Pets",    value: pets.length, color: "#FF4FA3" },
            { label: "Up to Date",    value: upToDate,    color: "#10B981" },
            { label: "Due Soon",      value: dueSoon,     color: "#F59E0B" },
            { label: "Overdue",       value: overdue,     color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                <span className="text-base font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by pet name, breed, or owner..." className="input pl-10 w-full" style={{ paddingLeft: "2.5rem" }} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={speciesFilter} onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
              className="input pl-9 pr-8 min-w-36 appearance-none cursor-pointer" style={{ paddingLeft: "2.25rem" }}>
              <option value="All">All Species</option>
              {["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Reptile", "Other"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={vaccFilter} onChange={(e) => { setVaccFilter(e.target.value); setPage(1); }}
              className="input pl-9 pr-8 min-w-40 appearance-none cursor-pointer" style={{ paddingLeft: "2.25rem" }}>
              <option value="All">All Vaccine Status</option>
              {["Up to Date", "Due Soon", "Overdue", "Unknown"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-[var(--card-border)] shrink-0">
            <button onClick={() => setView("grid")} className={cn("px-3 py-2 text-sm transition-colors", view === "grid" ? "gradient-primary text-white" : "btn-ghost text-neutral-400")}>
              ⊞
            </button>
            <button onClick={() => setView("table")} className={cn("px-3 py-2 text-sm transition-colors", view === "table" ? "gradient-primary text-white" : "btn-ghost text-neutral-400")}>
              ≡
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-neutral-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Loading pets...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm max-w-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {view === "grid" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginated.map((pet) => (
                  <PetCard key={pet.id} pet={pet} onClick={() => setSelectedPet(pet)} />
                ))}
              </div>
            )}

            {view === "table" && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Pet</th>
                        <th>Species / Breed</th>
                        <th className="hidden sm:table-cell">Owner</th>
                        <th>Age / Weight</th>
                        <th>Vaccine Status</th>
                        <th className="hidden lg:table-cell">Last Visit</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((pet, i) => {
                        const emoji = speciesEmoji[pet.species] || speciesEmoji.Other;
                        const color = speciesColor[pet.species] || speciesColor.Other;
                        const vsCfg = vaccStatusConfig[pet.vaccinationStatus] || vaccStatusConfig.Unknown;
                        return (
                          <motion.tr key={pet.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                                  <span className="text-base select-none">{emoji}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{pet.name}</p>
                                  <p className="text-xs text-neutral-400">{pet.sex}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="text-sm">{pet.species}</p>
                              <p className="text-xs text-neutral-400">{pet.breed}</p>
                            </td>
                            <td className="hidden sm:table-cell text-sm text-neutral-500">{pet.ownerName}</td>
                            <td>
                              <p className="text-sm">{calculateAge(pet.dob)}</p>
                              <p className="text-xs text-neutral-400">{pet.weight} kg</p>
                            </td>
                            <td>
                              <span className={cn("badge flex items-center gap-1 w-fit text-[10px]", vsCfg.cls)}>
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", vsCfg.dot)} />
                                {pet.vaccinationStatus}
                              </span>
                            </td>
                            <td className="hidden lg:table-cell text-sm text-neutral-500">{pet.lastVisit}</td>
                            <td>
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setSelectedPet(pet)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setFormPet(pet); setShowForm(true); }} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(pet.id)}
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

            {filtered.length === 0 && (
              <div className="text-center py-20 text-neutral-400 col-span-full">
                <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No pets found matching your search.</p>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between text-sm text-neutral-400 mt-4">
                <span>Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} pets</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1}
                    className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i+1)}
                      className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-colors", page===i+1 ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-800")}>
                      {i+1}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedPet && (
          <PetDetailModal
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
            onEdit={() => { setFormPet(selectedPet); setShowForm(true); setSelectedPet(null); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showForm && (
          <PetFormModal
            pet={formPet ?? undefined}
            onClose={() => { setShowForm(false); setFormPet(null); }}
            onSave={handleSave}
            clients={clients}
          />
        )}
      </AnimatePresence>
    </>
  );
}
