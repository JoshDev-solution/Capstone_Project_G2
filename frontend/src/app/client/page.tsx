"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PawPrint, Calendar, FileText, Bell, Clock, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/clients/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-neutral-500 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin mb-4"></div>
      Loading your portal...
    </div>;
  }

  const upcomingAppointments = profile?.appointments?.filter((a: any) => new Date(a.appointmentDate) >= new Date()) || [];
  const unpaidBills = profile?.bills?.filter((b: any) => b.status === "Unpaid") || [];
  const recentBills = profile?.bills?.slice(0, 3) || [];
  const pets = profile?.pets || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="card p-8 bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-xl shadow-primary-500/20 border-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <PawPrint className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
            Welcome back, {profile?.user?.firstName || "Pet Owner"}!
          </h1>
          <p className="text-white/80 text-lg">
            Manage your pets' health, book appointments, and view medical records all in one place.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Registered Pets</p>
            <h3 className="text-2xl font-black mt-1">{pets.length}</h3>
          </div>
        </div>
        <div className="card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Upcoming Appointments</p>
            <h3 className="text-2xl font-black mt-1">{upcomingAppointments.length}</h3>
          </div>
        </div>
        <div className="card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Unpaid Bills</p>
            <h3 className="text-2xl font-black mt-1">{unpaidBills.length}</h3>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Pets & Recent Bills */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* My Pets */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-primary-500" /> My Pets
              </h2>
              <Link href="/client/pets" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</Link>
            </div>
            
            {pets.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                <PawPrint className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>You haven't added any pets yet.</p>
                <Link href="/client/pets" className="btn btn-primary mt-4 btn-sm">Add a Pet</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pets.slice(0, 4).map((pet: any) => (
                  <div key={pet.id} className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary-300 transition-colors bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="w-14 h-14 rounded-full gradient-primary flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
                      <span className="font-bold text-lg leading-none">{pet.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{pet.name}</h3>
                      <p className="text-xs text-neutral-500 truncate">{pet.sex} • {pet.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Billing */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" /> Recent Billing
              </h2>
              <Link href="/client/billing" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View History</Link>
            </div>
            
            <div className="space-y-3">
              {recentBills.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-6">No billing history found.</p>
              ) : (
                recentBills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        bill.status === "Paid" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                      )}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{bill.billCode}</p>
                        <p className="text-xs text-neutral-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₱{Number(bill.totalAmount).toLocaleString()}</p>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        bill.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {bill.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Appointments */}
        <div className="flex flex-col gap-6">
          <div className="card p-6 h-full border-primary-100 dark:border-primary-900/30 bg-primary-50/30 dark:bg-primary-950/10">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary-500" /> Upcoming Appointments
            </h2>
            
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No upcoming appointments.</p>
                  <Link href="/client/appointments" className="btn btn-primary mt-4 btn-sm w-full">Book Now</Link>
                </div>
              ) : (
                upcomingAppointments.map((apt: any) => (
                  <div key={apt.id} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="badge badge-primary text-[10px] mb-1.5">{apt.status}</span>
                        <h4 className="font-bold text-sm leading-tight">{apt.reason || "General Checkup"}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-600 font-bold text-sm">
                          {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        30 mins
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {upcomingAppointments.length > 0 && (
              <Link href="/client/appointments" className="btn btn-outline w-full mt-6 text-sm">Manage Appointments</Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
