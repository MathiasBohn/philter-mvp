"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle, UserPlus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { Person, Role } from "@/lib/types";
import { FormSkeleton } from "@/components/loading/form-skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PersonForm = Omit<Person, "id" | "dob" | "addressHistory"> & { id?: string };

export default function PeoplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [people, setPeople] = useState<PersonForm[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<PersonForm>({
    fullName: "",
    email: "",
    phone: "",
    ssnLast4: "",
    role: Role.CO_APPLICANT,
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const savedData = localStorage.getItem(`people_${id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setPeople(parsed.people || []);
        }
      } catch (error) {
        console.error("Error loading people data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage
    localStorage.setItem(`people_${id}`, JSON.stringify({ people }));

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleContinue = async () => {
    await handleSave();
    router.push(`/applications/${id}/profile`);
  };

  const handleAddPerson = () => {
    if (!newPerson.fullName || !newPerson.email) return;

    const person: PersonForm = {
      ...newPerson,
      id: Date.now().toString(),
    };

    setPeople([...people, person]);
    setNewPerson({
      fullName: "",
      email: "",
      phone: "",
      ssnLast4: "",
      role: Role.CO_APPLICANT,
    });
    setIsDialogOpen(false);
  };

  const handleRemovePerson = (personId: string) => {
    setPeople(people.filter((p) => p.id !== personId));
  };

  const getRoleBadge = (role: Role) => {
    if (role === Role.CO_APPLICANT) {
      return <Badge variant="secondary">Co-applicant</Badge>;
    }
    return <Badge variant="outline">Guarantor</Badge>;
  };

  if (isLoading) {
    return <FormSkeleton sections={2} fieldsPerSection={4} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">People</h1>
        <p className="mt-2 text-muted-foreground">
          Manage co-applicants and guarantors for this application
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Saved successfully</AlertTitle>
          <AlertDescription>People information has been saved.</AlertDescription>
        </Alert>
      )}

      {/* People List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Co-applicants & Guarantors
              </CardTitle>
              <CardDescription>
                Add co-applicants or guarantors to this application
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Co-applicant or Guarantor</DialogTitle>
                  <DialogDescription>
                    Add a co-applicant or guarantor to this application. They will complete their own profile information.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={newPerson.fullName}
                      onChange={(e) => setNewPerson({ ...newPerson, fullName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPerson.email}
                      onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newPerson.phone}
                      onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newPerson.role}
                      onValueChange={(value) => setNewPerson({ ...newPerson, role: value as Role.CO_APPLICANT | Role.GUARANTOR })}
                    >
                      <SelectTrigger id="role">
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
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPerson}
                    disabled={!newPerson.fullName || !newPerson.email}
                  >
                    Add Person
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No co-applicants or guarantors added yet.</p>
              <p className="text-xs mt-1">Click "Add Person" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{person.fullName}</p>
                      {getRoleBadge(person.role)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      <p>{person.email}</p>
                      {person.phone && <p>{person.phone}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => person.id && handleRemovePerson(person.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href={`/applications/${id}`}>Back to Overview</Link>
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" onClick={handleContinue}>
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
