const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');


// ================= CREATE COMPLAINT =================
exports.createComplaint = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot create complaints. Only residents can submit complaints.'
      });
    }

    const { title, description, category, priority, location } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location,
      createdBy: req.user.id
    });

    await complaint.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      complaint
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
};


// ================= GET ALL COMPLAINTS =================
exports.getAllComplaints = async (req, res) => {
  try {
    let query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email phoneNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};


// ================= GET SINGLE COMPLAINT =================
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email phoneNumber address')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};


// ================= UPDATE COMPLAINT =================
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (req.user.role === 'resident') {
      if (complaint.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this complaint'
        });
      }

      const allowedUpdates = ['title', 'description', 'location', 'category', 'priority'];
      const updates = {};

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (req.body.status && req.body.status !== complaint.status) {
        return res.status(403).json({
          success: false,
          message: 'Residents cannot change complaint status.'
        });
      }

      complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

    } else {
      complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');
    }

    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};


// ================= DELETE COMPLAINT =================
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (
      req.user.role === 'resident' &&
      complaint.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint'
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};


// ================= GET COMPLAINT STATS =================
exports.getComplaintStats = async (req, res) => {
  try {
    let matchStage = {};

    if (req.user.role === 'resident') {
      matchStage.createdBy = new mongoose.Types.ObjectId(req.user.id);
    }

    const total = await Complaint.countDocuments(matchStage);

    // STATUS
    const statusAggregation = await Complaint.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byStatus = {
      Pending: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
      Rejected: 0
    };

    statusAggregation.forEach(item => {
      byStatus[item._id] = item.count;
    });

    // PRIORITY
    const priorityAggregation = await Complaint.aggregate([
      { $match: matchStage },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const byPriority = {
      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0
    };

    priorityAggregation.forEach(item => {
      byPriority[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        byStatus,
        byPriority
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};