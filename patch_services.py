import sys

with open("frontend/src/app/admin/services/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import
content = content.replace(
    'import { Plus, Search, Edit, Trash2, Stethoscope, X, Clock, ClipboardList } from "lucide-react";',
    'import { Plus, Search, Edit, Trash2, Stethoscope, X, Clock, ClipboardList } from "lucide-react";\nimport ConfirmationModal from "@/components/ui/ConfirmationModal";'
)

# 2. ServiceModal handleSubmit
content = content.replace(
    '  const [active, setActive] = useState(isEdit ? service.active : true);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !category) {\n      alert("Name and Category are required.");\n      return;\n    }\n    onSave({\n      id: service?.id,\n      name,\n      category,\n      price: Number(price),\n      duration: Number(duration),\n      description,\n      active\n    });\n    onClose();\n  };',
    '  const [active, setActive] = useState(isEdit ? service.active : true);\n  const [showConfirm, setShowConfirm] = useState(false);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !category) {\n      alert("Name and Category are required.");\n      return;\n    }\n    setShowConfirm(true);\n  };\n\n  const handleConfirmSave = () => {\n    onSave({\n      id: service?.id,\n      name,\n      category,\n      price: Number(price),\n      duration: Number(duration),\n      description,\n      active\n    });\n    setShowConfirm(false);\n    onClose();\n  };'
)

# 3. ServiceModal return end
content = content.replace(
    '          </div>\n        </form>\n      </motion.div>\n    </motion.div>\n  );\n}',
    '          </div>\n        </form>\n      </motion.div>\n      <ConfirmationModal\n        isOpen={showConfirm}\n        onClose={() => setShowConfirm(false)}\n        onConfirm={handleConfirmSave}\n        title={isEdit ? "Confirm Updates" : "Confirm Addition"}\n        message={isEdit ? "Are you sure you want to save these changes to the service?" : "Are you sure you want to add this new service?"}\n        confirmText="Yes, Save"\n        cancelText="Cancel"\n        type="info"\n      />\n    </motion.div>\n  );\n}'
)

# 4. ServicesPage handleDelete
content = content.replace(
    '  const handleDelete = async (id: number) => {\n    if (!confirm("Are you sure you want to delete this service?")) return;\n    try {',
    '  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);\n\n  const handleDeleteClick = (id: number) => {\n    setDeleteConfirmId(id);\n  };\n\n  const executeDelete = async () => {\n    if (!deleteConfirmId) return;\n    const id = deleteConfirmId;\n    setDeleteConfirmId(null);\n    try {'
)

# 5. ServicesPage trash button
content = content.replace(
    'onClick={() => handleDelete(service.id)}',
    'onClick={() => handleDeleteClick(service.id)}'
)

# 6. ServicesPage return end
content = content.replace(
    '      </AnimatePresence>\n    </>\n  );\n}',
    '      </AnimatePresence>\n\n      <ConfirmationModal\n        isOpen={deleteConfirmId !== null}\n        onClose={() => setDeleteConfirmId(null)}\n        onConfirm={executeDelete}\n        title="Confirm Deletion"\n        message="Are you sure you want to permanently delete this service? This action cannot be undone."\n        confirmText="Yes, Delete"\n        cancelText="Cancel"\n        type="danger"\n      />\n    </>\n  );\n}'
)

with open("frontend/src/app/admin/services/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
