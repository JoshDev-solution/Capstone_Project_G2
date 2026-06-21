import sys

with open("frontend/src/app/admin/pets/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import
content = content.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport ConfirmationModal from "@/components/ui/ConfirmationModal";'
)

# 2. PetFormModal handleSubmit
content = content.replace(
    'const [status, setStatus] = useState(isEdit ? pet.status : "Active");\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !species || !ownerName.trim() || !ownerEmail.trim()) {\n      alert("Name, Species, Owner Name, and Owner Email are required.");\n      return;\n    }\n    onSave({\n      id: pet?.id,\n      name,\n      species,\n      breed,\n      sex,\n      dob,\n      weight: Number(weight),\n      color,\n      microchip: pet?.microchip || "",\n      ownerName,\n      ownerEmail,\n      status\n    });\n    onClose();\n  };',
    'const [status, setStatus] = useState(isEdit ? pet.status : "Active");\n  const [showConfirm, setShowConfirm] = useState(false);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !species || !ownerName.trim() || !ownerEmail.trim()) {\n      alert("Name, Species, Owner Name, and Owner Email are required.");\n      return;\n    }\n    setShowConfirm(true);\n  };\n\n  const handleConfirmSave = () => {\n    onSave({\n      id: pet?.id,\n      name,\n      species,\n      breed,\n      sex,\n      dob,\n      weight: Number(weight),\n      color,\n      microchip: pet?.microchip || "",\n      ownerName,\n      ownerEmail,\n      status\n    });\n    setShowConfirm(false);\n    onClose();\n  };'
)

# 3. PetFormModal return
content = content.replace(
    '        </form>\n      </motion.div>\n    </motion.div>\n  );\n}\n\nexport default function PetsPage() {',
    '        </form>\n      </motion.div>\n      <ConfirmationModal\n        isOpen={showConfirm}\n        onClose={() => setShowConfirm(false)}\n        onConfirm={handleConfirmSave}\n        title={isEdit ? "Confirm Updates" : "Confirm Registration"}\n        message={isEdit ? "Are you sure you want to save these changes to the pet\'s profile?" : "Are you sure you want to register this new pet?"}\n        confirmText="Yes, Save"\n        cancelText="Cancel"\n        type="info"\n      />\n    </motion.div>\n  );\n}\n\nexport default function PetsPage() {'
)

# 4. PetsPage handleDelete
content = content.replace(
    '  const handleDelete = async (id: number) => {\n    if (!confirm("Are you sure you want to delete this pet?")) return;\n    try {',
    '  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);\n\n  const handleDeleteClick = (id: number) => {\n    setDeleteConfirmId(id);\n  };\n\n  const executeDelete = async () => {\n    if (!deleteConfirmId) return;\n    const id = deleteConfirmId;\n    setDeleteConfirmId(null);\n    try {'
)

# 5. PetsPage trash button
content = content.replace(
    'onClick={() => handleDelete(pet.id)}',
    'onClick={() => handleDeleteClick(pet.id)}'
)

# 6. PetsPage return end
content = content.replace(
    '        {showForm && <PetFormModal pet={formPet || undefined} onClose={() => setShowForm(false)} onSave={handleSave} clients={clients} />}\n      </AnimatePresence>\n    </>\n  );\n}',
    '        {showForm && <PetFormModal pet={formPet || undefined} onClose={() => setShowForm(false)} onSave={handleSave} clients={clients} />}\n      </AnimatePresence>\n      <ConfirmationModal\n        isOpen={deleteConfirmId !== null}\n        onClose={() => setDeleteConfirmId(null)}\n        onConfirm={executeDelete}\n        title="Confirm Deletion"\n        message="Are you sure you want to permanently delete this pet record? This action cannot be undone."\n        confirmText="Yes, Delete"\n        cancelText="Cancel"\n        type="danger"\n      />\n    </>\n  );\n}'
)

with open("frontend/src/app/admin/pets/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
