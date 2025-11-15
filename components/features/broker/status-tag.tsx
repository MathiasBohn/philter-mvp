import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";
import { getStatusConfig } from "@/lib/constants/labels";

interface StatusTagProps {
  status: ApplicationStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.color}>
      {config.label}
    </Badge>
  );
}
