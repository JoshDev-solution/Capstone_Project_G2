"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  X, User, Mail, Phone, Shield, ChevronLeft, ChevronRight,
  Filter, AlertTriangle
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

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

function UserModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user?: UserRow; 
  onClose: () => void; 
  onSave: (formData: Omit<UserRow, "id" | "joined"> & { id?: number; password?: string }) => void 
}) {
  const isEdit = !!user;
  const [firstName, setFirstName] = useState(isEdit ? user.name.split(" ")[0] : "");
  const [lastName, setLastName] = useState(isEdit ? user.name.split(" ").slice(1).join(" ") : "");
  const [email, setEmail] = useState(isEdit ? user.email : "");
  const [phone, setPhone] = useState(isEdit ? user.phone : "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(isEdit ? user.role : "Client");
  const [status, setStatus] = useState<Status>(isEdit ? user.status : "Active");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !role || (!isEdit && !password.trim())) {
      alert("Please fill out all required fields.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    onSave({
      id: user?.id,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password,
      role,
      status,
    });
    setShowConfirm(false);
    onClose();
  };

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
          <h2 className="text-xl font-bold">{isEdit ? "Edit User Account" : "Add New User Account"}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost rounded-xl w-9 h-9 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="input pl-10" 
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Juan" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name *</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="input" 
                placeholder="Dela Cruz" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="input pl-10" 
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="juan@example.com" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password {isEdit ? "(Leave empty to keep current)" : "*"}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input" 
                placeholder="Secure password" 
                required={!isEdit} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="input pl-10" 
                style={{ paddingLeft: "2.5rem" }}
                placeholder="+63-9XX-XXX-XXXX" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Role *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as Role)} 
                  className="input pl-10 cursor-pointer"
                  style={{ paddingLeft: "2.5rem" }}
                  required
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Veterinarian">Veterinarian</option>
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Client">Client</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status *</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as Status)} 
                className="input cursor-pointer"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        title={isEdit ? "Confirm Updates" : "Confirm Registration"}
        message={isEdit ? "Are you sure you want to save these changes to the user account?" : "Are you sure you want to create this new user account?"}
        confirmText="Yes, Save"
        cancelText="Cancel"
        type="info"
      />
    </motion.div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | undefined>();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: (() => void) | null }>({
    open: false,
    title: "",
    message: "",
    onConfirm: null
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const res = await fetch(`${baseUrl}/api/users/list`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to fetch users: ${res.status} ${errText}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerConfirm = (title: string, message: string, callback: () => void) => {
    setConfirmState({ open: true, title, message, onConfirm: callback });
  };

  const handleToggleStatus = async (id: number, currentStatus: Status, name: string) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const action = currentStatus === "Active" ? "deactivate" : "activate";

    triggerConfirm(
      "Confirm Status Change",
      `Are you sure you want to ${action} the account for user "${name}"?`,
      async () => {
        try {
          let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
          const token = localStorage.getItem("vcms_token");
          const targetUser = users.find((u) => u.id === id);
          if (!targetUser) return;

          const res = await fetch(`${baseUrl}/api/users/manage/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              name: targetUser.name,
              email: targetUser.email,
              phone: targetUser.phone,
              role: targetUser.role,
              status: nextStatus
            })
          });

          if (!res.ok) throw new Error("Failed to toggle user status.");
          setUsers((prev) =>
            prev.map((u) => u.id === id ? { ...u, status: nextStatus } : u)
          );
        } catch (err: any) {
          alert(err.message || "An error occurred.");
        }
      }
    );
  };

  const handleDeleteUser = async (id: number, name: string) => {
    triggerConfirm(
      "Delete User Account",
      `Are you sure you want to permanently delete user account "${name}"? This action is irreversible.`,
      async () => {
        try {
          let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
          const token = localStorage.getItem("vcms_token");
          const res = await fetch(`${baseUrl}/api/users/manage/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (!res.ok) throw new Error("Failed to delete user.");
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err: any) {
          alert(err.message || "An error occurred.");
        }
      }
    );
  };

  const handleSaveUser = async (formData: Omit<UserRow, "id" | "joined"> & { id?: number; password?: string }) => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      const isEdit = !!formData.id;
      const url = isEdit ? `${baseUrl}/api/users/manage/${formData.id}` : `${baseUrl}/api/users/manage`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to save user: ${res.status} ${errText}`);
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "An error occurred while saving.");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <>
      <div className="flex flex-col gap-6 text-left">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {users.length} total users · {users.filter((u) => u.status === "Active").length} active
            </p>
          </div>
          <button onClick={() => { setSelectedUser(undefined); setModal("create"); }} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Add User Account
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
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)} 
              className="input pl-9 pr-8 min-w-40 appearance-none cursor-pointer"
              style={{ paddingLeft: "2.25rem" }}
            >
              <option value="All">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Veterinarian">Veterinarian</option>
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Client">Client</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-neutral-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm max-w-md">
            {error}
          </div>
        )}

        {/* Users Table */}
        {!loading && !error && (
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
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                            style={{ backgroundColor: avatarColors[user.role] || "#D98CFF" }}
                          >
                            {getInitials(user.name.split(" ")[0] || "", user.name.split(" ").slice(1).join(" ") || "")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-neutral-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={cn("badge", roleColors[user.role] || "badge-primary")}>
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
                            onClick={() => handleToggleStatus(user.id, user.status, user.name)}
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
                            onClick={() => handleDeleteUser(user.id, user.name)}
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
          </div>
        )}
      </div>

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {modal && (
          <UserModal
            user={modal === "edit" ? selectedUser : undefined}
            onClose={() => setModal(null)}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Action Modal Overlay */}
      <AnimatePresence>
        {confirmState.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md card p-6 z-10 shadow-2xl text-left"
            >
              <div className="flex items-center gap-3 text-warning mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{confirmState.title}</h3>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                {confirmState.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmState({ open: false, title: "", message: "", onConfirm: null })}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmState.onConfirm) confirmState.onConfirm();
                    setConfirmState({ open: false, title: "", message: "", onConfirm: null });
                  }}
                  className="btn btn-primary bg-danger hover:bg-danger/95 border-danger hover:border-danger text-xs font-semibold text-white"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
