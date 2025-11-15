/**
 * LocalStorage persistence utility for the Philter MVP
 * Manages all data persistence across user flows
 */

import { Application, RFI, DecisionRecord, ApplicationStatus } from "./types"

// Storage keys
const STORAGE_KEYS = {
  APPLICATIONS: "philter_applications",
  RFIS: "philter_rfis",
  DECISIONS: "philter_decisions",
  CURRENT_USER: "philter_current_user_id",
} as const

// Type-safe storage utilities
export const storage = {
  /**
   * Get all persisted applications, merged with mock data
   */
  getApplications: (mockApplications: Application[]): Application[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (!stored) return mockApplications

      const persistedApps: Partial<Application>[] = JSON.parse(stored)

      // Merge persisted changes with mock data
      return mockApplications.map(mockApp => {
        const persisted = persistedApps.find(p => p.id === mockApp.id)
        if (!persisted) return mockApp

        // Merge, with persisted data taking precedence
        return {
          ...mockApp,
          ...persisted,
          // Ensure dates are Date objects
          createdAt: persisted.createdAt ? new Date(persisted.createdAt) : mockApp.createdAt,
          lastActivityAt: persisted.lastActivityAt ? new Date(persisted.lastActivityAt) : mockApp.lastActivityAt,
          submittedAt: persisted.submittedAt ? new Date(persisted.submittedAt) : mockApp.submittedAt,
        }
      })
    } catch (error) {
      console.error("Error loading applications from localStorage:", error)
      return mockApplications
    }
  },

  /**
   * Get a single application by ID
   */
  getApplication: (id: string, mockApplications: Application[]): Application | undefined => {
    const apps = storage.getApplications(mockApplications)
    return apps.find(app => app.id === id)
  },

  /**
   * Update an application's data
   */
  updateApplication: (id: string, updates: Partial<Application>): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      const apps: Partial<Application>[] = stored ? JSON.parse(stored) : []

      const index = apps.findIndex(app => app.id === id)
      if (index >= 0) {
        apps[index] = { ...apps[index], ...updates, id }
      } else {
        apps.push({ ...updates, id })
      }

      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps))
    } catch (error) {
      console.error("Error saving application to localStorage:", error)
    }
  },

  /**
   * Update application status
   */
  updateApplicationStatus: (id: string, status: ApplicationStatus): void => {
    storage.updateApplication(id, {
      status,
      lastActivityAt: new Date()
    })
  },

  /**
   * Get all RFIs, merged with mock data
   */
  getRFIs: (mockRFIs: RFI[]): RFI[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RFIS)
      if (!stored) return mockRFIs

      const persistedRFIs: RFI[] = JSON.parse(stored)

      // Convert date strings back to Date objects
      const parsedRFIs = persistedRFIs.map(rfi => ({
        ...rfi,
        createdAt: new Date(rfi.createdAt),
        resolvedAt: rfi.resolvedAt ? new Date(rfi.resolvedAt) : undefined,
        messages: rfi.messages.map(msg => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }))
      }))

      // Merge: persisted RFIs override mock RFIs, plus any new ones
      const mockRFIIds = new Set(mockRFIs.map(r => r.id))
      const mergedRFIs = [
        ...mockRFIs.map(mockRFI => {
          const persisted = parsedRFIs.find(p => p.id === mockRFI.id)
          return persisted || mockRFI
        }),
        // Add any persisted RFIs that don't exist in mock data
        ...parsedRFIs.filter(rfi => !mockRFIIds.has(rfi.id))
      ]

      return mergedRFIs
    } catch (error) {
      console.error("Error loading RFIs from localStorage:", error)
      return mockRFIs
    }
  },

  /**
   * Get RFIs for a specific application
   */
  getRFIsForApplication: (applicationId: string, mockRFIs: RFI[]): RFI[] => {
    const allRFIs = storage.getRFIs(mockRFIs)
    return allRFIs.filter(rfi => rfi.applicationId === applicationId)
  },

  /**
   * Save all RFIs
   */
  saveRFIs: (rfis: RFI[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.RFIS, JSON.stringify(rfis))
    } catch (error) {
      console.error("Error saving RFIs to localStorage:", error)
    }
  },

  /**
   * Add a new RFI
   */
  addRFI: (rfi: RFI, mockRFIs: RFI[]): void => {
    const allRFIs = storage.getRFIs(mockRFIs)
    allRFIs.push(rfi)
    storage.saveRFIs(allRFIs)
  },

  /**
   * Update an existing RFI
   */
  updateRFI: (rfiId: string, updates: Partial<RFI>, mockRFIs: RFI[]): void => {
    const allRFIs = storage.getRFIs(mockRFIs)
    const index = allRFIs.findIndex(rfi => rfi.id === rfiId)

    if (index >= 0) {
      allRFIs[index] = { ...allRFIs[index], ...updates }
      storage.saveRFIs(allRFIs)
    }
  },

  /**
   * Get all decisions
   */
  getDecisions: (): DecisionRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DECISIONS)
      if (!stored) return []

      const decisions: DecisionRecord[] = JSON.parse(stored)
      return decisions.map(decision => ({
        ...decision,
        timestamp: new Date(decision.timestamp)
      }))
    } catch (error) {
      console.error("Error loading decisions from localStorage:", error)
      return []
    }
  },

  /**
   * Get decision for a specific application
   */
  getDecisionForApplication: (applicationId: string): DecisionRecord | undefined => {
    const decisions = storage.getDecisions()
    return decisions.find(d => d.applicationId === applicationId)
  },

  /**
   * Save a decision
   */
  saveDecision: (decision: DecisionRecord): void => {
    try {
      const decisions = storage.getDecisions()
      const index = decisions.findIndex(d => d.applicationId === decision.applicationId)

      if (index >= 0) {
        decisions[index] = decision
      } else {
        decisions.push(decision)
      }

      localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions))
    } catch (error) {
      console.error("Error saving decision to localStorage:", error)
    }
  },

  /**
   * Sync form data (profile, income, etc.) to application object
   */
  syncFormDataToApplication: (applicationId: string): void => {
    try {
      const formSections = [
        'profile',
        'income',
        'financials',
        'documents',
        'disclosures'
      ];

      const formData: Record<string, any> = {};
      let hasData = false;

      // Collect all form data
      formSections.forEach(section => {
        const data = localStorage.getItem(`${section}_${applicationId}`);
        if (data) {
          formData[section] = JSON.parse(data);
          hasData = true;
        }
      });

      // If we have form data, update the application
      if (hasData) {
        storage.updateApplication(applicationId, {
          sections: Object.keys(formData).map(key => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            isComplete: true,
            data: formData[key]
          }))
        });
      }
    } catch (error) {
      console.error("Error syncing form data to application:", error);
    }
  },

  /**
   * Clear all persisted data (useful for testing/reset)
   */
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.CURRENT_USER) {
        localStorage.removeItem(key)
      }
    })
  }
}
