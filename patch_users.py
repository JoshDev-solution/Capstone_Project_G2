import sys

with open("frontend/src/app/admin/users/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import
content = content.replace(
    'import { cn, getInitials } from "@/lib/utils";',
    'import { cn, getInitials } from "@/lib/utils";\nimport ConfirmationModal from "@/components/ui/ConfirmationModal";'
)

# 2. UserFormModal handleSubmit
content = content.replace(
    'const [status, setStatus] = useState<Status>(isEdit ? user.status : "Active");\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !role || (!isEdit && !password.trim())) {\n      alert("Please fill out all required fields.");\n      return;\n    }\n    onSave({\n      id: user?.id,\n      name: `${firstName} ${lastName}`,\n      email,\n      phone,\n      password,\n      role,\n      status,\n    });\n    onClose();\n  };',
    'const [status, setStatus] = useState<Status>(isEdit ? user.status : "Active");\n  const [showConfirm, setShowConfirm] = useState(false);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !role || (!isEdit && !password.trim())) {\n      alert("Please fill out all required fields.");\n      return;\n    }\n    setShowConfirm(true);\n  };\n\n  const handleConfirmSave = () => {\n    onSave({\n      id: user?.id,\n      name: `${firstName} ${lastName}`,\n      email,\n      phone,\n      password,\n      role,\n      status,\n    });\n    setShowConfirm(false);\n    onClose();\n  };'
)

# 3. UserFormModal return
content = content.replace(
    '        </form>\n      </motion.div>\n    </motion.div>\n  );\n}\n\nexport default function UsersPage() {',
    '        </form>\n      </motion.div>\n      <ConfirmationModal\n        isOpen={showConfirm}\n        onClose={() => setShowConfirm(false)}\n        onConfirm={handleConfirmSave}\n        title={isEdit ? "Confirm Updates" : "Confirm Registration"}\n        message={isEdit ? "Are you sure you want to save these changes to the user account?" : "Are you sure you want to create this new user account?"}\n        confirmText="Yes, Save"\n        cancelText="Cancel"\n        type="info"\n      />\n    </motion.div>\n  );\n}\n\nexport default function UsersPage() {'
)

# 4. UsersPage handleDelete
content = content.replace(
    '  const handleDelete = async (id: number) => {\n    if (!confirm("Are you sure you want to delete this user?")) return;\n    try {',
    '  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);\n\n  const handleDeleteClick = (id: number) => {\n    setDeleteConfirmId(id);\n  };\n\n  const executeDelete = async () => {\n    if (!deleteConfirmId) return;\n    const id = deleteConfirmId;\n    setDeleteConfirmId(null);\n    try {'
)

# 5. UsersPage trash button
content = content.replace(
    'onClick={() => handleDelete(u.id)}',
    'onClick={() => handleDeleteClick(u.id)}'
)

# 6. UsersPage return end
# Note: UsersPage ALREADY has a local confirmation modal for toggling status at the end.
# We will just append our ConfirmationModal right before `</AnimatePresence>\n    </div>\n  );\n}` at the very bottom.
# Actually wait, `UsersPage` has a wrapper `<div>` at the root.
content = content.replace(
    '        {showForm && <UserFormModal user={formUser || undefined} onClose={() => setShowForm(false)} onSave={handleSave} />}\n      </AnimatePresence>\n    </div>\n  );\n}',
    '        {showForm && <UserFormModal user={formUser || undefined} onClose={() => setShowForm(false)} onSave={handleSave} />}\n      </AnimatePresence>\n\n      <ConfirmationModal\n        isOpen={deleteConfirmId !== null}\n        onClose={() => setDeleteConfirmId(null)}\n        onConfirm={executeDelete}\n        title="Confirm Deletion"\n        message="Are you sure you want to permanently delete this user? This action cannot be undone."\n        confirmText="Yes, Delete"\n        cancelText="Cancel"\n        type="danger"\n      />\n    </div>\n  );\n}'
)

with open("frontend/src/app/admin/users/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
