import React, { useState, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { 
  TicketIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../utils/helpers';
import TicketCard from '../components/TicketCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    tickets, 
    stats, 
    loading, 
    getTickets, 
    getStats 
  } = useTickets();

  useEffect(() => {
    getTickets({ limit: 5 }); // Get recent tickets
    if (user?.role !== 'user') {
      getStats();
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ title, value, icon: Icon, color = 'text-gray-600', bgColor = 'bg-gray-50' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !tickets.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {getGreeting()}, {user?.name}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your tickets today.
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tickets"
            value={stats.total}
            icon={TicketIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Open Tickets"
            value={stats.open + stats.inProgress}
            icon={ClockIcon}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="Breached SLA"
            value={stats.breached}
            icon={ExclamationTriangleIcon}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            title="Resolved Today"
            value={stats.resolved}
            icon={CheckCircleIcon}
            color="text-green-600"
            bgColor="bg-green-50"
          />
        </div>
      )}

      {/* Quick Stats for Users */}
      {user?.role === 'user' && tickets.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="My Tickets"
            value={tickets.length}
            icon={TicketIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Open"
            value={tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
            icon={ClockIcon}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="Resolved"
            value={tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            icon={CheckCircleIcon}
            color="text-green-600"
            bgColor="bg-green-50"
          />
        </div>
      )}

      {/* Recent Tickets */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Tickets
            </h3>
            <a
              href="/tickets"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </a>
          </div>
          
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <TicketCard 
                  key={ticket._id} 
                  ticket={ticket} 
                  showAssignee={user?.role !== 'user'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new ticket.
              </p>
              <div className="mt-6">
                <a
                  href="/tickets/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Ticket
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/tickets/new"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                  <TicketIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create New Ticket
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Submit a new support request or issue.
                </p>
              </div>
            </a>

            <a
              href="/tickets"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100">
                  <ClockIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View All Tickets
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Browse and manage your tickets.
                </p>
              </div>
            </a>

            {(user?.role === 'admin' || user?.role === 'agent') && (
              <a
                href="/analytics"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
                    <UserGroupIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Analytics
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View detailed analytics and reports.
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;