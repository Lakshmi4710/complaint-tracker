const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats
} = require('../controllers/complaintController');

// Stats route (must be before :id route)
router.get('/stats', protect, getComplaintStats);

// Main CRUD routes
router.route('/')
  .get(protect, getAllComplaints)
  .post(protect, createComplaint);

router.route('/:id')
  .get(protect, getComplaint)
  .put(protect, updateComplaint)
  .delete(protect, deleteComplaint); // ← FIXED: No authorize('admin')

module.exports = router;