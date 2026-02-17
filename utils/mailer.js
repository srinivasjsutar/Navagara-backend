const nodemailer = require("nodemailer");

// ✅ Gmail Configuration - Works on Vercel, Render, and ALL platforms
const transporter = nodemailer.createTransport({
  service: 'gmail',  // ← Use Gmail service
  auth: {
    user: process.env.EMAIL_USER,  // Keep same variable name
    pass: process.env.EMAIL_PASS,  // Keep same variable name
  },
});

// Log configuration on startup
console.log('📧 Email Configuration:');
console.log('   Service: Gmail');
console.log('   Email User:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   Email Pass:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');

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
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 From: ${process.env.EMAIL_USER}`);
    
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
    console.log("✅ Email sent successfully via Gmail");
    console.log("✅ Message ID:", info.messageId);
    console.log("✅ Accepted:", info.accepted);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    console.error("❌ Error code:", error.code);
    
    // Helpful error messages
    if (error.code === 'EAUTH') {
      console.error('❌ Gmail Authentication failed. Check:');
      console.error('   1. EMAIL_USER is your full Gmail address');
      console.error('   2. EMAIL_PASS is 16-character Gmail app password');
      console.error('   3. 2-Step Verification is enabled on Gmail');
      console.error('   4. Get app password: https://myaccount.google.com/apppasswords');
    }
    
    throw error;
  }
};

module.exports = sendMail;
