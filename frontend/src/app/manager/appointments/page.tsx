"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, Filter, Plus, CalendarCheck, Clock, AlertCircle, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Swal from 'sweetalert2';

export default function ManagerAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    clientId: "",
    petId: "",
    serviceId: "",
    vetId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "Scheduled",
    reason: ""
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/appointments`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const [cliRes, petRes, svcRes, userRes] = await Promise.all([
        fetch(`${baseUrl}/api/clients`),
        fetch(`${baseUrl}/api/pets`),
        fetch(`${baseUrl}/api/services`),
        fetch(`${baseUrl}/api/users`)
      ]);

      if (cliRes.ok) setClients(await cliRes.json());
      if (petRes.ok) setPets(await petRes.json());
      if (svcRes.ok) setServices(await svcRes.json());
      if (userRes.ok) {
        const users = await userRes.json();
        setVets(users.filter((u: any) => u.role?.name === "Vet"));
      }
    } catch (err) {
      console.error("Failed to fetch modal data", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;

      const payload = {
        appointmentCode: `APT-${Date.now().toString().slice(-6)}`,
        clientId: Number(formData.clientId),
        petId: Number(formData.petId),
        serviceId: formData.serviceId ? Number(formData.serviceId) : undefined,
        vetId: formData.vetId ? Number(formData.vetId) : undefined,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        appointmentTime: new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`).toISOString(),
        type: formData.type,
        reason: formData.reason,
        status: "Scheduled"
      };

      const res = await fetch(`${baseUrl}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire("Success", "Appointment created successfully!", "success");
        setIsModalOpen(false);
        setFormData({
          clientId: "", petId: "", serviceId: "", vetId: "",
          appointmentDate: "", appointmentTime: "", type: "Scheduled", reason: ""
        });
        fetchAppointments();
      } else {
        throw new Error("Failed to create appointment");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not create appointment. Please check connection.", "error");
    }
  };

  const filteredPets = pets.filter(p => p.clientId === Number(formData.clientId));

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.petName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (activeTab === "scheduled") return a.type !== "Walk-In" && a.type !== "Emergency";
    if (activeTab === "walkin") return a.type === "Walk-In";
    if (activeTab === "emergency") return a.type === "Emergency";
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Scheduled": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === "Emergency") return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === "Walk-In") return <Clock className="w-4 h-4 text-amber-500" />;
    return <CalendarCheck className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointments Queue</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage walk-ins, emergencies, and scheduled visits.</p>
        </div>
        <button onClick={openModal} className="btn btn-primary shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4 mr-2" /> New Appointment
        </button>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-neutral-100/50 dark:bg-neutral-800/30 rounded-xl w-max">
        {[
          { id: "all", label: "All Queue" },
          { id: "scheduled", label: "Scheduled" },
          { id: "walkin", label: "Walk-Ins" },
          { id: "emergency", label: "Emergencies" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 shadow-sm" 
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by ID, patient, or client..." 
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-outline flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-[var(--card-border)]">
              <tr>
                <th className="px-5 py-3">ID / Type</th>
                <th className="px-5 py-3">Patient & Client</th>
                <th className="px-5 py-3">Service & Vet</th>
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">Loading appointments...</td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-neutral-500">No appointments found.</td></tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-5 py-3">
                      <div className="font-semibold">{apt.code}</div>
                      <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                        {getTypeIcon(apt.type || "Scheduled")} {apt.type || "Scheduled"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold">{apt.petName}</p>
                      <p className="text-xs text-neutral-500">{apt.clientName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-neutral-700 dark:text-neutral-300">{apt.service}</p>
                      <p className="text-xs text-neutral-500">{apt.vetName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{apt.date}</p>
                      <p className="text-xs text-neutral-500">{apt.time}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("badge", getStatusBadge(apt.status))}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="btn btn-outline text-xs py-1.5 h-auto px-3">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--card-border)]">
              <h2 className="text-xl font-bold">New Appointment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="py-12 text-center text-neutral-500">Loading data...</div>
              ) : (
                <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Select Client *</label>
                      <select 
                        className="input" 
                        required
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value, petId: "" })}
                      >
                        <option value="">-- Choose Client --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.user?.firstName} {c.user?.lastName} ({c.clientCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Select Pet *</label>
                      <select 
                        className="input" 
                        required
                        disabled={!formData.clientId}
                        value={formData.petId}
                        onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                      >
                        <option value="">-- Choose Pet --</option>
                        {filteredPets.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Service *</label>
                      <select 
                        className="input" 
                        required
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      >
                        <option value="">-- Choose Service --</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (₱{s.price})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Assign Vet</label>
                      <select 
                        className="input" 
                        value={formData.vetId}
                        onChange={(e) => setFormData({ ...formData, vetId: e.target.value })}
                      >
                        <option value="">-- Any Available Vet --</option>
                        {vets.map(v => (
                          <option key={v.id} value={v.staff?.id || v.id}>
                            Dr. {v.firstName} {v.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Date *</label>
                      <input 
                        type="date" 
                        className="input" 
                        required
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Time *</label>
                      <input 
                        type="time" 
                        className="input" 
                        required
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Type</label>
                      <select 
                        className="input"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Walk-In">Walk-In</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium">Reason / Notes</label>
                      <textarea 
                        className="input min-h-[80px]"
                        placeholder="e.g. Annual checkup and vaccinations"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-6 border-t border-[var(--card-border)] flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-800/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" form="appointment-form" className="btn btn-primary shadow-lg shadow-primary-500/20">
                <Save className="w-4 h-4 mr-2" /> Create Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
