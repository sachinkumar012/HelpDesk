import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClockIcon, 
  UserIcon, 
  CalendarIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';
import { 
  formatDate, 
  formatRelativeTime, 
  getStatusColor, 
  getPriorityColor, 
  getSLAStatus, 
  truncateText,
  generateAvatarInitials,
  getAvatarColor,
  classNames
} from '../utils/helpers';

const TicketCard = ({ ticket, showAssignee = false }) => {
  const slaStatus = getSLAStatus(ticket.slaDeadline, ticket.status, ticket.breached);

  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            to={`/tickets/${ticket._id}`}
            className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {truncateText(ticket.title, 60)}
          </Link>
          <p className="mt-1 text-sm text-gray-600">
            {truncateText(ticket.description, 120)}
          </p>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(ticket.status))}>
            {ticket.status.replace('_', ' ')}
          </span>
          <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getPriorityColor(ticket.priority))}>
            {ticket.priority}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>{ticket.createdBy?.name || 'Unknown'}</span>
          </div>
          
          {showAssignee && ticket.assignedTo && (
            <div className="flex items-center">
              <div className={classNames(
                'h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2',
                getAvatarColor(ticket.assignedTo.name)
              )}>
                {generateAvatarInitials(ticket.assignedTo.name)}
              </div>
              <span>Assigned to {ticket.assignedTo.name}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{formatRelativeTime(ticket.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={classNames('flex items-center', slaStatus.color)}>
            <ClockIcon className="h-4 w-4 mr-1" />
            <span className="font-medium">{slaStatus.text}</span>
            {slaStatus.urgent && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Urgent
              </span>
            )}
          </div>
        </div>
      </div>

      {ticket.commentCount && (
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
          <span>{ticket.commentCount} comments</span>
        </div>
      )}
    </div>
  );
};

export default TicketCard;