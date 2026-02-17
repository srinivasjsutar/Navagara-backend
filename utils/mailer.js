const Brevo = require("@getbrevo/brevo");

// Initialize Brevo API
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

console.log("📧 Email Configuration:");
console.log("   Service: Brevo API (Free - 9000 emails/month)");
console.log(
  "   API Key:",
  process.env.BREVO_API_KEY ? "✅ SET" : "❌ NOT SET"
);
console.log(
  "   Sender Email:",
  process.env.SENDER_EMAIL || "❌ NOT SET"
);

/**
 * Send email function with optional PDF attachment
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text message
 * @param {string} pdfBase64 - Base64 encoded PDF (optional)
 * @param {string} pdfFilename - PDF filename (optional)
 * @returns {Promise} - Resolves when email is sent
 */
const sendMail = async (to, subject, text, pdfBase64, pdfFilename) => {
  try {
    console.log(`📧 Sending email to: ${to}`);

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Navanagara Society",
      email: process.env.SENDER_EMAIL, // your brevo verified sender email
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = text;

    // Attach PDF if provided
    if (pdfBase64 && pdfFilename) {
      sendSmtpEmail.attachment = [
        {
          name: pdfFilename,
          content: pdfBase64, // base64 string
        },
      ];
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully via Brevo");
    console.log("✅ Message ID:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendMail;
