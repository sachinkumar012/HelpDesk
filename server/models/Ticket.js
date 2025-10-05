const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  slaDeadline: {
    type: Date,
    required: true
  },
  breached: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for better query performance
ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ slaDeadline: 1, breached: 1 });
ticketSchema.index({ title: 'text', description: 'text' });

// Calculate SLA deadline before saving
ticketSchema.pre('save', function(next) {
  if (this.isNew) {
    const SLA_DURATION = {
      low: 48 * 60 * 60 * 1000,    // 48 hours
      medium: 24 * 60 * 60 * 1000, // 24 hours
      high: 6 * 60 * 60 * 1000     // 6 hours
    };
    
    // Use current time for SLA calculation as createdAt might not be set yet
    const now = new Date();
    this.slaDeadline = new Date(now.getTime() + SLA_DURATION[this.priority]);
  }
  next();
});

// Check if SLA is breached
ticketSchema.methods.checkSLABreach = function() {
  if (this.status !== 'resolved' && this.status !== 'closed') {
    this.breached = new Date() > this.slaDeadline;
  }
  return this.breached;
};

// Virtual for time remaining
ticketSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'resolved' || this.status === 'closed') {
    return null;
  }
  
  const now = new Date();
  const remaining = this.slaDeadline.getTime() - now.getTime();
  
  if (remaining <= 0) {
    return 'Breached';
  }
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);