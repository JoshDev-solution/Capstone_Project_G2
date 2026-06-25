"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, Activity, AlertCircle, Syringe, History, Check, PawPrint } from "lucide-react";
import Swal from 'sweetalert2';
import { cn } from "@/lib/utils";

export default function ActiveConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: appointmentId } = use(params);
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Vitals");

  // Form State
  const [vitals, setVitals] = useState({ weightKg: "", temperatureC: "", heartRate: "", respiratoryRate: "" });
  const [notes, setNotes] = useState({ chiefComplaint: "", clinicalFindings: "", generalNotes: "" });
  
  // Diagnoses List
  const [diagnoses, setDiagnoses] = useState<{diagnosisText: string, severity: string, treatmentPlan: string}[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState({ diagnosisText: "", severity: "Mild", treatmentPlan: "" });

  // Rx List
  const [prescriptions, setPrescriptions] = useState<{medicationName: string, dosage: string, frequency: string, duration: string}[]>([]);
  const [newRx, setNewRx] = useState({ medicationName: "", dosage: "", frequency: "", duration: "" });

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/appointments/${appointmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointment(data);
        
        // Auto update status to "In Progress" if it's "Arrived"
        if (data.status === "Arrived") {
          fetch(`${baseUrl}/api/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "In Progress" })
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiagnosis = () => {
    if (!newDiagnosis.diagnosisText) return;
    setDiagnoses([...diagnoses, { ...newDiagnosis }]);
    setNewDiagnosis({ diagnosisText: "", severity: "Mild", treatmentPlan: "" });
  };

  const handleAddRx = () => {
    if (!newRx.medicationName) return;
    setPrescriptions([...prescriptions, { ...newRx }]);
    setNewRx({ medicationName: "", dosage: "", frequency: "", duration: "" });
  };

  const handleCompleteConsultation = async () => {
    setSaving(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;

      // 1. Create the Consultation Record
      const consultRes = await fetch(`${baseUrl}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: Number(appointmentId),
          petId: appointment.petId,
          vetId: appointment.vetId || 1, // Fallback if vet not strictly assigned
          weightKg: vitals.weightKg ? Number(vitals.weightKg) : null,
          temperatureC: vitals.temperatureC ? Number(vitals.temperatureC) : null,
          heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
          respiratoryRate: vitals.respiratoryRate ? Number(vitals.respiratoryRate) : null,
          chiefComplaint: notes.chiefComplaint,
          clinicalFindings: notes.clinicalFindings,
          notes: notes.generalNotes
        })
      });

      if (!consultRes.ok) throw new Error("Failed to save consultation");
      const savedConsult = await consultRes.json();

      // 2. Save Diagnoses
      if (diagnoses.length > 0) {
        for (const dx of diagnoses) {
          await fetch(`${baseUrl}/api/diagnoses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consultationId: savedConsult.id,
              petId: appointment.petId,
              vetId: appointment.vetId || 1,
              ...dx
            })
          });
        }
      }

      // 3. Save Prescriptions (Using batch/nested if backend supports, else simplified for demo)
      if (prescriptions.length > 0) {
        await fetch(`${baseUrl}/api/prescriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId: savedConsult.id,
            petId: appointment.petId,
            vetId: appointment.vetId || 1,
            prescriptionCode: `RX-${Date.now()}`,
            items: {
              create: prescriptions
            }
          })
        });
      }

      // 4. Update Appointment Status to Completed
      await fetch(`${baseUrl}/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "Completed" })
      });

      Swal.fire({
        title: "Consultation Complete",
        text: "The medical records have been saved successfully.",
        icon: "success",
        confirmButtonColor: "#FF4FA3",
      }).then(() => {
        router.push('/vet/consultation');
      });

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to complete consultation. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading session...</div>;
  if (!appointment) return <div className="p-20 text-center text-red-500">Session not found.</div>;

  const tabs = [
    { id: "Vitals", icon: Activity },
    { id: "Clinical Notes", icon: FileText },
    { id: "Diagnosis", icon: AlertCircle },
    { id: "Prescription", icon: Syringe },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
              Consultation: {appointment.pet?.name}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Client: {appointment.client?.user?.firstName} {appointment.client?.user?.lastName} • Reason: {appointment.reason}
            </p>
          </div>
        </div>
        <button 
          onClick={handleCompleteConsultation}
          disabled={saving}
          className="btn btn-primary bg-primary-500 hover:bg-primary-600 border-0 shadow-lg shadow-primary-500/20"
        >
          {saving ? "Saving..." : <><Check className="w-4 h-4 mr-1" /> Complete Session</>}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden mt-6 gap-6">
        
        {/* Left Column - History Sidebar */}
        <div className="w-72 hidden lg:flex flex-col border border-[var(--card-border)] rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden shrink-0">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 font-bold flex items-center gap-2 border-b border-[var(--card-border)]">
            <History className="w-4 h-4 text-primary-500" /> Patient History
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-sm text-center text-neutral-500 py-10">
              <PawPrint className="w-8 h-8 opacity-20 mx-auto mb-2" />
              Fetch history timeline...<br/>(Coming in Med Records module)
            </div>
          </div>
        </div>

        {/* Right Column - Active Forms */}
        <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-sm">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-[var(--card-border)] overflow-x-auto hide-scrollbar bg-neutral-50 dark:bg-neutral-950 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab.id 
                    ? "border-primary-500 text-primary-600 bg-white dark:bg-neutral-900" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary-500" : "text-neutral-400")} />
                {tab.id}
                
                {tab.id === "Diagnosis" && diagnoses.length > 0 && (
                  <span className="ml-1 bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">{diagnoses.length}</span>
                )}
                {tab.id === "Prescription" && prescriptions.length > 0 && (
                  <span className="ml-1 bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">{prescriptions.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 dark:bg-neutral-900/20">
            
            {/* VITALS TAB */}
            {activeTab === "Vitals" && (
              <div className="max-w-2xl space-y-6">
                <h3 className="font-bold text-lg mb-4">Initial Vitals</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Weight (kg)</label>
                    <input type="number" step="0.1" className="input" placeholder="e.g. 15.5" value={vitals.weightKg} onChange={(e) => setVitals({...vitals, weightKg: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Temperature (°C)</label>
                    <input type="number" step="0.1" className="input" placeholder="e.g. 38.5" value={vitals.temperatureC} onChange={(e) => setVitals({...vitals, temperatureC: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Heart Rate (bpm)</label>
                    <input type="number" className="input" placeholder="e.g. 120" value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Respiratory Rate (bpm)</label>
                    <input type="number" className="input" placeholder="e.g. 30" value={vitals.respiratoryRate} onChange={(e) => setVitals({...vitals, respiratoryRate: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {/* CLINICAL NOTES TAB */}
            {activeTab === "Clinical Notes" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <label className="text-sm font-bold mb-1 block">Chief Complaint (Client's wording)</label>
                  <textarea 
                    className="input min-h-[100px]" 
                    placeholder="e.g. 'Dog has been vomiting since yesterday morning...'" 
                    value={notes.chiefComplaint} 
                    onChange={(e) => setNotes({...notes, chiefComplaint: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block text-primary-600">Objective Findings (Vet's examination)</label>
                  <textarea 
                    className="input min-h-[150px] border-primary-200 focus:border-primary-500" 
                    placeholder="e.g. Abdomen tense on palpation. Mild dehydration (~5%)..." 
                    value={notes.clinicalFindings} 
                    onChange={(e) => setNotes({...notes, clinicalFindings: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">General Notes & Plan</label>
                  <textarea 
                    className="input min-h-[100px]" 
                    placeholder="Recommended bloodwork..." 
                    value={notes.generalNotes} 
                    onChange={(e) => setNotes({...notes, generalNotes: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* DIAGNOSIS TAB */}
            {activeTab === "Diagnosis" && (
              <div className="max-w-4xl space-y-8">
                
                {/* Existing Diagnoses */}
                {diagnoses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Current Diagnoses</h3>
                    {diagnoses.map((dx, idx) => (
                      <div key={idx} className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-primary-100 shadow-sm flex justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-primary-700 dark:text-primary-400 text-lg">{dx.diagnosisText}</h4>
                            <span className={cn(
                              "badge text-[10px]",
                              dx.severity === "Severe" ? "bg-red-100 text-red-700" :
                              dx.severity === "Moderate" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            )}>{dx.severity}</span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2"><span className="font-medium text-neutral-900 dark:text-white">Plan:</span> {dx.treatmentPlan || "None specified"}</p>
                        </div>
                        <button onClick={() => setDiagnoses(diagnoses.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 text-sm font-medium">Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New */}
                <div className="bg-primary-50/50 dark:bg-primary-900/10 p-6 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-primary-500" /> Add Diagnosis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold mb-1 block">Diagnosis Name/Code</label>
                      <input type="text" className="input" placeholder="e.g. Acute Gastroenteritis" value={newDiagnosis.diagnosisText} onChange={(e) => setNewDiagnosis({...newDiagnosis, diagnosisText: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Severity</label>
                      <select className="input" value={newDiagnosis.severity} onChange={(e) => setNewDiagnosis({...newDiagnosis, severity: e.target.value})}>
                        <option>Mild</option>
                        <option>Moderate</option>
                        <option>Severe</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs font-semibold mb-1 block">Proposed Treatment Plan</label>
                    <textarea className="input min-h-[80px]" placeholder="e.g. IV fluids, anti-emetics..." value={newDiagnosis.treatmentPlan} onChange={(e) => setNewDiagnosis({...newDiagnosis, treatmentPlan: e.target.value})} />
                  </div>
                  <button onClick={handleAddDiagnosis} disabled={!newDiagnosis.diagnosisText} className="btn btn-outline border-primary-500 text-primary-600 hover:bg-primary-50">
                    + Add to Record
                  </button>
                </div>
              </div>
            )}

            {/* PRESCRIPTION TAB */}
            {activeTab === "Prescription" && (
              <div className="max-w-4xl space-y-8">
                
                {prescriptions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2 flex items-center justify-between">
                      Prescribed Medications
                      <button className="btn btn-primary text-xs h-8 px-3 py-0 bg-primary-500 border-0">Generate Rx PDF</button>
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-[var(--card-border)]">
                      <table className="w-full text-sm text-left bg-white dark:bg-neutral-900">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                          <tr>
                            <th className="px-4 py-3">Medication</th>
                            <th className="px-4 py-3">Dosage</th>
                            <th className="px-4 py-3">Frequency</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                          {prescriptions.map((rx, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 font-bold text-primary-600">{rx.medicationName}</td>
                              <td className="px-4 py-3">{rx.dosage}</td>
                              <td className="px-4 py-3">{rx.frequency}</td>
                              <td className="px-4 py-3">{rx.duration}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400"><Syringe className="w-5 h-5" /> Add Medication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Medication Name</label>
                      <input type="text" className="input border-blue-200" placeholder="e.g. Amoxicillin 250mg" value={newRx.medicationName} onChange={(e) => setNewRx({...newRx, medicationName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Dosage</label>
                      <input type="text" className="input border-blue-200" placeholder="e.g. 1 tablet" value={newRx.dosage} onChange={(e) => setNewRx({...newRx, dosage: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Frequency</label>
                      <input type="text" className="input border-blue-200" placeholder="e.g. Twice a day (BID)" value={newRx.frequency} onChange={(e) => setNewRx({...newRx, frequency: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Duration</label>
                      <input type="text" className="input border-blue-200" placeholder="e.g. 7 days" value={newRx.duration} onChange={(e) => setNewRx({...newRx, duration: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={handleAddRx} disabled={!newRx.medicationName} className="btn btn-outline border-blue-500 text-blue-600 hover:bg-blue-50">
                    + Add Medication
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
