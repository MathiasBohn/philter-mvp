"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/contexts/auth-context";
import { Role } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // Debug: log when component renders
  if (typeof window !== 'undefined') {
    console.log('Homepage rendered, user:', user ? 'authenticated' : 'not authenticated');
  }

  const userFlows = [
    {
      title: "Applicant",
      question: "Are you applying for a co-op or condo?",
      description: "Create and submit your board application for purchase, lease, or sublet transactions",
      icon: User,
      href: "/applications/new",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      role: Role.APPLICANT,
      cta: "Start Your Application",
    },
    {
      title: "Broker",
      question: "Are you a real estate broker?",
      description: "Manage your client applications, track progress, and submit to buildings",
      icon: Briefcase,
      href: "/broker",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      role: Role.BROKER,
      cta: "Access Broker Dashboard",
    },
    {
      title: "Transaction Agent",
      question: "Are you a transaction coordinator?",
      description: "Review submitted applications, manage templates, and coordinate with all parties",
      icon: Shield,
      href: "/agent/inbox",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      role: Role.ADMIN,
      cta: "Open Agent Portal",
    },
    {
      title: "Board Member",
      question: "Are you a board member?",
      description: "Review applications, request additional information, and make approval decisions",
      icon: Users,
      href: "/board",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      role: Role.BOARD,
      cta: "Enter Board Portal",
    },
  ];

  const handleFlowClick = (flow: typeof userFlows[0]) => {
    console.log('Flow clicked:', flow.title, 'User:', user ? 'authenticated' : 'not authenticated');

    try {
      // If user is already authenticated, go directly to the flow
      if (user) {
        console.log('Navigating to:', flow.href);
        router.push(flow.href);
      } else {
        // Otherwise, redirect to sign-in page
        // Optionally store the intended destination
        console.log('Storing redirect and going to sign-in');
        sessionStorage.setItem('redirect_after_login', flow.href);
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to hard navigation if router fails
      window.location.href = user ? flow.href : '/sign-in';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight hover:opacity-80 transition-opacity cursor-pointer">
              philter
            </h1>
          </Link>
          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              Welcome to Your Transaction Platform
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Streamline your co-op and condo board applications with our digital platform. Choose your role below to get started.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground/70 italic">
              Currently in beta testing
            </p>
          </div>
        </div>

        {/* User Flow Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {userFlows.map((flow) => {
            const Icon = flow.icon;
            return (
              <Card
                key={flow.title}
                className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 flex flex-col"
                onClick={() => handleFlowClick(flow)}
              >
                <CardHeader className="space-y-3 pb-3 flex-grow">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full ${flow.bgColor} mx-auto`}>
                    <Icon className={`h-7 w-7 ${flow.color}`} />
                  </div>
                  <div className="text-center space-y-1.5">
                    <CardTitle className="text-lg font-bold leading-tight">{flow.question}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {flow.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlowClick(flow);
                    }}
                  >
                    {flow.cta} →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-4 pt-2">
          <div className="p-5 rounded-lg bg-muted/50 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">New to philter?</strong> Our platform digitizes the entire co-op and condo board application process,
              making it easier for applicants, brokers, agents, and board members to collaborate efficiently.
            </p>
          </div>
          {!user && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account yet?
              </p>
              <Button asChild variant="outline" size="lg" className="min-w-[240px]">
                <Link href="/sign-up">
                  Create Your Free Account
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
