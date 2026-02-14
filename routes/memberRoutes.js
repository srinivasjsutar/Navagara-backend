const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const upload = require('../multerConfig');

// Add member
router.post('/add-members',upload.single("Image"), memberController.addMember);

// Get all members
router.get('/members', memberController.getAllMembers);

// Update member
router.put('/update-member/:seniority_no', memberController.updateMember);

module.exports = router;