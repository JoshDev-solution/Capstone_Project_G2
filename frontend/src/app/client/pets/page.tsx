"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Plus, Search, Activity, Calendar, Weight, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientPetsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pet Form State
  const [newPet, setNewPet] = useState({
    name: "",
    petTypeId: 1, // Default to Dog or first type in DB
    sex: "Male",
    color: "",
    weightKg: "",
    birthDate: "",
    isNeutered: false
  });

  const [petTypes, setPetTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchPetTypes();
  }, []);

  const fetchProfile = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/clients/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetTypes = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const res = await fetch(`${baseUrl}/api/pets/types`);
      if (res.ok) setPetTypes(await res.json());
    } catch (err) {}
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const payload = {
        ...newPet,
        clientId: profile.id, // Assign to this client
        weightKg: Number(newPet.weightKg)
      };

      const res = await fetch(`${baseUrl}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAddingPet(false);
        setNewPet({ name: "", petTypeId: 1, sex: "Male", color: "", weightKg: "", birthDate: "", isNeutered: false });
        fetchProfile(); // Refresh list
      } else {
        alert("Failed to add pet.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-neutral-500">Loading pets...</div>;

  const pets = profile?.pets || [];
  const filteredPets = pets.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-primary-500" /> My Pets
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your pets' profiles and medical history.</p>
        </div>
        <button onClick={() => setIsAddingPet(true)} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add Pet
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by pet name..." 
            className="input pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center card bg-transparent border-dashed">
            <PawPrint className="w-12 h-12 text-neutral-300 mb-3" />
            <p className="font-semibold">No pets found</p>
            <p className="text-sm text-neutral-500">You haven't added any pets yet.</p>
          </div>
        ) : (
          filteredPets.map((pet: any) => (
            <div key={pet.id} className="card overflow-hidden group hover:border-primary-300 transition-all shadow-sm hover:shadow-md">
              <div className="h-24 gradient-primary relative">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-neutral-900 border-4 border-white dark:border-neutral-900 flex items-center justify-center shadow-sm">
                    <span className="text-3xl font-black text-primary-500">{pet.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={cn("badge text-[10px]", pet.isActive ? "badge-success" : "badge-neutral")}>
                    {pet.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              <div className="pt-10 p-6">
                <h2 className="text-xl font-bold mb-1">{pet.name}</h2>
                <div className="flex gap-2 text-xs font-semibold text-neutral-500 mb-4">
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{pet.sex}</span>
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{pet.color || "Unknown Color"}</span>
                  {pet.isNeutered && <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 px-2 py-1 rounded-md">Neutered</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-[10px] text-neutral-400">Breed</p>
                      <p className="text-xs font-bold truncate">{pet.breed?.name || "Mixed"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-[10px] text-neutral-400">Age</p>
                      <p className="text-xs font-bold truncate">
                        {pet.birthDate ? `${new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} yrs` : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="btn btn-outline w-full text-sm">View Medical Records</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Pet Modal */}
      <AnimatePresence>
        {isAddingPet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold">Add New Pet</h2>
                <button onClick={() => setIsAddingPet(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddPet} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Pet Name</label>
                    <input required type="text" className="input w-full" value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Species/Type</label>
                    <select className="input w-full" value={newPet.petTypeId} onChange={e => setNewPet({...newPet, petTypeId: Number(e.target.value)})}>
                      {petTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Sex</label>
                    <select className="input w-full" value={newPet.sex} onChange={e => setNewPet({...newPet, sex: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color/Markings</label>
                    <input type="text" className="input w-full" value={newPet.color} onChange={e => setNewPet({...newPet, color: e.target.value})} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" className="input w-full" value={newPet.weightKg} onChange={e => setNewPet({...newPet, weightKg: e.target.value})} />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Birth Date</label>
                    <input type="date" className="input w-full" value={newPet.birthDate} onChange={e => setNewPet({...newPet, birthDate: e.target.value})} />
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" id="neutered" checked={newPet.isNeutered} onChange={e => setNewPet({...newPet, isNeutered: e.target.checked})} className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                    <label htmlFor="neutered" className="text-sm font-medium">This pet is Neutered / Spayed</label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddingPet(false)} className="btn btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? "Adding..." : "Save Pet"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
