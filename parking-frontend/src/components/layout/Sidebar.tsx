// src/components/layout/Sidebar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon,
  TruckIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import React from 'react';
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Vehicles', href: '/vehicles', icon: TruckIcon },
  { name: 'Requests', href: '/requests', icon: ClockIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden md:flex md:flex-col w-64 h-[calc(100vh-4rem)] fixed left-0 top-16 bg-white border-r border-gray-200">
      {/* Navigation Links - Now scrollable if needed */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname.startsWith(item.href)
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`mr-3 flex-shrink-0 h-5 w-5 ${
                location.pathname.startsWith(item.href)
                  ? 'text-primary-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Fixed User Profile & Logout Section at bottom */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                {user?.name || 'User Name'}
              </p>
              <Link
                to="/profile"
                className="text-xs font-medium text-primary-600 hover:text-primary-800"
              >
                View profile
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            title="Logout"
            aria-label="Logout"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}