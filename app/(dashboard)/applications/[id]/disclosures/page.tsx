"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { DisclosureCard, type Disclosure } from "@/components/features/application/disclosure-card"
import { FormActions } from "@/components/forms/form-actions"
import { FormSkeleton } from "@/components/loading/form-skeleton"
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
  SUBLET_POLICY: {
    id: "sublet-policy",
    type: DisclosureType.SUBLET_POLICY,
    title: "Sublet Policy Acknowledgement",
    description:
      "Please review the building's sublet policy, which outlines the terms and conditions for subletting your unit. This policy must be acknowledged before your sublet application can proceed.",
    pdfUrl: "/samples/sublet-policy.pdf",
    acknowledged: false,
    requiresUpload: true,
  },
  PET_ACKNOWLEDGEMENT: {
    id: "pet-acknowledgement",
    type: DisclosureType.PET_ACKNOWLEDGEMENT,
    title: "Pet Acknowledgement",
    description:
      "Please provide information about any pets you plan to bring into the unit. Building pet policies must be followed at all times.",
    pdfUrl: "/samples/pet-policy.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
    hasPets: false,
    pets: [],
  },
  SMOKE_DETECTOR: {
    id: "smoke-detector",
    type: DisclosureType.SMOKE_DETECTOR,
    title: "Smoke Detector Acknowledgement",
    description:
      "New York City law requires all residential units to have working smoke detectors. You acknowledge your responsibility for maintaining these devices.",
    pdfUrl: "/samples/smoke-detector-notice.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  CARBON_MONOXIDE_DETECTOR: {
    id: "carbon-monoxide-detector",
    type: DisclosureType.CARBON_MONOXIDE_DETECTOR,
    title: "Carbon Monoxide Detector Acknowledgement",
    description:
      "New York City law requires all residential units to have working carbon monoxide detectors. You acknowledge your responsibility for maintaining these devices.",
    pdfUrl: "/samples/carbon-monoxide-detector-notice.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  // Phase 2 Acknowledgements
  PERSONAL_INFO_AUTH: {
    id: "personal-info-auth",
    type: DisclosureType.PERSONAL_INFO_AUTH,
    title: "Personal Information Authorization",
    description:
      "I authorize the building management, board of directors, and their representatives to collect, use, and verify the personal information provided in this application for the purpose of evaluating my application for residence. This includes but is not limited to employment history, financial records, and personal references.",
    pdfUrl: "/disclosures/personal-info-authorization.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  BACKGROUND_CHECK_CONSENT: {
    id: "background-check-consent",
    type: DisclosureType.BACKGROUND_CHECK_CONSENT,
    title: "Background Check Consent",
    description:
      "I consent to a comprehensive background check including but not limited to criminal history, previous residency verification, and litigation search. I understand this information will be used solely for the purpose of evaluating my application and will be kept confidential in accordance with applicable law.",
    pdfUrl: "/disclosures/background-check-consent.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  REFERENCE_CONTACT_AUTH: {
    id: "reference-contact-auth",
    type: DisclosureType.REFERENCE_CONTACT_AUTH,
    title: "Reference Contact Authorization",
    description:
      "I authorize the building management and board to contact my personal and professional references as listed in this application. I release these references from any liability for providing truthful information about my character, reliability, and suitability as a prospective resident.",
    pdfUrl: "/disclosures/reference-contact-authorization.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  EMPLOYMENT_VERIFICATION_AUTH: {
    id: "employment-verification-auth",
    type: DisclosureType.EMPLOYMENT_VERIFICATION_AUTH,
    title: "Employment Verification Authorization",
    description:
      "I authorize the building management and board to verify my employment history and current employment status with my current and former employers. I authorize my employers to release information regarding my position, salary, employment dates, and job performance.",
    pdfUrl: "/disclosures/employment-verification-authorization.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  FINANCIAL_VERIFICATION_AUTH: {
    id: "financial-verification-auth",
    type: DisclosureType.FINANCIAL_VERIFICATION_AUTH,
    title: "Financial Statement Verification Authorization",
    description:
      "I authorize the building management and board to verify the financial information provided in this application, including but not limited to bank account balances, investment accounts, assets, and liabilities. I authorize my financial institutions to release this information for verification purposes.",
    pdfUrl: "/disclosures/financial-verification-authorization.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  MOVE_IN_DATE_COMMITMENT: {
    id: "move-in-date-commitment",
    type: DisclosureType.MOVE_IN_DATE_COMMITMENT,
    title: "Move-In Date Commitment",
    description:
      "I acknowledge that if my application is approved, I commit to the proposed move-in date stated in this application. I understand that any changes to the move-in date must be approved by the building management and board in advance. Failure to move in on the committed date without prior approval may result in application denial or additional fees.",
    pdfUrl: "/disclosures/move-in-date-commitment.pdf",
    acknowledged: false,
    requiresUpload: false,
    requiresSignature: true,
    signature: "",
  },
  INSURANCE_REQUIREMENTS: {
    id: "insurance-requirements",
    type: DisclosureType.INSURANCE_REQUIREMENTS,
    title: "Renter's Insurance Requirements",
    description:
      "All residents are required to obtain and maintain renter's insurance throughout the lease term with minimum liability coverage as specified by the building.",
    pdfUrl: "/disclosures/insurance-requirements.pdf",
    acknowledged: false,
    requiresUpload: false,
    insurancePartnerUrl: "https://www.example-insurance-partner.com", // Example insurance partner link
    minimumCoverage: 300000, // $300,000 minimum liability coverage
    requiredInclusions: [
      "Personal liability coverage",
      "Property damage coverage",
      "Building and property management listed as additional insured",
      "Loss of use coverage",
    ],
  },
}

