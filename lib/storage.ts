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
   */
  subscribe<T>(key: StorageKey, listener: Listener<T>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener as Listener<unknown>);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener as Listener<unknown>);
        if (keyListeners.size === 0) {
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
 */
export const STORAGE_KEYS = {
  APPLICATIONS: "philter_applications",
  RFIS: "philter_rfis",
  DECISIONS: "philter_decisions",
  CURRENT_USER: "philter_current_user_id",

  // Form data keys (dynamic)
  formData: (section: string, applicationId: string) =>
    `${section}_${applicationId}`,
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
