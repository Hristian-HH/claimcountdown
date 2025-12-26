const { Resend } = require('resend');
const { allAsync, getAsync } = require('../models/database');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send weekly email alerts to all users in organizations with expiring claims
 */
async function sendWeeklyAlerts() {
  try {
    // Get all users with email alerts enabled in organizations with claims expiring in 7 days
    const users = await allAsync(`
      SELECT DISTINCT u.id, u.email, u.organization_id
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      INNER JOIN claims c ON u.organization_id = c.organization_id
      WHERE c.days_remaining <= 7
        AND c.days_remaining >= 0
        AND c.is_expired = 0
        AND c.status != 'approved'
        AND (up.email_alerts_enabled IS NULL OR up.email_alerts_enabled = 1)
        AND (up.alert_frequency IS NULL OR up.alert_frequency = 'weekly')
    `);

    for (const user of users) {
      await sendUserAlert(user.id, user.email, user.organization_id);
    }

    return users.length;
  } catch (error) {
    console.error('Error sending weekly alerts:', error);
    throw error;
  }
}

/**
 * Send alert email to a specific user
 */
async function sendUserAlert(userId, email, organizationId) {
  try {
    // Get expiring claims for this organization
    const claims = await allAsync(`
      SELECT * FROM claims
      WHERE organization_id = ?
        AND days_remaining <= 7
        AND days_remaining >= 0
        AND is_expired = 0
        AND status != 'approved'
      ORDER BY days_remaining ASC
    `, [organizationId]);

    if (claims.length === 0) {
      return;
    }

    // Calculate total value at risk
    const totalAtRisk = claims.reduce((sum, claim) => sum + (claim.value || 0), 0);

    const htmlContent = generateEmailHTML(claims, totalAtRisk);
    const textContent = generateEmailText(claims, totalAtRisk);

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `⚠️ ${claims.length} FBA Claim${claims.length > 1 ? 's' : ''} Expiring Soon - $${totalAtRisk.toFixed(2)} at Risk`,
      html: htmlContent,
      text: textContent
    });

    console.log(`Alert sent to ${email} for ${claims.length} claim(s)`);
    return { success: true, claimCount: claims.length, totalAtRisk };
  } catch (error) {
    console.error(`Error sending alert to ${email}:`, error);
    throw error;
  }
}

/**
 * Send test email to verify email is working
 */
