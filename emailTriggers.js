// functions/emailTriggers.js

const { onDocumentCreated } = require("firebase-functions/v2/firestore")
const logger = require("firebase-functions/logger")
const admin = require("firebase-admin")
const { Resend } = require("resend")

if (!admin.apps.length) {
  admin.initializeApp()
}

const resend = new Resend(process.env.RESEND_API_KEY)

function safe(value) {
  return String(value ?? "").trim()
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatCurrency(value) {
  const n = Number(value || 0)
  return `$${n.toFixed(2).replace(/\.00$/, "")}`
}

function formatDate(value) {
  return value ? String(value) : ""
}

function buildEventInquiryText(data) {
  return [
    "New Event Flowers Inquiry",
    "",
    `Name: ${safe(data.name)}`,
    `Email: ${safe(data.email)}`,
    `Phone: ${safe(data.phone)}`,
    `Preferred Contact: ${safe(data.preferredReach)}`,
    `Event Type: ${safe(data.eventType)}`,
    `Event Date: ${formatDate(data.eventDate)}`,
    `Budget: ${safe(data.budget)}`,
    `Source: ${safe(data.source)}`,
    "",
    "Details:",
    safe(data.details),
  ].join("\n")
}

function buildEventInquiryHtml(data) {
  return `
    <div style="font-family: Georgia, serif; color: #304742; line-height: 1.7;">
      <h2 style="margin: 0 0 16px;">New Event Flowers Inquiry</h2>

      <table style="border-collapse: collapse; width: 100%; max-width: 760px;">
        <tr><td style="padding: 8px 0; font-weight: bold;">Name</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Phone</td><td>${escapeHtml(data.phone)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Contact</td><td>${escapeHtml(data.preferredReach)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Event Type</td><td>${escapeHtml(data.eventType)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Event Date</td><td>${escapeHtml(formatDate(data.eventDate))}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Budget</td><td>${escapeHtml(data.budget)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Source</td><td>${escapeHtml(data.source)}</td></tr>
      </table>

      <div style="margin-top: 20px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Details</div>
        <div style="padding: 14px; background: #f7f2eb; border-radius: 12px; white-space: pre-wrap;">
          ${escapeHtml(data.details)}
        </div>
      </div>
    </div>
  `
}

function buildALaCarteText(data) {
  const items = Array.isArray(data.items) ? data.items : []

  const lines = [
    "New A La Carte Inquiry",
    "",
    `Name: ${safe(data.name)}`,
    `Email: ${safe(data.email)}`,
    `Phone: ${safe(data.phone)}`,
    `Preferred Contact: ${safe(data.preferredReach)}`,
    `Event Type: ${safe(data.eventType)}`,
    `Event Date: ${formatDate(data.eventDate)}`,
    `Source: ${safe(data.source)}`,
    "",
    "Selected Items:",
  ]

  if (!items.length) {
    lines.push("No items selected.")
  } else {
    for (const item of items) {
      lines.push(
        `- ${safe(item.title)} x ${Number(item.quantity || 0)} — ${formatCurrency(item.total)}`
      )
    }
  }

  lines.push("")
  lines.push(`Grand Total: ${formatCurrency(data.grandTotal)}`)
  lines.push("")
  lines.push("Additional Notes:")
  lines.push(safe(data.notes))

  return lines.join("\n")
}

function buildALaCarteHtml(data) {
  const items = Array.isArray(data.items) ? data.items : []

  const itemRows = items.length
    ? items
        .map(
          (item) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e7ddd1;">${escapeHtml(item.title)}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e7ddd1; text-align: center;">${Number(item.quantity || 0)}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e7ddd1; text-align: right;">${formatCurrency(item.total)}</td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="3" style="padding: 10px 0;">No items selected.</td>
      </tr>
    `

  return `
    <div style="font-family: Georgia, serif; color: #304742; line-height: 1.7;">
      <h2 style="margin: 0 0 16px;">New A La Carte Inquiry</h2>

      <table style="border-collapse: collapse; width: 100%; max-width: 760px;">
        <tr><td style="padding: 8px 0; font-weight: bold;">Name</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email</td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Phone</td><td>${escapeHtml(data.phone)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Contact</td><td>${escapeHtml(data.preferredReach)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Event Type</td><td>${escapeHtml(data.eventType)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Event Date</td><td>${escapeHtml(formatDate(data.eventDate))}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Source</td><td>${escapeHtml(data.source)}</td></tr>
      </table>

      <div style="margin-top: 22px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Selected Items</div>
        <table style="width: 100%; border-collapse: collapse; max-width: 760px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px 0; border-bottom: 2px solid #304742;">Item</th>
              <th style="text-align: center; padding: 10px 0; border-bottom: 2px solid #304742;">Qty</th>
              <th style="text-align: right; padding: 10px 0; border-bottom: 2px solid #304742;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 18px; font-size: 18px;">
        <strong>Grand Total:</strong> ${formatCurrency(data.grandTotal)}
      </div>

      <div style="margin-top: 20px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Additional Notes</div>
        <div style="padding: 14px; background: #f7f2eb; border-radius: 12px; white-space: pre-wrap;">
          ${escapeHtml(data.notes)}
        </div>
      </div>
    </div>
  `
}

async function sendEmail({ subject, text, html, replyTo }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [process.env.EMAIL_TO],
    reply_to: replyTo || undefined,
    subject,
    text,
    html,
  })
}

const sendEventInquiryEmail = onDocumentCreated(
  {
    document: "eventInquiries/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data
    if (!snap) return

    const data = snap.data() || {}
    const docRef = snap.ref

    if (data.emailStatus === "sent") return

    try {
      const subject = `New Event Flowers Inquiry — ${safe(data.name) || "Unnamed"}`
      const text = buildEventInquiryText(data)
      const html = buildEventInquiryHtml(data)

      const result = await sendEmail({
        subject,
        text,
        html,
        replyTo: safe(data.email),
      })

      await docRef.set(
        {
          emailStatus: "sent",
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          emailId: result?.data?.id || null,
        },
        { merge: true }
      )
    } catch (error) {
      logger.error("Failed to send event inquiry email", error)

      await docRef.set(
        {
          emailStatus: "failed",
          emailError: safe(error?.message),
          emailFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      throw error
    }
  }
)

const sendALaCarteInquiryEmail = onDocumentCreated(
  {
    document: "aLaCarteInquiries/{docId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data
    if (!snap) return

    const data = snap.data() || {}
    const docRef = snap.ref

    if (data.emailStatus === "sent") return

    try {
      const subject = `New A La Carte Inquiry — ${safe(data.name) || "Unnamed"}`
      const text = buildALaCarteText(data)
      const html = buildALaCarteHtml(data)

      const result = await sendEmail({
        subject,
        text,
        html,
        replyTo: safe(data.email),
      })

      await docRef.set(
        {
          emailStatus: "sent",
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          emailId: result?.data?.id || null,
        },
        { merge: true }
      )
    } catch (error) {
      logger.error("Failed to send a la carte inquiry email", error)

      await docRef.set(
        {
          emailStatus: "failed",
          emailError: safe(error?.message),
          emailFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      throw error
    }
  }
)

module.exports = {
  sendEventInquiryEmail,
  sendALaCarteInquiryEmail,
}