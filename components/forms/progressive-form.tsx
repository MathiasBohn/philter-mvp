"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FormSection {
  id: string
  title: string
  description?: string
  isComplete?: boolean
  isRequired?: boolean
  children: React.ReactNode
}

interface ProgressiveFormProps {
  sections: FormSection[]
  /**
   * Start with all sections expanded
   */
  defaultExpandAll?: boolean
  /**
   * Allow multiple sections to be open simultaneously
   */
  allowMultiple?: boolean
  /**
   * Show section completion status
   */
  showStatus?: boolean
  className?: string
}

/**
 * Progressive disclosure form component
 * Breaks long forms into collapsible sections for better UX
 */
export function ProgressiveForm({
  sections,
  defaultExpandAll = false,
  allowMultiple = true,
  showStatus = true,
  className,
}: ProgressiveFormProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(defaultExpandAll ? sections.map((s) => s.id) : [sections[0]?.id].filter(Boolean))
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        if (!allowMultiple) {
          newSet.clear()
        }
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((s) => s.id)))
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

  const completedCount = sections.filter((s) => s.isComplete).length
  const totalCount = sections.length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Summary */}
      {showStatus && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Form Progress</p>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} sections completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id)

          return (
            <Card
              key={section.id}
              className={cn(
                "border-2 transition-all duration-200 animate-fade-in",
                isExpanded && "border-primary/50 shadow-sm"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Status Icon */}
                    {showStatus &&
                      (section.isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ))}

                    {/* Section Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {section.title}
                          {section.isRequired && (
                            <span className="ml-1 text-destructive text-sm">*</span>
                          )}
                        </CardTitle>
                      </div>
                      {section.description && !isExpanded && (
                        <CardDescription className="mt-1 truncate">
                          {section.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform flex-shrink-0" />
                  )}
                </div>

                {section.description && isExpanded && (
                  <CardDescription className="mt-2">{section.description}</CardDescription>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="animate-accordion-down pt-0">
                  {section.children}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Simple section wrapper for progressive forms
 */
export function FormSectionContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>
}
