const Brevo = require("@getbrevo/brevo");

// Initialize Brevo API
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

console.log("📧 Email Configuration:");
console.log("   Service: Brevo API (Free - 9000 emails/month)");
console.log("   API Key:", process.env.BREVO_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("   Sender Email:", process.env.SENDER_EMAIL || "❌ NOT SET");

const sendMail = async (to, subject, text, pdfBase64, pdfFilename) => {
  try {
    console.log(`📧 Sending email to: ${to}`); // ✅ fixed missing (

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Navanagara Society",
      email: process.env.SENDER_EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = text;

    // Attach PDF if provided
    if (pdfBase64 && pdfFilename) {
      sendSmtpEmail.attachment = [
        {
          name: pdfFilename,
          content: pdfBase64,
        },
      ];
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // ✅ Fixed: Brevo v2 returns messageId inside response body
    const messageId = data?.messageId || data?.body?.messageId || "sent";

    console.log("✅ Email sent successfully via Brevo");
    console.log("✅ Message ID:", messageId);
    console.log("✅ Full response:", JSON.stringify(data));

    return { success: true, messageId };

  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    console.error("❌ Full error:", JSON.stringify(error?.response?.body || {}));
    throw error;
  }
};

module.exports = sendMail;
