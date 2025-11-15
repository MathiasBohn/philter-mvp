"use client"

import { createProtectedLayout } from "@/lib/create-protected-layout"
import { Role } from "@/lib/types"

export default createProtectedLayout([Role.BROKER])
