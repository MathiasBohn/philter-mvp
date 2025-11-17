"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUser } from "@/lib/user-context";
import { Role } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data/users";

export default function Home() {
  const router = useRouter();
  const { setUser } = useUser();

  const userFlows = [
    {
      title: "Applicant",
      description: "Start a new board application as a buyer or seller",
      icon: User,
      href: "/applications/new",
      color: "text-blue-600 dark:text-blue-400",
      role: Role.APPLICANT,
    },
    {
      title: "Broker",
      description: "Manage your pipeline of applications and submissions",
      icon: Briefcase,
      href: "/broker",
      color: "text-purple-600 dark:text-purple-400",
      role: Role.BROKER,
    },
    {
      title: "Transaction Agent",
      description: "Review submitted applications and manage templates",
      icon: Shield,
      href: "/agent/inbox",
      color: "text-green-600 dark:text-green-400",
      role: Role.ADMIN,
    },
    {
      title: "Board Member",
      description: "Review and approve applications",
      icon: Users,
      href: "/board/review/app-1",
      color: "text-orange-600 dark:text-orange-400",
      role: Role.BOARD,
    },
  ];

  const handleFlowClick = (flow: typeof userFlows[0]) => {
    // Find a mock user with the selected role
    const user = mockUsers.find((u) => u.role === flow.role);
    if (user) {
      setUser(user);
      router.push(flow.href);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold tracking-tight hover:opacity-80 transition-opacity cursor-pointer">
              philter
            </h1>
          </Link>
          <p className="text-lg text-muted-foreground">
            Transaction Platform MVP - Beta Testing
          </p>
        </div>

        {/* User Flow Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {userFlows.map((flow) => {
            const Icon = flow.icon;
            return (
              <Card key={flow.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${flow.color}`} />
                    <CardTitle className="text-2xl">{flow.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {flow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleFlowClick(flow)}
                  >
                    Enter as {flow.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Select a user type above to test different workflows</p>
        </div>
      </div>
    </div>
  );
}
