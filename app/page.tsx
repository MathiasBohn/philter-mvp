"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Shield, Users, CheckCircle2, Clock, FileCheck, ArrowRight, Building2, FileText, Lock, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/contexts/auth-context";
import { Role } from "@/lib/types";
import { PhilterLogo } from "@/components/brand/philter-logo";
import { getDashboardForRole, getDashboardLabel } from "@/lib/routing";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const userFlows = [
    {
      title: "Applicant",
      question: "Applying for a co-op or condo?",
      description: "Create and submit your board application with an intuitive step-by-step process",
      icon: User,
      href: "/applications/new",
      role: Role.APPLICANT,
      cta: "Start Application",
      features: ["Digital document uploads", "Progress tracking", "Real-time updates"]
    },
    {
      title: "Broker",
      question: "Managing client applications?",
      description: "Track all your clients in one place and streamline submissions to buildings",
      icon: Briefcase,
      href: "/broker",
      role: Role.BROKER,
      cta: "Broker Dashboard",
      features: ["Pipeline management", "Quality assurance", "Building submissions"]
    },
    {
      title: "Transaction Agent",
      question: "Coordinating transactions?",
      description: "Review applications, manage templates, and coordinate seamlessly with all parties",
      icon: Shield,
      href: "/agent/inbox",
      role: Role.ADMIN,
      cta: "Agent Portal",
      features: ["Application inbox", "Template editor", "RFI management"]
    },
    {
      title: "Board Member",
      question: "Reviewing applications?",
      description: "Efficiently review applications, request information, and make informed decisions",
      icon: Users,
      href: "/board",
      role: Role.BOARD,
      cta: "Board Portal",
      features: ["Application review", "Request information", "Decision tracking"]
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Complete applications 3x faster with our streamlined digital process"
    },
    {
      icon: FileCheck,
      title: "Stay Organized",
      description: "All documents and information in one secure, accessible location"
    },
    {
      icon: CheckCircle2,
      title: "Reduce Errors",
      description: "Built-in validation ensures completeness and accuracy"
    }
  ];

  const features = [
    {
      icon: FileText,
      title: "Comprehensive Applications",
      description: "Support for co-op purchase, condo purchase, sublets, and leases"
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "Cloud-powered storage with encryption for sensitive data"
    },
    {
      icon: Zap,
      title: "Real-Time Collaboration",
      description: "Seamless communication between applicants, brokers, agents, and boards"
    }
  ];

  const transactionTypes = [
    "Co-op Purchase",
    "Condo Purchase",
    "Co-op Sublet",
    "Condo Lease"
  ];

  // Get the user's dashboard URL using centralized routing
  const userDashboard = user ? getDashboardForRole(user.role) : '/my-applications';
  const userDashboardLabel = user ? getDashboardLabel(user.role) : 'Dashboard';

  // Check if the flow matches the user's role
  const isUserRole = (flowRole: Role): boolean => {
    if (!user) return false;
    // Applicant, co-applicant, and guarantor all share the APPLICANT flow
    if (flowRole === Role.APPLICANT) {
      return [Role.APPLICANT, Role.CO_APPLICANT, Role.GUARANTOR].includes(user.role);
    }
    return user.role === flowRole;
  };

  const handleFlowClick = (flow: typeof userFlows[0]) => {
    if (user) {
      // If user clicks their own role, go to that dashboard
      if (isUserRole(flow.role)) {
        router.push(flow.href);
      } else {
        // Otherwise, redirect to their own dashboard using centralized routing
        router.push(userDashboard);
      }
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirect_after_login', flow.href);
      }
      router.push('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-philter-mint/30 to-philter-sage/20 dark:from-background dark:via-philter-navy/20 dark:to-background">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-philter-navy/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <PhilterLogo size="md" showBeta className="group-hover:opacity-80 transition-opacity" />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!user ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="shadow-sm">Get Started</Button>
                </Link>
              </>
            ) : (
              <Link href={userDashboard}>
                <Button variant="outline" size="sm">{userDashboardLabel}</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,139,78,0.08),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(30,58,95,0.06),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-philter-navy/5 rounded-full blur-3xl dark:bg-primary/10" />

        <div className="relative container mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
          {/* Main Header */}
          <div className="text-center space-y-5 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-sm font-medium text-primary backdrop-blur-sm">
              <Building2 className="h-4 w-4" />
              <span>Modernizing co-op & condo transactions</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Your Complete{" "}
              <span className="text-primary">Transaction</span>{" "}
              Platform
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Streamline co-op and condo board applications with our purpose-built digital platform.
              From application to approval, everything you need in one place.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <Link href="/sign-up">
                  <Button size="lg" className="text-base px-8 h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="lg" className="text-base px-8 h-11 border-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-2.5 p-5 rounded-xl bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-border hover:shadow-lg hover:border-primary/20 transition-all">
                  <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="relative container mx-auto px-4 py-12">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Choose Your Role
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Select your role below to access your personalized dashboard and tools
          </p>
        </div>

        {/* User Flow Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:gap-6 max-w-6xl mx-auto">
          {userFlows.map((flow) => {
            const Icon = flow.icon;
            const isCurrentUserRole = isUserRole(flow.role);
            const isDisabled = !!(user && !isCurrentUserRole);
            return (
              <Card
                key={flow.title}
                className={`group relative overflow-hidden transition-all duration-300 border-2 bg-card/80 dark:bg-card/60 backdrop-blur-sm ${
                  isCurrentUserRole
                    ? 'ring-2 ring-primary ring-offset-2 hover:shadow-2xl hover:scale-[1.02] cursor-pointer hover:border-primary/40'
                    : isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer hover:border-primary/40'
                }`}
                onClick={() => !isDisabled && handleFlowClick(flow)}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20" />

                <CardHeader className="space-y-3 pb-3 relative z-10">
                  {isCurrentUserRole && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="text-xs">Your Role</Badge>
                    </div>
                  )}
                  <div className="flex items-start gap-3.5">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg shrink-0 transition-all duration-300 ${
                      isDisabled
                        ? 'bg-muted'
                        : 'bg-primary/10 dark:bg-primary/20 group-hover:scale-110 group-hover:bg-primary/20 dark:group-hover:bg-primary/30'
                    }`}>
                      <Icon className={`h-6 w-6 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <CardTitle className="text-lg font-bold text-foreground">{flow.question}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {flow.description}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-1.5 pt-1">
                    {flow.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardHeader>

                <CardContent className="pt-0 pb-5 relative z-10">
                  <Button
                    className="w-full group-hover:shadow-lg transition-all"
                    size="lg"
                    disabled={isDisabled}
                    variant={isDisabled ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDisabled) handleFlowClick(flow);
                    }}
                  >
                    {isDisabled ? "Not Available" : flow.cta}
                    {!isDisabled && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Built for Modern Real Estate
            </h2>
            <p className="text-base text-muted-foreground">
              Everything you need for a complete digital transaction workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-5 rounded-xl bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-border hover:shadow-lg hover:border-primary/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transaction Types */}
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-philter-mint/50 to-philter-sage/30 dark:from-philter-navy/30 dark:to-philter-navy/20 border border-primary/10 dark:border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Supports All Transaction Types
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {transactionTypes.map((type, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-lg bg-card dark:bg-card/80 border border-border text-sm font-medium text-foreground shadow-sm"
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative container mx-auto px-4 py-12 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Info Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Welcome to philter
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our platform digitizes the entire co-op and condo board application process,
                  making it easier for applicants, brokers, agents, and board members to collaborate efficiently.
                  Experience a modern, streamlined approach to residential real estate transactions.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          {!user && (
            <div className="text-center space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Ready to streamline your transaction process?
              </p>
              <Link href="/sign-up">
                <Button size="lg" variant="outline" className="text-base px-8 h-11 border-2 hover:bg-accent">
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Footer branding */}
          <div className="flex justify-center pt-6">
            <PhilterLogo size="sm" className="opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
