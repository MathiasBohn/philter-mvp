/**
 * Centralized routing utilities for role-based navigation
 *
 * This module provides consistent routing logic across the application
 * for redirecting users to their appropriate dashboards based on their role.
 */

import { Role } from "@/lib/types"

/**
 * Role-to-dashboard mapping
 * Each role has a default dashboard they should be redirected to
 */
const ROLE_DASHBOARDS: Record<Role, string> = {
  [Role.APPLICANT]: "/my-applications",
  [Role.CO_APPLICANT]: "/my-applications",
  [Role.GUARANTOR]: "/my-applications",
  [Role.BROKER]: "/broker",
  [Role.ADMIN]: "/agent/inbox",
  [Role.BOARD]: "/board",
  // These participant roles don't have dedicated dashboards, default to my-applications
  [Role.UNIT_OWNER]: "/my-applications",
  [Role.OWNER_BROKER]: "/my-applications",
  [Role.OWNER_ATTORNEY]: "/my-applications",
  [Role.APPLICANT_ATTORNEY]: "/my-applications",
}

/**
 * Role-to-dashboard label mapping for UI display
 */
const ROLE_DASHBOARD_LABELS: Record<Role, string> = {
  [Role.APPLICANT]: "My Applications",
  [Role.CO_APPLICANT]: "My Applications",
  [Role.GUARANTOR]: "My Applications",
  [Role.BROKER]: "Broker Dashboard",
  [Role.ADMIN]: "Agent Portal",
  [Role.BOARD]: "Board Portal",
  [Role.UNIT_OWNER]: "My Applications",
  [Role.OWNER_BROKER]: "My Applications",
  [Role.OWNER_ATTORNEY]: "My Applications",
  [Role.APPLICANT_ATTORNEY]: "My Applications",
}

/**
 * Get the default dashboard URL for a given role
 * @param role - The user's role
 * @returns The dashboard URL path
 */
export function getDashboardForRole(role: Role | string | undefined | null): string {
  if (!role) {
    return "/my-applications"
  }

  // Handle string role values (from database)
  const roleKey = role as Role
  return ROLE_DASHBOARDS[roleKey] || "/my-applications"
}

/**
 * Get the dashboard label for UI display
 * @param role - The user's role
 * @returns Human-readable dashboard name
 */
export function getDashboardLabel(role: Role | string | undefined | null): string {
  if (!role) {
    return "Dashboard"
  }

  const roleKey = role as Role
  return ROLE_DASHBOARD_LABELS[roleKey] || "Dashboard"
}

/**
 * Check if a role can access a specific route
 * @param role - The user's role
 * @param path - The route path being accessed
 * @returns Whether the role is allowed to access the route
 */
export function canAccessRoute(role: Role | string | undefined | null, path: string): boolean {
  if (!role) return false

  const roleKey = role as Role

  // Agent routes - only ADMIN
  if (path.startsWith("/agent")) {
    return roleKey === Role.ADMIN
  }

  // Board routes - only BOARD
  if (path.startsWith("/board")) {
    return roleKey === Role.BOARD
  }

  // Broker routes - only BROKER
  if (path.startsWith("/broker")) {
    return roleKey === Role.BROKER
  }

  // Application editing routes - APPLICANT, CO_APPLICANT, GUARANTOR, BROKER
  if (path.startsWith("/applications/") && path !== "/applications/new") {
    return [Role.APPLICANT, Role.CO_APPLICANT, Role.GUARANTOR, Role.BROKER].includes(roleKey)
  }

  // My applications - all authenticated users
  if (path.startsWith("/my-applications")) {
    return true
  }

  // Settings/help - all authenticated users
  if (path.startsWith("/settings") || path.startsWith("/help-support")) {
    return true
  }

  return true
}

/**
 * Get the appropriate redirect URL when a user doesn't have access to a route
 * @param role - The user's role
 * @param attemptedPath - The route they were trying to access
 * @returns The redirect URL
 */
export function getAccessDeniedRedirect(role: Role | string | undefined | null, attemptedPath: string): string {
  // If user has no role, redirect to sign-in
  if (!role) {
    return "/sign-in"
  }

  // Otherwise redirect to their dashboard
  return getDashboardForRole(role)
}
