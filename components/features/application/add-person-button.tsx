"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { Role } from "@/lib/types";

export interface AddPersonButtonProps {
  onAdd: (name: string, email: string, role: Role.CO_APPLICANT | Role.GUARANTOR) => void;
}

export function AddPersonButton({ onAdd }: AddPersonButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role.CO_APPLICANT | Role.GUARANTOR>(Role.CO_APPLICANT);

  const handleAdd = () => {
    if (!name || !email) return;

    onAdd(name, email, role);

    // Reset form
    setName("");
    setEmail("");
    setRole(Role.CO_APPLICANT);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Co-applicant / Guarantor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Additional Person</DialogTitle>
          <DialogDescription>
            Add a co-applicant or guarantor to this application. They will be invited to complete their own section.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="person-name">Full Name</Label>
            <Input
              id="person-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-email">Email Address</Label>
            <Input
              id="person-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role.CO_APPLICANT | Role.GUARANTOR)}
            >
              <SelectTrigger id="person-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.CO_APPLICANT}>Co-applicant</SelectItem>
                <SelectItem value={Role.GUARANTOR}>Guarantor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!name || !email}>
            Add Person
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
