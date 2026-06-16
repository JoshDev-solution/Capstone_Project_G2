"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  X, User, Mail, Phone, Shield, ChevronLeft, ChevronRight,
  Filter,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

type Role = "Administrator" | "Veterinarian" | "Manager" | "Cashier" | "Client";
type Status = "Active" | "Inactive";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string;
  phone: string;
}

const roleColors: Record<Role, string> = {
  Administrator: "badge-danger",
  Veterinarian: "badge-primary",
  Manager: "badge-warning",
  Cashier: "badge-success",
  Client: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

const avatarColors: Record<Role, string> = {
  Administrator: "#EF4444",
  Veterinarian: "#FF4FA3",
  Manager: "#F59E0B",
  Cashier: "#10B981",
  Client: "#D98CFF",
};

const mockUsers: UserRow[] = [
  { id: 1, name: "System Administrator", email: "admin@ljvetclinic.com", role: "Administrator", status: "Active", joined: "Jan 15, 2020", phone: "+63-912-345-6789" },
  { id: 2, name: "Dr. Maria Lopez", email: "drlopez@ljvetclinic.com", role: "Veterinarian", status: "Active", joined: "Jan 15, 2020", phone: "+63-917-123-4567" },
  { id: 3, name: "Juan Santos", email: "manager@ljvetclinic.com", role: "Manager", status: "Active", joined: "Mar 1, 2021", phone: "+63-918-234-5678" },
  { id: 4, name: "Ana Cruz", email: "cashier@ljvetclinic.com", role: "Cashier", status: "Active", joined: "Jun 15, 2022", phone: "+63-919-345-6789" },
  { id: 5, name: "Carlo Reyes", email: "petowner@gmail.com", role: "Client", status: "Active", joined: "Sep 10, 2023", phone: "+63-920-456-7890" },
  { id: 6, name: "Maria Santos", email: "msantos@gmail.com", role: "Client", status: "Inactive", joined: "Dec 3, 2023", phone: "+63-921-567-8901" },
  { id: 7, name: "Dr. Jose Reyes", email: "drreyes@ljvetclinic.com", role: "Veterinarian", status: "Active", joined: "Feb 20, 2022", phone: "+63-922-678-9012" },
];

function UserModal({ user, onClose }: { user?: UserRow; onClose: () => void }) {
  const isEdit = !!user;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg card p-6 z-10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isEdit ? "Edit User" : "Add New User"}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input type="text" defaultValue={isEdit ? user.name.split(" ")[0] : ""} className="input pl-9" placeholder="Juan" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name</label>
              <input type="text" defaultValue={isEdit ? user.name.split(" ").slice(1).join(" ") : ""} className="input" placeholder="Dela Cruz" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="email" defaultValue={isEdit ? user.email : ""} className="input pl-9" placeholder="juan@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="tel" defaultValue={isEdit ? user.phone : ""} className="input pl-9" placeholder="+63-9XX-XXX-XXXX" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select defaultValue={isEdit ? user.role : ""} className="input pl-9 appearance-none cursor-pointer">
                <option value="">Select role...</option>
                {["Administrator", "Veterinarian", "Manager", "Cashier", "Client"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Temporary Password</label>
              <input type="password" className="input" placeholder="Min. 8 characters" />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button className="btn btn-primary flex-1">
            {isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | undefined>();
  const [users, setUsers] = useState(mockUsers);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      )
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {users.length} total users · {users.filter((u) => u.status === "Active").length} active
            </p>
          </div>
          <button
            onClick={() => { setSelectedUser(undefined); setModal("create"); }}
            className="btn btn-primary shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input pl-10 w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input pl-9 pr-8 cursor-pointer appearance-none min-w-36"
            >
              <option value="All">All Roles</option>
              {["Administrator", "Veterinarian", "Manager", "Cashier", "Client"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Phone</th>
                  <th className="hidden lg:table-cell">Joined</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: avatarColors[user.role] }}
                        >
                          {getInitials(user.name.split(" ")[0], user.name.split(" ").slice(-1)[0])}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{user.name}</p>
                          <p className="text-xs text-neutral-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn("badge", roleColors[user.role])}>
                        {user.role}
                      </span>
                    </td>
                    <td className="hidden md:table-cell text-sm text-neutral-500">{user.phone}</td>
                    <td className="hidden lg:table-cell text-sm text-neutral-500">{user.joined}</td>
                    <td>
                      <span className={cn(
                        "badge",
                        user.status === "Active" ? "badge-success" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={cn("btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center", user.status === "Active" ? "text-success" : "text-neutral-400")}
                          title={user.status === "Active" ? "Deactivate" : "Activate"}
                        >
                          {user.status === "Active" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setModal("edit"); }}
                          className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-primary-500"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-danger"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users found matching your search.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-[var(--card-border)] flex items-center justify-between text-sm text-neutral-400">
            <span>Showing {filtered.length} of {users.length} users</span>
            <div className="flex items-center gap-1">
              <button className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium text-xs">1</span>
              <button className="btn-icon btn-ghost rounded-lg w-8 h-8 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <UserModal
            user={modal === "edit" ? selectedUser : undefined}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
