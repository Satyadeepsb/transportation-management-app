import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const menuItems: Record<UserRole, MenuItem[]> = {
  [UserRole.ADMIN]: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'All Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'Create Shipment', icon: '➕' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/users', label: 'Users', icon: '👥' },
  ],
  [UserRole.DISPATCHER]: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'Create Shipment', icon: '➕' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
  ],
  [UserRole.DRIVER]: [
    { path: '/my-shipments', label: 'My Shipments', icon: '🚚' },
  ],
  [UserRole.CUSTOMER]: [
    { path: '/my-shipments', label: 'My Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'Create Shipment', icon: '➕' },
    { path: '/track', label: 'Track Shipment', icon: '🔍' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const items = user?.role ? menuItems[user.role] : [];

  return (
    <aside className="w-64 bg-gray-900 min-h-screen">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
          <span className="text-2xl font-bold text-white">TMS</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            © 2026 TMS
          </div>
        </div>
      </div>
    </aside>
  );
}
