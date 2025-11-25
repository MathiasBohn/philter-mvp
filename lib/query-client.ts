import { QueryClient, DefaultOptions } from '@tanstack/react-query'

/**
 * Default options for React Query
 *
 * Configures cache times and stale times for optimal performance:
 * - Applications: 5 minutes stale time (updated frequently)
 * - Documents: 1 minute stale time (uploaded/deleted regularly)
 * - Templates: 30 minutes stale time (rarely change)
 * - User profile: 10 minutes stale time (occasionally updated)
 */
const queryConfig: DefaultOptions = {
  queries: {
    // How long data is considered fresh (no refetch needed)
    staleTime: 5 * 60 * 1000, // 5 minutes default

    // How long unused data stays in cache
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

    // Refetch on window focus (good for real-time updates)
    refetchOnWindowFocus: true,

    // Refetch on mount if stale
    refetchOnMount: true,

    // Retry failed requests
    retry: 1,

    // Retry delay (exponential backoff)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
  },
}

/**
 * Creates a new QueryClient instance with configured defaults
 *
 * @returns QueryClient instance for React Query
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

/**
 * Singleton query client for client-side usage
 *
 * Do not use this in Server Components - create a new client instead
 */
let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient()
  } else {
    // Browser: reuse the same client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

/**
 * Query keys for consistent cache invalidation
 *
 * Usage:
 * - Use these constants for all query keys
 * - Makes it easy to invalidate related queries
 * - Provides type safety for query keys
 */
export const queryKeys = {
  // Applications
  applications: {
    all: ['applications'] as const,
    detail: (id: string) => ['applications', id] as const,
    participants: (id: string) => ['applications', id, 'participants'] as const,
  },

  // Documents
  documents: {
    byApplication: (applicationId: string) => ['documents', applicationId] as const,
    detail: (id: string) => ['document', id] as const,
  },

  // RFIs
  rfis: {
    all: ['rfis'] as const,
    byApplication: (applicationId: string) => ['rfis', applicationId] as const,
    detail: (id: string) => ['rfi', id] as const,
    messages: (rfiId: string) => ['rfi', rfiId, 'messages'] as const,
  },

  // Templates
  templates: {
    all: ['templates'] as const,
    detail: (id: string) => ['templates', id] as const,
    byBuilding: (buildingId: string) => ['templates', 'building', buildingId] as const,
  },

  // Decisions
  decisions: {
    byApplication: (applicationId: string) => ['decision', applicationId] as const,
  },

  // Users
  users: {
    current: ['user', 'me'] as const,
    profile: (userId: string) => ['user', userId] as const,
    search: (query: string, role?: string) => ['users', 'search', query, role] as const,
  },

  // Buildings
  buildings: {
    all: ['buildings'] as const,
    detail: (id: string) => ['buildings', id] as const,
  },

  // Activity Log
  activityLog: {
    all: (filters?: Record<string, unknown>) => ['activity-log', filters] as const,
    byApplication: (applicationId: string) => ['activity-log', 'application', applicationId] as const,
  },

  // People
  people: {
    byApplication: (applicationId: string) => ['people', applicationId] as const,
    detail: (id: string) => ['person', id] as const,
  },

  // Employment
  employment: {
    byApplication: (applicationId: string) => ['employment', applicationId] as const,
    detail: (id: string) => ['employment', id] as const,
  },

  // Financials
  financials: {
    byApplication: (applicationId: string) => ['financials', applicationId] as const,
    detail: (id: string) => ['financial', id] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
    byId: (id: string) => ['notifications', id] as const,
  },
} as const
