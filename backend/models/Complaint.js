const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a complaint title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Maintenance',
      'Cleanliness',
      'Security',
      'Noise',
      'Parking',
      'Electricity',
      'Water Supply',
      'Internet/WiFi',
      'Common Areas',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Pending'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  images: [{
    type: String // Store image URLs or paths
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  resolutionDetails: {
    type: String,
    maxlength: [500, 'Resolution details cannot exceed 500 characters']
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on every save
complaintSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Automatically set resolvedAt when status changes to Resolved
complaintSchema.pre('save', function() {
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = Date.now();
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);