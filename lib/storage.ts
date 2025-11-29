/**
 * StorageService - Centralized localStorage management with caching and observability
 *
 * Features:
 * - In-memory cache to reduce localStorage reads
 * - Observer pattern for reactive updates
 * - Type-safe API with generics
 * - Built on existing compression/chunking from persistence.ts
 * - Ready for async/Web Worker migration
 */

"use client";

import React from "react";

type StorageKey = string;
type Listener<T> = (value: T) => void;

// Low-level storage operations interface
interface StorageAdapter {
  safeGet<T>(key: string, defaultValue: T): T;
  safeSet(key: string, value: unknown): void;
  safeRemove(key: string): void;
}

export class StorageService {
  private cache: Map<StorageKey, unknown> = new Map();
  private listeners: Map<StorageKey, Set<Listener<unknown>>> = new Map();
  private cacheEnabled: boolean = true;
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Get value from storage with caching
   */
  get<T>(key: StorageKey, defaultValue: T): T {
    // Check cache first
    if (this.cacheEnabled && this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    // Read from localStorage via adapter
    const value = this.adapter.safeGet<T>(key, defaultValue);

    // Update cache
    if (this.cacheEnabled) {
      this.cache.set(key, value);
    }

    return value;
  }

  /**
   * Set value in storage and notify listeners
   */
  set<T>(key: StorageKey, value: T): void {
    // Update localStorage via adapter
    this.adapter.safeSet(key, value);

    // Update cache
    if (this.cacheEnabled) {
      this.cache.set(key, value);
    }

    // Notify listeners
    this.notify(key, value);
  }

  /**
   * Update value using a callback function
   */
  update<T>(key: StorageKey, defaultValue: T, updater: (current: T) => T): void {
    const current = this.get(key, defaultValue);
    const updated = updater(current);
    this.set(key, updated);
  }

  /**
   * Remove value from storage
   */
  remove(key: StorageKey): void {
    this.adapter.safeRemove(key);
    this.cache.delete(key);
    this.notify(key, null);
  }

  /**
   * Subscribe to changes for a specific key
   * Type Safety Fix 3.10: Removed non-null assertion
   */
  subscribe<T>(key: StorageKey, listener: Listener<T>): () => void {
    // Get or create the listener set for this key
    let keyListeners = this.listeners.get(key);

    if (!keyListeners) {
      keyListeners = new Set();
      this.listeners.set(key, keyListeners);
    }

    // Now keyListeners is guaranteed to exist
    keyListeners.add(listener as Listener<unknown>);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(key);
      if (currentListeners) {
        currentListeners.delete(listener as Listener<unknown>);
        if (currentListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Notify all listeners for a key
   */
  private notify<T>(key: StorageKey, value: T | null): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        listener(value);
      });
    }
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: StorageKey): void {
    this.cache.delete(key);
  }

  /**
   * Disable/enable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      listenerCount: this.listeners.size,
    };
  }

  /**
   * Batch operations - useful for multiple updates
   */
  batch(operations: Array<() => void>): void {
    // Disable notifications temporarily
    const originalListeners = this.listeners;
    this.listeners = new Map();

    try {
      operations.forEach(op => op());
    } finally {
      // Restore listeners and notify once
      this.listeners = originalListeners;
    }
  }
}

/**
 * Type-safe storage keys
 *
 * NOTE: Application data is now managed via Supabase/React Query.
 * This file only contains keys for UI state, preferences, and temporary features
 * pending backend implementation.
 */
export const STORAGE_KEYS = {
  // Auth & User (managed by auth context)
  CURRENT_USER: "philter_current_user_id",

  // UI Preferences
  THEME: "theme",
  UI_STATE: "philter_ui_state",

  // Temporary features (pending backend implementation)
  CUSTOM_BUILDINGS: "custom_buildings", // Used by create-building-modal
  AUDIT_LOG: "audit_log", // Used by qa-panel (broker overrides audit trail)

  // Dynamic keys for temporary features
  applicationOverrides: (id: string) => `application_overrides_${id}`, // QA panel overrides
} as const;

/**
 * React hook for using storage with automatic subscriptions
 * Usage: const [value, setValue] = useStorage('my_key', defaultValue)
 *
 * Note: Requires storageService to be initialized. Import from persistence.ts
 */
export function createUseStorage(service: StorageService) {
  return function useStorage<T>(
    key: StorageKey,
    defaultValue: T
  ): [T, (value: T) => void] {
    const [state, setState] = React.useState<T>(() =>
      service.get(key, defaultValue)
    );

    React.useEffect(() => {
      // Subscribe to changes
      const unsubscribe = service.subscribe<T>(key, (newValue) => {
        setState(newValue as T);
      });

      // Sync with current value
      setState(service.get(key, defaultValue));

      return unsubscribe;
    }, [key, defaultValue]);

    const setValue = React.useCallback((value: T) => {
      service.set(key, value);
    }, [key]);

    return [state, setValue];
  };
}

/**
 * Default storage adapter using localStorage
 */
const defaultAdapter: StorageAdapter = {
  safeGet<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  safeSet(key: string, value: unknown): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },
  safeRemove(key: string): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  },
};

/**
 * Global storage service instance
 */
export const storageService = new StorageService(defaultAdapter);

/**
 * React hook for using storage with automatic subscriptions
 * Usage: const [value, setValue] = useStorage('my_key', defaultValue)
 */
export const useStorage = createUseStorage(storageService);
