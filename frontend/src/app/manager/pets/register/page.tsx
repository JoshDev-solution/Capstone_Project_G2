"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, User, PawPrint, Calendar, Stethoscope } from "lucide-react";
import Swal from 'sweetalert2';
import { cn } from "@/lib/utils";

const petSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  clientId: z.string().min(1, "Please select an owner"),
  petTypeId: z.string().min(1, "Please select a species"),
  breedId: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.enum(["Male", "Female", "Unknown"]),
  color: z.string().optional(),
  weightKg: z.string().optional(),
  isNeutered: z.boolean().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

export default function RegisterPetPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [petTypes, setPetTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      sex: "Unknown",
      isNeutered: false,
    }
  });

  useEffect(() => {
    // Fetch clients and pet types for dropdowns
    // Mocking for now since we don't have dedicated lookup endpoints, but assuming /api/users works
    // and we can fetch clients
    const fetchData = async () => {
      try {
        let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
        if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
        
        // This relies on endpoints being available. If not, it will fail gracefully.
        const [clientsRes, typesRes] = await Promise.all([
          fetch(`${baseUrl}/api/clients`),
          fetch(`${baseUrl}/api/pets`)
        ]);

        if (clientsRes.ok) {
          const allClients = await clientsRes.json();
          setClients(allClients);
        }
        
        // Mock Pet Types for prototype
        setPetTypes([
          { id: "1", name: "Dog" },
          { id: "2", name: "Cat" },
          { id: "3", name: "Bird" },
          { id: "4", name: "Exotic" },
        ]);

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: PetFormValues) => {
    setLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const payload = {
        ...data,
        clientId: Number(data.clientId),
        petTypeId: Number(data.petTypeId),
        breedId: data.breedId ? Number(data.breedId) : undefined,
        weightKg: data.weightKg ? Number(data.weightKg) : undefined,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      };

      const res = await fetch(`${baseUrl}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire({
          title: "Success",
          text: "Pet has been successfully registered.",
          icon: "success",
          confirmButtonColor: "#FF4FA3",
        }).then(() => {
          router.push("/manager/pets");
        });
      } else {
        throw new Error("Failed to register pet");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not register pet. Please check connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Register New Pet</h1>
          <p className="text-sm text-neutral-500 mt-1">Create a new patient profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Owner Information */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
            <User className="w-5 h-5 text-primary-500" /> Owner Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Owner / Client <span className="text-red-500">*</span></label>
              <select className={cn("input", errors.clientId && "border-red-500")} {...register("clientId")}>
                <option value="">-- Choose existing client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.user?.firstName} {c.user?.lastName} ({c.user?.email || c.clientCode})
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
              <p className="text-xs text-neutral-500 mt-1">If the client is new, please register the client first in the Clients module.</p>
            </div>
          </div>
        </div>

        {/* Pet Basic Information */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-[var(--card-border)] pb-3">
            <PawPrint className="w-5 h-5 text-primary-500" /> Patient Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pet Name <span className="text-red-500">*</span></label>
              <input type="text" className={cn("input", errors.name && "border-red-500")} placeholder="e.g. Buster" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Species <span className="text-red-500">*</span></label>
              <select className={cn("input", errors.petTypeId && "border-red-500")} {...register("petTypeId")}>
                <option value="">-- Select Species --</option>
                {petTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              {errors.petTypeId && <p className="text-xs text-red-500">{errors.petTypeId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sex <span className="text-red-500">*</span></label>
              <select className="input" {...register("sex")}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" className="input pl-9" {...register("birthDate")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Color / Markings</label>
              <input type="text" className="input" placeholder="e.g. Black with white spots" {...register("color")} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Weight (kg)</label>
              <input type="number" step="0.1" className="input" placeholder="e.g. 12.5" {...register("weightKg")} />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isNeutered" className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" {...register("isNeutered")} />
              <label htmlFor="isNeutered" className="text-sm font-medium cursor-pointer">Pet is Spayed / Neutered</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
          <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary shadow-lg shadow-primary-500/20" disabled={loading}>
            {loading ? "Registering..." : <><Save className="w-4 h-4 mr-2" /> Register Patient</>}
          </button>
        </div>
      </form>
    </div>
  );
}