export default function DisclosuresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)
  const [disclosures, setDisclosures] = useState<Disclosure[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Load transaction type and disclosures from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate brief loading for better UX
        await new Promise(resolve => setTimeout(resolve, 300))
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
              // Only include sublet policy for sublet transactions
              ...(loadedTxType === TransactionType.COOP_SUBLET ? [DISCLOSURE_TEMPLATES.SUBLET_POLICY] : []),
              DISCLOSURE_TEMPLATES.PET_ACKNOWLEDGEMENT,
              DISCLOSURE_TEMPLATES.SMOKE_DETECTOR,
              DISCLOSURE_TEMPLATES.CARBON_MONOXIDE_DETECTOR,
              // Phase 2 Acknowledgements
              DISCLOSURE_TEMPLATES.PERSONAL_INFO_AUTH,
              DISCLOSURE_TEMPLATES.BACKGROUND_CHECK_CONSENT,
              DISCLOSURE_TEMPLATES.REFERENCE_CONTACT_AUTH,
              DISCLOSURE_TEMPLATES.EMPLOYMENT_VERIFICATION_AUTH,
              DISCLOSURE_TEMPLATES.FINANCIAL_VERIFICATION_AUTH,
              DISCLOSURE_TEMPLATES.MOVE_IN_DATE_COMMITMENT,
              // Phase 3 Additions
              DISCLOSURE_TEMPLATES.INSURANCE_REQUIREMENTS,
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
      } finally {
        setIsLoading(false)
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

  const handlePetDataChange = (disclosureId: string, hasPets: boolean, pets?: any[]) => {
    setDisclosures((prev) =>
      prev.map((d) =>
        d.id === disclosureId ? { ...d, hasPets, pets } : d
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

    // Check pet acknowledgement
    const petAcknowledgement = disclosures.find(
      (d) => d.type === DisclosureType.PET_ACKNOWLEDGEMENT
    )
    if (petAcknowledgement) {
      if (petAcknowledgement.hasPets && petAcknowledgement.pets) {
        // Check if all pet fields are filled
        const incompletePets = petAcknowledgement.pets.filter(
          (pet: any) => !pet.type || !pet.breed || !pet.weight
        )
        if (incompletePets.length > 0) {
          newErrors.push(
            "Please complete all fields for each pet (type, breed, and weight)"
          )
        }
      }
      // Check signature if they have pets
      if (petAcknowledgement.hasPets && (!petAcknowledgement.signature || petAcknowledgement.signature.trim() === "")) {
        newErrors.push(
          "You must provide a digital signature for the Pet Acknowledgement"
        )
      }
    }

    // Check smoke detector acknowledgement signature
    const smokeDetector = disclosures.find(
      (d) => d.type === DisclosureType.SMOKE_DETECTOR
    )
    if (smokeDetector && (!smokeDetector.signature || smokeDetector.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Smoke Detector Acknowledgement"
      )
    }

    // Check carbon monoxide detector acknowledgement signature
    const coDetector = disclosures.find(
      (d) => d.type === DisclosureType.CARBON_MONOXIDE_DETECTOR
    )
    if (coDetector && (!coDetector.signature || coDetector.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Carbon Monoxide Detector Acknowledgement"
      )
    }

    // Phase 2 Acknowledgements - Check signatures
    const personalInfoAuth = disclosures.find(
      (d) => d.type === DisclosureType.PERSONAL_INFO_AUTH
    )
    if (personalInfoAuth && (!personalInfoAuth.signature || personalInfoAuth.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Personal Information Authorization"
      )
    }

    const backgroundCheckConsent = disclosures.find(
      (d) => d.type === DisclosureType.BACKGROUND_CHECK_CONSENT
    )
    if (backgroundCheckConsent && (!backgroundCheckConsent.signature || backgroundCheckConsent.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Background Check Consent"
      )
    }

    const referenceContactAuth = disclosures.find(
      (d) => d.type === DisclosureType.REFERENCE_CONTACT_AUTH
    )
    if (referenceContactAuth && (!referenceContactAuth.signature || referenceContactAuth.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Reference Contact Authorization"
      )
    }

    const employmentVerificationAuth = disclosures.find(
      (d) => d.type === DisclosureType.EMPLOYMENT_VERIFICATION_AUTH
    )
    if (employmentVerificationAuth && (!employmentVerificationAuth.signature || employmentVerificationAuth.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Employment Verification Authorization"
      )
    }

    const financialVerificationAuth = disclosures.find(
      (d) => d.type === DisclosureType.FINANCIAL_VERIFICATION_AUTH
    )
    if (financialVerificationAuth && (!financialVerificationAuth.signature || financialVerificationAuth.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Financial Statement Verification Authorization"
      )
    }

    const moveInDateCommitment = disclosures.find(
      (d) => d.type === DisclosureType.MOVE_IN_DATE_COMMITMENT
    )
    if (moveInDateCommitment && (!moveInDateCommitment.signature || moveInDateCommitment.signature.trim() === "")) {
      newErrors.push(
        "You must provide a digital signature for the Move-In Date Commitment"
      )
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

  if (isLoading) {
    return <FormSkeleton sections={2} fieldsPerSection={3} />
  }

  if (!isLeaseOrSublet && transactionType) {
    return (
      <div className="space-y-6">
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disclosures</h1>
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
            onPetDataChange={(hasPets, pets) =>
              handlePetDataChange(disclosure.id, hasPets, pets)
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
