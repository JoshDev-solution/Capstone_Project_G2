import re
import os

filepath = "frontend/src/app/admin/settings/page.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
if "User," not in content:
    content = content.replace("Settings, Lock, Bell, Mail, Shield, Palette, Database, Save,", "Settings, Lock, Bell, Mail, Shield, Palette, Database, Save, User, Camera, Loader2,")
if "useRef" not in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useEffect, useRef } from "react";')

# 2. Sections
sections_old = """const sections = [
  { id: "clinic",      label: "Clinic Info",     icon: PawPrint },"""
sections_new = """const sections = [
  { id: "profile",     label: "My Profile",      icon: User },
  { id: "clinic",      label: "Clinic Info",     icon: PawPrint },"""
content = content.replace(sections_old, sections_new)

# 3. State & Logic
logic_old = """export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("clinic");
  const [saved, setSaved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };"""

logic_new = """export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "",
    profileImageUrl: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        role: data.role || "",
        profileImageUrl: data.profileImageUrl || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");

      const res = await fetch(`${baseUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone
        })
      });

      if (!res.ok) throw new Error("Failed to update profile");
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${baseUrl}/api/users/profile/picture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      
      setProfile(prev => ({ ...prev, profileImageUrl: data.profileImageUrl }));
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  let fullImageUrl = "";
  if (profile.profileImageUrl) {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      fullImageUrl = `${baseUrl}${profile.profileImageUrl}`;
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };"""
content = content.replace(logic_old, logic_new)

# 4. JSX Injection
jsx_injection = """{/* Profile Info */}
          {activeSection === "profile" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="card p-6 flex flex-col items-center text-center h-full">
                  <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                      ) : profile.profileImageUrl ? (
                        <img src={fullImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 p-2.5 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50 group-hover:scale-110 duration-200"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {profileLoading ? "..." : `${profile.firstName} ${profile.lastName}`}
                  </h2>
                  <p className="text-sm font-medium text-primary-500 dark:text-primary-400 mt-1">
                    {profile.role || "Administrator"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">{profile.email}</p>
                </div>
              </div>
              <div className="md:w-2/3">
                <form onSubmit={handleProfileSave} className="card p-6 flex flex-col gap-5">
                  <h3 className="text-lg font-bold border-b border-[var(--card-border)] pb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-neutral-400" />
                    Personal Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First Name</label>
                      <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="input" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last Name</label>
                      <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="input" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                    <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="input" />
                  </div>
                  <div className="pt-4 border-t border-[var(--card-border)] flex justify-end">
                    <button type="submit" disabled={savingProfile} className={cn("btn flex items-center gap-2 transition-all", saved ? "bg-success text-white hover:bg-success" : "btn-primary")}>
                      {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Clinic Info */}"""

content = content.replace("{/* Clinic Info */}", jsx_injection)

# 5. Remove original Save Button if on profile
content = content.replace("""{/* Save Button */}
          <div className="flex justify-end mt-4">""", """{/* Save Button */}
          {activeSection !== "profile" && <div className="flex justify-end mt-4">""")

content = content.replace("""</motion.button>
          </div>
        </div>
      </div>""", """</motion.button>
          </div>}
        </div>
      </div>""")


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
