"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, PawPrint, Plus, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientAppointmentsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking Form State
  const [newApt, setNewApt] = useState({
    petId: "",
    serviceId: 1,
    appointmentDate: "",
    appointmentTime: "",
    reason: ""
  });

  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchServices();
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

  const fetchServices = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const res = await fetch(`${baseUrl}/api/services`);
      if (res.ok) setServices(await res.json());
    } catch (err) {}
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const payload = {
        ...newApt,
        clientId: profile.id,
        petId: Number(newApt.petId),
        serviceId: Number(newApt.serviceId),
        appointmentTime: `${newApt.appointmentDate}T${newApt.appointmentTime}:00Z`,
        status: "Scheduled"
      };

      const res = await fetch(`${baseUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsBooking(false);
        setNewApt({ petId: "", serviceId: 1, appointmentDate: "", appointmentTime: "", reason: "" });
        fetchProfile();
        alert("Appointment successfully booked!");
      } else {
        alert("Failed to book appointment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-neutral-500">Loading appointments...</div>;

  const appointments = profile?.appointments || [];
  const pets = profile?.pets || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" /> Appointments
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Book and manage your clinic visits.</p>
        </div>
        <button onClick={() => setIsBooking(true)} className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          {appointments.length === 0 ? (
            <div className="card p-10 text-center flex flex-col items-center justify-center text-neutral-500">
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-semibold text-lg text-neutral-900 dark:text-white">No Appointments</p>
              <p className="text-sm">You haven't scheduled any visits yet.</p>
            </div>
          ) : (
            appointments.sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()).map((apt: any) => {
              const isPast = new Date(apt.appointmentDate) < new Date(new Date().setHours(0,0,0,0));
              return (
                <div key={apt.id} className={cn(
                  "card p-5 border-l-4 transition-all flex flex-col sm:flex-row justify-between gap-4",
                  isPast ? "border-l-neutral-300 dark:border-l-neutral-700 opacity-75" : "border-l-primary-500 hover:shadow-md"
                )}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "badge text-[10px]",
                        apt.status === "Scheduled" ? "badge-info" :
                        apt.status === "Completed" ? "badge-success" :
                        apt.status === "Cancelled" ? "badge-danger" : "badge-neutral"
                      )}>
                        {apt.status}
                      </span>
                      {isPast && <span className="text-xs text-neutral-400 font-semibold">PAST</span>}
                    </div>
                    <h3 className="font-bold text-lg">{apt.reason || "General Visit"}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                      <PawPrint className="w-3.5 h-3.5" />
                      {pets.find((p: any) => p.id === apt.petId)?.name || "Unknown Pet"}
                    </p>
                  </div>

                  <div className="sm:text-right bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg sm:bg-transparent sm:p-0">
                    <p className="font-bold text-primary-600 dark:text-primary-400 flex items-center sm:justify-end gap-1.5 mb-1">
                      <Clock className="w-4 h-4" />
                      {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-neutral-500 flex items-center sm:justify-end gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(apt.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="card p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
            <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4" /> Clinic Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> Please arrive 10 minutes before your scheduled time.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> Bring previous medical records if this is your first visit.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> All pets must be on a leash or in a carrier.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <h2 className="text-lg font-bold">Book Appointment</h2>
                <button onClick={() => setIsBooking(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleBook} className="p-6 space-y-4 overflow-y-auto">
                {pets.length === 0 ? (
                  <div className="p-4 bg-danger/10 text-danger rounded-xl text-sm font-semibold">
                    You must add a pet to your profile before booking an appointment.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Pet</label>
                      <select required className="input w-full" value={newApt.petId} onChange={e => setNewApt({...newApt, petId: e.target.value})}>
                        <option value="">-- Choose Pet --</option>
                        {pets.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Service Type</label>
                      <select required className="input w-full" value={newApt.serviceId} onChange={e => setNewApt({...newApt, serviceId: Number(e.target.value)})}>
                        {services.map((s: any) => <option key={s.id} value={s.id}>{s.name} (₱{Number(s.price)})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input required type="date" className="input w-full" min={new Date().toISOString().split("T")[0]} value={newApt.appointmentDate} onChange={e => setNewApt({...newApt, appointmentDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Time</label>
                        <input required type="time" className="input w-full" value={newApt.appointmentTime} onChange={e => setNewApt({...newApt, appointmentTime: e.target.value})} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Reason for Visit</label>
                      <textarea required className="input w-full h-24 py-2" placeholder="Briefly describe why you are bringing your pet in..." value={newApt.reason} onChange={e => setNewApt({...newApt, reason: e.target.value})} />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsBooking(false)} className="btn btn-ghost flex-1">Cancel</button>
                      <button type="submit" disabled={submitting} className="btn btn-primary flex-1">{submitting ? "Booking..." : "Confirm Booking"}</button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
