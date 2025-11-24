"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, BuildingType } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { storageService, STORAGE_KEYS } from "@/lib/storage"

type CreateBuildingModalProps = {
  open: boolean
  onClose: () => void
  onSave: (building: Building) => void
}

export function CreateBuildingModal({ open, onClose, onSave }: CreateBuildingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const buildingIdRef = useRef(0)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as BuildingType | "",
    street: "",
    unit: "",
    city: "New York",
    state: "NY",
    zip: "",
    managementCompany: "",
    contactEmail: "",
    contactPhone: "",
  })

  const generateBuildingCodePrefix = (name: string): string => {
    // Generate building code prefix from name (e.g., "The Manhattan" -> "MAN")
    return name
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 3)
      .padEnd(3, 'X')
  }

  const generateBuildingCode = (name: string): string => {
    // Generate building code with incremental suffix
    const prefix = generateBuildingCodePrefix(name)
    const suffix = String(Math.floor(Math.random() * 900) + 100)
    return `${prefix}${suffix}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.type || !formData.street || !formData.city || !formData.state || !formData.zip) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate unique ID and code
    buildingIdRef.current += 1
    const uniqueId = `bldg-${Date.now()}-${buildingIdRef.current}`

    const newBuilding: Building = {
      id: uniqueId,
      name: formData.name,
      code: generateBuildingCode(formData.name),
      type: formData.type as BuildingType,
      address: {
        street: formData.street,
        unit: formData.unit || undefined,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
    }

    // Store in storage
    const existingBuildingsData = storageService.get(STORAGE_KEYS.CUSTOM_BUILDINGS, '[]');
    const existingBuildings = typeof existingBuildingsData === 'string' ? JSON.parse(existingBuildingsData) : existingBuildingsData;
    const updatedBuildings = [...existingBuildings, newBuilding]
    storageService.set(STORAGE_KEYS.CUSTOM_BUILDINGS, updatedBuildings)

    setIsLoading(false)
    onSave(newBuilding)

    // Reset form
    setFormData({
      name: "",
      type: "",
      street: "",
      unit: "",
      city: "New York",
      state: "NY",
      zip: "",
      managementCompany: "",
      contactEmail: "",
      contactPhone: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Building</DialogTitle>
          <DialogDescription>
            Add a new building to the system. A unique building code will be automatically generated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Building Information */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold text-sm">Building Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">
                    Building Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., The Manhattan"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Building Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BuildingType.CONDO}>Condo</SelectItem>
                      <SelectItem value={BuildingType.COOP}>Co-op</SelectItem>
                      <SelectItem value={BuildingType.RENTAL}>Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code-preview">Building Code (Auto-generated)</Label>
                  <Input
                    id="code-preview"
                    value={formData.name ? `${generateBuildingCodePrefix(formData.name)}###` : "---"}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Final code will be generated on save</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold text-sm">Address</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="street"
                    placeholder="e.g., 123 Park Avenue"
                    value={formData.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit/Suite (Optional)</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., Suite 100"
                    value={formData.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., New York"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">
                    ZIP Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="zip"
                    placeholder="10016"
                    maxLength={5}
                    value={formData.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional Information */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <h3 className="font-semibold text-sm">Management Information (Optional)</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="managementCompany">Management Company</Label>
                  <Input
                    id="managementCompany"
                    placeholder="e.g., ABC Property Management"
                    value={formData.managementCompany}
                    onChange={(e) => handleChange("managementCompany", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@building.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="(212) 555-1234"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Building
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
