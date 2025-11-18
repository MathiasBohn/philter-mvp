import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PolicyItemProps {
  label: string;
  value: string | number | boolean;
  isBoolean?: boolean;
}

export function PolicyItem({ label, value, isBoolean = false }: PolicyItemProps) {
  return (
    <div className="flex items-start justify-between py-3 border-b last:border-0">
      <span className="font-medium text-sm">{label}</span>
      {isBoolean ? (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Allowed
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Not Allowed
              </Badge>
            </>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground font-semibold">
          {typeof value === 'number' && label.includes('Finance') ? `${value}%` : value}
        </span>
      )}
    </div>
  );
}
