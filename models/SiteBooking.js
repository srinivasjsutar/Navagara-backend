const mongoose = require("mongoose");

const siteBookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobilenumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    projectname: String,
    sitedimension: String,
    transactionid: String,
    totalamount: {
      type: Number,
      required: true,
    },
    bookingamount: {
      type: Number,
      required: true,
    },
    downpayment: Number,
    installments: Number,
    paymentmode: String,
    bank: String,
    seniority_no: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "SiteBooking",
  siteBookingSchema,
  "sitebookings",
);
