"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionType } from "@/lib/types"
import { Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/lib/hooks/use-toast"

interface BuildingOption {
  id: string
  name: string
  code: string
  address: string
}

export default function BrokerNewApplicationPage() {
  const router = useRouter()

  // Fetch buildings from API
  const [buildings, setBuildings] = useState<BuildingOption[]>([])
  const [loadingBuildings, setLoadingBuildings] = useState(true)
  const [buildingsError, setBuildingsError] = useState<string | null>(null)

  const [buildingId, setBuildingId] = useState("")
  const [unit, setUnit] = useState("")
  const [transactionType, setTransactionType] = useState<TransactionType | "">("")
  const [applicantEmail, setApplicantEmail] = useState("")
  const [applicantName, setApplicantName] = useState("")
  const [sendInvitation, setSendInvitation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdApplicationId, setCreatedApplicationId] = useState("")
  const [invitationSent, setInvitationSent] = useState(false)

  // Fetch buildings on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await fetch('/api/buildings')
        if (!response.ok) {
          throw new Error('Failed to fetch buildings')
        }
        const data = await response.json()
        setBuildings(data.buildings || [])
      } catch (error) {
        console.error('Error fetching buildings:', error)
        setBuildingsError('Failed to load buildings. Please refresh the page.')
      } finally {
        setLoadingBuildings(false)
      }
    }
    fetchBuildings()
  }, [])

  const handleBuildingChange = (value: string) => {
    setBuildingId(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!buildingId || !transactionType) {
      toast.error('Please select a building and transaction type')
      return
    }

    // If sending invitation, require applicant details
    if (sendInvitation && (!applicantEmail || !applicantName)) {
      toast.error('Please enter applicant name and email to send an invitation')
      return
    }

    setIsSubmitting(true)

    try {
      // Use the broker-specific endpoint for creating applications
      const response = await fetch('/api/broker/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          unit: unit || undefined,
          transactionType,
          // Only include applicant details if sending invitation
          ...(sendInvitation && {
            applicantEmail,
            applicantName,
          }),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details?.[0]?.message || 'Failed to create application')
      }

      setCreatedApplicationId(result.application.id)
      setInvitationSent(sendInvitation)
      setShowSuccessDialog(true)
      toast.success(sendInvitation
        ? `Application created! Invitation sent to ${applicantEmail}`
        : 'Application created successfully!')
    } catch (error) {
      console.error('Failed to create application:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    router.push(`/broker/${createdApplicationId}/qa`)
  }

  const handleViewPipeline = () => {
    router.push(`/broker`)
  }

  // Show error if buildings failed to load
  if (buildingsError) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Application</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Buildings</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {buildingsError}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show message if no buildings exist
  if (!loadingBuildings && buildings.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Application</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Buildings Available</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              There are no buildings in the system yet. Please contact your administrator to add buildings before creating applications.
            </p>
            <Button onClick={() => router.push('/broker')} variant="outline">
              Back to Pipeline
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Application</h1>
        <p className="mt-2 text-muted-foreground">
          Set up a new application for your client
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Select the building and unit for this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="building">Building *</Label>
              {loadingBuildings ? (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading buildings...</span>
                </div>
              ) : (
                <Select value={buildingId} onValueChange={handleBuildingChange} disabled={isSubmitting}>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{building.name}</span>
                          <span className="text-sm text-muted-foreground">{building.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit Number</Label>
              <Input
                id="unit"
                placeholder="e.g., 12A"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setTransactionType(value as TransactionType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="transactionType">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionType.COOP_PURCHASE}>Co-op Purchase</SelectItem>
                  <SelectItem value={TransactionType.CONDO_PURCHASE}>Condo Purchase</SelectItem>
                  <SelectItem value={TransactionType.COOP_SUBLET}>Co-op Sublet</SelectItem>
                  <SelectItem value={TransactionType.CONDO_LEASE}>Condo Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Applicant Invitation</CardTitle>
                <CardDescription>
                  Optionally invite an applicant to complete the application
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="send-invitation" className="text-sm font-normal">
                  Send invitation now
                </Label>
                <Switch
                  id="send-invitation"
                  checked={sendInvitation}
                  onCheckedChange={setSendInvitation}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardHeader>
          {sendInvitation && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Applicant Name *</Label>
                <Input
                  id="applicantName"
                  placeholder="John Doe"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicantEmail">Applicant Email *</Label>
                <Input
                  id="applicantEmail"
                  type="email"
                  placeholder="applicant@example.com"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  An invitation will be sent to this email address with a link to complete the application.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/broker')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loadingBuildings}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sendInvitation ? 'Create & Send Invitation' : 'Create Application'}
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Application Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              {invitationSent
                ? <>An invitation has been sent to <strong>{applicantEmail}</strong> to complete their application.</>
                : 'Your application has been created. You can invite an applicant later from the application workspace.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <Button onClick={handleContinue} className="w-full">
              Go to Application Workspace
            </Button>
            <Button onClick={handleViewPipeline} variant="outline" className="w-full">
              Back to Pipeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
