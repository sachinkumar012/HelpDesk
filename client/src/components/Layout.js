import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  TicketIcon,
  PlusIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { classNames } from '../utils/helpers';
import UserMenu from './UserMenu';

const Layout = ({ children }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, current: false },
    { name: 'Tickets', href: '/tickets', icon: TicketIcon, current: false },
    { name: 'New Ticket', href: '/tickets/new', icon: PlusIcon, current: false },
  ];

  // Add admin/agent specific navigation
  if (user?.role === 'admin') {
    navigation.push(
      { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: false },
      { name: 'Users', href: '/users', icon: UsersIcon, current: false }
    );
  } else if (user?.role === 'agent') {
    navigation.push(
      { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, current: false }
    );
  }

  return (
    <div className="min-h-full">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  HelpDesk Mini
                </h1>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )
                    }
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="space-y-1 pt-2 pb-3">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                  )
                }
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;