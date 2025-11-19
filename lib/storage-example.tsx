/**
 * StorageService Usage Examples
 *
 * This file demonstrates various ways to use the new StorageService
 * for optimal performance with localStorage operations.
 */

"use client";

import { useEffect, useState } from "react";
import { storageService, useStorage, STORAGE_KEYS } from "@/lib/persistence";
import { Application, ApplicationStatus } from "@/lib/types";

// ============================================================================
// EXAMPLE 1: Using the React Hook (Recommended for Components)
// ============================================================================

export function ApplicationListWithHook() {
  // This hook automatically:
  // - Loads data from cache/localStorage
  // - Subscribes to changes from other components
  // - Re-renders when data changes
  // - Cleans up on unmount
  const [applications, setApplications] = useStorage<Application[]>(
    STORAGE_KEYS.APPLICATIONS,
    []
  );

  const updateStatus = (id: string, status: ApplicationStatus) => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status, lastActivityAt: new Date() } : app
      )
    );
  };

  return (
    <div>
      <h2>Applications ({applications.length})</h2>
      {applications.map((app) => (
        <div key={app.id}>
          <span>{app.people.map((p) => p.fullName).join(", ")}</span>
          <button onClick={() => updateStatus(app.id, ApplicationStatus.APPROVED)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Using StorageService Directly (For Non-React or Server Code)
// ============================================================================

export function updateApplicationDirectly(id: string, updates: Partial<Application>) {
  // Update using a callback function to ensure atomic updates
  storageService.update<Application[]>(
    STORAGE_KEYS.APPLICATIONS,
    [],
    (currentApps) => {
      return currentApps.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      );
    }
  );
}

// ============================================================================
// EXAMPLE 3: Subscribing to Changes (Cross-Component Communication)
// ============================================================================

export function ApplicationStatusMonitor() {
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Subscribe to application changes
    const unsubscribe = storageService.subscribe<Application[]>(
      STORAGE_KEYS.APPLICATIONS,
      (updatedApps) => {
        console.log("Applications updated!", updatedApps);
        setUpdateCount((prev) => prev + 1);
      }
    );

    // IMPORTANT: Always return the unsubscribe function
    return unsubscribe;
  }, []);

  return <div>Application updates detected: {updateCount}</div>;
}

// ============================================================================
// EXAMPLE 4: Batch Operations (Multiple Updates at Once)
// ============================================================================

export function bulkUpdateApplications(updates: Record<string, Partial<Application>>) {
  // Batch multiple operations to trigger only one notification
  storageService.batch([
    () => {
      const apps = storageService.get<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
      const updatedApps = apps.map((app) =>
        updates[app.id] ? { ...app, ...updates[app.id] } : app
      );
      storageService.set(STORAGE_KEYS.APPLICATIONS, updatedApps);
    },
    () => {
      // Other storage operations...
    },
  ]);
}

// ============================================================================
// EXAMPLE 5: Form Data Storage (Section-Specific Keys)
// ============================================================================

export function ProfileFormWithStorage({ applicationId }: { applicationId: string }) {
  const formKey = STORAGE_KEYS.formData("profile", applicationId);

  const [formData, setFormData] = useStorage<Record<string, unknown>>(formKey, {});

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <form>
      <input
        type="text"
        value={(formData.fullName as string) || ""}
        onChange={(e) => handleFieldChange("fullName", e.target.value)}
      />
      {/* More fields... */}
    </form>
  );
}

// ============================================================================
// EXAMPLE 6: Cache Management (Advanced)
// ============================================================================

export function CacheDebugPanel() {
  const [stats, setStats] = useState(storageService.getCacheStats());

  const refreshStats = () => {
    setStats(storageService.getCacheStats());
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h3>Cache Statistics</h3>
      <p>Cache Size: {stats.size} items</p>
      <p>Listeners: {stats.listenerCount}</p>
      <p>Keys: {stats.keys.join(", ")}</p>

      <div style={{ marginTop: "10px" }}>
        <button onClick={refreshStats}>Refresh Stats</button>
        <button onClick={() => storageService.clearCache()}>Clear Cache</button>
        <button
          onClick={() => {
            storageService.invalidate(STORAGE_KEYS.APPLICATIONS);
            refreshStats();
          }}
        >
          Invalidate Applications
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Performance Comparison
// ============================================================================

export function PerformanceTest() {
  const [results, setResults] = useState<string>("");

  const runTest = () => {
    const iterations = 1000;

    // Test 1: Direct localStorage (no cache)
    const start1 = performance.now();
    for (let i = 0; i < iterations; i++) {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (data) JSON.parse(data);
    }
    const time1 = performance.now() - start1;

    // Test 2: StorageService (with cache)
    storageService.clearCache(); // Start fresh
    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
      storageService.get(STORAGE_KEYS.APPLICATIONS, []);
    }
    const time2 = performance.now() - start2;

    const improvement = ((time1 - time2) / time1) * 100;

    setResults(`
      Direct localStorage: ${time1.toFixed(2)}ms
      StorageService (cached): ${time2.toFixed(2)}ms
      Improvement: ${improvement.toFixed(1)}% faster
    `);
  };

  return (
    <div>
      <button onClick={runTest}>Run Performance Test</button>
      {results && <pre>{results}</pre>}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Replacing Old localStorage Patterns
// ============================================================================

// Before (Old Pattern)
function OldPatternComponent() {
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("my_data");
    return stored ? JSON.parse(stored) : { count: 0 };
  });

  useEffect(() => {
    localStorage.setItem("my_data", JSON.stringify(data));
  }, [data]);

  return <div>Count: {data.count}</div>;
}

// After (New Pattern with StorageService)
function NewPatternComponent() {
  const [data, setData] = useStorage<{ count: number }>("my_data", { count: 0 });

  // That's it! Auto-synced and cached
  return <div>Count: {data.count}</div>;
}
