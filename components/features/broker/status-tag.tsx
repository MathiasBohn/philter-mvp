import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";

interface StatusTagProps {
  status: ApplicationStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const getStatusVariant = () => {
    switch (status) {
      case ApplicationStatus.IN_PROGRESS:
        return "secondary";
      case ApplicationStatus.SUBMITTED:
        return "default";
      case ApplicationStatus.IN_REVIEW:
        return "outline";
      case ApplicationStatus.RFI:
        return "destructive";
      case ApplicationStatus.APPROVED:
        return "default";
      case ApplicationStatus.CONDITIONAL:
        return "secondary";
      case ApplicationStatus.DENIED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case ApplicationStatus.IN_PROGRESS:
        return "In Progress";
      case ApplicationStatus.SUBMITTED:
        return "Submitted";
      case ApplicationStatus.IN_REVIEW:
        return "In Review";
      case ApplicationStatus.RFI:
        return "RFI Required";
      case ApplicationStatus.APPROVED:
        return "Approved";
      case ApplicationStatus.CONDITIONAL:
        return "Conditional";
      case ApplicationStatus.DENIED:
        return "Denied";
      default:
        return status;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case ApplicationStatus.APPROVED:
        return "bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600";
      case ApplicationStatus.CONDITIONAL:
        return "bg-yellow-600 dark:bg-yellow-700 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600";
      case ApplicationStatus.DENIED:
      case ApplicationStatus.RFI:
        return "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600";
      default:
        return "";
    }
  };

  const customColorClass = getStatusColor();

  return (
    <Badge variant={getStatusVariant()} className={customColorClass || undefined}>
      {getStatusLabel()}
    </Badge>
  );
}
