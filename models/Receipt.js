const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  membershipid: {
    type: String,
    required: true
  },
  receipt_no: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false  // Optional field for user email
  },
  projectname: String,
  date: {
    type: Date,
    required: true
  },
  amountpaid: {
    type: Number,
    required: true
  },
  bookingamount: {
    type: Number,
    default: 0
  },
  mobilenumber: Number,
  totalreceived: {
    type: Number,
    default: 0
  },
  paymentmode: String,
  paymenttype: String,
  transactionid: String,
  sitedimension: String,
  created_by: String,
  bank: String,
  seniority_no: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Receipt', receiptSchema);
