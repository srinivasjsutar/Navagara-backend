const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

// Create receipt
router.post('/receipt', receiptController.createReceipt);

// Get all receipts
router.get('/receipts', receiptController.getAllReceipts);

// Backfill receipts
router.put('/backfill-receipts', receiptController.backfillReceipts);

module.exports = router;
