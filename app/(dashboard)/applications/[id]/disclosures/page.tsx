"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { DisclosureCard, type Disclosure } from "@/components/features/application/disclosure-card"
import { FormActions } from "@/components/forms/form-actions"
import { TransactionType, DisclosureType } from "@/lib/types"

const DISCLOSURE_TEMPLATES = {
  LEAD_PAINT_CERTIFICATION: {
    id: "lead-paint-certification",
    type: DisclosureType.LEAD_PAINT_CERTIFICATION,
    title: "Lead Paint Certification and Acknowledgement of Responsibility",
    description:
      "Required certification acknowledging your responsibilities regarding lead-based paint hazards in residential housing built before 1978.",
    pdfUrl: "/disclosures/lead-paint-certification.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  LEAD_WARNING_STATEMENT: {
    id: "lead-warning-statement",
    type: DisclosureType.LEAD_WARNING_STATEMENT,
    title: "Lead Warning Statement",
    description:
      "Federal law requires disclosure of known information on lead-based paint and lead-based paint hazards before sale or lease of housing built before 1978.",
    pdfUrl: "/disclosures/lead-paint-warning-statement.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  LEAD_DISCLOSURE: {
    id: "lead-disclosure",
    type: DisclosureType.LEAD_DISCLOSURE,
    title: "Lead-Based Paint Disclosure",
    description:
      "Disclosure of information and acknowledgment regarding the presence of lead-based paint and/or lead-based paint hazards.",
    pdfUrl: "/disclosures/lead-disclosure.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  EPA_LEAD_PAMPHLET: {
    id: "epa-lead-pamphlet",
    type: DisclosureType.EPA_LEAD_PAMPHLET,
    title: "EPA Lead Pamphlet: Protect Your Family from Lead in Your Home",
    description:
      "EPA-approved pamphlet providing information about lead-based paint hazards and how to protect your family.",
    pdfUrl: "/disclosures/epa-lead-pamphlet.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  LOCAL_LAW_38: {
    id: "local-law-38",
    type: DisclosureType.LOCAL_LAW_38,
    title: "NYC Local Law 38: Window Falls Prevention",
    description:
      "New York City Local Law 38 requires landlords to provide annual notices about window guard installation to prevent window falls.",
    pdfUrl: "/disclosures/local-law-38.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  LOCAL_LAW_55: {
    id: "local-law-55",
    type: DisclosureType.LOCAL_LAW_55,
    title: "Local Law 55: Indoor Allergen Hazards",
    description:
      "New York City Local Law 55 requires landlords to provide tenants with information about indoor allergen hazards, including mold, mice, rats, and cockroaches. This disclosure informs you of your rights and the landlord's responsibilities regarding these allergens.",
    pdfUrl: "/samples/local-law-55-disclosure.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  WINDOW_GUARD: {
    id: "window-guard",
    type: DisclosureType.WINDOW_GUARD,
    title: "Window Guard Lease Notice",
    description:
      "New York City law requires landlords to install window guards in apartments where children 10 years old or younger reside. This notice informs you of your right to request window guard installation and your responsibility to notify the landlord if a child under 11 resides or will reside in the apartment.",
    pdfUrl: "/samples/window-guard-notice.pdf",
    acknowledged: false,
    requiresUpload: true,
  },
  FLOOD_DISCLOSURE: {
    id: "flood-disclosure",
    type: DisclosureType.FLOOD_DISCLOSURE,
    title: "NY State Flood History and Risk Notice",
    description:
      "New York State law requires disclosure of flood history and flood risk information for all residential properties. This disclosure informs you about the property's location in relation to flood zones and any history of flood damage.",
    pdfUrl: "/disclosures/ny-state-flood-disclosure.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    floodOptions: [],
    signature: "",
  },
  HOUSE_RULES: {
    id: "house-rules",
    type: DisclosureType.HOUSE_RULES,
    title: "House Rules Acknowledgement",
    description:
      "Please review the building's house rules, which outline the policies and regulations governing residence in the building. You must acknowledge that you have received and reviewed these rules.",
    pdfUrl: "/samples/house-rules-template.pdf",
    houseRulesUrl: "/samples/house-rules-template.pdf",
    acknowledged: false,
    requiresUpload: false,
  },
  CONSUMER_REPORT_AUTH: {
    id: "consumer-report-auth",
    type: DisclosureType.CONSUMER_REPORT_AUTH,
    title: "Consumer Report Authorization",
    description:
      "Federal law requires your written authorization before we can obtain consumer reports (including credit reports and background checks) as part of your application. This form authorizes the building management and board to obtain such reports.",
    pdfUrl: "/samples/consumer-report-authorization.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
}

export default function DisclosuresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)
  const [disclosures, setDisclosures] = useState<Disclosure[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Load transaction type and disclosures from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Try to get transaction type from application data
        const appData = localStorage.getItem(`application-${id}`)
        let loadedTxType: TransactionType | null = null

        if (appData) {
          const data = JSON.parse(appData)
          loadedTxType = data.transactionType
        }

        // Load saved disclosures
        const saved = localStorage.getItem(`disclosures-data-${id}`)
        let loadedDisclosures: typeof disclosures | null = null

        if (saved) {
          const data = JSON.parse(saved)
          if (data.disclosures) {
            loadedDisclosures = data.disclosures
          }
        } else if (loadedTxType) {
          // Initialize disclosures for lease/sublet
          if (
            loadedTxType === TransactionType.CONDO_LEASE ||
            loadedTxType === TransactionType.COOP_SUBLET
          ) {
            // Load profile data to pre-populate consumer report authorization
            const profileData = localStorage.getItem(`profile-data-${id}`)
            const consumerReportTemplate: Disclosure = {
              ...DISCLOSURE_TEMPLATES.CONSUMER_REPORT_AUTH,
              consumerReportData: {
                firstName: "",
                middleName: "",
                lastName: "",
                ssn: "",
                address: {
                  street: "",
                  unit: "",
                  city: "",
                  state: "",
                  zip: "",
                },
              }
            }

            if (profileData) {
              try {
                const profile = JSON.parse(profileData)
                consumerReportTemplate.consumerReportData = {
                  firstName: profile.firstName || "",
                  middleName: profile.middleName || "",
                  lastName: profile.lastName || "",
                  ssn: profile.ssn || "",
                  dob: profile.dob ? new Date(profile.dob) : undefined,
                  address: profile.currentAddress || {
                    street: "",
                    unit: "",
                    city: "",
                    state: "",
                    zip: "",
                  },
                }
              } catch (error) {
                console.error("Error parsing profile data:", error)
              }
            }

            loadedDisclosures = [
              DISCLOSURE_TEMPLATES.LEAD_PAINT_CERTIFICATION,
              DISCLOSURE_TEMPLATES.LEAD_WARNING_STATEMENT,
              DISCLOSURE_TEMPLATES.LEAD_DISCLOSURE,
              DISCLOSURE_TEMPLATES.EPA_LEAD_PAMPHLET,
              DISCLOSURE_TEMPLATES.LOCAL_LAW_38,
              DISCLOSURE_TEMPLATES.LOCAL_LAW_55,
              DISCLOSURE_TEMPLATES.WINDOW_GUARD,
              DISCLOSURE_TEMPLATES.FLOOD_DISCLOSURE,
              DISCLOSURE_TEMPLATES.HOUSE_RULES,
              consumerReportTemplate,
            ]
          }
        }

        // Batch state updates
        if (loadedTxType) {
          setTransactionType(loadedTxType)
        }
        if (loadedDisclosures) {
          setDisclosures(loadedDisclosures)
        }
      } catch (error) {
        console.error("Error loading disclosures data:", error)
      }
    }

    loadData()
  }, [id])

  const handleAcknowledge = (disclosureId: string, acknowledged: boolean) => {
    setDisclosures((prev) =>
      prev.map((d) => (d.id === disclosureId ? { ...d, acknowledged } : d))
    )
  }

  const handleDocumentUpload = (disclosureId: string, file: File) => {
    setDisclosures((prev) =>
      prev.map((d) =>
        d.id === disclosureId
          ? {
              ...d,
              signedDocument: {
                id: Math.random().toString(36).substring(7),
                file,
                progress: 100,
                status: "complete" as const,
              },
            }
          : d
      )
    )
  }

  const handleDocumentRemove = (disclosureId: string) => {
    setDisclosures((prev) =>
      prev.map((d) =>
        d.id === disclosureId ? { ...d, signedDocument: undefined } : d
      )
    )
  }

  const handleFloodOptionsChange = (disclosureId: string, options: string[]) => {
    setDisclosures((prev) =>
      prev.map((d) =>
        d.id === disclosureId ? { ...d, floodOptions: options } : d
      )
    )
  }

  const handleSignatureChange = (disclosureId: string, signature: string) => {
    setDisclosures((prev) =>
      prev.map((d) =>
        d.id === disclosureId ? { ...d, signature } : d
      )
    )
  }

  const calculateAge = (birthDate: Date | undefined): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const validate = () => {
    const newErrors: string[] = []

    // Check if all disclosures are acknowledged
    const unacknowledged = disclosures.filter((d) => !d.acknowledged)
    if (unacknowledged.length > 0) {
      newErrors.push(
        "You must acknowledge all disclosures before continuing"
      )
    }

    // Check if required uploads are provided
    const missingUploads = disclosures.filter(
      (d) => d.requiresUpload && !d.signedDocument
    )
    if (missingUploads.length > 0) {
      newErrors.push(
        "You must upload all required signed disclosure forms"
      )
    }

    // Check flood disclosure completion
    const floodDisclosure = disclosures.find(
      (d) => d.type === DisclosureType.FLOOD_DISCLOSURE
    )
    if (floodDisclosure) {
      if (!floodDisclosure.floodOptions || floodDisclosure.floodOptions.length === 0) {
        newErrors.push(
          "You must select at least one flood zone option for the Flood Disclosure"
        )
      }
      if (!floodDisclosure.signature || floodDisclosure.signature.trim() === "") {
        newErrors.push(
          "You must provide a digital signature for the Flood Disclosure"
        )
      }
    }

    // Check consumer report authorization completion
    const consumerReportAuth = disclosures.find(
      (d) => d.type === DisclosureType.CONSUMER_REPORT_AUTH
    )
    if (consumerReportAuth) {
      // Check age requirement (must be 18+)
      if (consumerReportAuth.consumerReportData?.dob) {
        const age = calculateAge(consumerReportAuth.consumerReportData.dob)
        if (age < 18) {
          newErrors.push(
            "You must be at least 18 years old to sign the Consumer Report Authorization"
          )
        }
      } else {
        newErrors.push(
          "Date of birth is required for the Consumer Report Authorization. Please complete your profile first."
        )
      }

      // Check signature
      if (!consumerReportAuth.signature || consumerReportAuth.signature.trim() === "") {
        newErrors.push(
          "You must provide a digital signature for the Consumer Report Authorization"
        )
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Save to localStorage
    const data = {
      disclosures,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(`disclosures-data-${id}`, JSON.stringify(data))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSaving(false)
  }

  const handleContinue = async () => {
    if (!validate()) {
      return
    }

    await handleSave()
    router.push(`/applications/${id}/review`)
  }

  // Skip this screen if not a lease/sublet transaction
  const isLeaseOrSublet =
    transactionType === TransactionType.CONDO_LEASE ||
    transactionType === TransactionType.COOP_SUBLET

  // Redirect effect for non-lease/sublet transactions
  useEffect(() => {
    if (!isLeaseOrSublet && transactionType) {
      router.push(`/applications/${id}/review`)
    }
  }, [isLeaseOrSublet, transactionType, id, router])

  if (!isLeaseOrSublet && transactionType) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Disclosures are not required for purchase transactions. Redirecting to
            review page...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold">Disclosures</h1>
        <p className="mt-2 text-muted-foreground">
          Please review and acknowledge the following legally required disclosures for
          lease and sublet transactions in New York City.
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      <div className="space-y-6">
        {disclosures.map((disclosure) => (
          <DisclosureCard
            key={disclosure.id}
            disclosure={disclosure}
            onAcknowledge={(acknowledged) =>
              handleAcknowledge(disclosure.id, acknowledged)
            }
            onDocumentUpload={(file) => handleDocumentUpload(disclosure.id, file)}
            onDocumentRemove={() => handleDocumentRemove(disclosure.id)}
            onFloodOptionsChange={(options) =>
              handleFloodOptionsChange(disclosure.id, options)
            }
            onSignatureChange={(signature) =>
              handleSignatureChange(disclosure.id, signature)
            }
          />
        ))}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These disclosures are required by New York City law for all residential lease
          and sublet transactions. You must acknowledge and, where required, sign and
          upload the disclosure forms before submitting your application.
        </AlertDescription>
      </Alert>

      <Separator />

      <FormActions
        onSave={handleSave}
        onCancel={() => router.push(`/applications/${id}`)}
        onContinue={handleContinue}
        isSaving={isSaving}
        continueText="Save & Continue"
      />
    </div>
  )
}
