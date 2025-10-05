import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

export const formatDate = (date, formatString = 'PPp') => {
  return format(new Date(date), formatString);
};

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getStatusColor = (status) => {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export const getSLAStatus = (slaDeadline, status, breached) => {
  if (status === 'resolved' || status === 'closed') {
    return { text: 'Completed', color: 'text-green-600', urgent: false };
  }

  if (breached) {
    return { text: 'Breached', color: 'text-red-600', urgent: true };
  }

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const timeDiff = deadline.getTime() - now.getTime();
  const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (timeDiff <= 0) {
    return { text: 'Breached', color: 'text-red-600', urgent: true };
  }

  if (hoursLeft < 2) {
    return { 
      text: `${hoursLeft}h ${minutesLeft}m left`, 
      color: 'text-red-600', 
      urgent: true 
    };
  }

  if (hoursLeft < 6) {
    return { 
      text: `${hoursLeft}h ${minutesLeft}m left`, 
      color: 'text-yellow-600', 
      urgent: false 
    };
  }

  return { 
    text: `${hoursLeft}h ${minutesLeft}m left`, 
    color: 'text-green-600', 
    urgent: false 
  };
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const generateAvatarInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : plural || `${singular}s`;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};