async function sendTestEmail(userId, email, organizationId) {
  try {
    // Get some sample claims or create a test claim
    const claims = await allAsync(`
      SELECT * FROM claims
      WHERE organization_id = ?
      ORDER BY days_remaining ASC
      LIMIT 3
    `, [organizationId]);

    const totalAtRisk = claims.reduce((sum, claim) => sum + (claim.value || 0), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <h2 style="margin: 0 0 8px 0; color: #1e40af;">✅ Test Email Successful!</h2>
          <p style="margin: 0; color: #1e3a8a;">Your email alerts are configured correctly.</p>
        </div>

        <p style="margin: 16px 0;">This is a test email from ClaimCountdown. You will receive weekly alerts for claims expiring within 7 days.</p>

        ${claims.length > 0 ? `
          <p style="margin: 16px 0; font-weight: 600;">Here's a preview with your recent claims:</p>
          ${generateEmailHTML(claims, totalAtRisk, true)}
        ` : `
          <p style="margin: 16px 0;">You don't have any claims yet. Upload a CSV to start tracking!</p>
        `}

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            You can manage your email preferences in the <a href="${process.env.FRONTEND_URL}/settings" style="color: #2563eb;">Settings</a> page.
          </p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: '✅ Test Email - ClaimCountdown',
      html: htmlContent
    });

    console.log(`Test email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Error sending test email to ${email}:`, error);
    throw error;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(claims, totalAtRisk, isPreview = false) {
  const claimsRows = claims.map(claim => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; font-size: 14px;">${claim.sku}</td>
      <td style="padding: 12px 8px; font-size: 14px;">${claim.product_name || 'N/A'}</td>
      <td style="padding: 12px 8px; font-size: 14px;">${claim.reason}</td>
      <td style="padding: 12px 8px; text-align: center; font-size: 14px;">${claim.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600;">$${claim.value ? claim.value.toFixed(2) : '0.00'}</td>
      <td style="padding: 12px 8px; text-align: center; font-weight: bold; font-size: 14px; color: ${claim.days_remaining <= 3 ? '#dc2626' : '#f59e0b'};">
        ${claim.days_remaining} day${claim.days_remaining !== 1 ? 's' : ''}
      </td>
    </tr>
  `).join('');

  const headerText = isPreview ? 'Preview of Your Claims' : 'Claims Expiring Soon';
  const subheaderText = isPreview
    ? `This is how your weekly digest will look`
    : `Your team has ${claims.length} claim${claims.length > 1 ? 's' : ''} expiring within the next 7 days`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <!-- Header -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <h1 style="margin: 0 0 8px 0; color: #111827; font-size: 24px;">ClaimCountdown</h1>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Weekly Claims Digest</p>
      </div>

      <!-- Alert Banner -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
        <h2 style="margin: 0 0 8px 0; color: #92400e; font-size: 18px;">⚠️ ${headerText}</h2>
        <p style="margin: 0; color: #78350f; font-size: 14px;">${subheaderText}</p>
      </div>

      <!-- Total at Risk Card -->
      <div style="background-color: #fee2e2; border: 2px solid #ef4444; padding: 16px; margin-bottom: 16px; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 4px 0; color: #7f1d1d; font-size: 14px; font-weight: 600;">Total Value at Risk</p>
        <p style="margin: 0; color: #991b1b; font-size: 32px; font-weight: bold;">$${totalAtRisk.toFixed(2)}</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 0; margin-bottom: 16px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); overflow: hidden;">
        <p style="padding: 20px 20px 0 20px; margin: 0 0 16px 0; font-size: 14px;">Don't miss your reimbursement deadline! The following claims need immediate attention:</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px 8px; text-align: left; font-weight: 600; font-size: 12px; color: #6b7280; text-transform: uppercase;">SKU</th>
              <th style="padding: 12px 8px; text-align: left; font-weight: 600; font-size: 12px; color: #6b7280; text-transform: uppercase;">Product</th>
              <th style="padding: 12px 8px; text-align: left; font-weight: 600; font-size: 12px; color: #6b7280; text-transform: uppercase;">Reason</th>
              <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 12px; color: #6b7280; text-transform: uppercase;">Qty</th>
              <th style="padding: 12px 8px; text-align: right; font-weight: 600; font-size: 12px; color: #6b7280; text-transform: uppercase;">Value</th>
              <th style="padding: 12px 8px; text-align: center; font-weight: 600; font-size: 12px; color: #6b7280; text-transform: uppercase;">Days Left</th>
            </tr>
          </thead>
          <tbody>
            ${claimsRows}
          </tbody>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Dashboard</a>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <p style="margin: 0 0 12px 0; font-weight: 600; font-size: 14px; color: #111827;">Next Steps:</p>
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
          <li style="margin-bottom: 8px;">Review your expiring claims in the dashboard</li>
          <li style="margin-bottom: 8px;">Submit reimbursement requests to Amazon Seller Central</li>
          <li style="margin-bottom: 0;">Update claim status in ClaimCountdown once submitted</li>
        </ol>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 16px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0 0 8px 0;">You're receiving this email because you have email alerts enabled in ClaimCountdown.</p>
        <p style="margin: 0;">
          <a href="${process.env.FRONTEND_URL}/settings" style="color: #2563eb; text-decoration: none;">Manage Email Preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email content
 */
function generateEmailText(claims, totalAtRisk) {
  const claimsList = claims.map(claim =>
    `- SKU: ${claim.sku} | ${claim.reason} | Qty: ${claim.quantity} | Value: $${claim.value ? claim.value.toFixed(2) : '0.00'} | Days Left: ${claim.days_remaining}`
  ).join('\n');

  return `
CLAIMS EXPIRING SOON

Your team has ${claims.length} claim${claims.length > 1 ? 's' : ''} expiring within the next 7 days.

TOTAL VALUE AT RISK: $${totalAtRisk.toFixed(2)}

${claimsList}

Next Steps:
1. Log in to ClaimCountdown: ${process.env.FRONTEND_URL}
2. Review your expiring claims
3. Submit reimbursement requests to Amazon Seller Central
4. Update claim status in ClaimCountdown once submitted

---
You're receiving this email because you have email alerts enabled in ClaimCountdown.
Manage preferences: ${process.env.FRONTEND_URL}/settings
  `.trim();
}

module.exports = {
  sendWeeklyAlerts,
  sendUserAlert,
  sendTestEmail
};
