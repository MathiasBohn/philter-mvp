/**
 * LocalStorage persistence utility for the Philter MVP
 * Manages all data persistence across user flows
 * Features: Compression, Chunking, Error Recovery
 */

import { Application, RFI, DecisionRecord, ApplicationStatus } from "./types"
import * as LZString from "lz-string"

// Storage keys
const STORAGE_KEYS = {
  APPLICATIONS: "philter_applications",
  RFIS: "philter_rfis",
  DECISIONS: "philter_decisions",
  CURRENT_USER: "philter_current_user_id",
} as const

// Configuration
const CHUNK_SIZE = 50000 // Max chars per chunk (to stay well under localStorage limits)
const COMPRESSION_THRESHOLD = 1000 // Compress data larger than 1KB

/**
 * Optimized storage helper utilities
 * Implements compression and chunking to handle large data
 */
const storageHelper = {
  /**
   * Compress data using LZ-String if it exceeds threshold
   */
  compress: (data: string): string => {
    if (data.length > COMPRESSION_THRESHOLD) {
      return LZString.compressToUTF16(data)
    }
    return data
  },

  /**
   * Decompress data (handles both compressed and uncompressed)
   */
  decompress: (data: string): string => {
    try {
      const decompressed = LZString.decompressFromUTF16(data)
      return decompressed || data // If decompression fails, return original
    } catch {
      return data // Return original if not compressed
    }
  },

  /**
   * Split data into chunks if it exceeds chunk size
   */
  chunkData: (key: string, data: string): void => {
    const chunks = Math.ceil(data.length / CHUNK_SIZE)

    if (chunks === 1) {
      // Data fits in one chunk, store normally
      localStorage.setItem(key, data)
      // Clean up any old chunks
      localStorage.removeItem(`${key}_chunks`)
      let i = 0
      while (localStorage.getItem(`${key}_chunk_${i}`)) {
        localStorage.removeItem(`${key}_chunk_${i}`)
        i++
      }
    } else {
      // Store in chunks
      localStorage.setItem(`${key}_chunks`, chunks.toString())
      for (let i = 0; i < chunks; i++) {
        const chunk = data.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        localStorage.setItem(`${key}_chunk_${i}`, chunk)
      }
      // Clean up the main key if it exists
      localStorage.removeItem(key)
    }
  },

  /**
   * Retrieve chunked data
   */
  unchunkData: (key: string): string | null => {
    const chunksCount = localStorage.getItem(`${key}_chunks`)

    if (!chunksCount) {
      // Not chunked, retrieve normally
      return localStorage.getItem(key)
    }

    // Retrieve and combine chunks
    const chunks: string[] = []
    const count = parseInt(chunksCount, 10)

    for (let i = 0; i < count; i++) {
      const chunk = localStorage.getItem(`${key}_chunk_${i}`)
      if (!chunk) {
        console.error(`Missing chunk ${i} for key ${key}`)
        return null
      }
      chunks.push(chunk)
    }

    return chunks.join("")
  },

  /**
   * Safe set with compression and chunking
   */
  safeSet: (key: string, value: unknown): void => {
    try {
      const jsonString = JSON.stringify(value)
      const compressed = storageHelper.compress(jsonString)
      storageHelper.chunkData(key, compressed)
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error)
      // Fallback: try storing without compression
      try {
        const jsonString = JSON.stringify(value)
        storageHelper.chunkData(key, jsonString)
      } catch (fallbackError) {
        console.error(`Fallback storage also failed for key ${key}:`, fallbackError)
      }
    }
  },

  /**
   * Safe get with decompression and unchunking
   */
  safeGet: <T>(key: string, defaultValue: T): T => {
    try {
      const data = storageHelper.unchunkData(key)
      if (!data) return defaultValue

      const decompressed = storageHelper.decompress(data)
      return JSON.parse(decompressed) as T
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error)
      return defaultValue
    }
  },

  /**
   * Remove item and all its chunks
   */
  safeRemove: (key: string): void => {
    localStorage.removeItem(key)
    localStorage.removeItem(`${key}_chunks`)
    let i = 0
    while (localStorage.getItem(`${key}_chunk_${i}`)) {
      localStorage.removeItem(`${key}_chunk_${i}`)
      i++
    }
  }
}

// Type-safe storage utilities
export const storage = {
  /**
   * Get all persisted applications, merged with mock data
   */
  getApplications: (mockApplications: Application[]): Application[] => {
    try {
      const persistedApps: Partial<Application>[] = storageHelper.safeGet(
        STORAGE_KEYS.APPLICATIONS,
        []
      )

      if (persistedApps.length === 0) return mockApplications

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
      const apps: Partial<Application>[] = storageHelper.safeGet(
        STORAGE_KEYS.APPLICATIONS,
        []
      )

      const index = apps.findIndex(app => app.id === id)
      if (index >= 0) {
        apps[index] = { ...apps[index], ...updates, id }
      } else {
        apps.push({ ...updates, id })
      }

      storageHelper.safeSet(STORAGE_KEYS.APPLICATIONS, apps)
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
      const persistedRFIs: RFI[] = storageHelper.safeGet(STORAGE_KEYS.RFIS, [])

      if (persistedRFIs.length === 0) return mockRFIs

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
      storageHelper.safeSet(STORAGE_KEYS.RFIS, rfis)
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
      const decisions: DecisionRecord[] = storageHelper.safeGet(
        STORAGE_KEYS.DECISIONS,
        []
      )
      return decisions.map(decision => ({
        ...decision,
        decidedAt: new Date(decision.decidedAt)
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

      storageHelper.safeSet(STORAGE_KEYS.DECISIONS, decisions)
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

      const formData: Record<string, unknown> = {};
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
        storageHelper.safeRemove(key)
      }
    })
  }
}

/**
 * Export storage helper for direct use in components if needed
 */
export { storageHelper }
