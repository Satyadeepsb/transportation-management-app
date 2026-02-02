import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Notifications from './Notifications';
import { UserRole } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.DISPATCHER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.DRIVER:
        return 'bg-green-100 text-green-800';
      case UserRole.CUSTOMER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          <span className="hidden sm:inline">Transportation Management</span>
          <span className="sm:hidden">TMS</span>
        </h1>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Notifications />

          {/* User Profile */}
          <button
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
          >
            <span className="text-sm text-gray-700 font-medium">{user?.fullName}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user?.role!)}`}>
              {user?.role}
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
