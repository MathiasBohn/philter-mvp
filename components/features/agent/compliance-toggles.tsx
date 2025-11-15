"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export interface ComplianceConfig {
  localLaw55: boolean;
  windowGuard: boolean;
}

interface ComplianceTogglesProps {
  config: ComplianceConfig;
  onChange: (config: ComplianceConfig) => void;
  transactionType?: string;
}

export function ComplianceToggles({
  config,
  onChange,
  transactionType,
}: ComplianceTogglesProps) {
  const isLeaseOrSublet =
    transactionType === "CONDO_LEASE" || transactionType === "COOP_SUBLET";

  if (!isLeaseOrSublet) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Compliance disclosures are only applicable to lease and sublet transactions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Switch
            id="local-law-55"
            checked={config.localLaw55}
            onCheckedChange={(checked) =>
              onChange({ ...config, localLaw55: checked })
            }
          />
          <div className="flex-1">
            <Label htmlFor="local-law-55" className="text-base font-semibold cursor-pointer">
              Local Law 55 - Indoor Allergen Hazards
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Require disclosure and acknowledgment of indoor allergen hazards (NYC
              requirement for residential leases)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Switch
            id="window-guard"
            checked={config.windowGuard}
            onCheckedChange={(checked) =>
              onChange({ ...config, windowGuard: checked })
            }
          />
          <div className="flex-1">
            <Label htmlFor="window-guard" className="text-base font-semibold cursor-pointer">
              Window Guard Notice
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Require window guard lease notice acknowledgment and optional signed form
              upload (NYC requirement for units with children)
            </p>
          </div>
        </div>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These compliance requirements will be enforced during the application process.
          Applicants will need to acknowledge all enabled disclosures before submission.
        </AlertDescription>
      </Alert>
    </div>
  );
}
