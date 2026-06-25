"use client";

import { useState, useEffect } from "react";
import { Search, PawPrint, Calendar, Filter, Plus, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ManagerPetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/pets`);
      if (res.ok) {
        const data = await res.json();
        setPets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pets & Clients</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage pet profiles and ownership records.</p>
        </div>
        <Link href="/manager/pets/register" className="btn btn-primary shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4 mr-2" /> Register New Pet
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by pet name, owner name..." 
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-outline flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Results */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Breed / Species</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-neutral-500">Loading patients...</td></tr>
              ) : filteredPets.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-neutral-500">No patients found.</td></tr>
              ) : (
                filteredPets.map((pet) => (
                  <tr key={pet.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 shrink-0">
                          <PawPrint className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-base">{pet.name}</p>
                          <p className="text-xs text-neutral-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> DOB: {pet.dob}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{pet.ownerName}</p>
                      <p className="text-xs text-neutral-500">{pet.ownerEmail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{pet.breed}</p>
                      <p className="text-xs text-neutral-500">{pet.species}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "badge",
                        pet.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400"
                      )}>
                        {pet.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/manager/pets/${pet.id}`} className="btn btn-outline text-xs py-1.5 h-auto px-3 inline-flex items-center gap-1 hover:border-primary-500 hover:text-primary-600">
                        <Edit className="w-3 h-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
