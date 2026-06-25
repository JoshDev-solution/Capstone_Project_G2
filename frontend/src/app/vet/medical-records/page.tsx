"use client";

import { useState, useEffect } from "react";
import { Search, FileText, PawPrint, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MedicalRecordsPage() {
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
      
      // Fetching all pets for the medical records database
      const res = await fetch(`${baseUrl}/api/pets`);
      if (res.ok) {
        setPets(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.client?.user?.lastName && p.client.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-500" /> Medical Records Database
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Search and view historical medical records for all patients.</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by pet name or owner's last name..." 
            className="input pl-10 w-full rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-outline flex items-center gap-2 rounded-xl">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Species/Breed</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-neutral-500">Loading database...</td></tr>
              ) : filteredPets.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-neutral-500">No patients found.</td></tr>
              ) : (
                filteredPets.map((pet) => (
                  <tr key={pet.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 shrink-0">
                          {pet.profileImageUrl ? (
                            <img src={pet.profileImageUrl} alt={pet.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <PawPrint className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-base text-neutral-900 dark:text-white">{pet.name}</p>
                          <p className="text-xs text-neutral-500">{pet.sex} • {pet.weightKg ? `${pet.weightKg} kg` : "Unknown weight"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{pet.client?.user?.firstName} {pet.client?.user?.lastName}</p>
                      <p className="text-xs text-neutral-500">{pet.client?.user?.phone || "No phone"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {pet.petType?.name || "Unknown"}
                      </span>
                      <p className="text-xs text-neutral-500 mt-1">{pet.breed?.name || "Mixed Breed"}</p>
                    </td>
                    <td className="px-6 py-4">
                      {pet.appointments && pet.appointments.length > 0 ? (
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(pet.appointments[0].appointmentDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">No visits recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/vet/medical-records/${pet.id}`} className="btn btn-primary text-xs py-2 px-4 bg-primary-500 hover:bg-primary-600 border-0 rounded-lg shadow-sm">
                        View Records
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
