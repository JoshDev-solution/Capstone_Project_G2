"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PawPrint, Calendar, Activity, AlertCircle, Syringe, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MedicalRecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: petId } = use(params);
  
  const [pet, setPet] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetHistory();
  }, [petId]);

  const fetchPetHistory = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const petRes = await fetch(`${baseUrl}/api/pets/${petId}`);
      if (petRes.ok) {
        setPet(await petRes.json());
      }

      // Fetch consultations for this pet
      const consultRes = await fetch(`${baseUrl}/api/consultations`);
      if (consultRes.ok) {
        const allConsults = await consultRes.json();
        // Filter by petId
        const petConsults = allConsults.filter((c: any) => c.petId === Number(petId));
        // Sort descending by date
        setConsultations(petConsults.sort((a: any, b: any) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading medical records...</div>;
  if (!pet) return <div className="p-20 text-center text-red-500">Pet not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header Profile */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mt-10 -mr-10"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <button onClick={() => router.back()} className="absolute top-0 left-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 backdrop-blur-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-24 h-24 sm:ml-12 rounded-full bg-white/20 p-1 shrink-0 backdrop-blur-sm shadow-xl">
            <div className="w-full h-full rounded-full bg-white text-primary-500 flex items-center justify-center overflow-hidden">
              {pet.profileImageUrl ? (
                <img src={pet.profileImageUrl} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <PawPrint className="w-10 h-10" />
              )}
            </div>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-white/90 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{pet.petType?.name}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{pet.breed?.name || "Mixed"}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{pet.sex}</span>
              {pet.weightKg && <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{pet.weightKg} kg</span>}
            </div>
          </div>

          <div className="text-center sm:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-white/70 uppercase tracking-wider font-bold mb-1">Owner Info</p>
            <p className="font-bold text-lg">{pet.client?.user?.firstName} {pet.client?.user?.lastName}</p>
            <p className="text-sm">{pet.client?.user?.phone}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Pet Info Summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold border-b border-[var(--card-border)] pb-3 mb-4 text-lg">Vital Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-neutral-500">Birth Date</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : "Unknown"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-neutral-500">Microchip</span>
                <span className="font-medium text-neutral-900 dark:text-white">{pet.microchipNumber || "None"}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-neutral-500">Neutered/Spayed</span>
                <span className={cn("font-medium", pet.isNeutered ? "text-emerald-600" : "text-neutral-900 dark:text-white")}>
                  {pet.isNeutered ? "Yes" : "No"}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="card p-6 border-amber-200 dark:border-amber-900/30">
            <h3 className="font-bold border-b border-amber-100 dark:border-amber-900/30 pb-3 mb-4 text-amber-600 dark:text-amber-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Medical Alerts
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Allergies</span>
                <p className="text-sm text-neutral-900 dark:text-white mt-1">{pet.allergies || "No known allergies"}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-neutral-500 block">Chronic Conditions</span>
                <p className="text-sm text-neutral-900 dark:text-white mt-1">{pet.medicalNotes || "None recorded"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Medical Timeline */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold border-b border-[var(--card-border)] pb-3 mb-6 text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" /> Clinical History Timeline
          </h3>
          
          <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-3 space-y-8 pb-4">
            
            {consultations.length === 0 ? (
              <div className="pl-6 text-neutral-500 italic text-sm">No clinical history recorded for this patient yet.</div>
            ) : (
              consultations.map((consult, idx) => (
                <div key={idx} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute w-6 h-6 bg-white dark:bg-neutral-900 border-2 border-primary-500 rounded-full -left-[13px] top-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl p-5 border border-[var(--card-border)] shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-primary-600 dark:text-primary-400 text-sm font-bold block mb-1">
                          {new Date(consult.consultationDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Consultation Visit</h4>
                      </div>
                      <span className="text-xs text-neutral-500">Vet: Dr. {consult.vet?.user?.lastName || "Staff"}</span>
                    </div>

                    <div className="space-y-4">
                      
                      {/* Vitals */}
                      {(consult.weightKg || consult.temperatureC) && (
                        <div className="flex flex-wrap gap-4 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-[var(--card-border)] text-sm">
                          {consult.weightKg && <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500" /> <span className="text-neutral-500">Weight:</span> <span className="font-bold">{consult.weightKg}kg</span></div>}
                          {consult.temperatureC && <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-red-500" /> <span className="text-neutral-500">Temp:</span> <span className="font-bold">{consult.temperatureC}°C</span></div>}
                          {consult.heartRate && <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-pink-500" /> <span className="text-neutral-500">HR:</span> <span className="font-bold">{consult.heartRate}bpm</span></div>}
                        </div>
                      )}

                      {/* Notes */}
                      <div className="text-sm space-y-2">
                        {consult.chiefComplaint && (
                          <p><span className="font-bold text-neutral-700 dark:text-neutral-300">Complaint:</span> <span className="text-neutral-600 dark:text-neutral-400">{consult.chiefComplaint}</span></p>
                        )}
                        {consult.clinicalFindings && (
                          <p><span className="font-bold text-primary-700 dark:text-primary-400">Findings:</span> <span className="text-neutral-600 dark:text-neutral-400">{consult.clinicalFindings}</span></p>
                        )}
                      </div>

                      {/* Diagnoses */}
                      {consult.diagnoses && consult.diagnoses.length > 0 && (
                        <div className="pt-3 border-t border-[var(--card-border)]">
                          <h5 className="text-xs font-bold uppercase text-neutral-500 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Diagnoses</h5>
                          <div className="flex flex-wrap gap-2">
                            {consult.diagnoses.map((dx: any, i: number) => (
                              <span key={i} className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2.5 py-1 rounded-md font-medium border border-amber-200 dark:border-amber-900/50">
                                {dx.diagnosisText} {dx.severity ? `(${dx.severity})` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescriptions */}
                      {consult.prescriptions && consult.prescriptions.length > 0 && (
                        <div className="pt-3 border-t border-[var(--card-border)]">
                          <h5 className="text-xs font-bold uppercase text-neutral-500 mb-2 flex items-center gap-1"><Syringe className="w-3 h-3" /> Prescriptions Issued</h5>
                          <ul className="space-y-1">
                            {consult.prescriptions.map((rx: any, i: number) => (
                              rx.items?.map((item: any, j: number) => (
                                <li key={`${i}-${j}`} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                  <span><strong className="text-neutral-900 dark:text-white">{item.medicationName}</strong> — {item.dosage}, {item.frequency} for {item.duration}</span>
                                </li>
                              ))
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
