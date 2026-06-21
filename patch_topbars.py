import sys

def patch_topbar(filepath, default_initials, default_name, default_role, profile_link):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update State and Fetch Logic
    # Find useEffect and insert our logic
    state_injection = """
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userName, setUserName] = useState<{first: string, last: string, role: string} | null>(null);

  const fetchProfile = async () => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const token = localStorage.getItem("vcms_token");
      if (!token) return;
      const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUserName({ first: data.firstName || "", last: data.lastName || "", role: data.role || "" });
        if (data.profileImageUrl) {
          setProfilePic(`${baseUrl}${data.profileImageUrl}`);
        } else {
          setProfilePic(null);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);
"""

    if "const [user, setUser]" in content:
        content = content.replace("  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);", state_injection)
        # Remove old useEffect for vcms_user
        import re
        content = re.sub(r'  useEffect\(\(\) => \{\n    try \{\n      const storedUser = localStorage\.getItem\("vcms_user"\);\n      if \(storedUser\) \{\n        setUser\(JSON\.parse\(storedUser\)\);\n      \}\n    \} catch \(e\) \{ \}\n  \}, \[\]\);\n', '', content)
    else:
        # AdminTopbar doesn't have user state
        content = content.replace("  const dropRef = useRef<HTMLDivElement>(null);\n  const notifRef = useRef<HTMLDivElement>(null);", 
            "  const dropRef = useRef<HTMLDivElement>(null);\n  const notifRef = useRef<HTMLDivElement>(null);\n" + state_injection)


    # 2. Update Avatar UI
    if "AdminTopbar" in filepath:
        old_avatar = """<div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
              SA
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">System Admin</p>
              <p className="text-[10px] text-neutral-400 leading-tight">Administrator</p>
            </div>"""
        
        new_avatar = """{profilePic ? (
              <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700" />
            ) : (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {userName ? `${userName.first.charAt(0)}${userName.last.charAt(0)}`.toUpperCase() : "SA"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{userName ? `${userName.first} ${userName.last}` : "System Admin"}</p>
              <p className="text-[10px] text-neutral-400 leading-tight">{userName ? userName.role : "Administrator"}</p>
            </div>"""
        content = content.replace(old_avatar, new_avatar)
    else:
        # VetTopbar
        old_avatar = """<div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user ? getInitials(user.firstName || "", user.lastName || "") : "DR"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{user ? `Dr. ${user.lastName}` : "Veterinarian"}</p>
              <p className="text-[10px] text-neutral-400 leading-tight">Staff</p>
            </div>"""
        
        new_avatar = """{profilePic ? (
              <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700" />
            ) : (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {userName ? `${userName.first.charAt(0)}${userName.last.charAt(0)}`.toUpperCase() : "DR"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{userName ? `Dr. ${userName.last}` : "Veterinarian"}</p>
              <p className="text-[10px] text-neutral-400 leading-tight">{userName ? userName.role : "Staff"}</p>
            </div>"""
        content = content.replace(old_avatar, new_avatar)

    # 3. Update Link
    content = content.replace('{ icon: User, label: "My Profile", href: "#" }', f'{{ icon: User, label: "My Profile", href: "{profile_link}" }}')

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

patch_topbar("frontend/src/components/admin/AdminTopbar.tsx", "SA", "System Admin", "Administrator", "/admin/profile")
patch_topbar("frontend/src/components/vet/VetTopbar.tsx", "DR", "Veterinarian", "Staff", "/vet/profile/settings")

