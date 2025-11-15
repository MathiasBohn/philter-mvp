"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <h1 className="text-2xl font-semibold">Sign In</h1>
    </div>
  );
}
