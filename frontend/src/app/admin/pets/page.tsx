"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, PawPrint, Eye, Filter,
  X, User, ChevronLeft, ChevronRight, Syringe,
  ClipboardList, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────
type Species = "Dog" | "Cat" | "Bird" | "Rabbit" | "Hamster" | "Reptile" | "Other";
type Sex      = "Male" | "Female";

interface Pet {
  id: number;
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  color: string;
  dob: string;          // YYYY-MM-DD
  weight: number;       // kg
  microchip?: string;
  ownerName: string;
  ownerEmail: string;
  status: "Active" | "Deceased" | "Transferred";
  vaccinationStatus: "Up to Date" | "Due Soon" | "Overdue" | "Unknown";
  lastVisit: string;
  notes?: string;
  imageUrl?: string;    // placeholder for Cloudinary
}

interface MedicalRecord {
  id: number;
  petId: number;
  date: string;
  type: "Consultation" | "Vaccination" | "Deworming" | "Surgery" | "Lab" | "Grooming";
  diagnosis?: string;
  treatment: string;
  vet: string;
  weight?: number;
  notes?: string;
  nextVisit?: string;
}

interface VaccinationRecord {
  id: number;
  petId: number;
  vaccineName: string;
  doseNumber: number;
  administeredDate: string;
  nextDueDate: string;
  batch: string;
  vet: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────
const mockPets: Pet[] = [
  { id: 1,  name: "Buddy",     species: "Dog",    breed: "Labrador Retriever", sex: "Male",   color: "Golden",  dob: "2020-03-15", weight: 28.5, ownerName: "Carlo Reyes",      ownerEmail: "carlo.r@gmail.com",    status: "Active",    vaccinationStatus: "Up to Date", lastVisit: "Jun 10, 2026", microchip: "900032000123456" },
  { id: 2,  name: "Whiskers",  species: "Cat",    breed: "Persian",            sex: "Female", color: "White",   dob: "2021-07-22", weight: 4.2,  ownerName: "Maria Santos",     ownerEmail: "maria.s@gmail.com",    status: "Active",    vaccinationStatus: "Up to Date", lastVisit: "Jun 8, 2026",  microchip: "900032000234567" },
  { id: 3,  name: "Max",       species: "Dog",    breed: "German Shepherd",    sex: "Male",   color: "Black/Tan",dob: "2019-11-05",weight: 32.0, ownerName: "Jose Cruz",        ownerEmail: "jose.c@gmail.com",     status: "Active",    vaccinationStatus: "Due Soon",   lastVisit: "May 20, 2026" },
  { id: 4,  name: "Luna",      species: "Cat",    breed: "Siamese",            sex: "Female", color: "Cream",   dob: "2022-01-10", weight: 3.8,  ownerName: "Ana Lopez",        ownerEmail: "ana.l@gmail.com",      status: "Active",    vaccinationStatus: "Up to Date", lastVisit: "Jun 5, 2026" },
  { id: 5,  name: "Rocky",     species: "Dog",    breed: "Aspin",              sex: "Male",   color: "Brown",   dob: "2018-06-18", weight: 15.5, ownerName: "Ramon Diaz",       ownerEmail: "ramon.d@gmail.com",    status: "Active",    vaccinationStatus: "Overdue",    lastVisit: "Apr 12, 2026" },
  { id: 6,  name: "Mochi",     species: "Dog",    breed: "Shih Tzu",           sex: "Female", color: "White/Gray",dob:"2023-02-28",weight: 5.2,  ownerName: "Sofia Lim",        ownerEmail: "sofia.l@gmail.com",    status: "Active",    vaccinationStatus: "Up to Date", lastVisit: "Jun 12, 2026" },
  { id: 7,  name: "Tweety",    species: "Bird",   breed: "Cockatiel",          sex: "Male",   color: "Yellow",  dob: "2022-09-01", weight: 0.1,  ownerName: "Elena Villanueva", ownerEmail: "elena.v@gmail.com",    status: "Active",    vaccinationStatus: "Unknown",    lastVisit: "Jun 15, 2026" },
  { id: 8,  name: "Coco",      species: "Cat",    breed: "Ragdoll",            sex: "Male",   color: "Bicolor", dob: "2020-12-25", weight: 6.5,  ownerName: "David Garcia",     ownerEmail: "david.g@gmail.com",    status: "Active",    vaccinationStatus: "Due Soon",   lastVisit: "May 28, 2026" },
  { id: 9,  name: "Biscuit",   species: "Dog",    breed: "Golden Retriever",   sex: "Female", color: "Golden",  dob: "2021-04-14", weight: 24.0, ownerName: "Rachel Torres",    ownerEmail: "rachel.t@gmail.com",   status: "Active",    vaccinationStatus: "Up to Date", lastVisit: "Jun 1, 2026" },
  { id: 10, name: "Shadow",    species: "Dog",    breed: "Black Labrador",     sex: "Male",   color: "Black",   dob: "2019-08-30", weight: 30.0, ownerName: "Marco Reyes",      ownerEmail: "marco.r@gmail.com",    status: "Active",    vaccinationStatus: "Up to Date", lastVisit: "Jun 14, 2026" },
  { id: 11, name: "Snowball",  species: "Rabbit", breed: "Holland Lop",        sex: "Female", color: "White",   dob: "2023-05-20", weight: 1.8,  ownerName: "Nina Aquino",      ownerEmail: "nina.a@gmail.com",     status: "Active",    vaccinationStatus: "Unknown",    lastVisit: "Mar 5, 2026" },
  { id: 12, name: "Rex",       species: "Dog",    breed: "Doberman",           sex: "Male",   color: "Black/Rust",dob:"2018-03-11",weight: 38.0, ownerName: "Luis Santos",      ownerEmail: "luis.s@gmail.com",     status: "Active",    vaccinationStatus: "Overdue",    lastVisit: "Feb 20, 2026" },
];

const mockRecords: MedicalRecord[] = [
  { id: 1, petId: 1, date: "Jun 10, 2026", type: "Consultation", diagnosis: "Healthy — Annual Checkup",    treatment: "General physical exam. No abnormalities found.",             vet: "Dr. Lovely Eguia", weight: 28.5, nextVisit: "Jun 2027" },
  { id: 2, petId: 1, date: "Mar 5, 2026",  type: "Vaccination",  treatment: "Anti-Rabies vaccine administered (Verorab 1mL SC).",              vet: "Dr. Lovely Eguia", weight: 27.8 },
  { id: 3, petId: 1, date: "Dec 1, 2025",  type: "Deworming",    treatment: "Milbemax deworming tablet administered.",                         vet: "Dr. Lovely Eguia", weight: 27.0, nextVisit: "Mar 2026" },
  { id: 4, petId: 1, date: "Sep 15, 2025", type: "Lab",          diagnosis: "CBC Normal",                    treatment: "Complete blood count panel — all values within normal range.", vet: "Dr. Lovely Eguia" },
];

const mockVaccinations: VaccinationRecord[] = [
  { id: 1, petId: 1, vaccineName: "Anti-Rabies",      doseNumber: 1, administeredDate: "Mar 5, 2026",  nextDueDate: "Mar 5, 2027",  batch: "VR-2026-001", vet: "Dr. Lovely Eguia" },
  { id: 2, petId: 1, vaccineName: "5-in-1 (DHPP+L)",  doseNumber: 3, administeredDate: "Jun 10, 2025", nextDueDate: "Jun 10, 2026", batch: "DH-2025-042", vet: "Dr. Lovely Eguia" },
  { id: 3, petId: 1, vaccineName: "Kennel Cough",      doseNumber: 1, administeredDate: "Jun 10, 2025", nextDueDate: "Jun 10, 2026", batch: "KC-2025-015", vet: "Dr. Lovely Eguia" },
];

// ─── Constants ──────────────────────────────────────────────────────────────
const vaccStatusConfig: Record<string, { cls: string; dot: string }> = {
  "Up to Date": { cls: "badge-success",  dot: "bg-success" },
  "Due Soon":   { cls: "badge-warning",  dot: "bg-warning" },
  "Overdue":    { cls: "badge-danger",   dot: "bg-danger"  },
  "Unknown":    { cls: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400", dot: "bg-neutral-400" },
};

const speciesEmoji: Record<Species, string> = {
  Dog: "🐕", Cat: "🐈", Bird: "🦜",
  Rabbit: "🐰", Hamster: "🐹", Reptile: "🦎", Other: "🐾",
};

const speciesColor: Record<Species, string> = {
  Dog: "#FF4FA3", Cat: "#D98CFF", Bird: "#F59E0B",
  Rabbit: "#10B981", Hamster: "#F97316", Reptile: "#14B8A6", Other: "#6B7280",
};

const recordTypeConfig: Record<MedicalRecord["type"], { cls: string; color: string }> = {
  Consultation: { cls: "badge-primary",  color: "#FF4FA3" },
  Vaccination:  { cls: "badge-success",  color: "#10B981" },
  Deworming:    { cls: "badge-warning",  color: "#F59E0B" },
  Surgery:      { cls: "badge-danger",   color: "#EF4444" },
  Lab:          { cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300", color: "#3B82F6" },
  Grooming:     { cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300", color: "#D98CFF" },
};

const ageFromDOB = (dob: string) => {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  return years > 0 ? `${years}y ${months}m` : `${months} months`;
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
  const emoji = speciesEmoji[pet.species];
  const vsCfg = vaccStatusConfig[pet.vaccinationStatus];
  const color = speciesColor[pet.species];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="card p-5 cursor-pointer group hover:shadow-lg transition-shadow"
    >
      {/* Avatar + Badge */}
      <div className="relative mb-4">
        <div className="w-full h-32 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
          <span className="text-6xl opacity-50 group-hover:opacity-70 transition-opacity select-none">{emoji}</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={cn("badge text-[10px] px-2 py-0.5 flex items-center gap-1", vsCfg.cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", vsCfg.dot)} />
            {pet.vaccinationStatus}
          </span>
        </div>
        <div className="absolute -bottom-3 left-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: color }}>
            <span className="text-white text-xs font-bold">{pet.name.charAt(0)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-base">{pet.name}</h3>
            <p className="text-xs text-neutral-400">{pet.breed}</p>
          </div>
          <span className="text-xs text-neutral-400">{ageFromDOB(pet.dob)}</span>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="badge text-[10px] px-2" style={{ background: `${color}15`, color }}>{pet.species}</span>
          <span className="badge text-[10px] px-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{pet.sex}</span>
          <span className="badge text-[10px] px-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{pet.weight} kg</span>
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{pet.ownerName}</span>
          </div>
          <span>Last: {pet.lastVisit}</span>
        </div>
      </div>
    </motion.div>
  );
}

function PetDetailModal({ pet, onClose, onEdit }: { pet: Pet; onClose: () => void; onEdit: () => void }) {
  const [tab, setTab] = useState<"profile" | "medical" | "vaccines">("profile");
  const emoji = speciesEmoji[pet.species];
  const vsCfg = vaccStatusConfig[pet.vaccinationStatus];
  const color = speciesColor[pet.species];
  const records = mockRecords.filter((r) => r.petId === pet.id);
  const vaccines = mockVaccinations.filter((v) => v.petId === pet.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-2xl card z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl p-6 flex items-start gap-4" style={{ background: `${color}15` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0" style={{ background: color }}>
            <span className="text-3xl select-none">{emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{pet.name}</h2>
              <span className={cn("badge flex items-center gap-1 text-[10px]", vsCfg.cls)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", vsCfg.dot)} />
                Vaccine: {pet.vaccinationStatus}
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

        {/* Tabs */}
        <div className="flex border-b border-[var(--card-border)] px-6">
          {([["profile", "Profile"], ["medical", "Medical History"], ["vaccines", "Vaccinations"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", tab === t ? "border-primary-500 text-primary-500" : "border-transparent text-neutral-400 hover:text-neutral-600")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name",          value: pet.name },
                { label: "Species",            value: pet.species },
                { label: "Breed",              value: pet.breed },
                { label: "Sex",                value: pet.sex },
                { label: "Date of Birth",      value: pet.dob },
                { label: "Age",                value: ageFromDOB(pet.dob) },
                { label: "Weight",             value: `${pet.weight} kg` },
                { label: "Color / Markings",   value: pet.color },
                { label: "Microchip No.",      value: pet.microchip ?? "Not registered" },
                { label: "Status",             value: pet.status },
                { label: "Last Visit",         value: pet.lastVisit },
                { label: "Vaccination Status", value: pet.vaccinationStatus },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-0.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{row.label}</span>
                  <span className="text-sm font-medium">{row.value}</span>
                </div>
              ))}
              {pet.notes && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide">Notes</span>
                  <p className="text-sm mt-0.5">{pet.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Medical History Tab */}
          {tab === "medical" && (
            <div>
              {records.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No medical records found for {pet.name}.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {records.map((rec) => {
                    const cfg = recordTypeConfig[rec.type];
                    return (
                      <div key={rec.id} className="relative pl-5 border-l-2 border-[var(--card-border)]">
                        <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                        <div className="card p-4">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("badge", cfg.cls)}>{rec.type}</span>
                              <span className="text-xs text-neutral-400">{rec.date}</span>
                              {rec.weight && <span className="text-xs text-neutral-400">{rec.weight} kg</span>}
                            </div>
                            <span className="text-xs text-neutral-400 shrink-0">{rec.vet}</span>
                          </div>
                          {rec.diagnosis && (
                            <p className="text-sm font-semibold mb-1">{rec.diagnosis}</p>
                          )}
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{rec.treatment}</p>
                          {rec.nextVisit && (
                            <p className="text-xs text-primary-500 mt-2 font-medium">Next visit: {rec.nextVisit}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="btn btn-primary w-full mt-6 text-sm">
                <Plus className="w-4 h-4" /> Add Medical Record
              </button>
            </div>
          )}

          {/* Vaccines Tab */}
          {tab === "vaccines" && (
            <div>
              {vaccines.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  <Syringe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No vaccination records for {pet.name}.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {vaccines.map((v) => {
                    const isOverdue = new Date(v.nextDueDate) < new Date();
                    return (
                      <div key={v.id} className="card p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                          <Syringe className="w-5 h-5 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-bold text-sm">{v.vaccineName}</p>
                            <span className="badge badge-success text-[10px]">Dose {v.doseNumber}</span>
                          </div>
                          <p className="text-xs text-neutral-400">Administered: {v.administeredDate} · Batch: {v.batch}</p>
                          <p className="text-xs text-neutral-400">Vet: {v.vet}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-neutral-400">Next Due</p>
                          <p className={cn("text-sm font-bold", isOverdue ? "text-danger" : "text-success")}>{v.nextDueDate}</p>
                          {isOverdue && <span className="badge badge-danger text-[10px]">Overdue</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="btn btn-primary w-full mt-6 text-sm">
                <Syringe className="w-4 h-4" /> Record Vaccination
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PetFormModal({ pet, onClose }: { pet?: Pet; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="relative w-full max-w-xl card z-10 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
          <h2 className="text-xl font-bold">{pet ? `Edit ${pet.name}` : "Register New Pet"}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Basic Info */}
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Pet Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Pet Name *</label>
                <input type="text" defaultValue={pet?.name} className="input" placeholder="e.g., Buddy" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Species *</label>
                <select defaultValue={pet?.species ?? ""} className="input appearance-none cursor-pointer">
                  <option value="">Select species...</option>
                  {["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Reptile", "Other"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Breed</label>
                <input type="text" defaultValue={pet?.breed} className="input" placeholder="e.g., Labrador" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sex *</label>
                <select defaultValue={pet?.sex ?? ""} className="input appearance-none cursor-pointer">
                  <option value="">Select...</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input type="date" defaultValue={pet?.dob} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                <input type="number" step="0.1" defaultValue={pet?.weight} className="input" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Color / Markings</label>
                <input type="text" defaultValue={pet?.color} className="input" placeholder="e.g., Golden" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Microchip No.</label>
                <input type="text" defaultValue={pet?.microchip} className="input" placeholder="15-digit number" />
              </div>
            </div>

            {/* Owner Info */}
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-2">Owner Information</p>
            <div>
              <label className="block text-sm font-medium mb-1.5">Owner *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select className="input pl-9 appearance-none cursor-pointer">
                  <option value="">Select existing client...</option>
                  {["Carlo Reyes", "Maria Santos", "Jose Cruz", "Ana Lopez", "Ramon Diaz", "Sofia Lim"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Health Status */}
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-2">Health Status</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Pet Status</label>
                <select defaultValue={pet?.status ?? "Active"} className="input appearance-none cursor-pointer">
                  <option>Active</option>
                  <option>Deceased</option>
                  <option>Transferred</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Vaccination Status</label>
                <select defaultValue={pet?.vaccinationStatus ?? "Unknown"} className="input appearance-none cursor-pointer">
                  <option>Up to Date</option>
                  <option>Due Soon</option>
                  <option>Overdue</option>
                  <option>Unknown</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Additional Notes</label>
              <textarea defaultValue={pet?.notes} rows={3} className="input resize-none" placeholder="Allergies, special conditions, behavior notes..." />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-[var(--card-border)]">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button className="btn btn-primary flex-1">{pet ? "Save Changes" : "Register Pet"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PetsPage() {
  const [pets] = useState(mockPets);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [vaccFilter, setVaccFilter] = useState("All");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [formPet, setFormPet] = useState<Pet | undefined | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const filtered = pets.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
    const matchSp = speciesFilter === "All" || p.species === speciesFilter;
    const matchVacc = vaccFilter === "All" || p.vaccinationStatus === vaccFilter;
    return matchQ && matchSp && matchVacc;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  // Summary counts
  const overdue  = pets.filter((p) => p.vaccinationStatus === "Overdue").length;
  const dueSoon  = pets.filter((p) => p.vaccinationStatus === "Due Soon").length;
  const upToDate = pets.filter((p) => p.vaccinationStatus === "Up to Date").length;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pet Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{pets.length} registered pets in the system</p>
          </div>
          <button onClick={() => { setFormPet(undefined); setShowForm(true); }} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Register Pet
          </button>
        </div>

        {/* Vaccination Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Pets",    value: pets.length, color: "#FF4FA3" },
            { label: "Up to Date",    value: upToDate,    color: "#10B981" },
            { label: "Due Soon",      value: dueSoon,     color: "#F59E0B" },
            { label: "Overdue",       value: overdue,     color: "#EF4444" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                <span className="text-base font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-tight">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by pet name, breed, or owner..." className="input pl-10 w-full" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={speciesFilter} onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
              className="input pl-9 pr-8 min-w-36 appearance-none cursor-pointer">
              <option value="All">All Species</option>
              {["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Reptile", "Other"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select value={vaccFilter} onChange={(e) => { setVaccFilter(e.target.value); setPage(1); }}
              className="input pl-9 pr-8 min-w-40 appearance-none cursor-pointer">
              <option value="All">All Vaccine Status</option>
              {["Up to Date", "Due Soon", "Overdue", "Unknown"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {/* View Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--card-border)] shrink-0">
            <button onClick={() => setView("grid")} className={cn("px-3 py-2 text-sm transition-colors", view === "grid" ? "gradient-primary text-white" : "btn-ghost text-neutral-400")}>
              ⊞
            </button>
            <button onClick={() => setView("table")} className={cn("px-3 py-2 text-sm transition-colors", view === "table" ? "gradient-primary text-white" : "btn-ghost text-neutral-400")}>
              ≡
            </button>
          </div>
        </div>

        {/* Grid View */}
        {view === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginated.map((pet) => (
              <PetCard key={pet.id} pet={pet} onClick={() => setSelectedPet(pet)} />
            ))}
          </div>
        )}

        {/* Table View */}
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
                    const emoji = speciesEmoji[pet.species];
                    const color = speciesColor[pet.species];
                    const vsCfg = vaccStatusConfig[pet.vaccinationStatus];
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
                          <p className="text-sm">{ageFromDOB(pet.dob)}</p>
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
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setSelectedPet(pet)} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setFormPet(pet); setShowForm(true); }} className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger">
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
            {filtered.length === 0 && (
              <div className="text-center py-14 text-neutral-400">
                <PawPrint className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No pets found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && view === "grid" && (
          <div className="text-center py-20 text-neutral-400">
            <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No pets found matching your search.</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-sm text-neutral-400">
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
      </div>

      {/* Modals */}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}
