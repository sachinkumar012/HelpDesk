const express = require('express');
const { body, param } = require('express-validator');
const {
  addComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const addCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Parent comment ID must be a valid MongoDB ObjectId')
];

const updateCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters')
];

const ticketIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID')
];

const commentIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID')
];

// Routes
router.post('/tickets/:id/comments', auth, ticketIdValidation, addCommentValidation, addComment);
router.get('/tickets/:id/comments', auth, ticketIdValidation, getComments);
router.patch('/comments/:id', auth, commentIdValidation, updateCommentValidation, updateComment);
router.delete('/comments/:id', auth, commentIdValidation, deleteComment);

module.exports = router;