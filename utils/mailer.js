const nodemailer = require("nodemailer");

// Hostinger SMTP with Port 2525 (works on Render!)
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 2525,  // ← Changed from 465 to 2525 (Render allows this port)
  secure: false, // ← Use TLS instead of SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  },
  connectionTimeout: 30000, // 30 seconds timeout
  greetingTimeout: 30000,
  socketTimeout: 30000
});

/**
 * Send email function with PDF attachment
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text message
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @param {string} pdfFilename - PDF filename
 * @returns {Promise} - Resolves when email is sent
 */
const sendMail = async (to, subject, text, pdfBase64, pdfFilename) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Using SMTP: smtp.hostinger.com:2525`);
    
    const mailOptions = {
      from: `"Navanagara Society" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      attachments: pdfBase64
        ? [
            {
              filename: pdfFilename,
              content: pdfBase64,
              encoding: "base64",
            },
          ]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    console.log("✅ Accepted recipients:", info.accepted);
    console.log("✅ Response:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error command:", error.command);
    console.error("❌ Error response:", error.response);
    throw error;
  }
};

module.exports = sendMail;
