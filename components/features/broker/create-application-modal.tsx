"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { TransactionType } from "@/lib/types";
import { Plus, Loader2 } from "lucide-react";

const createApplicationSchema = z.object({
  buildingId: z.string().uuid("Please select a building"),
  unit: z.string().optional(),
  transactionType: z.nativeEnum(TransactionType, {
    message: "Please select a transaction type",
  }),
  applicantEmail: z.string().email("Please enter a valid email address"),
  applicantName: z.string().min(1, "Applicant name is required"),
});

type CreateApplicationFormData = z.infer<typeof createApplicationSchema>;

interface CreateApplicationModalProps {
  buildings: Array<{ id: string; name: string; address: string }>;
  onSuccess?: (applicationId: string) => void;
}

export function CreateApplicationModal({
  buildings,
  onSuccess,
}: CreateApplicationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateApplicationFormData>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      unit: "",
      applicantName: "",
      applicantEmail: "",
    },
  });

  const onSubmit = async (data: CreateApplicationFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/broker/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create application");
      }

      toast.success(`Application created! Invitation sent to ${data.applicantEmail}`);

      // Reset form and close modal
      form.reset();
      setOpen(false);

      // Callback or redirect
      if (onSuccess) {
        onSuccess(result.application.id);
      } else {
        // Redirect to the application overview
        router.push(`/applications/${result.application.id}/overview`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create application. Please try again"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Application</DialogTitle>
          <DialogDescription>
            Create a new application for your client. We&apos;ll send them an
            invitation to complete their application.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Applicant Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Applicant Information</h3>

              <FormField
                control={form.control}
                name="applicantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      We&apos;ll send an invitation to this email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Property Information</h3>

              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a building" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {building.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {building.address}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="5B"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TransactionType.COOP_PURCHASE}>
                          Co-op Purchase
                        </SelectItem>
                        <SelectItem value={TransactionType.CONDO_PURCHASE}>
                          Condo Purchase
                        </SelectItem>
                        <SelectItem value={TransactionType.COOP_SUBLET}>
                          Co-op Sublet
                        </SelectItem>
                        <SelectItem value={TransactionType.CONDO_LEASE}>
                          Condo Lease
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create & Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
