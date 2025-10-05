const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

const checkTicketAccess = (req, res, next) => {
  const { role, _id: userId } = req.user;
  const ticket = req.ticket; // Assumes ticket is loaded in a previous middleware

  // Admin can access all tickets
  if (role === 'admin') {
    return next();
  }

  // Agent can access assigned tickets
  if (role === 'agent' && ticket.assignedTo && ticket.assignedTo.toString() === userId.toString()) {
    return next();
  }

  // User can access only their own tickets
  if (role === 'user' && ticket.createdBy.toString() === userId.toString()) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied to this ticket.' });
};

module.exports = {
  authorizeRoles,
  checkTicketAccess
};