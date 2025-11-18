"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockBuildings } from "@/lib/mock-data/buildings";
import { TransactionType } from "@/lib/types";
import { Copy, Check, Send } from "lucide-react";

interface InviteApplicantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteApplicantModal({
  open,
  onOpenChange,
}: InviteApplicantModalProps) {
  const [email, setEmail] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType | "">("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = () => {
    if (!email || !buildingId || !transactionType) {
      return;
    }

    // Generate unique code (in production, this would come from backend)
    const uniqueCode = `INV-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substr(2, 9)}`.toUpperCase();

    const link = `${window.location.origin}/applications/new?code=${uniqueCode}&building=${buildingId}&type=${transactionType}&email=${encodeURIComponent(email)}`;

    setInviteLink(link);
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setEmail("");
    setBuildingId("");
    setTransactionType("");
    setInviteLink("");
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const isFormValid = email && buildingId && transactionType;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Invite Applicant</DialogTitle>
          <DialogDescription>
            Generate a unique invitation link to share with your applicant.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!inviteLink ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="email">Applicant Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="applicant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="building">Building</Label>
                <Select value={buildingId} onValueChange={setBuildingId}>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBuildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name} - {building.address.street}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transaction-type">Transaction Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value) =>
                    setTransactionType(value as TransactionType)
                  }
                >
                  <SelectTrigger id="transaction-type">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
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
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Invitation Link</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Copied to clipboard!</p>
                )}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="text-sm font-semibold">Invitation Details</h4>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Email:</dt>
                  <dd className="font-medium">{email}</dd>
                  <dt className="text-muted-foreground">Building:</dt>
                  <dd className="font-medium">
                    {mockBuildings.find((b) => b.id === buildingId)?.name}
                  </dd>
                  <dt className="text-muted-foreground">Type:</dt>
                  <dd className="font-medium">
                    {transactionType.replace(/_/g, " ")}
                  </dd>
                </dl>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Next Steps:</strong> Share this link with your applicant
                  via email or messaging. The link will pre-fill their application
                  with the building and transaction type information.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!inviteLink ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerateLink} disabled={!isFormValid}>
                <Send className="mr-2 h-4 w-4" />
                Generate Invitation
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Create Another
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
