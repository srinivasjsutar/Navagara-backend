const Receipt = require('../models/Receipt');
const SiteBooking = require('../models/SiteBooking');
const Member = require('../models/Member');
const sendMail = require("../utils/mailer");

// Generate unique receipt number
const generateReceiptNumber = async () => {
  const count = await Receipt.countDocuments();
  const receiptNo = `RCP${String(count + 1).padStart(6, '0')}`;
  return receiptNo;
};

// Create receipt
exports.createReceipt = async (req, res) => {
  try {
    const seniorityNumber = req.body.membershipid;
    const userEmail = req.body.email;

    // VALIDATION 1: Check if seniority number is provided
    if (!seniorityNumber) {
      return res.status(400).json({
        success: false,
        message: 'Seniority number is required'
      });
    }

    console.log(`🔍 Validating seniority number: ${seniorityNumber}`);

    // VALIDATION 2: Check if member exists with this seniority number
    const memberDoc = await Member.findOne({ seniority_no: seniorityNumber });

    if (!memberDoc) {
      console.log(`❌ Member not found for seniority number: ${seniorityNumber}`);
      return res.status(404).json({
        success: false,
        message: `Member not found with seniority number: ${seniorityNumber}. Please ensure the member is registered first.`
      });
    }

    console.log(`✅ Member found: ${memberDoc.name}`);

    // VALIDATION 3: Check if site booking exists for this seniority number
    const bookingDoc = await SiteBooking.findOne({ seniority_no: seniorityNumber });

    if (!bookingDoc) {
      console.log(`❌ Site booking not found for seniority number: ${seniorityNumber}`);
      return res.status(404).json({
        success: false,
        message: `Site booking not found for seniority number: ${seniorityNumber}. Please create a site booking first.`
      });
    }

    console.log(`✅ Site booking found for: ${bookingDoc.name}`);

    // All validations passed - proceed with receipt creation
    const bookingamount = parseInt(bookingDoc.bookingamount || 0);
    const bank = req.body.bank || bookingDoc.bank || '';
    const amountpaid = parseInt(req.body.amountpaid || 0);

    // Generate unique receipt number
    const receipt_no = await generateReceiptNumber();

    // Create receipt object
    const receiptData = {
      membershipid: seniorityNumber,
      receipt_no,
      name: req.body.name || memberDoc.name,
      email: userEmail,
      projectname: req.body.projectname || bookingDoc.projectname,
      date: new Date(req.body.date),
      amountpaid,
      bookingamount,
      mobilenumber: parseInt(req.body.mobilenumber) || memberDoc.mobile,
      totalreceived: bookingamount + amountpaid,
      paymentmode: req.body.paymentmode,
      paymenttype: req.body.paymenttype,
      transactionid: req.body.transactionid,
      sitedimension: req.body.dimension || bookingDoc.sitedimension,  // ✅ FIXED: save as 'sitedimension'
      created_by: req.body.created_by || 'Admin',
      bank,
      seniority_no: seniorityNumber  // ✅ FIXED: changed from 'senioritynumber' to 'seniority_no'
    };

    const receipt = new Receipt(receiptData);
    await receipt.save();

    console.log('📄 Receipt created successfully:', receipt_no);

    // Send response immediately - don't wait for emails
    res.status(201).json({
      success: true,
      message: 'Receipt created successfully! Emails are being sent...',
      data: receipt
    });

    // Send emails in background (after response is sent)
    setImmediate(async () => {
      try {
        const pdfBase64 = req.body.pdfBase64;
        const pdfFilename = req.body.pdfFilename || `Receipt_${receipt_no}.pdf`;

        // Customer email message
        const customerMessage = `Dear ${receiptData.name},

Thank you for your payment!

Receipt Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Receipt Number   : ${receipt_no}
Seniority Number : ${seniorityNumber}
Amount Paid      : ₹${amountpaid.toLocaleString('en-IN')}
Payment Mode     : ${receiptData.paymentmode}
Transaction ID   : ${receiptData.transactionid}
Date             : ${new Date(receiptData.date).toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your payment receipt is attached to this email as a PDF file.

If you have any questions, please contact our support team.

Best Regards,
Navanagara House Building Co-operative Society

---
This is an automated email. Please do not reply to this message.`;

        // Company copy message
        const companyMessage = `NEW RECEIPT GENERATED

Receipt Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Receipt Number   : ${receipt_no}
Member Name      : ${receiptData.name}
Seniority Number : ${seniorityNumber}
Customer Email   : ${userEmail || 'Not provided'}
Mobile           : ${receiptData.mobilenumber || 'Not provided'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amount Paid      : ₹${amountpaid.toLocaleString('en-IN')}
Booking Amount   : ₹${bookingamount.toLocaleString('en-IN')}
Total Received   : ₹${receiptData.totalreceived.toLocaleString('en-IN')}
Payment Mode     : ${receiptData.paymentmode}
Payment Type     : ${receiptData.paymenttype}
Transaction ID   : ${receiptData.transactionid}
Date             : ${new Date(receiptData.date).toLocaleDateString('en-IN')}
Project          : ${receiptData.projectname || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PDF receipt is attached.

---
Navanagara Admin System`;

        const emailPromises = [];

        // 1. Send to CUSTOMER email (from form)
        if (userEmail && userEmail.trim()) {
          console.log(`📧 Sending to customer: ${userEmail}`);
          emailPromises.push(
            sendMail(
              userEmail.trim(),
              `Payment Receipt - ${receipt_no}`,
              customerMessage,
              pdfBase64,
              pdfFilename
            )
              .then(() => console.log(`✅ Email sent to customer: ${userEmail}`))
              .catch((error) => console.error(`⚠️ Failed to send to customer ${userEmail}:`, error.message))
          );
        } else {
          console.log(`⚠️ No customer email provided`);
        }

        // 2. Send to COMPANY email (from .env)
        const companyEmail = process.env.COMPANY_EMAIL; // ✅ fixed from EMAIL_USER
        if (companyEmail && companyEmail.trim()) {
          console.log(`📧 Sending to company: ${companyEmail}`);
          emailPromises.push(
            sendMail(
              companyEmail.trim(),
              `[COMPANY COPY] New Receipt - ${receipt_no}`,
              companyMessage,
              pdfBase64,
              pdfFilename
            )
              .then(() => console.log(`✅ Email sent to company: ${companyEmail}`))
              .catch((error) => console.error(`⚠️ Failed to send to company ${companyEmail}:`, error.message))
          );
        } else {
          console.log(`⚠️ COMPANY_EMAIL not configured in .env`);
        }

        await Promise.all(emailPromises);
        console.log(`📧 Email sending completed. Total sent: ${emailPromises.length}`);

      } catch (emailError) {
        console.error('⚠️ Email sending failed:', emailError.message);
      }
    });

  } catch (error) {
    console.error('❌ Error creating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating receipt',
      error: error.message
    });
  }
};

// Get all receipts
exports.getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: receipts
    });
  } catch (error) {
    console.error('❌ Error fetching receipts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipts',
      error: error.message
    });
  }
};

// Get receipt by ID
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('❌ Error fetching receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipt',
      error: error.message
    });
  }
};

// Backfill receipts
exports.backfillReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({});
    let updated = 0;

    for (const r of receipts) {
      if (!r.membershipid) continue;
      if (r.bookingamount != null && r.totalreceived != null) continue;

      const bookingDoc = await SiteBooking.findOne({ seniority_no: r.membershipid });
      const bookingamount = Number(bookingDoc?.bookingamount || 0);
      const amountpaid = Number(r.amountpaid || 0);

      await Receipt.updateOne(
        { _id: r._id },
        {
          $set: {
            bookingamount,
            totalreceived: bookingamount + amountpaid
          }
        }
      );

      updated++;
    }

    res.status(200).json({
      success: true,
      message: `✅ Updated ${updated} receipt(s).`
    });
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    res.status(500).json({
      success: false,
      message: '❌ Backfill failed',
      error: error.message
    });
  }
};
