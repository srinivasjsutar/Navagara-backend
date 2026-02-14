const nodemailer = require("nodemailer");

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
    const mailOptions = {
      from: `"Receipt System" <${process.env.EMAIL_USER}>`,
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
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendMail;
