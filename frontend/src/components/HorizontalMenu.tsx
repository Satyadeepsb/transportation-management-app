import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface QuickMenuItem {
  path: string;
  label: string;
  icon?: string;
}

const quickMenuItems: Record<UserRole, QuickMenuItem[]> = {
  [UserRole.ADMIN]: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'Shipments', icon: '🚚' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ],
  [UserRole.DISPATCHER]: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'Shipments', icon: '🚚' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ],
  [UserRole.DRIVER]: [
    { path: '/my-shipments', label: 'My Shipments', icon: '🚚' },
  ],
  [UserRole.CUSTOMER]: [
    { path: '/my-shipments', label: 'My Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'New Shipment', icon: '➕' },
    { path: '/track', label: 'Track', icon: '🔍' },
  ],
};

export default function HorizontalMenu() {
  const { user } = useAuth();
  const location = useLocation();

  const items = user?.role ? quickMenuItems[user.role] : [];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
