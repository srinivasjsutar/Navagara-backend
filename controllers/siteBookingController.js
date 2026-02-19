const SiteBooking = require("../models/SiteBooking");
const Member = require("../models/Member");

// Helper — returns undefined instead of NaN when value is missing
const safeInt = (value) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? undefined : parsed;
};

// Create site booking
exports.createSiteBooking = async (req, res) => {
  try {
    const seniority_no = req.body.seniority_no;
    if (!seniority_no) {
      return res.status(400).send("seniority_no is required");
    }

    const memberDoc = await Member.findOne({ seniority_no: seniority_no });
    if (!memberDoc) {
      return res.status(404).send("Member not found for this seniority number");
    }

    const mobilenumber = memberDoc.mobile;

    const siteBooking = new SiteBooking({
      seniority_no: req.body.seniority_no,
      name: req.body.name,
      mobilenumber: mobilenumber,
      date: new Date(req.body.date),
      projectname: req.body.projectname,
      sitedimension: req.body.sitedimension,
      transactionid: req.body.transactionid,
      totalamount: parseInt(req.body.totalamount),
      bookingamount: safeInt(req.body.bookingamount),   // ← safe, won't send NaN
      downpayment: safeInt(req.body.downpayment),       // ← safe, won't send NaN
      installments: safeInt(req.body.installments),     // ← safe, won't send NaN
      paymentmode: req.body.paymentmode,
      bank: req.body.bank,
    });

    await siteBooking.save();
    res.send("Created Successfully!..");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating site booking");
  }
};

// Get all site bookings
exports.getAllSiteBookings = async (req, res) => {
  try {
    const siteBookings = await SiteBooking.find({});
    res.send(siteBookings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching site bookings");
  }
};

// Update site booking
exports.updateSiteBooking = async (req, res) => {
  try {
    const fields = {
      seniority_no: req.body.seniority_no,
      name: req.body.name,
      projectname: req.body.projectname,
      date: new Date(req.body.date),
      sitedimension: req.body.sitedimension,
      transactionid: req.body.transactionid,
      totalamount: parseInt(req.body.totalamount),
      bookingamount: safeInt(req.body.bookingamount),   // ← safe
      downpayment: safeInt(req.body.downpayment),       // ← safe
      installments: safeInt(req.body.installments),     // ← safe
      paymentmode: req.body.paymentmode,
    };

    await SiteBooking.updateOne(
      { seniority_no: req.params.id },
      { $set: fields },
    );
    res.send("updated Successfully!..");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating site booking");
  }
};
