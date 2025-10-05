const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
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

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id: ticketId } = req.params;
    const { content, parentCommentId } = req.body;
    const { _id: userId, role } = req.user;

    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access permissions
    if (role === 'user' && ticket.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }
    if (role === 'agent' && (!ticket.assignedTo || ticket.assignedTo.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }

    // If it's a reply, verify parent comment exists and belongs to this ticket
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.ticketId.toString() !== ticketId) {
        return res.status(400).json({ message: 'Invalid parent comment' });
      }
    }

    const comment = await Comment.create({
      ticketId,
      authorId: userId,
      parentCommentId: parentCommentId || null,
      content
    });

    await comment.populate('authorId', 'name email role');

    // Create timeline entry
    await createTimelineEntry(ticketId, 'commented', userId, {
      commentId: comment._id,
      isReply: !!parentCommentId
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

// @desc    Get comments for a ticket
// @route   GET /api/tickets/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const { _id: userId, role } = req.user;

    // Check if ticket exists and user has access
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access permissions
    if (role === 'user' && ticket.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }
    if (role === 'agent' && (!ticket.assignedTo || ticket.assignedTo.toString() !== userId.toString())) {
      return res.status(403).json({ message: 'Access denied to this ticket' });
    }

    // Get top-level comments with their replies
    const comments = await Comment.find({ 
      ticketId, 
      parentCommentId: null 
    })
    .populate('authorId', 'name email role')
    .populate({
      path: 'replies',
      populate: {
        path: 'authorId',
        select: 'name email role'
      },
      options: { sort: { createdAt: 1 } }
    })
    .sort({ createdAt: 1 });

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// @desc    Update comment
// @route   PATCH /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { content } = req.body;
    const { _id: userId, role } = req.user;

    const comment = await Comment.findById(id).populate('authorId', 'name email role');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only author or admin can update comment
    if (comment.authorId._id.toString() !== userId.toString() && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only edit your own comments' });
    }

    // Check if comment is not too old (e.g., 24 hours)
    const commentAge = Date.now() - comment.createdAt.getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours
    
    if (commentAge > maxEditTime && role !== 'admin') {
      return res.status(400).json({ message: 'Comment is too old to edit' });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId, role } = req.user;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only author or admin can delete comment
    if (comment.authorId.toString() !== userId.toString() && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own comments' });
    }

    // Delete all replies to this comment first
    await Comment.deleteMany({ parentCommentId: id });
    
    // Delete the comment
    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment
};