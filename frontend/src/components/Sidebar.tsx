import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: Record<UserRole, MenuItem[]> = {
  [UserRole.ADMIN]: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'All Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'Create Shipment', icon: '➕' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ],
  [UserRole.DISPATCHER]: [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/shipments', label: 'Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'Create Shipment', icon: '➕' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ],
  [UserRole.DRIVER]: [
    { path: '/my-shipments', label: 'My Shipments', icon: '🚚' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ],
  [UserRole.CUSTOMER]: [
    { path: '/my-shipments', label: 'My Shipments', icon: '🚚' },
    { path: '/shipments/create', label: 'Create Shipment', icon: '➕' },
    { path: '/track', label: 'Track Shipment', icon: '🔍' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ],
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const items = user?.role ? menuItems[user.role] : [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
          <span className="text-2xl font-bold text-white">TMS</span>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
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
