import sys

with open("frontend/src/app/admin/registrations/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import
content = content.replace(
    'import { CheckCircle, XCircle, Eye, Search, Clock, User, PawPrint, Mail, Phone, X } from "lucide-react";',
    'import { CheckCircle, XCircle, Eye, Search, Clock, User, PawPrint, Mail, Phone, X } from "lucide-react";\nimport ConfirmationModal from "@/components/ui/ConfirmationModal";'
)

# 2. Add confirm state to RegistrationsPage
content = content.replace(
    '  const [error, setError] = useState("");\n\n  const fetchRegistrations = async () => {',
    '  const [error, setError] = useState("");\n  const [confirmState, setConfirmState] = useState<{ open: boolean; action: "approve" | "reject"; id: number | null }>({ open: false, action: "approve", id: null });\n\n  const fetchRegistrations = async () => {'
)

# 3. Update approve/reject to handle confirmation
content = content.replace(
    '  const approve = async (id: number) => {\n    try {',
    '  const executeApprove = async (id: number) => {\n    try {'
)

content = content.replace(
    '  const reject = async (id: number) => {\n    try {',
    '  const executeReject = async (id: number) => {\n    try {'
)

content = content.replace(
    '  const approve = async (id: number) => {',
    '  const handleApproveClick = (id: number) => { setConfirmState({ open: true, action: "approve", id }); };\n\n  const executeApprove = async (id: number) => {'
)

content = content.replace(
    '  const reject = async (id: number) => {',
    '  const handleRejectClick = (id: number) => { setConfirmState({ open: true, action: "reject", id }); };\n\n  const executeReject = async (id: number) => {'
)

# 4. Replace approve/reject calls
content = content.replace(
    'onApprove={approve}',
    'onApprove={handleApproveClick}'
)

content = content.replace(
    'onReject={reject}',
    'onReject={handleRejectClick}'
)

content = content.replace(
    'onClick={() => reject(reg.id)}',
    'onClick={() => handleRejectClick(reg.id)}'
)

content = content.replace(
    'onClick={() => approve(reg.id)}',
    'onClick={() => handleApproveClick(reg.id)}'
)

# 5. Append ConfirmationModal
content = content.replace(
    '      </AnimatePresence>\n    </>\n  );\n}',
    '      </AnimatePresence>\n\n      <ConfirmationModal\n        isOpen={confirmState.open}\n        onClose={() => setConfirmState({ ...confirmState, open: false })}\n        onConfirm={() => {\n          if (confirmState.id !== null) {\n            if (confirmState.action === "approve") executeApprove(confirmState.id);\n            else executeReject(confirmState.id);\n          }\n          setConfirmState({ ...confirmState, open: false });\n        }}\n        title={confirmState.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}\n        message={`Are you sure you want to ${confirmState.action} this registration?`}\n        confirmText={confirmState.action === "approve" ? "Yes, Approve" : "Yes, Reject"}\n        cancelText="Cancel"\n        type={confirmState.action === "approve" ? "success" : "danger"}\n      />\n    </>\n  );\n}'
)

with open("frontend/src/app/admin/registrations/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
