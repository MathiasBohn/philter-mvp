"use client"

import { createProtectedLayout } from "@/lib/create-protected-layout"
import { Role } from "@/lib/types"

// Allow applicants, co-applicants, guarantors, and brokers to access application editing
// Note: ADMIN (Transaction Agent) should use /agent/review/[id] to review applications
// Board members should use /board/review/[id] for their review workflow
export default createProtectedLayout([
  Role.APPLICANT,
  Role.CO_APPLICANT,
  Role.GUARANTOR,
  Role.BROKER,
])
