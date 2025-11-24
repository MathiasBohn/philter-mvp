import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, Clock, XCircle } from "lucide-react";

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED' | null;

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  email?: string;
  className?: string;
}

export function InvitationStatusBadge({ status, email, className }: InvitationStatusBadgeProps) {
  if (!status) {
    return null;
  }

  const config = {
    PENDING: {
      label: 'Invitation Pending',
      icon: Mail,
      variant: 'secondary' as const,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700',
    },
    ACCEPTED: {
      label: 'Invitation Accepted',
      icon: CheckCircle2,
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
    },
    EXPIRED: {
      label: 'Invitation Expired',
      icon: Clock,
      variant: 'secondary' as const,
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
    },
    REVOKED: {
      label: 'Invitation Revoked',
      icon: XCircle,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-700',
    },
  };

  const { label, icon: Icon, className: statusClassName } = config[status];

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 ${statusClassName} ${className || ''}`}
      title={email ? `Sent to: ${email}` : undefined}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

/**
 * Get invitation status from application data
 */
export function getInvitationStatus(application: {
  brokerOwned?: boolean;
  primaryApplicantId?: string | null;
  application_invitations?: Array<{ status: string }>;
}): InvitationStatus {
  // Not a broker-owned application
  if (!application.brokerOwned) {
    return null;
  }

  // Applicant has accepted (linked to application)
  if (application.primaryApplicantId) {
    return 'ACCEPTED';
  }

  // Check invitation status
  if (application.application_invitations && application.application_invitations.length > 0) {
    const latestInvitation = application.application_invitations[0];
    return latestInvitation.status as InvitationStatus;
  }

  // Default to pending if broker-owned but no status found
  return 'PENDING';
}
