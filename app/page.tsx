"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Shield, Users, CheckCircle2, Clock, FileCheck, Sparkles, ArrowRight, Building2, FileText, Lock, Zap } from "lucide-react";
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
      question: "Applying for a co-op or condo?",
      description: "Create and submit your board application with an intuitive step-by-step process",
      icon: User,
      href: "/applications/new",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "hover:border-blue-400 dark:hover:border-blue-600",
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
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "hover:border-purple-400 dark:hover:border-purple-600",
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
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "hover:border-green-400 dark:hover:border-green-600",
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
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "hover:border-orange-400 dark:hover:border-orange-600",
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
      description: "IndexedDB-powered local storage with encryption for sensitive data"
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

  const handleFlowClick = (flow: typeof userFlows[0]) => {
    console.log('Flow clicked:', flow.title, 'User:', user ? 'authenticated' : 'not authenticated');

    // If user is already authenticated, go directly to the flow
    if (user) {
      console.log('Navigating to:', flow.href);
      router.push(flow.href);
    } else {
      // Otherwise, redirect to sign-in page
      // Optionally store the intended destination
      console.log('Storing redirect and going to sign-in');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirect_after_login', flow.href);
      }
      router.push('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              philter
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
              beta
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="shadow-sm">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/my-applications">My Applications</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-12">
          {/* Main Header */}
          <div className="text-center space-y-5 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Modernizing co-op & condo transactions</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Your Complete Transaction Platform
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Streamline co-op and condo board applications with our purpose-built digital platform.
              From application to approval, everything you need in one place.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <Button asChild size="lg" className="text-base px-8 h-11 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8 h-11 border-2">
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-2.5 p-5 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="relative container mx-auto px-4 py-12">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Choose Your Role
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Select your role below to access your personalized dashboard and tools
          </p>
        </div>

        {/* User Flow Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:gap-6 max-w-6xl mx-auto">
          {userFlows.map((flow) => {
            const Icon = flow.icon;
            return (
              <Card
                key={flow.title}
                className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 ${flow.borderColor} bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`}
                onClick={() => handleFlowClick(flow)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${flow.bgColor}`} />

                <CardHeader className="space-y-3 pb-3 relative z-10">
                  <div className="flex items-start gap-3.5">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${flow.bgColor} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${flow.color}`} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">{flow.question}</CardTitle>
                      <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                        {flow.description}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-1.5 pt-1">
                    {flow.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${flow.color} shrink-0`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardHeader>

                <CardContent className="pt-0 pb-5 relative z-10">
                  <Button
                    className={`w-full group-hover:shadow-lg transition-all ${flow.color.replace('text-', 'hover:bg-').replace('dark:text-', 'dark:hover:bg-')} hover:text-white`}
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlowClick(flow);
                    }}
                  >
                    {flow.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Built for Modern Real Estate
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Everything you need for a complete digital transaction workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-5 rounded-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transaction Types */}
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900/60 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Supports All Transaction Types
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {transactionTypes.map((type, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm"
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
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-700 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-blue-500 text-white shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Welcome to philter
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
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
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ready to streamline your transaction process?
              </p>
              <Button asChild size="lg" variant="outline" className="text-base px-8 h-11 border-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Link href="/sign-up">
                  Create Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
