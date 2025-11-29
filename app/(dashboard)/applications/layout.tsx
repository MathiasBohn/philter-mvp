"use client"

import { createProtectedLayout } from "@/lib/create-protected-layout"
import { Role } from "@/lib/types"

// Allow applicants, brokers, agents (ADMIN), and board members to view applications
// Note: ADMIN and BOARD can view applications for review purposes
// The actual edit permissions are controlled by the API/RLS policies
export default createProtectedLayout([
  Role.APPLICANT,
  Role.CO_APPLICANT,
  Role.GUARANTOR,
  Role.BROKER,
  Role.ADMIN,
  Role.BOARD,
])
