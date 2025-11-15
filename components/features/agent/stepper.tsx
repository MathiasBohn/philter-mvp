"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isComplete = stepIdx < currentStep;
          const isCurrent = stepIdx === currentStep;
          const isUpcoming = stepIdx > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex-1",
                stepIdx !== steps.length - 1 && "pr-8 sm:pr-20"
              )}
            >
              {/* Connector line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute left-4 top-4 -ml-px mt-0.5 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full transition-colors",
                      isComplete ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}

              {/* Step indicator */}
              <button
                type="button"
                onClick={() => onStepClick?.(stepIdx)}
                disabled={!onStepClick}
                className={cn(
                  "group relative flex flex-col items-start",
                  onStepClick && "cursor-pointer",
                  !onStepClick && "cursor-default"
                )}
              >
                <span className="flex items-center">
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      isComplete &&
                        "bg-primary text-primary-foreground group-hover:bg-primary/90",
                      isCurrent &&
                        "border-2 border-primary bg-background text-primary",
                      isUpcoming && "border-2 border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-medium">{stepIdx + 1}</span>
                    )}
                  </span>
                </span>
                <span className="mt-2 flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-primary",
                      isComplete && "text-foreground",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
