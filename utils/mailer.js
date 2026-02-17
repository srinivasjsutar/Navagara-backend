const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('📧 Email Configuration:');
console.log('   Service: Resend API (HTTP)');
console.log('   API Key:', process.env.RESEND_API_KEY ? '✅ SET' : '❌ NOT SET');

const sendMail = async (to, subject, text, pdfBase64, pdfFilename) => {
  try {
    console.log(`📧 Sending email to: ${to}`);

    const { data, error } = await resend.emails.send({
      from: "Navanagara Society <onboarding@resend.dev>",
      to: to,
      subject: subject,
      text: text,
      attachments: pdfBase64
        ? [{ filename: pdfFilename, content: pdfBase64 }]
        : [],
    });

    if (error) {
      console.error("❌ Resend error:", error.message);
      throw new Error(error.message);
    }

    console.log("✅ Email sent successfully via Resend");
    console.log("✅ Message ID:", data.id);
    return { success: true, messageId: data.id };

  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendMail;
