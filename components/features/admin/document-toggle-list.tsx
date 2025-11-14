"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export interface DocumentConfig {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  required: boolean;
  isCustom?: boolean;
}

interface DocumentToggleListProps {
  documents: DocumentConfig[];
  onChange: (documents: DocumentConfig[]) => void;
}

export function DocumentToggleList({ documents, onChange }: DocumentToggleListProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleToggle = (key: string, enabled: boolean) => {
    const updated = documents.map((doc) =>
      doc.key === key ? { ...doc, enabled } : doc
    );
    onChange(updated);
  };

  const handleRequiredChange = (key: string, required: boolean) => {
    const updated = documents.map((doc) =>
      doc.key === key ? { ...doc, required } : doc
    );
    onChange(updated);
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) return;

    const newKey = newCategoryName.toLowerCase().replace(/\s+/g, "_");
    const newDocument: DocumentConfig = {
      key: newKey,
      label: newCategoryName,
      description: "Custom document category",
      enabled: true,
      required: false,
      isCustom: true,
    };

    onChange([...documents, newDocument]);
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const handleRemoveCustomCategory = (key: string) => {
    const updated = documents.filter((doc) => doc.key !== key);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.key} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Switch
                  id={`doc-${doc.key}`}
                  checked={doc.enabled}
                  onCheckedChange={(checked) => handleToggle(doc.key, checked)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`doc-${doc.key}`}
                    className="text-base font-semibold cursor-pointer"
                  >
                    {doc.label}
                    {doc.isCustom && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Custom)
                      </span>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {doc.description}
                  </p>
                </div>
                {doc.isCustom && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomCategory(doc.key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {doc.enabled && (
                <div className="mt-4 ml-11">
                  <RadioGroup
                    value={doc.required ? "required" : "optional"}
                    onValueChange={(value) =>
                      handleRequiredChange(doc.key, value === "required")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="required" id={`${doc.key}-required`} />
                      <Label
                        htmlFor={`${doc.key}-required`}
                        className="font-normal cursor-pointer"
                      >
                        Required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="optional" id={`${doc.key}-optional`} />
                      <Label
                        htmlFor={`${doc.key}-optional`}
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

      {/* Add custom category */}
      <div className="mt-4">
        {showAddCategory ? (
          <Card className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCustomCategory();
                  } else if (e.key === "Escape") {
                    setShowAddCategory(false);
                    setNewCategoryName("");
                  }
                }}
              />
              <Button type="button" onClick={handleAddCustomCategory}>
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddCategory(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Category
          </Button>
        )}
      </div>
    </div>
  );
}
