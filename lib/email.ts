/**
 * Email Utility
 *
 * Handles sending emails via Resend
 */

import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendInvitationEmailParams {
  to: string;
  applicantName: string;
  brokerName: string;
  buildingName: string;
  buildingAddress: string;
  transactionType: string;
  invitationToken: string;
}

/**
 * Send application invitation email to applicant
 */
export async function sendInvitationEmail({
  to,
  applicantName,
  brokerName,
  buildingName,
  buildingAddress,
  transactionType,
  invitationToken,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  // Check if Resend is configured
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.');
    console.log('Invitation URL:', `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${invitationToken}`);
    return { success: false, error: 'Email service not configured' };
  }

  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${invitationToken}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'philter <onboarding@resend.dev>',
      to,
      subject: `${brokerName} has created an application for you on philter`,
      html: generateInvitationEmailHTML({
        applicantName,
        brokerName,
        buildingName,
        buildingAddress,
        transactionType,
        invitationUrl,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate HTML for invitation email
 */
function generateInvitationEmailHTML({
  applicantName,
  brokerName,
  buildingName,
  buildingAddress,
  transactionType,
  invitationUrl,
}: Omit<SendInvitationEmailParams, 'to' | 'invitationToken'> & { invitationUrl: string }): string {
  const transactionTypeLabel = formatTransactionType(transactionType);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .content {
      margin-bottom: 24px;
    }
    .property-details {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin: 24px 0;
    }
    .property-details h3 {
      margin: 0 0 8px 0;
      color: #111827;
      font-size: 16px;
    }
    .property-details p {
      margin: 4px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 24px 0;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .alternative-link {
      word-break: break-all;
      font-size: 12px;
      color: #6b7280;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">philter</div>
      <p style="color: #6b7280; margin: 0;">Your Transaction Platform</p>
    </div>

    <div class="content">
      <p>Hi ${applicantName},</p>

      <p><strong>${brokerName}</strong> has created a board application for you on philter.</p>

      <div class="property-details">
        <h3>Application Details</h3>
        <p><strong>Building:</strong> ${buildingName}</p>
        <p><strong>Address:</strong> ${buildingAddress}</p>
        <p><strong>Transaction Type:</strong> ${transactionTypeLabel}</p>
      </div>

      <p>To get started, click the button below to create your account and begin filling out your application:</p>

      <div style="text-align: center;">
        <a href="${invitationUrl}" class="cta-button">Accept Invitation & Get Started</a>
      </div>

      <p>Your broker will be able to monitor your progress and will submit the application once it's complete.</p>

      <p class="alternative-link">
        <strong>Link not working?</strong><br>
        Copy and paste this URL into your browser:<br>
        ${invitationUrl}
      </p>
    </div>

    <div class="footer">
      <p>This invitation will expire in 7 days.</p>
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
      <p style="margin-top: 16px;">
        Questions? Contact your broker, ${brokerName}.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Format transaction type for display
 */
function formatTransactionType(type: string): string {
  const formats: Record<string, string> = {
    'COOP_PURCHASE': 'Co-op Purchase',
    'CONDO_PURCHASE': 'Condo Purchase',
    'COOP_SUBLET': 'Co-op Sublet',
    'CONDO_LEASE': 'Condo Lease',
  };
  return formats[type] || type;
}
