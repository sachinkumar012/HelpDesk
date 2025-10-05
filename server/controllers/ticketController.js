const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Timeline = require('../models/Timeline');

// Helper function to create timeline entry
const createTimelineEntry = async (ticketId, action, actorId, details = {}) => {
  try {
    await Timeline.create({
      ticketId,
      action,
      actorId,
      details
    });
  } catch (error) {
    console.error('Timeline creation error:', error);
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority } = req.body;

    // Calculate SLA deadline based on priority
    const SLA_DURATION = {
      low: 48 * 60 * 60 * 1000,    // 48 hours
      medium: 24 * 60 * 60 * 1000, // 24 hours
      high: 6 * 60 * 60 * 1000     // 6 hours
    };

    const now = new Date();
    const slaDeadline = new Date(now.getTime() + SLA_DURATION[priority || 'medium']);

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      createdBy: req.user._id,
      slaDeadline: slaDeadline
    });

    await ticket.populate('createdBy', 'name email role');

    // Create timeline entry
    await createTimelineEntry(ticket._id, 'created', req.user._id, {
      title,
      priority: ticket.priority
    });

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error while creating ticket' });
  }
};

// @desc    Get tickets with filtering and pagination
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      priority, 
      breached, 
      assignedTo, 
      limit = 10, 
      offset = 0 
    } = req.query;

    const { role, _id: userId } = req.user;

    // Build query based on user role
    let query = {};

    if (role === 'user') {
      query.createdBy = userId;
    } else if (role === 'agent') {
      query.assignedTo = userId;
    }
    // Admin can see all tickets (no additional filter)

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (breached === 'true') query.breached = true;
    if (assignedTo) query.assignedTo = assignedTo;

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Update breached status for all tickets before querying
    const now = new Date();
    await Ticket.updateMany(
      { 
        $and: [
          { status: { $nin: ['resolved', 'closed'] } },
          { slaDeadline: { $lt: now } },
          { breached: false }
        ]
      },
      { breached: true }
    );

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      items: tickets,
      total,
      next_offset: parseInt(offset) + parseInt(limit) < total ? parseInt(offset) + parseInt(limit) : null
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching tickets' });
  }
};

// @desc    Get single ticket with comments and timeline
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access permissions
    const { role, _id: userId } = req.user;
    if (role === 'user' && ticket.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }
    if (role === 'agent' && (!ticket.assignedTo || ticket.assignedTo._id.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }

    // Update breached status
    ticket.checkSLABreach();
    if (ticket.isModified('breached')) {
      await ticket.save();
    }

    // Get comments (threaded)
    const comments = await Comment.find({ ticketId: id, parentCommentId: null })
      .populate('authorId', 'name email role')
      .populate({
        path: 'replies',
        populate: {
          path: 'authorId',
          select: 'name email role'
        }
      })
      .sort({ createdAt: 1 });

    // Get timeline
    const timeline = await Timeline.find({ ticketId: id })
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      ticket,
      comments,
      timeline
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error while fetching ticket' });
  }
};

// @desc    Update ticket
// @route   PATCH /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, priority, version } = req.body;
    const { role, _id: userId } = req.user;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Optimistic locking check
    if (version && ticket.version !== parseInt(version)) {
      return res.status(409).json({ 
        message: 'Ticket has been modified by another user. Please refresh and try again.',
        currentVersion: ticket.version
      });
    }

    // Permission checks
    if (role === 'user') {
      return res.status(403).json({ message: 'Users cannot update tickets after creation' });
    }

    if (role === 'agent' && (!ticket.assignedTo || ticket.assignedTo.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Agents can only update their assigned tickets' });
    }

    const changes = {};
    const timelineDetails = {};

    // Track changes for timeline
    if (status && status !== ticket.status) {
      changes.status = status;
      timelineDetails.statusChange = { from: ticket.status, to: status };
    }

    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      changes.assignedTo = assignedTo;
      timelineDetails.assignmentChange = { from: ticket.assignedTo, to: assignedTo };
    }

    if (priority && priority !== ticket.priority) {
      changes.priority = priority;
      timelineDetails.priorityChange = { from: ticket.priority, to: priority };
      
      // Recalculate SLA deadline for priority change
      const SLA_DURATION = {
        low: 48 * 60 * 60 * 1000,
        medium: 24 * 60 * 60 * 1000,
        high: 6 * 60 * 60 * 1000
      };
      changes.slaDeadline = new Date(ticket.createdAt.getTime() + SLA_DURATION[priority]);
      changes.breached = false; // Reset breach status
    }

    // Increment version
    changes.version = ticket.version + 1;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      changes,
      { new: true }
    ).populate('createdBy', 'name email role')
     .populate('assignedTo', 'name email role');

    // Create timeline entries
    if (timelineDetails.statusChange) {
      await createTimelineEntry(id, 'status_changed', userId, timelineDetails.statusChange);
    }
    if (timelineDetails.assignmentChange) {
      await createTimelineEntry(id, 'assigned', userId, timelineDetails.assignmentChange);
    }
    if (timelineDetails.priorityChange) {
      await createTimelineEntry(id, 'priority_changed', userId, timelineDetails.priorityChange);
    }

    res.json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error while updating ticket' });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private (Admin/Agent)
const getTicketStats = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    let matchStage = {};
    if (role === 'agent') {
      matchStage.assignedTo = userId;
    } else if (role === 'user') {
      matchStage.createdBy = userId;
    }

    const stats = await Ticket.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          breached: { $sum: { $cond: ['$breached', 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
        breached: 0, high: 0, medium: 0, low: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  getTicketStats
};