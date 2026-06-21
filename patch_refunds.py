import sys

with open("frontend/src/app/admin/refunds/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import
content = content.replace(
    'import { cn } from "@/lib/utils";',
    'import { cn } from "@/lib/utils";\nimport ConfirmationModal from "@/components/ui/ConfirmationModal";'
)

# 2. Add confirm state to RefundsPage
content = content.replace(
    '  const [error, setError] = useState("");\n  const PER_PAGE = 8;',
    '  const [error, setError] = useState("");\n  const [confirmState, setConfirmState] = useState<{ open: boolean; action: "approve" | "reject" | "process"; id: number | null }>({ open: false, action: "approve", id: null });\n  const PER_PAGE = 8;'
)

# 3. Update actions to handle confirmation
content = content.replace(
    '  const approve = (id: number) => updateStatus(id, "Approved");\n  const reject = (id: number) => updateStatus(id, "Rejected");\n  const process_ = (id: number) => updateStatus(id, "Processed");',
    '  const executeApprove = (id: number) => updateStatus(id, "Approved");\n  const executeReject = (id: number) => updateStatus(id, "Rejected");\n  const executeProcess = (id: number) => updateStatus(id, "Processed");\n\n  const handleApproveClick = (id: number) => { setConfirmState({ open: true, action: "approve", id }); };\n  const handleRejectClick = (id: number) => { setConfirmState({ open: true, action: "reject", id }); };\n  const handleProcessClick = (id: number) => { setConfirmState({ open: true, action: "process", id }); };'
)

# 4. Replace approve/reject/process calls
content = content.replace(
    'onApprove={approve}',
    'onApprove={handleApproveClick}'
)
content = content.replace(
    'onReject={reject}',
    'onReject={handleRejectClick}'
)
content = content.replace(
    'onProcess={process_}',
    'onProcess={handleProcessClick}'
)
content = content.replace(
    'onClick={() => approve(r.id)}',
    'onClick={() => handleApproveClick(r.id)}'
)
content = content.replace(
    'onClick={() => reject(r.id)}',
    'onClick={() => handleRejectClick(r.id)}'
)
content = content.replace(
    'onClick={() => process_(r.id)}',
    'onClick={() => handleProcessClick(r.id)}'
)

# 5. Append ConfirmationModal
content = content.replace(
    '      </AnimatePresence>\n    </>\n  );\n}',
    '      </AnimatePresence>\n\n      <ConfirmationModal\n        isOpen={confirmState.open}\n        onClose={() => setConfirmState({ ...confirmState, open: false })}\n        onConfirm={() => {\n          if (confirmState.id !== null) {\n            if (confirmState.action === "approve") executeApprove(confirmState.id);\n            else if (confirmState.action === "reject") executeReject(confirmState.id);\n            else executeProcess(confirmState.id);\n          }\n          setConfirmState({ ...confirmState, open: false });\n        }}\n        title={`Confirm ${confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1)}`}\n        message={`Are you sure you want to ${confirmState.action} this refund request?`}\n        confirmText={`Yes, ${confirmState.action.charAt(0).toUpperCase() + confirmState.action.slice(1)}`}\n        cancelText="Cancel"\n        type={confirmState.action === "approve" ? "success" : confirmState.action === "reject" ? "danger" : "info"}\n      />\n    </>\n  );\n}'
)

with open("frontend/src/app/admin/refunds/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
