'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, Link as LinkIcon, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Invitation {
  id: string
  email: string
  token: string
  status: string
  expires_at: string
  created_at: string
  accepted_at: string | null
}

interface InvitationManagerProps {
  applicationId: string
}

export function InvitationManager({ applicationId }: InvitationManagerProps) {
  const queryClient = useQueryClient()
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showClaimLinkDialog, setShowClaimLinkDialog] = useState(false)
  const [email, setEmail] = useState('')
  const [claimLink, setClaimLink] = useState<string | null>(null)

  // Use React Query to fetch invitations - eliminates double fetch from useCallback dependency
  const { data: invitations = [], isLoading: loading } = useQuery({
    queryKey: ['invitations', applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/invitations?application_id=${applicationId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load invitations')
      }

      return data.invitations || []
    },
    enabled: !!applicationId,
  })

  // Mutation for sending email invitations
  const sendInvitationMutation = useMutation({
    mutationFn: async (invitationEmail: string) => {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          email: invitationEmail,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      return data
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully')
      setEmail('')
      setShowEmailDialog(false)
      // Invalidate and refetch invitations
      queryClient.invalidateQueries({ queryKey: ['invitations', applicationId] })
    },
    onError: (error) => {
      console.error('Error sending invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    },
  })

  // Mutation for generating claim links
  const generateClaimLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/claim-link`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate claim link')
      }

      return data
    },
    onSuccess: (data) => {
      setClaimLink(data.claim_url)
      toast.success('Claim link generated successfully')
      // Invalidate and refetch invitations
      queryClient.invalidateQueries({ queryKey: ['invitations', applicationId] })
    },
    onError: (error) => {
      console.error('Error generating claim link:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate claim link')
      setShowClaimLinkDialog(false)
    },
  })

  const handleSendEmailInvitation = () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }
    sendInvitationMutation.mutate(email)
  }

  const handleGenerateClaimLink = () => {
    generateClaimLinkMutation.mutate()
  }

  const handleCopyClaimLink = () => {
    if (claimLink) {
      navigator.clipboard.writeText(claimLink)
      toast.success('Claim link copied to clipboard')
    }
  }

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.status === 'ACCEPTED') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      )
    }

    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Manage applicant invitations for this application
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Email Invitation</DialogTitle>
                    <DialogDescription>
                      Enter the applicant&apos;s email address to send them an invitation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="applicant@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={sendInvitationMutation.isPending}
                      />
                    </div>
                    <Alert>
                      <AlertDescription>
                        The applicant will receive an email with a link to accept the invitation and create their account.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={handleSendEmailInvitation}
                      disabled={sendInvitationMutation.isPending || !email}
                      className="w-full"
                    >
                      {sendInvitationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showClaimLinkDialog} onOpenChange={(open) => {
                setShowClaimLinkDialog(open)
                if (!open) setClaimLink(null)
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Generate Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Claim Link</DialogTitle>
                    <DialogDescription>
                      Create a shareable link that anyone can use to claim this application.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!claimLink ? (
                      <>
                        <Alert>
                          <AlertDescription>
                            Anyone with this link will be able to claim the application and become an applicant.
                            The link will expire in 30 days.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={handleGenerateClaimLink}
                          disabled={generateClaimLinkMutation.isPending}
                          className="w-full"
                        >
                          {generateClaimLinkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Generate Claim Link
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            Claim link generated successfully! Share this link with the applicant.
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          <Label>Claim Link</Label>
                          <div className="flex gap-2">
                            <Input
                              value={claimLink}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              onClick={handleCopyClaimLink}
                              size="icon"
                              variant="outline"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No invitations sent yet</p>
              <p className="text-sm">Send an email invitation or generate a claim link to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation: Invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      {invitation.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invitation.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Claim Link</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Sent {formatDate(invitation.created_at)}
                        {invitation.accepted_at && ` • Accepted ${formatDate(invitation.accepted_at)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
