"use client";

import { useState, useEffect } from "react";
import { Bug, Calendar, Search, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DewormingPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      
      const res = await fetch(`${baseUrl}/api/medical-records`);
      if (res.ok) {
        const data = await res.json();
        // Filter for deworming (case-insensitive)
        const dewormingRecords = data.filter((r: any) => 
          r.recordType?.toLowerCase().includes("deworm") || 
          r.title?.toLowerCase().includes("deworm")
        );
        setRecords(dewormingRecords);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextDue = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + 3); // Default 3 months for deworming
    return d;
  };

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    return r.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           r.title?.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary-500" /> Deworming Tracking
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Monitor administered deworming treatments and upcoming due dates.</p>
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search patient or treatment..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-sm h-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-[var(--card-border)]">
            <tr>
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-6 py-4 font-semibold">Treatment Administered</th>
              <th className="px-6 py-4 font-semibold">Date Given</th>
              <th className="px-6 py-4 font-semibold">Next Due Date</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-neutral-500">Loading records...</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-neutral-500">
                  <div className="flex flex-col items-center">
                    <Bug className="w-10 h-10 mb-3 text-neutral-300" />
                    <p className="font-semibold text-lg text-neutral-700 dark:text-neutral-300">No deworming records found</p>
                    <p className="text-sm mt-1">Records added in the Medical History will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map(r => {
                const nextDue = calculateNextDue(r.recordDate);
                const isOverdue = nextDue < new Date();
                
                return (
                  <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                        {r.pet?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                        {r.pet?.breed?.name || r.pet?.petType?.name || "Pet"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-[200px]">{r.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        {new Date(r.recordDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn(
                          "font-bold", 
                          isOverdue ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {nextDue.toLocaleDateString()}
                        </span>
                        {isOverdue && (
                          <span className="badge bg-red-100 text-red-700 text-[10px] px-1.5 py-0">OVERDUE</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/vet/medical-records/${r.petId}`} 
                        className="btn btn-outline text-xs px-3 py-1.5"
                      >
                        View Record
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
