const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'assigned', 'commented', 'status_changed', 'priority_changed']
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
timelineSchema.index({ ticketId: 1, timestamp: -1 });

module.exports = mongoose.model('Timeline', timelineSchema);