const Brevo = require("@getbrevo/brevo");

// Initialize Brevo API
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

// Only log config status (never log the actual API key)
console.log("📧 Email Configuration:");
console.log("   Service: Brevo API (Free - 9000 emails/month)");
console.log("   API Key:", process.env.BREVO_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("   Sender Email:", process.env.SENDER_EMAIL || "❌ NOT SET");
console.log("   Company Email:", process.env.COMPANY_EMAIL || "❌ NOT SET");

/**
 * Convert plain text receipt body to clean HTML for better email deliverability.
 * Brevo strongly prefers htmlContent over textContent.
 */
const textToHtml = (text) => {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const htmlLines = lines.map((line) => {
    const trimmed = line.trim();
    // Section divider
    if (/^━+$/.test(trimmed)) {
      return `<hr style="border:none;border-top:1px solid #cccccc;margin:8px 0;" />`;
    }
    // Key : Value lines — make the key bold
    if (trimmed.includes(":")) {
      const colonIdx = trimmed.indexOf(":");
      const key = trimmed.substring(0, colonIdx).trim();
      const val = trimmed.substring(colonIdx + 1).trim();
      if (key && val) {
        return `<p style="margin:4px 0;"><strong>${key}:</strong> ${val}</p>`;
      }
    }
    // Empty line
    if (!trimmed) return `<br/>`;
    return `<p style="margin:4px 0;">${trimmed}</p>`;
  });

  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#333333;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
      <div style="background:#5b21b6;padding:16px 24px;border-radius:6px 6px 0 0;margin:-24px -24px 24px -24px;">
        <h2 style="color:#ffffff;margin:0;font-size:18px;">Navanagara House Building Co-operative Society</h2>
      </div>
      ${htmlLines.join("\n")}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:12px;color:#888888;text-align:center;">
        This is an automated email. Please do not reply to this message.
      </div>
    </div>
  `;
};

/**
 * Send an email via Brevo.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body (will be converted to HTML automatically)
 * @param {string|null} pdfBase64 - Base64-encoded PDF attachment (optional)
 * @param {string|null} pdfFilename - Filename for the attachment (optional)
 */
const sendMail = async (to, subject, text, pdfBase64, pdfFilename) => {
  try {
    console.log(`📧 Sending email to: ${to}`);

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Navanagara Society",
      email: process.env.SENDER_EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;

    // ✅ Use BOTH htmlContent and textContent — improves deliverability
    // Brevo requires at least one; htmlContent avoids spam filters
    sendSmtpEmail.htmlContent = textToHtml(text);
    sendSmtpEmail.textContent = text; // plain-text fallback for email clients that don't render HTML

    // Attach PDF if provided and within size limits
    if (pdfBase64 && pdfFilename) {
      const pdfSizeKB = Math.round((pdfBase64.length * 3) / 4 / 1024);
      if (pdfSizeKB > 9000) {
        // Brevo free plan max attachment: ~10 MB
        console.warn(`⚠️ PDF too large to attach (${pdfSizeKB} KB) — sending without attachment`);
      } else {
        sendSmtpEmail.attachment = [
          {
            name: pdfFilename,
            content: pdfBase64,
          },
        ];
        console.log(`📎 Attaching PDF: ${pdfFilename} (${pdfSizeKB} KB)`);
      }
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Brevo v2 SDK: messageId is inside body
    const messageId =
      data?.messageId ||
      data?.body?.messageId ||
      data?.response?.body?.messageId ||
      "sent";

    console.log("✅ Email sent successfully via Brevo");
    console.log("✅ Message ID:", messageId);
    // ❌ REMOVED: Full response log (it contained the raw API key in request headers!)

    return { success: true, messageId };
  } catch (error) {
    const errBody = error?.response?.body || error?.response?.text || {};
    console.error("❌ Error sending email to:", to);
    console.error("❌ Error message:", error.message);
    // Log Brevo error body but NOT the request (which contains the API key)
    console.error("❌ Brevo error detail:", JSON.stringify(errBody));
    throw error;
  }
};

module.exports = sendMail;
