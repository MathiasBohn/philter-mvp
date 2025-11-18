"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageSquare, BookOpen, ExternalLink, Search } from "lucide-react";

export default function HelpSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help with your application or contact our support team
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <BookOpen className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Documentation</CardTitle>
            <CardDescription>
              Browse our comprehensive guides and tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Docs
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <CardDescription>
              Chat with our support team in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Start Chat
              <span className="ml-2 text-xs">(Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Mail className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Email Support</CardTitle>
            <CardDescription>
              Send us an email and we&apos;ll get back to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:support@philter.app">
                Send Email
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about using Philter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                className="pl-9"
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I submit my application?</AccordionTrigger>
              <AccordionContent>
                After completing all required sections of your application, navigate to the
                Review & Submit page. Review all information for accuracy, then click the
                &quot;Submit Application&quot; button. Your application will be sent to your broker
                for verification before being forwarded to the building management.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>What documents are required?</AccordionTrigger>
              <AccordionContent>
                The required documents vary by employment type, but typically include proof
                of income (W-2, paystubs, or 1099 forms), bank statements, and personal
                references. You&apos;ll find specific requirements listed in each section of the
                application.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Can I save my progress and continue later?</AccordionTrigger>
              <AccordionContent>
                Yes! Your application data is automatically saved as you complete each
                section. You can safely close your browser and return later to continue
                where you left off. Just make sure to complete all required fields in each
                section before navigating away.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How long does the review process take?</AccordionTrigger>
              <AccordionContent>
                The review timeline varies depending on the building and complexity of your
                application. Typically, broker review takes 1-2 business days, building
                management review takes 3-5 business days, and board review (if required)
                takes 7-14 business days. You&apos;ll receive email notifications at each stage
                of the process.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How do I update my information after submitting?</AccordionTrigger>
              <AccordionContent>
                If your application is still with your broker, you can make changes by
                contacting them directly. Once submitted to the building, you&apos;ll need to
                contact building management to request any updates. For significant changes,
                you may need to resubmit certain sections of your application.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Send us a message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question in detail..."
                rows={5}
              />
            </div>
            <Button>Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
