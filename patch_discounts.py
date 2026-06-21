import sys

with open("frontend/src/app/admin/discounts/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import
content = content.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport ConfirmationModal from "@/components/ui/ConfirmationModal";'
)

# 2. DiscountModal handleSubmit
content = content.replace(
    '  const [active, setActive] = useState(isEdit ? discount.active : true);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !code.trim() || !type) {\n      alert("Name, Code, and Type are required.");\n      return;\n    }\n    onSave({\n      id: discount?.id,\n      name,\n      code: code.toUpperCase(),\n      type,\n      value: Number(value),\n      minPurchase: Number(minPurchase),\n      startDate,\n      endDate,\n      usageLimit: usageLimit === "" ? null : Number(usageLimit),\n      active\n    });\n    onClose();\n  };',
    '  const [active, setActive] = useState(isEdit ? discount.active : true);\n  const [showConfirm, setShowConfirm] = useState(false);\n\n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!name.trim() || !code.trim() || !type) {\n      alert("Name, Code, and Type are required.");\n      return;\n    }\n    setShowConfirm(true);\n  };\n\n  const handleConfirmSave = () => {\n    onSave({\n      id: discount?.id,\n      name,\n      code: code.toUpperCase(),\n      type,\n      value: Number(value),\n      minPurchase: Number(minPurchase),\n      startDate,\n      endDate,\n      usageLimit: usageLimit === "" ? null : Number(usageLimit),\n      active\n    });\n    setShowConfirm(false);\n    onClose();\n  };'
)

# 3. DiscountModal return end
content = content.replace(
    '          </div>\n        </form>\n      </motion.div>\n    </motion.div>\n  );\n}',
    '          </div>\n        </form>\n      </motion.div>\n      <ConfirmationModal\n        isOpen={showConfirm}\n        onClose={() => setShowConfirm(false)}\n        onConfirm={handleConfirmSave}\n        title={isEdit ? "Confirm Updates" : "Confirm Addition"}\n        message={isEdit ? "Are you sure you want to save these changes to the discount?" : "Are you sure you want to create this new discount?"}\n        confirmText="Yes, Save"\n        cancelText="Cancel"\n        type="info"\n      />\n    </motion.div>\n  );\n}'
)

# 4. DiscountsPage handleDelete
content = content.replace(
    '  const handleDelete = async (id: number) => {\n    if (!confirm("Are you sure you want to delete this discount?")) return;\n    try {',
    '  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);\n\n  const handleDeleteClick = (id: number) => {\n    setDeleteConfirmId(id);\n  };\n\n  const executeDelete = async () => {\n    if (!deleteConfirmId) return;\n    const id = deleteConfirmId;\n    setDeleteConfirmId(null);\n    try {'
)

# 5. DiscountsPage trash button
content = content.replace(
    'onClick={() => handleDelete(d.id)}',
    'onClick={() => handleDeleteClick(d.id)}'
)

# 6. DiscountsPage return end
content = content.replace(
    '      </AnimatePresence>\n    </>\n  );\n}',
    '      </AnimatePresence>\n\n      <ConfirmationModal\n        isOpen={deleteConfirmId !== null}\n        onClose={() => setDeleteConfirmId(null)}\n        onConfirm={executeDelete}\n        title="Confirm Deletion"\n        message="Are you sure you want to permanently delete this discount? This action cannot be undone."\n        confirmText="Yes, Delete"\n        cancelText="Cancel"\n        type="danger"\n      />\n    </>\n  );\n}'
)

with open("frontend/src/app/admin/discounts/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
