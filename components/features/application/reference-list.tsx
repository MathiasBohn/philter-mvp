"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, Upload, FileText } from "lucide-react";
import { ReferenceLetterEntry, ReferenceType } from "@/lib/types";
import { useState } from "react";

export interface ReferenceListProps {
  references: ReferenceLetterEntry[];
  onAdd: (reference: ReferenceLetterEntry) => void;
  onRemove: (id: string) => void;
  onUpload?: (referenceId: string, file: File) => void;
}

export function ReferenceList({ references, onAdd, onRemove, onUpload }: ReferenceListProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [referenceType, setReferenceType] = useState<ReferenceType>(ReferenceType.PERSONAL);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    company: "",
    institution: "",
    occupiedFrom: "",
    occupiedTo: "",
  });

  const personalReferences = references.filter((r) => r.type === ReferenceType.PERSONAL);
  const professionalReferences = references.filter((r) => r.type === ReferenceType.PROFESSIONAL);
  const landlordReferences = references.filter((r) => r.type === ReferenceType.LANDLORD);
  const bankReferences = references.filter((r) => r.type === ReferenceType.BANK);

  const handleAddReference = () => {
    // For bank references, name is optional but institution is required
    if (referenceType === ReferenceType.BANK) {
      if (!formData.institution || !formData.phone || !formData.email) {
        return;
      }
    } else {
      if (!formData.name || !formData.phone || !formData.email) {
        return;
      }
    }

    const newReference: ReferenceLetterEntry = {
      id: `ref-${Date.now()}`,
      type: referenceType,
      name: referenceType === ReferenceType.BANK ? formData.institution : formData.name,
      phone: formData.phone,
      email: formData.email,
      relationship: referenceType === ReferenceType.PERSONAL ? formData.relationship : undefined,
      company: referenceType === ReferenceType.PROFESSIONAL ? formData.company : undefined,
      institution: referenceType === ReferenceType.BANK ? formData.institution : undefined,
      occupiedFrom: referenceType === ReferenceType.LANDLORD && formData.occupiedFrom
        ? new Date(formData.occupiedFrom)
        : undefined,
      occupiedTo: referenceType === ReferenceType.LANDLORD && formData.occupiedTo
        ? new Date(formData.occupiedTo)
        : undefined,
    };

    onAdd(newReference);
    setFormData({
      name: "",
      phone: "",
      email: "",
      relationship: "",
      company: "",
      institution: "",
      occupiedFrom: "",
      occupiedTo: "",
    });
    setShowDialog(false);
  };

  const handleFileSelect = (referenceId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(referenceId, file);
    }
  };

  const renderReferenceCard = (reference: ReferenceLetterEntry) => (
    <Card key={reference.id}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {reference.type === ReferenceType.BANK && reference.institution
                  ? reference.institution
                  : reference.name}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {reference.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{reference.email}</p>
            <p className="text-sm text-muted-foreground">{reference.phone}</p>
            {reference.relationship && (
              <p className="text-sm text-muted-foreground">Relationship: {reference.relationship}</p>
            )}
            {reference.company && (
              <p className="text-sm text-muted-foreground">Company: {reference.company}</p>
            )}
            {reference.occupiedFrom && (
              <p className="text-sm text-muted-foreground">
                Occupied: {new Date(reference.occupiedFrom).toLocaleDateString()}
                {reference.occupiedTo && ` - ${new Date(reference.occupiedTo).toLocaleDateString()}`}
              </p>
            )}

            {/* Upload Letter */}
            <div className="mt-2">
              {reference.letterDocumentId ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>Reference letter uploaded</span>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id={`upload-${reference.id}`}
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileSelect(reference.id, e)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`upload-${reference.id}`)?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Letter (Optional)
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(reference.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Personal References */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Personal References <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">At least 3 required</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setReferenceType(ReferenceType.PERSONAL);
              setShowDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Personal Reference
          </Button>
        </div>
        {personalReferences.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No personal references added yet. Please add at least 3.
            </CardContent>
          </Card>
        ) : (
          personalReferences.map(renderReferenceCard)
        )}
      </div>

      {/* Professional Reference */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Professional Reference <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">At least 1 professional OR landlord reference required</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setReferenceType(ReferenceType.PROFESSIONAL);
              setShowDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Professional Reference
          </Button>
        </div>
        {professionalReferences.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No professional references added yet.
            </CardContent>
          </Card>
        ) : (
          professionalReferences.map(renderReferenceCard)
        )}
      </div>

      {/* Landlord References */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Landlord References</h3>
            <p className="text-sm text-muted-foreground">1-2 recommended</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setReferenceType(ReferenceType.LANDLORD);
              setShowDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Landlord Reference
          </Button>
        </div>
        {landlordReferences.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No landlord references added yet.
            </CardContent>
          </Card>
        ) : (
          landlordReferences.map(renderReferenceCard)
        )}
      </div>

      {/* Bank Reference */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Bank Reference <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">1 required</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setReferenceType(ReferenceType.BANK);
              setShowDialog(true);
            }}
            disabled={bankReferences.length >= 1}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bank Reference
          </Button>
        </div>
        {bankReferences.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No bank reference added yet. Please add 1.
            </CardContent>
          </Card>
        ) : (
          bankReferences.map(renderReferenceCard)
        )}
      </div>

      {/* Add Reference Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add {referenceType} Reference</DialogTitle>
            <DialogDescription>
              Enter the contact information for your {referenceType.toLowerCase()} reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name field - not shown for bank references */}
              {referenceType !== ReferenceType.BANK && (
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="ref-name">Name *</Label>
                  <Input
                    id="ref-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
              )}

              {/* Bank reference shows institution first */}
              {referenceType === ReferenceType.BANK && (
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="ref-institution">Financial Institution *</Label>
                  <Input
                    id="ref-institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Bank name (e.g., Chase, Bank of America)"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ref-phone">Phone *</Label>
                <Input
                  id="ref-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ref-email">Email *</Label>
                <Input
                  id="ref-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              {referenceType === ReferenceType.PERSONAL && (
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="ref-relationship">Relationship</Label>
                  <Input
                    id="ref-relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Friend, Colleague, etc."
                  />
                </div>
              )}

              {referenceType === ReferenceType.PROFESSIONAL && (
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="ref-company">Company</Label>
                  <Input
                    id="ref-company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
              )}

              {referenceType === ReferenceType.LANDLORD && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ref-from">Occupied From</Label>
                    <Input
                      id="ref-from"
                      type="date"
                      value={formData.occupiedFrom}
                      onChange={(e) => setFormData({ ...formData, occupiedFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ref-to">Occupied To</Label>
                    <Input
                      id="ref-to"
                      type="date"
                      value={formData.occupiedTo}
                      onChange={(e) => setFormData({ ...formData, occupiedTo: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddReference}>
              Add Reference
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
