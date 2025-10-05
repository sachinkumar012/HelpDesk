const express = require('express');
const { body, param } = require('express-validator');
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  getTicketStats
} = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

const router = express.Router();

// Validation middleware
const createTicketValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];

const updateTicketValidation = [
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be open, in_progress, resolved, or closed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID'),
  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer')
];

const ticketIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID')
];

// Routes
router.post('/', auth, createTicketValidation, createTicket);
router.get('/stats', auth, authorizeRoles('agent', 'admin'), getTicketStats);
router.get('/', auth, getTickets);
router.get('/:id', auth, ticketIdValidation, getTicket);
router.patch('/:id', auth, authorizeRoles('agent', 'admin'), ticketIdValidation, updateTicketValidation, updateTicket);

module.exports = router;