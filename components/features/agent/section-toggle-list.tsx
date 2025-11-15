"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";

export interface SectionConfig {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  required: boolean;
}

interface SectionToggleListProps {
  sections: SectionConfig[];
  onChange: (sections: SectionConfig[]) => void;
}

export function SectionToggleList({ sections, onChange }: SectionToggleListProps) {
  const handleToggle = (key: string, enabled: boolean) => {
    const updated = sections.map((section) =>
      section.key === key ? { ...section, enabled } : section
    );
    onChange(updated);
  };

  const handleRequiredChange = (key: string, required: boolean) => {
    const updated = sections.map((section) =>
      section.key === key ? { ...section, required } : section
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.key} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Switch
                  id={`section-${section.key}`}
                  checked={section.enabled}
                  onCheckedChange={(checked) => handleToggle(section.key, checked)}
                />
                <div>
                  <Label
                    htmlFor={`section-${section.key}`}
                    className="text-base font-semibold cursor-pointer"
                  >
                    {section.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {section.description}
                  </p>
                </div>
              </div>

              {section.enabled && (
                <div className="mt-4 ml-11">
                  <RadioGroup
                    value={section.required ? "required" : "optional"}
                    onValueChange={(value) =>
                      handleRequiredChange(section.key, value === "required")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="required" id={`${section.key}-required`} />
                      <Label
                        htmlFor={`${section.key}-required`}
                        className="font-normal cursor-pointer"
                      >
                        Required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="optional" id={`${section.key}-optional`} />
                      <Label
                        htmlFor={`${section.key}-optional`}
                        className="font-normal cursor-pointer"
                      >
                        Optional
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
